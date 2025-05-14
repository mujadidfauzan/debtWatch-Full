import React, { useState, useEffect } from "react";
import UserProfile from "@/components/UserProfile";
import TabSelector from "@/components/TabSelector";
import AmountDisplay from "@/components/AmountDisplay";
import Calculator from "@/components/Calculator";
import NavigationBar from "@/components/NavigationBar";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addUserTransaction, getUserProfile } from "../lib/api";
import { TransactionData } from "../lib/api";
import { auth } from "@/firebase";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState<string>("0");
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const queryClient = useQueryClient();

  const { data: userProfile } = useQuery({ 
    queryKey: ['userProfile', userId], 
    queryFn: () => getUserProfile(userId!), 
    enabled: !!userId 
  });

  const mutation = useMutation({
    mutationFn: (newTransaction: Omit<TransactionData, 'id' | 'created_at'> & { created_at: Date }) => {
      if (!userId) {
        toast.error("User not logged in!");
        throw new Error("User not logged in");
      }
      return addUserTransaction(userId, newTransaction);
    },
    onSuccess: () => {
      toast.success("Transaction added successfully!");
      setAmount('0');
      setCategory(''); 
      setNote('');
      setSelectedDate(new Date());
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    },
    onError: (error: Error) => {
      console.error("Error adding transaction:", error);
      toast.error(`Failed to add transaction: ${error.message}`);
    }
  });

  const handleAddTransaction = () => {
    const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date.");
      return;
    }
    if (!userId) {
      toast.error("Cannot add transaction: User not logged in.");
      return;
    }

    const transactionToAdd = {
      amount: numericAmount,
      category: category,
      note: note.trim(), 
      type: activeTab,
      created_at: selectedDate
    };

    mutation.mutate(transactionToAdd);
  };

  const performCalculation = () => {
    if (!firstOperand || !operation || amount === null) return amount;

    const prev = parseFloat(firstOperand.replace(/\./g, '').replace(',', '.'));
    const current = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    let result: number;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '−':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) {
          toast.error("Cannot divide by zero");
          return "0";
        }
        result = prev / current;
        break;
      default:
        return amount;
    }
    return result.toString();
  };

  const handleKeyPress = (key: string) => {
    if (key === "C") {
      setAmount("0");
      setFirstOperand(null);
      setOperation(null);
      setWaitingForSecondOperand(false);
    } else if (key === "⌫") {
      if (waitingForSecondOperand) {
          setAmount("0");
      } else {
        setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
      }
    } else if (key === "enter") {
      if (firstOperand && operation && amount && !waitingForSecondOperand) {
        const result = performCalculation();
        setAmount(result);
        setFirstOperand(null);
        setOperation(null);
        setWaitingForSecondOperand(false);
      } else {
        if (!operation) {
            handleAddTransaction();
        }
      }
    } else if (["÷", "×", "−", "+"].includes(key)) {
      if (amount === "0" && firstOperand === null) return;

      if (firstOperand && operation && !waitingForSecondOperand) {
        const result = performCalculation();
        setAmount(result);
        setFirstOperand(result);
      } else {
        setFirstOperand(amount);
      }
      setOperation(key);
      setWaitingForSecondOperand(true);
    } else {
      if (waitingForSecondOperand) {
        setAmount(key === "." ? "0." : key);
        setWaitingForSecondOperand(false);
      } else {
        setAmount(prev => {
          if (key === ".") {
            return prev.includes(".") ? prev : prev + key;
          }
          if (prev === "0" && key !== ".") {
            return key;
          }
          return prev + key;
        });
      }
    }
  };

  const currentCategories = activeTab === 'income' ? incomeCategories : expenseCategories;

  const isFormValid = parseFloat(amount) > 0 && !!category && !!selectedDate;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-app-blue to-blue-600">
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-6">
          <UserProfile userName={userProfile?.full_name} />
        </div>

        <div className="mb-4">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="mb-4">
          <AmountDisplay 
            amount={amount} 
            firstOperand={firstOperand}
            operation={operation}
            waitingForSecondOperand={waitingForSecondOperand}
          />
        </div>
        
        <div className="space-y-3 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/20 border-white/50 text-white hover:text-white",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-white/20 border-white/50 text-white">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {currentCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input 
            type="text"
            placeholder="Write a note... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 rounded bg-white/20 text-white placeholder-white/70"
          />
        </div>
        
        <Button 
          onClick={handleAddTransaction}
          disabled={!isFormValid || mutation.isPending}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg mb-4 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save Transaction'}
        </Button>

        <div className="mt-auto">
          <Calculator onKeyPress={handleKeyPress} />
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default Index;
