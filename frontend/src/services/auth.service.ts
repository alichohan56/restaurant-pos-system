import { isAxiosError } from 'axios';
import apiClient from '../api/apiClient';
import type { LoginResponse, User } from '../types/auth.types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  if (!data || !data.accessToken || !data.user) {
    throw new Error('Login failed. Please try again.');
  }

  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export function getLoginErrorMessage(error: unknown): string {
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
      if (message.toLowerCase().includes('inactive')) {
        return 'Your account is inactive. Please contact your administrator.';
      }
      return 'Invalid email or password.';
    }

    if (status === 400) {
      return message || 'Please enter a valid email and password.';
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
