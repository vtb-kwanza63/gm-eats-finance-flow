import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Search, Filter, Calendar, DollarSign, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSkeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import type { Transaction, FilterParams } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onFilterChange?: (filters: FilterParams) => void;
  className?: string;
}

export function TransactionList({ 
  transactions, 
  isLoading = false, 
  onFilterChange,
  className 
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterParams>({});

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => 
      transaction.Transaction.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  const handleFilterChange = (key: keyof FilterParams, value: string | undefined) => {
    // Convert "all" back to undefined for API calls
    const apiValue = value === "all" ? undefined : value;
    const newFilters = { ...filters, [key]: apiValue };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    onFilterChange?.({});
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingSkeleton count={5} className="h-16" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange('type', value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.month || "all"}
              onValueChange={(value) => handleFilterChange('month', value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, '0');
                  const monthName = format(new Date(2024, i, 1), 'MMMM');
                  return (
                    <SelectItem key={month} value={month}>
                      {monthName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select
              value={filters.year || "all"}
              onValueChange={(value) => handleFilterChange('year', value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {[2024, 2025].map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filters.type || filters.month || filters.year || searchTerm) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your search or filters"
                : "Add your first transaction to get started"}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction._id || index}
                transaction={transaction}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

function TransactionCard({ transaction, index }: TransactionCardProps) {
  const isIncome = transaction.Transaction_type === 'income';
  const date = new Date(
    parseInt(transaction.Date.year),
    parseInt(transaction.Date.month) - 1,
    parseInt(transaction.Date.day)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="hover-scale">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                isIncome 
                  ? "bg-success-light text-success" 
                  : "bg-warning-light text-warning"
              )}>
                {isIncome ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>

              {/* Transaction Details */}
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  {transaction.Transaction}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{format(date, 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Amount and Type */}
            <div className="text-right">
              <div className={cn(
                "text-lg font-semibold mb-1",
                isIncome ? "text-success" : "text-warning"
              )}>
                {isIncome ? '+' : '-'}${transaction.value.toLocaleString()}
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize",
                  isIncome 
                    ? "bg-success-light text-success border-success/20" 
                    : "bg-warning-light text-warning border-warning/20"
                )}
              >
                {transaction.Transaction_type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}