import type { Request } from 'express';

// ========================
// API Response
// ========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

// ========================
// Auth
// ========================

export interface JwtPayload {
  userId: string;
  email: string;
  roleCodes: string[];
}

export interface AuthenticatedUser extends JwtPayload {
  isActive: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// ========================
// Pagination
// ========================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
