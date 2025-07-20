import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/loading';
import type { Transaction, MonthlyTotal, YearlyTotal } from '@/types/transaction';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function AnalyticsCharts({ transactions, isLoading }: AnalyticsChartsProps) {
  const monthlyData = useMemo(() => {
    const monthlyTotals: Record<string, MonthlyTotal> = {};

    transactions.forEach(transaction => {
      const key = `${transaction.Date.year}-${transaction.Date.month}`;
      const monthName = new Date(
        parseInt(transaction.Date.year),
        parseInt(transaction.Date.month) - 1,
        1
      ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyTotals[key]) {
        monthlyTotals[key] = {
          month: transaction.Date.month,
          year: transaction.Date.year,
          income: 0,
          expenses: 0,
          net: 0,
        };
      }

      if (transaction.Transaction_type === 'income') {
        monthlyTotals[key].income += 1;
      } else {
        monthlyTotals[key].expenses += 1;
      }
      
      monthlyTotals[key].net = monthlyTotals[key].income - monthlyTotals[key].expenses;
    });

    return Object.entries(monthlyTotals)
      .map(([key, data]) => ({
        ...data,
        name: new Date(
          parseInt(data.year),
          parseInt(data.month) - 1,
          1
        ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      }))
      .sort((a, b) => {
        const dateA = new Date(parseInt(a.year), parseInt(a.month) - 1);
        const dateB = new Date(parseInt(b.year), parseInt(b.month) - 1);
        return dateA.getTime() - dateB.getTime();
      });
  }, [transactions]);

  const yearlyData = useMemo(() => {
    const yearlyTotals: Record<string, YearlyTotal> = {};

    transactions.forEach(transaction => {
      const year = transaction.Date.year;

      if (!yearlyTotals[year]) {
        yearlyTotals[year] = {
          year,
          income: 0,
          expenses: 0,
          net: 0,
        };
      }

      if (transaction.Transaction_type === 'income') {
        yearlyTotals[year].income += 1;
      } else {
        yearlyTotals[year].expenses += 1;
      }
      
      yearlyTotals[year].net = yearlyTotals[year].income - yearlyTotals[year].expenses;
    });

    return Object.values(yearlyTotals).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard className="h-80" />
        <LoadingCard className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Monthly Transaction Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px hsl(var(--shadow))',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    name="Income" 
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Expenses" 
                    fill="hsl(var(--warning))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Yearly Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Yearly Transaction Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px hsl(var(--shadow))',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="income" 
                    name="Income" 
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Expenses" 
                    fill="hsl(var(--warning))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}