import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  basePrice: true,
  sku: true,
  isActive: true,
  isAvailable: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true } },
} as const;

type ProductRecord = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

export interface SafeProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  basePrice: number;
  sku: string | null;
  isActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ListProductsQuery {
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  search?: string;
}

function serializeProduct(product: ProductRecord): SafeProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    image: product.image,
    basePrice: product.basePrice.toNumber(),
    sku: product.sku,
    isActive: product.isActive,
    isAvailable: product.isAvailable,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListProductsQuery = {}): Promise<SafeProduct[]> {
    const where: Prisma.ProductWhereInput = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: productSelect,
    });

    return products.map(serializeProduct);
  }

  async findOne(id: string): Promise<SafeProduct> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return serializeProduct(product);
  }

  async create(dto: CreateProductDto): Promise<SafeProduct> {
    await this.assertCategoryExists(dto.categoryId);
    const slug = await this.resolveSlug(dto.slug, dto.name);
    await this.assertSkuAvailable(dto.sku);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          image: dto.image,
          basePrice: String(dto.basePrice),
          sku: dto.sku,
          isActive: dto.isActive ?? true,
          isAvailable: dto.isAvailable ?? true,
          sortOrder: dto.sortOrder ?? 0,
          categoryId: dto.categoryId,
        },
        select: productSelect,
      });
      return serializeProduct(product);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<SafeProduct> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    if (dto.categoryId !== undefined) {
      await this.assertCategoryExists(dto.categoryId);
    }
    const slug =
      dto.slug !== undefined ? await this.resolveSlug(dto.slug, undefined, id) : undefined;
    if (dto.sku !== undefined) {
      await this.assertSkuAvailable(dto.sku, id);
    }

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          image: dto.image,
          basePrice:
            dto.basePrice !== undefined ? String(dto.basePrice) : undefined,
          sku: dto.sku,
          isActive: dto.isActive,
          isAvailable: dto.isAvailable,
          sortOrder: dto.sortOrder,
          categoryId: dto.categoryId,
        },
        select: productSelect,
      });
      return serializeProduct(product);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<SafeProduct> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    try {
      const product = await this.prisma.product.delete({
        where: { id },
        select: productSelect,
      });
      return serializeProduct(product);
    } catch (error) {
      throw this.mapPrismaError(error);
    }
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with id "${categoryId}" not found`,
      );
    }
  }

  private async assertSkuAvailable(
    sku: string | undefined,
    excludeId?: string,
  ): Promise<void> {
    if (!sku) {
      return;
    }

    const duplicate = await this.prisma.product.findFirst({
      where: {
        sku,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ConflictException('A product with this SKU already exists');
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

    const conflict = await this.prisma.product.findFirst({
      where: { slug: raw, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });

    if (conflict) {
      throw new ConflictException(`Product with slug "${raw}" already exists`);
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
        const target =
          error.meta && typeof error.meta === 'object' && 'target' in error.meta
            ? error.meta.target
            : undefined;
        const fields = Array.isArray(target)
          ? target.join(', ')
          : typeof target === 'string'
            ? target
            : '';
        if (fields.includes('sku')) {
          return new ConflictException(
            'A product with this SKU already exists',
          );
        }
        if (fields.includes('slug')) {
          return new ConflictException('A product with this slug already exists');
        }
        return new ConflictException('Product already exists');
      }
      if (error.code === 'P2003') {
        return new ConflictException(
          'Product cannot be deleted because it is still in use',
        );
      }
      if (error.code === 'P2025') {
        return new NotFoundException('Product not found');
      }
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      const message = error.message ?? '';
      if (message.includes('foreign key constraint')) {
        return new ConflictException(
          'Product cannot be deleted because it is still in use',
        );
      }
      if (
        message.includes('duplicate key value') ||
        message.includes('unique constraint')
      ) {
        if (message.includes('sku')) {
          return new ConflictException(
            'A product with this SKU already exists',
          );
        }
        if (message.includes('slug')) {
          return new ConflictException(
            'A product with this slug already exists',
          );
        }
        return new ConflictException('Product already exists');
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
