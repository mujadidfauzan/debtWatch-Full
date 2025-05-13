import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react'; // Assuming you use lucide-react for icons

// Placeholder for UserProfile component if you have one, or define inline
const UserProfilePlaceholder = ({ userName }: { userName: string }) => (
  <div className="flex items-center space-x-2 bg-black/20 text-white p-2 rounded-lg">
    {/* Placeholder for a user icon */}
    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </div>
    <span>{userName}</span>
  </div>
);

interface Transaction {
  id: string;
  icon: string; // Placeholder for icon type
  name: string;
  dateRange: string;
  category: string;
  amount: string;
  isExpense: boolean;
}

const dummyTransactions: Transaction[] = [
  {
    id: '1',
    icon: '💰', // Example icon
    name: 'Salary',
    dateRange: '18-27 - April 30',
    category: 'Monthly',
    amount: '4.000,00',
    isExpense: false,
  },
  {
    id: '2',
    icon: '🛒', // Example icon
    name: 'Groceries',
    dateRange: '17:00 - April 24',
    category: 'Pantry',
    amount: '-100,00',
    isExpense: true,
  },
  {
    id: '3',
    icon: '🏠', // Example icon
    name: 'Rent',
    dateRange: '8:30 - April 15',
    category: 'Rent',
    amount: '-674,40',
    isExpense: true,
  },
];

const FinancialOverviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Monthly');
  // Dummy data - replace with actual data fetching and state management
  const userName = "JohnDoe";
  const totalIncomes = "100.000";
  const totalExpenses = "30.000";
  const balance = "70.000";
  const expensePercentage = 30;

  return (
    <div className="min-h-screen bg-app-blue text-white flex flex-col">
      {/* Top Navigation/Header */}
      <div className="p-4 flex items-center justify-between">
        {/* <ChevronLeft size={28} className="cursor-pointer" onClick={() => window.history.back()} /> */}
        {/* User Profile - Use your actual UserProfile component here */}
        <UserProfilePlaceholder userName={userName} />
        {/* Add any other header elements if needed */}
      </div>

      {/* Main Content Area */}
      <div className="px-4 pb-4">
        {/* Income/Expense Summary */}
        <div className="mb-6">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-xs text-white/80 flex items-center"><span className="text-green-400 mr-1">↗️</span> Total Incomes</p>
              <p className="text-2xl font-bold">Rp {totalIncomes}</p>
            </div>
            <div className="h-10 w-px bg-white/40"></div> {/* Separator */}
            <div className="text-center">
              <p className="text-xs text-white/80 flex items-center"><span className="text-red-400 mr-1">↘️</span> Total Expenses</p>
              <p className="text-2xl font-bold">Rp {totalExpenses}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-white/30 rounded-full h-6 flex items-center text-xs">
            <div 
              className="bg-green-400 h-full rounded-l-full flex items-center justify-center text-black font-semibold"
              style={{ width: `${100 - expensePercentage}%` }}
            >
              {100 - expensePercentage}%
            </div>
            <div 
              className="bg-red-400 h-full rounded-r-full flex items-center justify-center text-black font-semibold"
              style={{ width: `${expensePercentage}%` }}
            >
              {expensePercentage}%
            </div>
             {/* Balance text - You might want to position this differently based on exact UI */}
            {/* <span className="ml-auto pr-3 text-white font-medium">Rp {balance}</span> */}
          </div>
           <p className="text-right text-xs mt-1 text-white/80">Sisa: Rp {balance}</p>
        </div>
      </div>

      {/* White Content Area with Rounded Top */}
      <div className="flex-1 bg-white text-gray-800 rounded-t-[28px] p-4 flex flex-col">
        {/* Savings & Last Week Summary */}
        <div className="bg-yellow-400 text-black p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="text-center">
            {/* Placeholder for car icon with circular progress */}
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-1 mx-auto">
              <span className="text-2xl">🚗</span>
            </div>
            <p className="text-xs font-semibold">Savings</p>
            <p className="text-xs">On Goals</p>
          </div>
          <div className="w-px bg-black/20 h-16 mx-2"></div> {/* Separator */}
          <div className="space-y-2 flex-1 pl-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl mr-2">💰</span> {/* Placeholder icon */}
                <div>
                  <p className="text-xs font-medium">Revenue Last Week</p>
                  <p className="text-sm font-bold">$4.000.00</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl mr-2">🍴</span> {/* Placeholder icon */}
                <div>
                  <p className="text-xs font-medium">Food Last Week</p>
                  <p className="text-sm font-bold text-red-600">-$100.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Daily, Weekly, Monthly */}
        <div className="mb-6">
          <div className="flex justify-around bg-blue-100 rounded-full p-1">
            {['Daily', 'Weekly', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex-1 transition-colors
                  ${activeTab === tab ? 'bg-yellow-400 text-black' : 'text-blue-700 hover:bg-blue-200'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3 overflow-y-auto pb-16"> {/* Added pb for potential nav bar */}
          {dummyTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 rounded-lg mr-3">
                <span className="text-xl">{transaction.icon}</span> {/* Display icon */}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{transaction.name}</p>
                <p className="text-xs text-gray-500">{transaction.dateRange}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${transaction.isExpense ? 'text-red-600' : 'text-green-600'}`}>{transaction.amount}</p>
                <p className="text-xs text-gray-500">{transaction.category}</p>
              </div>
            </div>
          ))}
           {dummyTransactions.length === 0 && (
            <p className="text-center text-gray-500 py-4">No transactions for this period.</p>
          )}
        </div>
      </div>
      {/* <NavigationBar /> // If you have a common NavigationBar */}
    </div>
  );
};

export default FinancialOverviewPage; 