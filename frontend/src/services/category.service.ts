import { isAxiosError } from 'axios';
import apiClient from '../api/apiClient';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category.types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', input);
  return data;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<Category> {
  const { data } = await apiClient.delete<Category>(`/categories/${id}`);
  return data;
}

export function getCategoryErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to connect to the server. Please try again.';
    }

    const { status, data } = error.response;
    const rawMessage =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message?: unknown }).message
        : undefined;
    const message = typeof rawMessage === 'string' ? rawMessage : '';

    if (status === 401) {
      return 'Your session has expired. Please sign in again.';
    }

    if (status === 400) {
      return message || 'Please review the form fields and try again.';
    }

    if (status === 404) {
      return 'Category not found. It may have already been deleted.';
    }

    if (status === 409) {
      return message || 'This category cannot be saved because of a conflict.';
    }

    if (status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    return message || 'Something went wrong. Please try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
