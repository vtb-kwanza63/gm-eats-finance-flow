import { motion } from 'framer-motion';
import { Plus, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TransactionList } from '@/components/transactions/TransactionList';
import type { Transaction } from '@/types/transaction';

interface DashboardProps {
  transactions: Transaction[];
  isLoading: boolean;
  onAddTransaction: () => void;
}

export function Dashboard({ transactions, isLoading, onAddTransaction }: DashboardProps) {
  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(parseInt(a.Date.year), parseInt(a.Date.month) - 1, parseInt(a.Date.day));
      const dateB = new Date(parseInt(b.Date.year), parseInt(b.Date.month) - 1, parseInt(b.Date.day));
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Track your financial transactions and insights
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onAddTransaction}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <StatsCards transactions={transactions} isLoading={isLoading} />

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TransactionList
                transactions={recentTransactions}
                isLoading={isLoading}
                className="p-6 pt-0"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onAddTransaction}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onAddTransaction}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">This Month</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Income</span>
                    <span className="text-success font-medium">
                      ${transactions.filter(t => {
                        const now = new Date();
                        return t.Transaction_type === 'income' && 
                               parseInt(t.Date.month) === now.getMonth() + 1 &&
                               parseInt(t.Date.year) === now.getFullYear();
                      }).reduce((sum, t) => sum + t.value, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Expenses</span>
                    <span className="text-warning font-medium">
                      ${transactions.filter(t => {
                        const now = new Date();
                        return t.Transaction_type === 'expense' && 
                               parseInt(t.Date.month) === now.getMonth() + 1 &&
                               parseInt(t.Date.year) === now.getFullYear();
                      }).reduce((sum, t) => sum + t.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}