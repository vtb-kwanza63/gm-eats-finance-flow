import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/transaction';

interface StatsCardsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function StatsCards({ transactions, isLoading }: StatsCardsProps) {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => 
      parseInt(t.Date.month) === currentMonth && 
      parseInt(t.Date.year) === currentYear
    );
    
    const thisYearTransactions = transactions.filter(t => 
      parseInt(t.Date.year) === currentYear
    );

    const totalIncome = transactions.filter(t => t.Transaction_type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = transactions.filter(t => t.Transaction_type === 'expense').reduce((sum, t) => sum + t.value, 0);
    
    const thisMonthIncome = thisMonthTransactions.filter(t => t.Transaction_type === 'income').reduce((sum, t) => sum + t.value, 0);
    const thisMonthExpenses = thisMonthTransactions.filter(t => t.Transaction_type === 'expense').reduce((sum, t) => sum + t.value, 0);
    
    const thisYearIncome = thisYearTransactions.filter(t => t.Transaction_type === 'income').reduce((sum, t) => sum + t.value, 0);
    const thisYearExpenses = thisYearTransactions.filter(t => t.Transaction_type === 'expense').reduce((sum, t) => sum + t.value, 0);

    return {
      total: {
        income: totalIncome,
        expenses: totalExpenses,
        net: totalIncome - totalExpenses,
        transactions: transactions.length,
      },
      thisMonth: {
        income: thisMonthIncome,
        expenses: thisMonthExpenses,
        net: thisMonthIncome - thisMonthExpenses,
        transactions: thisMonthTransactions.length,
      },
      thisYear: {
        income: thisYearIncome,
        expenses: thisYearExpenses,
        net: thisYearIncome - thisYearExpenses,
        transactions: thisYearTransactions.length,
      }
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Transactions",
      value: stats.total.transactions,
      icon: BarChart3,
      gradient: "bg-gradient-primary",
      textColor: "text-primary-foreground",
      change: null,
    },
    {
      title: "This Month Income",
      value: stats.thisMonth.income,
      icon: TrendingUp,
      gradient: "bg-gradient-success",
      textColor: "text-success-foreground",
      change: null,
    },
    {
      title: "This Month Expenses",
      value: stats.thisMonth.expenses,
      icon: TrendingDown,
      gradient: "bg-gradient-warning",
      textColor: "text-warning-foreground",
      change: null,
    },
    {
      title: "This Month Net",
      value: stats.thisMonth.net,
      icon: DollarSign,
      gradient: stats.thisMonth.net >= 0 ? "bg-gradient-success" : "bg-gradient-warning",
      textColor: stats.thisMonth.net >= 0 ? "text-success-foreground" : "text-warning-foreground",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover-lift overflow-hidden">
              <CardContent className="p-0">
                <div className={cn("p-6 text-white", card.gradient)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm opacity-90", card.textColor)}>
                        {card.title}
                      </p>
                      <motion.p
                        key={card.value}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("text-3xl font-bold", card.textColor)}
                      >
                        {card.title.includes('Transaction') ? card.value : `$${card.value.toLocaleString()}`}
                      </motion.p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      "bg-white/20 backdrop-blur-sm"
                    )}>
                      <Icon className={cn("w-6 h-6", card.textColor)} />
                    </div>
                  </div>
                </div>
                
                {/* Additional Details */}
                <div className="p-4 bg-card">
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block">This Year</span>
                      <span className="font-medium text-foreground">
                        {card.title.includes('Income') ? `$${stats.thisYear.income.toLocaleString()}` :
                         card.title.includes('Expenses') ? `$${stats.thisYear.expenses.toLocaleString()}` :
                         card.title.includes('Net') ? `$${stats.thisYear.net.toLocaleString()}` :
                         stats.thisYear.transactions}
                      </span>
                    </div>
                    <div>
                      <span className="block">All Time</span>
                      <span className="font-medium text-foreground">
                        {card.title.includes('Income') ? `$${stats.total.income.toLocaleString()}` :
                         card.title.includes('Expenses') ? `$${stats.total.expenses.toLocaleString()}` :
                         card.title.includes('Net') ? `$${stats.total.net.toLocaleString()}` :
                         stats.total.transactions}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}