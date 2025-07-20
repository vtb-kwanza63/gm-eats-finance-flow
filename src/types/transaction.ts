export interface TransactionDate {
  month: string; // 01-12 format
  year: string;  // YYYY format
  day: string;   // DD format
}

export interface Transaction {
  _id?: string;
  Date: TransactionDate;
  Transaction: string;
  Transaction_type: 'income' | 'expense';
  __v?: number;
}

export interface TransactionFormData {
  transaction: string;
  transactionType: 'income' | 'expense';
  date: Date;
}

export interface FilterParams {
  month?: string;
  year?: string;
  type?: 'income' | 'expense';
}

export interface MonthlyTotal {
  month: string;
  year: string;
  income: number;
  expenses: number;
  net: number;
}

export interface YearlyTotal {
  year: string;
  income: number;
  expenses: number;
  net: number;
}