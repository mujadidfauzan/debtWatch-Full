import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/SummaryCard';
import Tabs from '../components/Tabs';
import TransactionItem from '../components/TransactionItem';
import UserProfile from '../components/UserProfile';
import NavigationBar from '../components/NavigationBar';
import AddDebtDialog from '../components/AddDebtDialog';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getUserTransactions } from '../lib/api';
import { auth } from '@/firebase'; // Import auth

// Define the structure of a debt item
interface DebtItem {
  id: string;
  namaUtang: string;
  totalCicilan: number;
  cicilanSudahDibayar: number;
  bunga: number | string; // Can be string from form, convert to number if needed
  cicilanPerbulan: number;
  // tanggalMulaiCicilan: string; // Add if you need to display or use it
}

// Remove the hardcoded USER_ID
// const USER_ID = "user123";

export default function Dashboard() {
  const navigate = useNavigate();

  // Get the current user from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid; // Get the UID

  const [isAddDebtDialogOpen, setIsAddDebtDialogOpen] = useState(false);
  const [debts, setDebts] = useState<DebtItem[]>([]); // Initialized as an empty array
  const [debtToEdit, setDebtToEdit] = useState<DebtItem | null>(null);
  const [isEditDebtDialogOpen, setIsEditDebtDialogOpen] = useState(false);

  const openAddDebtDialog = () => {
    setDebtToEdit(null); // Ensure we are in "add" mode
    setIsAddDebtDialogOpen(true);
  };
  const closeAddDebtDialog = () => setIsAddDebtDialogOpen(false);

  const openEditDebtDialog = (debt: DebtItem) => {
    setDebtToEdit(debt);
    setIsAddDebtDialogOpen(true); // Reuse the same dialog state for now
                               // Consider a separate state if dialog content differs significantly for edit
  };
  // We can use closeAddDebtDialog to close the dialog when editing is done or cancelled.

  const handleAddDebt = (newDebtData: Omit<DebtItem, 'id'>) => {
    setDebts(prevDebts => [
      ...prevDebts,
      { ...newDebtData, id: Date.now().toString() } // Simple ID generation
    ]);
    closeAddDebtDialog(); // Close dialog after adding
  };

  const handleEditDebt = (updatedDebt: DebtItem) => {
    setDebts(prevDebts => 
      prevDebts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt)
    );
    setIsAddDebtDialogOpen(false); // Close the dialog
    setDebtToEdit(null);
  };

  const handleDeleteDebt = (debtId: string) => {
    setDebts(prevDebts => prevDebts.filter(debt => debt.id !== debtId));
    setIsAddDebtDialogOpen(false); // Close the dialog
    setDebtToEdit(null); // Clear any debt being edited
  };

  // Calculate total utang dynamically
  const totalUtangPerbulan = debts.reduce((sum, debt) => sum + debt.cicilanPerbulan, 0);

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile,
  } = useQuery({
    // Use the dynamic userId in the queryKey
    queryKey: ['userProfile', userId],
    // Pass the dynamic userId to the query function
    queryFn: () => getUserProfile(userId!),
    // Only enable the query if userId is available
    enabled: !!userId,
  });

  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useQuery({
    // Use the dynamic userId in the queryKey
    queryKey: ['transactions', userId],
    // Pass the dynamic userId to the query function
    queryFn: () => getUserTransactions(userId!),
    // Only enable the query if userId is available
    enabled: !!userId,
  });

  const income = transactions?.filter((t) => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const expenses = transactions?.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) || 0;
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
    <div className="relative min-h-screen bg-app-blue">
      {/* Konten utama */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Bagian Atas (Biru) */}
        <div className="p-4 text-white bg-app-blue">
          {/* Profil User & Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-black/20 p-2 rounded-lg flex items-center">
                <UserProfile userName={userProfile?.full_name || 'teslagi'} />
              </div>
            </div>
          </div>

          {/* Status Keuangan & Jumlah Utang */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-white/90">Status Keuanganddd</p>
              <p className="text-3xl font-bold">Resiko Tinggi</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/90">Jumlah Utang</p>
              <p className="text-2xl font-bold">Rp. 2.000.000.000</p>
            </div>
          </div>

          {/* Add Aset & Progress Bar */}
          <div className="bg-black/20 p-1 rounded-full flex items-center text-sm mb-6">
            <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium mr-2 whitespace-nowrap">+ Add Aset</button>
            <div className="bg-white/50 h-5 flex-grow rounded-full relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-green-400 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <span className="text-xs font-medium ml-2 whitespace-nowrap tabular-nums">Rp 700.000.000</span>
          </div>
        </div>

        {/* Area Konten Bawah (Putih dengan rounded top) */}
        <div className="bg-white rounded-t-[28px] p-4 flex-1 -mt-5 z-10 relative">
          {/* Profil Utang */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Profil Utang</h2>
              <div>
                <button onClick={openAddDebtDialog} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium">Add+</button>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg pb-1">
              <div className="grid grid-cols-5 gap-px text-center text-xs font-semibold">
                <div className="bg-yellow-300 p-2.5 rounded-tl-lg text-gray-700">Nama Utang</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Cicilan Terbayar</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Bunga</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Cicilan Perbulan</div>
                <div className="bg-yellow-300 p-2.5 rounded-tr-lg text-gray-700">Aksi</div>
              </div>
              <div className="grid grid-cols-5 gap-px text-center text-xs text-gray-700 bg-yellow-200 rounded-b-lg overflow-hidden">
                {debts.length > 0 ? (
                  debts.map((debt, index) => (
                    <React.Fragment key={debt.id}>
                      <div className={`p-2.5 ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{debt.namaUtang}</div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{debt.cicilanSudahDibayar}/{debt.totalCicilan}</div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{typeof debt.bunga === 'number' ? `${debt.bunga}%` : debt.bunga}</div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{debt.cicilanPerbulan.toLocaleString('id-ID')}</div>
                      <div className={`p-2.5 flex items-center justify-center ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>
                        <button 
                          onClick={() => openEditDebtDialog(debt)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md"
                        >
                          Edit
                        </button>
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-5 p-4 text-center text-gray-500 bg-yellow-50">
                    Belum ada data utang.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center bg-blue-600 text-white p-2.5 rounded-lg mt-2 font-semibold text-sm">
              <p>Total Utang</p>
              <p className="tabular-nums">Rp. {totalUtangPerbulan.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Riwayat Keuangan */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Riwayat Keuangan</h2>
              <div>
                <button 
                  onClick={() => navigate('/input')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                >
                  Add+
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              <div 
                onClick={() => navigate('/overview')} 
                className="bg-gray-100 p-3.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors duration-150"
              >
                <p className="font-medium text-gray-700">Pendapatan</p>
                <p className="font-semibold text-green-600 tabular-nums">Rp. {income.toLocaleString('id-ID')}</p>
              </div>
              <div 
                onClick={() => navigate('/overview')} 
                className="bg-gray-100 p-3.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors duration-150"
              >
                <p className="font-medium text-gray-700">Pengeluaran</p>
                <p className="font-semibold text-red-500 tabular-nums">Rp. {expenses.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Status Sisa Uang */}
          <div className="bg-yellow-50 p-3.5 rounded-lg pb-24">
            <div className="flex justify-between items-center bg-yellow-400 p-2.5 rounded-md">
              <p className="font-semibold text-sm text-black">Sisa Uang</p>
              <p className="font-bold text-sm text-black tabular-nums">Rp. 2.300.000</p>
            </div>
            <div className="flex justify-between items-center bg-blue-600 text-white p-2.5 rounded-md mt-2.5">
              <p className="font-semibold text-sm">Cicilan Yang Harus Dibayar</p>
              <p className="font-bold text-sm tabular-nums">Rp. 3.300.000</p>
            </div>
            <div className="mt-3.5">
              <p className="text-sm font-semibold text-gray-800">Satus :</p>
              <p className="text-sm text-red-600 font-medium mt-1">
                Berpotensi Gagal Bayar Karena Sisa Uang Kurang Dari Cicilan Yang Harus Dibayar
              </p>
            </div>
          </div>

          {/* Render AddDebtDialog */}
          <AddDebtDialog 
            isOpen={isAddDebtDialogOpen}
            onClose={() => {
              closeAddDebtDialog();
              setDebtToEdit(null);
            }}
            onAddDebt={!debtToEdit ? handleAddDebt : undefined}
            onEditDebt={debtToEdit ? handleEditDebt : undefined}
            initialData={debtToEdit}
            onDeleteDebt={debtToEdit ? handleDeleteDebt : undefined}
          />
        </div>
      </div>

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NavigationBar />
      </div>
    </div>
  );
}
