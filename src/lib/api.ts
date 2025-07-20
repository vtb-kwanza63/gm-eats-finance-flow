import { Transaction, FilterParams } from '@/types/transaction';

const API_BASE_URL = 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async createTransaction(transaction: Omit<Transaction, '_id' | '__v'>): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new ApiError(`Failed to create transaction: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while creating transaction');
    }
  },

  async getTransactions(filters?: FilterParams): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.month) params.append('month', filters.month);
      if (filters?.year) params.append('year', filters.year);
      if (filters?.type) params.append('type', filters.type);

      const url = `${API_BASE_URL}/transactions${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new ApiError(`Failed to fetch transactions: ${response.statusText}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Network error while fetching transactions');
    }
  },
};