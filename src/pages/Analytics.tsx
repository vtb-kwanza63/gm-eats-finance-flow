import { motion } from 'framer-motion';
import { BarChart3, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { StatsCards } from '@/components/dashboard/StatsCards';
import type { Transaction } from '@/types/transaction';

interface AnalyticsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function Analytics({ transactions, isLoading }: AnalyticsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Analytics
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-1"
        >
          Analyze your financial data with interactive charts and insights
        </motion.p>
      </div>

      {/* Stats Overview */}
      <StatsCards transactions={transactions} isLoading={isLoading} />

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnalyticsCharts transactions={transactions} isLoading={isLoading} />
      </motion.div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Transaction Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-success-light rounded-lg">
                  <span className="text-sm text-success-foreground">Most Active Month</span>
                  <span className="font-medium text-success">
                    {transactions.length > 0 ? (() => {
                      const monthCounts = transactions.reduce((acc, t) => {
                        const key = `${t.Date.year}-${t.Date.month}`;
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      const maxKey = Object.keys(monthCounts).reduce((a, b) => 
                        monthCounts[a] > monthCounts[b] ? a : b
                      );
                      
                      const [year, month] = maxKey.split('-');
                      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      });
                    })() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-primary-light rounded-lg">
                  <span className="text-sm text-primary-foreground">Total Months Tracked</span>
                  <span className="font-medium text-primary">
                    {(() => {
                      const months = new Set(transactions.map(t => `${t.Date.year}-${t.Date.month}`));
                      return months.size;
                    })()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Average per Month</span>
                  <span className="font-medium text-foreground">
                    {(() => {
                      const months = new Set(transactions.map(t => `${t.Date.year}-${t.Date.month}`));
                      return months.size > 0 ? Math.round(transactions.length / months.size) : 0;
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const income = transactions.filter(t => t.Transaction_type === 'income').length;
                  const expenses = transactions.filter(t => t.Transaction_type === 'expense').length;
                  const ratio = expenses > 0 ? (income / expenses).toFixed(2) : '∞';
                  const healthScore = income >= expenses ? 'Excellent' : 
                                    income >= expenses * 0.8 ? 'Good' : 
                                    income >= expenses * 0.6 ? 'Fair' : 'Needs Attention';
                  
                  return (
                    <>
                      <div className="flex justify-between items-center p-3 bg-success-light rounded-lg">
                        <span className="text-sm text-success-foreground">Income Ratio</span>
                        <span className="font-medium text-success">{ratio}:1</span>
                      </div>
                      
                      <div className={`flex justify-between items-center p-3 rounded-lg ${
                        healthScore === 'Excellent' ? 'bg-success-light' :
                        healthScore === 'Good' ? 'bg-primary-light' :
                        healthScore === 'Fair' ? 'bg-warning-light' : 'bg-warning-light'
                      }`}>
                        <span className="text-sm">Financial Health</span>
                        <span className="font-medium">{healthScore}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {healthScore === 'Excellent' && "Your income transactions exceed your expenses. Great job!"}
                        {healthScore === 'Good' && "Your finances are balanced with good income coverage."}
                        {healthScore === 'Fair' && "Consider increasing income or reducing expenses."}
                        {healthScore === 'Needs Attention' && "Focus on improving your income-to-expense ratio."}
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}