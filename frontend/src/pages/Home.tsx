import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import NavigationBar from '../components/NavigationBar';
import AddDebtDialog from '../components/AddDebtDialog';
import AddAssetDialog from '../components/AddAssetDialog';
import { useQuery } from '@tanstack/react-query';
import {
  getUserProfile,
  getUserTransactions,
  getUserDebts,
  addUserDebt,
  updateUserDebt,
  deleteUserDebt,
  DebtItem,
  UserProfileData,
  updateUserAssets,
  AssetPayload
} from '../lib/api';
import { auth } from '@/firebase';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get the current user from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const [isAddDebtDialogOpen, setIsAddDebtDialogOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<DebtItem | null>(null);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);

  // Get user profile data
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile,
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  // Get user debts data
  const {
    data: debts = [], // Default to empty array if undefined
    isLoading: isLoadingDebts,
    isError: isErrorDebts,
    error: errorDebts,
    refetch: refetchDebts,
  } = useQuery({
    queryKey: ['userDebts', userId],
    queryFn: () => getUserDebts(userId!),
    enabled: !!userId,
  });

  // Get user transactions data
  const {
    data: transactions = [], // Default to empty array
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => getUserTransactions(userId!),
    enabled: !!userId,
  });

  const openAddDebtDialog = () => {
    setDebtToEdit(null);
    setIsAddDebtDialogOpen(true);
  };

  const closeAddDebtDialog = () => setIsAddDebtDialogOpen(false);

  const openEditDebtDialog = (debt: DebtItem) => {
    setDebtToEdit(debt);
    setIsAddDebtDialogOpen(true);
  };

  const openAddAssetDialog = () => setIsAddAssetDialogOpen(true);
  const closeAddAssetDialog = () => setIsAddAssetDialogOpen(false);

  const handleAddAsset = async (assetData: { name: string; quantity: number; price: number }) => {
    if (!userId) {
      console.error("User not logged in. Cannot add asset.");
      // Optionally, provide user feedback here (e.g., a toast notification)
      return;
    }

    const newAssetPayload: AssetPayload = {
      name: assetData.name,
      jumlah: assetData.quantity,
      hargaJual: [assetData.price], // Assuming price maps to a single-element array for hargaJual
    };

    try {
      // The updateUserAssets function in api.ts expects an array of AssetPayload
      await updateUserAssets(userId, [newAssetPayload]);
      console.log('Asset added successfully via API');
      // If you have a query to fetch assets, you would refetch it here.
      // e.g., queryClient.invalidateQueries(['userAssets', userId]);
      closeAddAssetDialog();
    } catch (error) {
      console.error('Failed to add asset:', error);
      // Optionally, provide user feedback here (e.g., a toast notification)
      // Consider if the dialog should remain open for the user to retry or correct input
    }
  };

  const handleAddDebt = async (newDebtData: Omit<DebtItem, 'id'>) => {
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    try {
      await addUserDebt(userId, newDebtData);
      refetchDebts();
      closeAddDebtDialog();
    } catch (error) {
      console.error('Failed to add debt:', error);
    }
  };

  const handleEditDebt = async (updatedDebt: DebtItem) => {
    if (!userId) return;

    try {
      await updateUserDebt(userId, updatedDebt.id, updatedDebt);
      refetchDebts();
      setIsAddDebtDialogOpen(false);
      setDebtToEdit(null);
    } catch (error) {
      console.error('Failed to edit debt:', error);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!userId) return;

    try {
      await deleteUserDebt(userId, debtId);
      refetchDebts();
      setIsAddDebtDialogOpen(false);
      setDebtToEdit(null);
    } catch (error) {
      console.error('Failed to delete debt:', error);
    }
  };

  // Calculate financial metrics
  const income = transactions?.filter((t) => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const expenses = transactions?.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const balance = income - expenses;
  const progressPercentage = income > 0 ? (expenses / income) * 100 : 0;

  // Calculate debt metrics with safeguards against NaN
  const totalUtangPerbulan = debts.reduce((sum, debt) => {
    // Ensure cicilanPerbulan is a valid number
    const payment = Number(debt.cicilanPerbulan) || 0;
    return sum + payment;
  }, 0);

  const sisaUtang = debts.reduce((sum, debt) => {
    // Ensure all values are valid numbers
    const totalBulan = Number(debt.cicilanTotalBulan) || 0;
    const sudahDibayar = Number(debt.cicilanSudahDibayar) || 0;
    const perBulan = Number(debt.cicilanPerbulan) || 0;

    const sisaBulan = Math.max(0, totalBulan - sudahDibayar);
    return sum + sisaBulan * perBulan;
  }, 0);

  const [riskLevel, setRiskLevel] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');


  // Loading state check
  if ((isLoadingProfile || isLoadingTransactions || isLoadingDebts) && userId) {
    return <div className="flex justify-center items-center min-h-screen">Loading user data...</div>;
  }

  // Handle case where user is not logged in
  if (!userId) {
    return <div className="flex justify-center items-center min-h-screen">User not logged in.</div>;
  }

  // Handle errors after userId is confirmed
  if (isErrorProfile) {
    auth.signOut();
    navigate('/login');
    return <div className="flex justify-center items-center min-h-screen">Error loading profile: {errorProfile instanceof Error ? errorProfile.message : 'Unknown error'}</div>;
  }

  if (isErrorDebts) {
    return <div className="flex justify-center items-center min-h-screen">Error loading debts: {errorDebts instanceof Error ? errorDebts.message : 'Unknown error'}</div>;
  }

  if (isErrorTransactions) {
    return <div className="flex justify-center items-center min-h-screen">Error loading transactions: {errorTransactions instanceof Error ? errorTransactions.message : 'Unknown error'}</div>;
  }

  return (
    <div className="relative min-h-screen bg-app-blue">
      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top section (Blue) */}
        <div className="p-4 text-white bg-app-blue">
          {/* User Profile & Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-black/20 p-2 rounded-lg flex items-center">
                <UserProfile userName={userProfile?.full_name || 'User'} />
              </div>
            </div>
          </div>

          {/* Financial Status & Debt Amount */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-white/90">Financial Status</p>
              <p className="text-3xl font-bold">{riskLevel ? `Risk: ${riskLevel}` : 'Calculating...'}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-white/90">Total Debt</p>
              <p className="text-2xl font-bold">Rp. {sisaUtang.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Add Asset & Dan Visualisasi Total Asset */}
          <div className="bg-black/20 p-1 rounded-full flex items-center text-sm mb-6">
            <div className="flex w-full rounded-full overflow-hidden">
              <button
                onClick={openAddAssetDialog}
                className="bg-teal-900 text-white px-3 py-1.5 flex items-center hover:bg-teal-800 focus:outline-none flex-shrink-0 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <span className="text-xs font-medium">Add Asset</span>
              </button>
              <div
                onClick={() => navigate('/assets-list')}
                className="bg-gray-100 text-black px-4 py-1.5 flex-grow flex items-center justify-end whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <span className="text-xs font-medium tabular-nums">Rp 700.000.000</span> {/* This should ideally come from fetched asset data */}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Content Area (White with rounded top) */}
        <div className="bg-white rounded-t-[28px] p-4 flex-1 -mt-5 z-10 relative">
          {/* Debt Profile */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Debt Profile</h2>
              <div>
                <button onClick={openAddDebtDialog} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                  Add+
                </button>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg pb-1">
              <div className="grid grid-cols-5 gap-px text-center text-xs font-semibold">
                <div className="bg-yellow-300 p-2.5 rounded-tl-lg text-gray-700">Debt Name</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Paid Installments</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Interest</div>
                <div className="bg-yellow-300 p-2.5 text-gray-700">Monthly Payment</div>
                <div className="bg-yellow-300 p-2.5 rounded-tr-lg text-gray-700">Action</div>
              </div>
              <div className="grid grid-cols-5 gap-px text-center text-xs text-gray-700 bg-yellow-200 rounded-b-lg overflow-hidden">
                {debts.length > 0 ? (
                  debts.map((debt, index) => (
                    <React.Fragment key={debt.id}>
                      <div className={`p-2.5 ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{debt.namaUtang}</div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>
                        {debt.cicilanSudahDibayar}/{debt.cicilanTotalBulan}
                      </div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{typeof debt.bunga === 'number' ? `${debt.bunga}%` : `${debt.bunga}%`}</div>
                      <div className={`p-2.5 tabular-nums ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>{debt.cicilanPerbulan.toLocaleString('id-ID')}</div>
                      <div className={`p-2.5 flex items-center justify-center ${index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100'}`}>
                        <button onClick={() => openEditDebtDialog(debt)} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md">
                          Edit
                        </button>
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-5 p-4 text-center text-gray-500 bg-yellow-50">No debt data yet.</div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center bg-blue-600 text-white p-2.5 rounded-lg mt-2 font-semibold text-sm">
              <p>Total Debt</p>
              <p className="tabular-nums">Rp. {totalUtangPerbulan.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Financial History */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Financial History</h2>
              <div>
                <button onClick={() => navigate('/input')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium">
                  Add+
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              <div onClick={() => navigate('/overview')} className="bg-gray-100 p-3.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                <p className="font-medium text-gray-700">Income</p>
                <p className="font-semibold text-green-600 tabular-nums">Rp. {income.toLocaleString('id-ID')}</p>
              </div>
              <div onClick={() => navigate('/overview')} className="bg-gray-100 p-3.5 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors duration-150">
                <p className="font-medium text-gray-700">Expenses</p>
                <p className="font-semibold text-red-500 tabular-nums">Rp. {expenses.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Remaining Money Status */}
          <div className="bg-yellow-50 p-3.5 rounded-lg pb-24">
            <div className="flex justify-between items-center bg-yellow-400 p-2.5 rounded-md">
              <p className="font-semibold text-sm text-black">Remaining Money</p>
              <p className="font-bold text-sm text-black tabular-nums">Rp. {balance.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex justify-between items-center bg-blue-600 text-white p-2.5 rounded-md mt-2.5">
              <p className="font-semibold text-sm">Required Monthly Payment</p>
              <p className="font-bold text-sm tabular-nums">Rp. {totalUtangPerbulan.toLocaleString('id-ID')}</p>
            </div>

            <div className="mt-3.5">
              <p className="text-sm font-semibold text-gray-800">Status:</p>
              <p className="text-sm text-red-600 font-medium mt-1">{explanation || 'Waiting for analysis...'}</p>
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

          {/* Render AddAssetDialog */}
          <AddAssetDialog
            isOpen={isAddAssetDialogOpen}
            onClose={closeAddAssetDialog}
            onAddAsset={handleAddAsset}
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
