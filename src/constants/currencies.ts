import type { CurrencyCode } from '@/types';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const getCurrencyInfo = (code: CurrencyCode): CurrencyInfo => {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
};

export const formatCurrency = (amount: number, currencyCode: CurrencyCode): string => {
  const currency = getCurrencyInfo(currencyCode);
  return `${currency.symbol}${amount.toFixed(2)}`;
};
