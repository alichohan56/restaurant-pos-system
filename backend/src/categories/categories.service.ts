import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  image: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface ListCategoriesQuery {
  isActive?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListCategoriesQuery = {}): Promise<SafeCategory[]> {
    return this.prisma.category.findMany({
      where: query.isActive === undefined ? {} : { isActive: query.isActive },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: categorySelect,
    });
  }

  async findOne(id: string): Promise<SafeCategory> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<SafeCategory> {
    const slug = await this.resolveSlug(dto.slug, dto.name);

    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          image: dto.image,
          sortOrder: dto.sortOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
        select: categorySelect,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<SafeCategory> {
    const existing = await this.prisma.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    const slug =
      dto.slug !== undefined ? await this.resolveSlug(dto.slug, undefined, id) : undefined;

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name,
          slug,
          image: dto.image,
          sortOrder: dto.sortOrder,
          isActive: dto.isActive,
        },
        select: categorySelect,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<SafeCategory> {
    const existing = await this.prisma.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    try {
      return await this.prisma.category.delete({
        where: { id },
        select: categorySelect,
      });
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private async resolveSlug(
    providedSlug: string | undefined,
    name: string | undefined,
    excludeId?: string,
  ): Promise<string> {
    const raw = providedSlug
      ? this.slugify(providedSlug)
      : name
        ? this.slugify(name)
        : undefined;

    if (!raw) {
      throw new BadRequestException(
        providedSlug !== undefined
          ? 'slug must contain at least one letter or number'
          : 'name must contain at least one letter or number to generate a slug',
      );
    }

    const conflict = await this.prisma.category.findFirst({
      where: { slug: raw, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException(`Category with slug "${raw}" already exists`);
    }

    return raw;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private mapPrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException('Category slug already exists');
      }
      if (error.code === 'P2003') {
        return new ConflictException(
          'Category cannot be deleted because it is still in use',
        );
      }
      if (error.code === 'P2025') {
        return new NotFoundException('Category not found');
      }
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      const message = error.message ?? '';
      if (message.includes('foreign key constraint')) {
        return new ConflictException(
          'Category cannot be deleted because it is still in use',
        );
      }
      if (
        message.includes('duplicate key value') ||
        message.includes('unique constraint')
      ) {
        return new ConflictException('Category slug already exists');
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
