import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getUserTransactions, TransactionData, getUserProfile, UserProfileData } from '@/lib/api';
import { auth } from '@/firebase';
import { getCategoryIcon } from '@/lib/categoryUtils';
import { useNavigate } from 'react-router-dom';

// Placeholder for UserProfile component if you have one, or define inline
const UserProfilePlaceholder = ({ userName }: { userName: string }) => (
  <div className="flex items-center space-x-2 bg-black/20 text-white p-2 rounded-lg">
    {/* Placeholder for a user icon */}
    <div className="w-6 h-6 md:w-7 md:h-7 bg-gray-400 rounded-full flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
    <span className="text-xs md:text-xl">{userName}</span>
  </div>
);

// Format number as currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date from ISO string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);

  return `${hours}:${minutes} - ${month} ${day}`;
};

interface Transaction {
  id: string;
  icon: string;
  name: string;
  dateRange: string;
  category: string;
  amount: string;
  isExpense: boolean;
}

const FinancialOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ userName: string }>({ userName: 'User' });
  const [financialSummary, setFinancialSummary] = useState({
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
    expensePercentage: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;

        if (!user || !user.uid) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Fetch user profile data
        const profileData = await getUserProfile(user.uid);
        setUserData({ userName: profileData.full_name || user.displayName || 'User' });

        // Fetch transactions
        const transactionsData = await getUserTransactions(user.uid);

        // Process transactions based on active tab
        const filteredTransactions = filterTransactionsByTab(transactionsData, activeTab);

        // Calculate financial summary
        const summary = calculateFinancialSummary(filteredTransactions);
        setFinancialSummary(summary);

        // Map transactions to UI format
        const mappedTransactions = mapTransactionsForUI(filteredTransactions);
        setTransactions(mappedTransactions);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [activeTab]);

  // Filter transactions based on selected tab
  const filterTransactionsByTab = (transactionsData: TransactionData[], tab: string): TransactionData[] => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactionsData.filter((transaction) => {
      const transactionDate = new Date(transaction.created_at);

      switch (tab) {
        case 'Daily':
          return transactionDate >= startOfDay;
        case 'Weekly':
          return transactionDate >= startOfWeek;
        case 'Monthly':
          return transactionDate >= startOfMonth;
        default:
          return true;
      }
    });
  };

  // Calculate summary values
  const calculateFinancialSummary = (transactionsData: TransactionData[]) => {
    const totalIncomes = transactionsData.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactionsData.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncomes - totalExpenses;

    // Avoid division by zero
    const expensePercentage = totalIncomes === 0 ? 0 : Math.round((totalExpenses / totalIncomes) * 100);

    return {
      totalIncomes,
      totalExpenses,
      balance,
      expensePercentage: Math.min(expensePercentage, 100), // Cap at 100%
    };
  };

  // Map API transactions to UI format
  const mapTransactionsForUI = (transactionsData: TransactionData[]): Transaction[] => {
    return transactionsData.map((t) => ({
      id: t.id,
      icon: getCategoryIcon(t.category),
      name: t.note || t.category,
      dateRange: formatDate(t.created_at),
      category: t.category,
      amount: formatCurrency(t.amount),
      isExpense: t.type === 'expense',
    }));
  };

  return (
    <div className="min-h-screen bg-app-blue text-white flex flex-col">
      {/* Top Navigation/Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => navigate('/home')} className="flex items-center text-white hover:text-yellow-400 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm md:text-xl font-medium">Back</span>
        </button>
        <UserProfilePlaceholder userName={userData.userName} />
      </div>

      {/* Main Content Area */}
      <div className="px-4 pb-4">
        {/* Income/Expense Summary */}
        <div className="mb-6">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className=" text-white/80 flex items-center text-xs md:text-lg">
                <span className="text-green-400 mr-1 ">↗️</span> Total Incomes
              </p>
              <p className="text-2xl font-bold">Rp {formatCurrency(financialSummary.totalIncomes)}</p>
            </div>
            <div className="h-10 w-px bg-white/40"></div> {/* Separator */}
            <div className="text-center">
              <p className=" text-white/80 flex items-center text-xs md:text-lg">
                <span className="text-red-400 mr-1">↘️</span> Total Expenses
              </p>
              <p className="text-2xl font-bold">Rp {formatCurrency(financialSummary.totalExpenses)}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-white/30 rounded-full h-6 flex items-center text-xs md:text-lg">
            <div className="bg-green-400 h-full rounded-l-full flex items-center justify-center text-black font-semibold" style={{ width: `${100 - financialSummary.expensePercentage}%` }}>
              {100 - financialSummary.expensePercentage}%
            </div>
            <div className="bg-red-400 h-full rounded-r-full flex items-center justify-center text-black font-semibold" style={{ width: `${financialSummary.expensePercentage}%` }}>
              {financialSummary.expensePercentage}%
            </div>
          </div>
          <p className="text-right text-xs md:text-xl mt-1 text-white/80">Remaining: Rp {formatCurrency(financialSummary.balance)}</p>
        </div>
      </div>

      {/* White Content Area with Rounded Top */}
      <div className="flex-1 bg-white text-gray-800 rounded-t-[28px] p-4 flex flex-col">
        <div className="mb-6">
          <div className="flex justify-around bg-blue-100 rounded-full p-1">
            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm md:text-xl font-medium flex-1 transition-colors
                  ${activeTab === tab ? 'bg-yellow-400 text-black' : 'text-blue-700 hover:bg-blue-200'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Transaction List */}
        <div className="space-y-3 overflow-y-auto pb-16">
          {' '}
          {/* Added pb for potential nav bar */}
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                Retry
              </button>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                <div className="p-3 bg-blue-100 rounded-lg mr-3">
                  <span className="text-xl md:text-2xl">{transaction.icon}</span> {/* Display icon */}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm md:text-xl">{transaction.name}</p>
                  <p className="text-xs md:text-lg text-gray-500">{transaction.dateRange}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm md:text-xl font-semibold ${transaction.isExpense ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.isExpense ? '-Rp ' : '+Rp '}
                    {transaction.amount}
                  </p>
                  <p className="text-xs md:text-lg text-gray-500">{transaction.category}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No transactions for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverviewPage;
