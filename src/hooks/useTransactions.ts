import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { Transaction, FilterParams } from '@/types/transaction';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({});
  const { toast } = useToast();

  const fetchTransactions = useCallback(async (filters?: FilterParams) => {
    setIsLoading(true);
    try {
      const data = await api.getTransactions(filters);
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleFilterChange = useCallback((filters: FilterParams) => {
    setCurrentFilters(filters);
    fetchTransactions(filters);
  }, [fetchTransactions]);

  const refreshTransactions = useCallback(() => {
    fetchTransactions(currentFilters);
  }, [fetchTransactions, currentFilters]);

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    currentFilters,
    handleFilterChange,
    refreshTransactions,
    fetchTransactions,
  };
}