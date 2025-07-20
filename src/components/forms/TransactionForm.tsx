import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarIcon, Plus, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TransactionFormData } from '@/types/transaction';

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({ onSuccess, onCancel, isModal = false, defaultType = 'income' }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    transaction: '',
    value: 0,
    transactionType: defaultType,
    date: new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transaction.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction description",
        variant: "destructive",
      });
      return;
    }

    if (formData.value <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await api.createTransaction({
        Date: {
          month: String(formData.date.getMonth() + 1).padStart(2, '0'),
          year: String(formData.date.getFullYear()),
          day: String(formData.date.getDate()).padStart(2, '0'),
        },
        Transaction: formData.transaction,
        value: formData.value,
        Transaction_type: formData.transactionType,
      });

      toast({
        title: "Success!",
        description: "Transaction added successfully",
        variant: "default",
      });

      // Reset form
      setFormData({
        transaction: '',
        value: 0,
        transactionType: 'income',
        date: new Date(),
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Transaction Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'income', label: 'Income', icon: DollarSign, color: 'success' },
            { value: 'expense', label: 'Expense', icon: CreditCard, color: 'warning' },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = formData.transactionType === type.value;
            
            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transactionType: type.value as 'income' | 'expense' }))}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
                  isSelected
                    ? type.color === 'success'
                      ? "border-success bg-success-light text-success"
                      : "border-warning bg-warning-light text-warning"
                    : "border-border bg-background hover:bg-muted/50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Transaction Description */}
      <div className="space-y-2">
        <Label htmlFor="transaction">Description</Label>
        <Input
          id="transaction"
          placeholder="Enter transaction description..."
          value={formData.transaction}
          onChange={(e) => setFormData(prev => ({ ...prev, transaction: e.target.value }))}
          className="transition-all duration-200 focus:scale-[1.02]"
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="value">Amount</Label>
        <Input
          id="value"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount"
          value={formData.value || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
          className="transition-all duration-200 focus:scale-[1.02]"
        />
      </div>

      {/* Date Selection */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal transition-all duration-200 hover:scale-[1.02]",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}