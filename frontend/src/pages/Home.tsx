import React from "react";
import SummaryCard from "../components/SummaryCard";
import Tabs from "../components/Tabs";
import TransactionItem from "../components/TransactionItem";
import UserProfile from "../components/UserProfile";
import NavigationBar from "../components/NavigationBar";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserTransactions } from "../lib/api";
import { auth } from "@/firebase"; // Import auth

// Remove the hardcoded USER_ID
// const USER_ID = "user123"; 

export default function Dashboard() {
  // Get the current user from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid; // Get the UID

  const { data: userProfile, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile } = useQuery({
    // Use the dynamic userId in the queryKey
    queryKey: ['userProfile', userId],
    // Pass the dynamic userId to the query function
    queryFn: () => getUserProfile(userId!),
    // Only enable the query if userId is available
    enabled: !!userId,
  });

  const { data: transactions, isLoading: isLoadingTransactions, isError: isErrorTransactions, error: errorTransactions } = useQuery({
    // Use the dynamic userId in the queryKey
    queryKey: ['transactions', userId],
    // Pass the dynamic userId to the query function
    queryFn: () => getUserTransactions(userId!),
    // Only enable the query if userId is available
    enabled: !!userId,
  });

  const income = transactions?.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const expenses = transactions?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const balance = income - expenses;
  const progressPercentage = income > 0 ? (expenses / income) * 100 : 0;

  // Combined loading state check
  if ((isLoadingProfile || isLoadingTransactions) && userId) {
    return <div className="flex justify-center items-center min-h-screen">Loading user data...</div>;
  }

  // Handle case where user is not logged in (userId is null/undefined)
  // This case should technically be handled by the routing in App.tsx, but adding a check here is safe.
  if (!userId) {
     return <div className="flex justify-center items-center min-h-screen">User not logged in.</div>;
     // Or ideally, redirect to login, though App.tsx should handle this.
  }

  // Handle errors after userId is confirmed
  if (isErrorProfile) {
    return <div className="flex justify-center items-center min-h-screen">Error loading profile: {errorProfile instanceof Error ? errorProfile.message : 'Unknown error'}</div>;
  }
  if (isErrorTransactions) {
    return <div className="flex justify-center items-center min-h-screen">Error loading transactions: {errorTransactions instanceof Error ? errorTransactions.message : 'Unknown error'}</div>;
  }

  return (
    <div className="relative min-h-screen">
     
      <div className="absolute inset-0 bg-gradient-to-b from-app-blue to-blue-600 z-0" />

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="p-4">
          {/* Profil User */}
          <div className="mb-6">
            <UserProfile userName={userProfile?.full_name} />
          </div>

          {/* Summary */}
          <div className="bg-blue-700 text-white rounded-xl p-4 z-10 relative">
            <div className="flex justify-between items-center text-sm mb-4">
              {/* Incomes */}
              <div className="flex-1">
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <span className="text-yellow-400">↗️</span>
                  <p>Total Incomes</p>
                </div>
                <p className="text-2xl font-bold">
                  Rp {income.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-white/40 mx-2" />

              {/* Expenses */}
              <div className="flex-1 text-right">
                <div className="flex justify-end items-center gap-1 text-white/80 text-xs">
                  <span className="text-yellow-400">↘️</span>
                  <p>Total Expenses</p>
                </div>
                <p className="text-2xl font-bold text-yellow-300">
                  Rp {expenses.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 bg-white rounded-full h-6 flex items-center ">
              <div
                className="bg-black text-white text-xs h-6 rounded-full flex items-center justify-center "
                style={{ width: `${progressPercentage}%`, minWidth: "3rem" }}
              >
                {Math.round(progressPercentage)}%
              </div>
              <div className="flex-1 text-right text-black text-xs pr-2 font-medium">
                Balance: Rp {balance.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>

        {/* Area putih hingga bawah */}
        <div className="bg-white rounded-t-3xl p-4 flex-1 -mt-6 z-10 relative">
          <SummaryCard />

          <div className="mt-4">
            <Tabs />
          </div>

          <div className="space-y-4 mt-4 pb-24">
            <p className="text-md italic text-left text-blue-600">Detail Transaksi</p>
            {transactions && transactions.length > 0 ? (
              transactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  icon={transaction.type === 'income' ? '💰' : '💸'} // Example icon
                  title={transaction.note || transaction.category}
                  time={new Date(transaction.created_at).toLocaleString('id-ID')}
                  category={transaction.category}
                  amount={`${transaction.type === 'expense' ? '-' : ''}Rp ${transaction.amount.toLocaleString("id-ID")}`}
                  positive={transaction.type === 'income'}
                />
              ))
            ) : (
              <p>Tidak ada transaksi.</p>
            )}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NavigationBar />
      </div>
    </div>
  );
}
