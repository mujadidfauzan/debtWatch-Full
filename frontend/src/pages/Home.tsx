import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import NavigationBar from '../components/NavigationBar';
import AddDebtDialog from '../components/AddDebtDialog';
import AddAssetDialog from '../components/AddAssetDialog';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, getUserTransactions, getUserDebts, addUserDebt, updateUserDebt, deleteUserDebt, DebtItem, UserProfileData, updateUserAssets, AssetItem, getUserAssets } from '../lib/api';
import { auth } from '@/firebase';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get the current user from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const [isAddDebtDialogOpen, setIsAddDebtDialogOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<DebtItem | null>(null);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [totalAssetValue, setTotalAssetValue] = useState<number | null>(null);

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
    // console.log('Setting debt to edit:', debt);
    setDebtToEdit(debt);
    setIsAddDebtDialogOpen(true);
  };

  const openAddAssetDialog = () => setIsAddAssetDialogOpen(true);
  const closeAddAssetDialog = () => setIsAddAssetDialogOpen(false);

  const handleAddAsset = async (assetData: { name: string; quantity: number; price: number }) => {
    if (!userId) {
      console.error('User not logged in. Cannot add asset.');
      // Optionally, provide user feedback here (e.g., a toast notification)
      return;
    }

    const newAssetItem: AssetItem = {
      id: `asset_${Date.now()}`, // atau pakai UUID kalau kamu punya
      displayName: assetData.name, // ✅ ganti `name` jadi `displayName`
      jumlah: assetData.quantity,
      hargaJual: [assetData.price],
      isCustom: true,
      created_at: new Date().toISOString(),
    };

    try {
      // The updateUserAssets function in api.ts expects an array of AssetItem
      await updateUserAssets(userId, [newAssetItem]);
      // console.log('Asset added successfully via API');
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

  useEffect(() => {
    const fetchRiskScore = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`https://debtwatch-full-production.up.railway.app/users/${userId}/risk_scores/generate`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Gagal mengambil data risiko keuangan');
        const data = await response.json();
        // console.log(data);
        setRiskLevel(data.risk_level);
        setExplanation(data.explanation);
      } catch (error) {
        console.error('Error fetching risk score:', error);
      }
    };
    fetchRiskScore();
  }, [userId]);

  useEffect(() => {
    const fetchTotalAssets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const assets = await getUserAssets(user.uid);
        const total = assets.reduce((sum, asset) => {
          return sum + asset.hargaJual.reduce((acc, val) => acc + val, 0);
        }, 0);
        setTotalAssetValue(total);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setTotalAssetValue(0); // Optional: fallback
      }
    };

    fetchTotalAssets();
  }, []);

  const formatCurrency = (value: number): string => `Rp ${value.toLocaleString('id-ID')}`;

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
          <div className="flex justify-between items-center mb-6 text-xs md:text-xl">
            <div className="flex items-center space-x-2">
              <div className="bg-black/20 p-2 rounded-lg flex items-center">
                <UserProfile userName={userProfile?.full_name || 'User'} />
              </div>
            </div>
          </div>

          {/* Financial Status & Debt Amount */}
          {/* Financial Status & Debt Amount */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-6">
            {/* Financial Status */}
            <div className="w-full sm:w-1/2">
              <p className="text-sm md:text-xl text-white/90 tracking-wide mb-2">💼 Financial Status</p>

              {riskLevel ? (
                <div className="flex items-center space-x-3 transition-all duration-300 mb-2">
                  {riskLevel === 'High' && (
                    <span className="text-red-500 text-2xl animate-pulse" role="img" aria-label="High Risk Warning">
                      ⚠️
                    </span>
                  )}
                  {riskLevel === 'Medium' && (
                    <span className="text-yellow-300 text-2xl animate-pulse" role="img" aria-label="Medium Risk Warning">
                      ⚠️
                    </span>
                  )}
                  {riskLevel === 'Low' && (
                    <span className="text-green-400 text-2xl" role="img" aria-label="Low Risk">
                      ✅
                    </span>
                  )}
                  <p
                    className={`text-2xl sm:text-3xl font-extrabold transition-colors duration-300
          ${riskLevel === 'High' ? 'text-red-500' : riskLevel === 'Medium' ? 'text-yellow-300' : 'text-green-400'}`}
                  >
                    Risk: {riskLevel}
                  </p>
                </div>
              ) : (
                <p className="text-2xl sm:text-3xl font-semibold text-gray-300 animate-pulse">Calculating...</p>
              )}

              {/* Dynamic Status Bar */}
              {riskLevel && (
                <div className="bg-white/10 rounded-lg overflow-hidden h-3 w-full">
                  <div
                    className={`
          h-full transition-all duration-500
          ${riskLevel === 'High' ? 'bg-red-500 w-5/6' : riskLevel === 'Medium' ? 'bg-yellow-300 w-2/3' : 'bg-green-400 w-1/3'}
        `}
                  />
                </div>
              )}
            </div>

            {/* Total Debt */}
            <div className="w-full sm:w-1/2 text-left sm:text-right">
              <p className="text-sm md:text-xl text-white/90 mb-2">💳 Total Debt</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-300">Rp {sisaUtang.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Add Asset & Dan Visualisasi Total Asset */}
          <div className="bg-black/20 p-1 rounded-full flex items-center text-sm mb-6">
            <div className="flex w-full rounded-full overflow-hidden">
              <button onClick={openAddAssetDialog} className="bg-teal-900 text-white px-3 py-1.5 flex items-center hover:bg-teal-800 focus:outline-none flex-shrink-0 whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                <span className="text-xs md:text-xl font-medium">Add Asset</span>
              </button>
              <div onClick={() => navigate('/assets-list')} className="bg-gray-100 text-black px-4 py-1.5 flex-grow flex items-center justify-end whitespace-nowrap cursor-pointer hover:bg-gray-200 transition-colors">
                <span className="text-xs md:text-xl font-medium tabular-nums">{totalAssetValue !== null ? formatCurrency(totalAssetValue) : 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Content Area (White with rounded top) */}
        <div className="bg-white rounded-t-[28px] p-4 flex-1 -mt-5 z-10 relative">
          {/* Debt Profile */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Debt Profile</h2>
              <div>
                <button onClick={openAddDebtDialog} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm md:text-xl font-medium">
                  Add+
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="bg-yellow-50 rounded-lg overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-px text-center text-xs md:text-sm font-semibold bg-yellow-300 text-gray-700 rounded-t-lg">
                  <div className="p-3">Debt Name</div>
                  <div className="p-3">Paid Installments</div>
                  <div className="p-3">Interest</div>
                  <div className="p-3">Monthly Payment</div>
                  <div className="p-3">Action</div>
                </div>

                {/* Table Body */}
                {debts.length > 0 ? (
                  <div className="grid grid-cols-5 gap-px text-center text-xs md:text-sm text-gray-700 bg-yellow-200 rounded-b-lg">
                    {debts.map((debt, index) => {
                      const bgColor = index % 2 === 0 ? 'bg-yellow-50' : 'bg-yellow-100';
                      return (
                        <React.Fragment key={debt.id}>
                          <div className={`p-3 ${bgColor}`}>{debt.namaUtang}</div>
                          <div className={`p-3 tabular-nums ${bgColor}`}>
                            {debt.cicilanSudahDibayar}/{debt.cicilanTotalBulan}
                          </div>
                          <div className={`p-3 tabular-nums ${bgColor}`}>{typeof debt.bunga === 'number' ? `${debt.bunga}%` : debt.bunga}</div>
                          <div className={`p-3 tabular-nums ${bgColor}`}>Rp {debt.cicilanPerbulan.toLocaleString('id-ID')}</div>
                          <div className={`p-3 flex items-center justify-center ${bgColor}`}>
                            <button onClick={() => openEditDebtDialog(debt)} className="text-xs md:text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-200">
                              Edit
                            </button>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : (
                  <div className="col-span-5 p-4 text-center text-gray-500 bg-yellow-50">No debt data yet.</div>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-600 text-white p-3 rounded-lg mt-3 font-semibold text-sm md:text-base gap-2">
              <p>Total Monthly Debt</p>
              <p className="tabular-nums text-right">Rp {totalUtangPerbulan.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Financial History */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Financial History</h2>
              <div className="flex gap-2">
                <button onClick={() => navigate('/overview')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-md text-sm md:text-xl font-medium">
                  Detail
                </button>
                <button onClick={() => navigate('/input')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm md:text-xl font-medium">
                  Add+
                </button>
              </div>
            </div>
            <div className="space-y-2.5 text-sm md:text-xl">
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
              <p className="font-semibold text-sm md:text-xl text-black">Remaining Money</p>
              <p className="font-bold text-sm md:text-xl text-black tabular-nums">Rp. {balance.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex justify-between items-center bg-blue-600 text-white p-2.5 rounded-md mt-2.5">
              <p className="font-semibold text-sm md:text-xl">Required Monthly Payment</p>
              <p className="font-bold text-sm md:text-xl tabular-nums">Rp. {totalUtangPerbulan.toLocaleString('id-ID')}</p>
            </div>

            <div className="mt-3.5">
              <p className="text-sm md:text-xl font-semibold text-gray-800">Status:</p>
              <p className="text-sm md:text-xl text-red-600 font-medium mt-1">{explanation || 'Waiting for analysis...'}</p>
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
          <AddAssetDialog isOpen={isAddAssetDialogOpen} onClose={closeAddAssetDialog} onAddAsset={handleAddAsset} />
        </div>
      </div>

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NavigationBar />
      </div>
    </div>
  );
}
