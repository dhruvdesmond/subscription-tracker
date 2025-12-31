import type { Category } from '@/types';

export interface CategoryInfo {
  value: Category;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#EF4444' },
  { value: 'productivity', label: 'Productivity', icon: '💼', color: '#3B82F6' },
  { value: 'utilities', label: 'Utilities', icon: '🔧', color: '#6B7280' },
  { value: 'health', label: 'Health & Fitness', icon: '💪', color: '#22C55E' },
  { value: 'education', label: 'Education', icon: '📚', color: '#A855F7' },
  { value: 'finance', label: 'Finance', icon: '💰', color: '#F59E0B' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', color: '#EC4899' },
  { value: 'other', label: 'Other', icon: '📦', color: '#64748B' },
];

export const getCategoryInfo = (category: Category): CategoryInfo => {
  return CATEGORIES.find(c => c.value === category) ?? CATEGORIES[CATEGORIES.length - 1];
};
