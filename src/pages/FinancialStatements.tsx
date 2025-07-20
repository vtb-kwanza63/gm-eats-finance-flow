import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { Transaction } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  period: string;
}

interface ComparisonData {
  current: FinancialSummary;
  previous: FinancialSummary;
  percentageChange: {
    income: number;
    expenses: number;
    net: number;
  };
}

export default function FinancialStatements() {
  const [viewMode, setViewMode] = useState<'annual' | 'dateRange' | 'singleMonth' | 'comparison'>('annual');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [comparisonPeriod1, setComparisonPeriod1] = useState('');
  const [comparisonPeriod2, setComparisonPeriod2] = useState('');
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const calculateFinancialSummary = (transactions: Transaction[], period: string): FinancialSummary => {
    const income = transactions
      .filter(t => t.Transaction_type === 'income')
      .reduce((sum, t) => sum + t.value, 0);
    
    const expenses = transactions
      .filter(t => t.Transaction_type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      transactionCount: transactions.length,
      period
    };
  };

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      let filters = {};
      let period = '';

      switch (viewMode) {
        case 'annual':
          filters = { year: selectedYear };
          period = selectedYear;
          break;
        case 'dateRange':
          if (startMonth && endMonth) {
            const [startYear, startMon] = startMonth.split('-');
            const [endYear, endMon] = endMonth.split('-');
            // For now, we'll fetch all data and filter locally
            // In a real app, you'd want server-side filtering for date ranges
            const transactions = await api.getTransactions();
            const filteredTransactions = transactions.filter(t => {
              const transactionDate = `${t.Date.year}-${t.Date.month}`;
              return transactionDate >= startMonth && transactionDate <= endMonth;
            });
            const summary = calculateFinancialSummary(filteredTransactions, `${startMonth} to ${endMonth}`);
            setFinancialData(summary);
            setIsLoading(false);
            return;
          }
          break;
        case 'singleMonth':
          if (selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            filters = { year, month };
            period = `${months.find(m => m.value === month)?.label} ${year}`;
          }
          break;
      }

      const transactions = await api.getTransactions(filters);
      const summary = calculateFinancialSummary(transactions, period);
      setFinancialData(summary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComparisonData = async () => {
    if (!comparisonPeriod1 || !comparisonPeriod2) return;

    setIsLoading(true);
    try {
      const [year1, month1] = comparisonPeriod1.split('-');
      const [year2, month2] = comparisonPeriod2.split('-');

      const [transactions1, transactions2] = await Promise.all([
        api.getTransactions({ year: year1, month: month1 }),
        api.getTransactions({ year: year2, month: month2 })
      ]);

      const summary1 = calculateFinancialSummary(transactions1, `${months.find(m => m.value === month1)?.label} ${year1}`);
      const summary2 = calculateFinancialSummary(transactions2, `${months.find(m => m.value === month2)?.label} ${year2}`);

      const percentageChange = {
        income: summary2.totalIncome ? ((summary1.totalIncome - summary2.totalIncome) / summary2.totalIncome) * 100 : 0,
        expenses: summary2.totalExpenses ? ((summary1.totalExpenses - summary2.totalExpenses) / summary2.totalExpenses) * 100 : 0,
        net: summary2.netIncome ? ((summary1.netIncome - summary2.netIncome) / summary2.netIncome) * 100 : 0,
      };

      setComparisonData({
        current: summary1,
        previous: summary2,
        percentageChange
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comparison data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'comparison') {
      fetchFinancialData();
    }
  }, [viewMode, selectedYear, startMonth, endMonth, selectedMonth]);

  useEffect(() => {
    if (viewMode === 'comparison') {
      fetchComparisonData();
    }
  }, [comparisonPeriod1, comparisonPeriod2]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const renderFinancialSummary = (data: FinancialSummary, title?: string) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(data.totalIncome)}</div>
          <p className="text-xs text-muted-foreground">
            {title || data.period}
          </p>
        </CardContent>
      </Card>

      <Card className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{formatCurrency(data.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {title || data.period}
          </p>
        </CardContent>
      </Card>

      <Card className="hover-scale">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-success' : 'text-warning'}`}>
            {formatCurrency(data.netIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            {title || data.period}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Financial Statements</h1>
        <p className="text-muted-foreground">
          Comprehensive financial reporting and analysis
        </p>
      </div>

      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="annual">Annual View</TabsTrigger>
          <TabsTrigger value="dateRange">Date Range</TabsTrigger>
          <TabsTrigger value="singleMonth">Single Month</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Annual Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="year">Select Year:</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {financialData && renderFinancialSummary(financialData)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dateRange" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date Range Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startMonth">From (YYYY-MM):</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endMonth">To (YYYY-MM):</Label>
                  <Input
                    id="endMonth"
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                  />
                </div>
              </div>
              {financialData && renderFinancialSummary(financialData)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="singleMonth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectedMonth">Select Month (YYYY-MM):</Label>
                <Input
                  id="selectedMonth"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              {financialData && renderFinancialSummary(financialData)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Period Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period1">Period 1 (YYYY-MM):</Label>
                  <Input
                    id="period1"
                    type="month"
                    value={comparisonPeriod1}
                    onChange={(e) => setComparisonPeriod1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period2">Period 2 (YYYY-MM):</Label>
                  <Input
                    id="period2"
                    type="month"
                    value={comparisonPeriod2}
                    onChange={(e) => setComparisonPeriod2(e.target.value)}
                  />
                </div>
              </div>

              {comparisonData && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Current Period</h3>
                    {renderFinancialSummary(comparisonData.current)}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Previous Period</h3>
                    {renderFinancialSummary(comparisonData.previous)}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Change Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Income Change</span>
                            <Badge variant={comparisonData.percentageChange.income >= 0 ? "default" : "destructive"}>
                              {formatPercentage(comparisonData.percentageChange.income)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Expense Change</span>
                            <Badge variant={comparisonData.percentageChange.expenses <= 0 ? "default" : "destructive"}>
                              {formatPercentage(comparisonData.percentageChange.expenses)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Net Change</span>
                            <Badge variant={comparisonData.percentageChange.net >= 0 ? "default" : "destructive"}>
                              {formatPercentage(comparisonData.percentageChange.net)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}