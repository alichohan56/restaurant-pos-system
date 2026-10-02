export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}
