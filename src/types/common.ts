import type { Category } from './subscription';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export type SortField = 'name' | 'amount' | 'nextRenewal' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface FilterConfig {
  categories?: Category[];
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
}
