import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { getUserAssets } from '@/lib/api';
import type { AssetItem } from '@/lib/api';

export default function AssetsPage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const {
    data: assets,
    isLoading,
    isError,
    error,
  } = useQuery<AssetItem[]>({
    queryKey: ['userAssets', userId],
    queryFn: () => getUserAssets(userId!),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <p className="text-xl text-red-600">User not logged in.</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <header className="mb-6">
        <button onClick={() => navigate('/home')} className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Assets</h1>
      </header>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading assets...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error instanceof Error ? error.message : 'Failed to load assets.'}</span>
        </div>
      )}

      {!isLoading && !isError && assets && (
        <div className="space-y-4">
          {assets.length > 0 ? (
            <ul className="divide-y divide-gray-200 bg-white shadow-md rounded-lg">
              {assets.map((asset, index) => {
                const averagePrice = asset.hargaJual && asset.hargaJual.length > 0 ? asset.hargaJual.reduce((a, b) => a + b, 0) / asset.hargaJual.length : 0;

                const totalValue = averagePrice * asset.jumlah;

                return (
                  <li key={asset.id || index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{asset.displayName}</h3>
                        <p className="text-sm text-gray-600">Quantity: {asset.jumlah}</p>
                      </div>
                      <p className="text-md font-medium text-gray-800">Value: Rp. {totalValue.toLocaleString('id-ID')}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10 bg-white shadow-md rounded-lg">
              <p className="text-gray-500 text-lg">You have no assets listed yet.</p>
            </div>
          )}
        </div>
      )}
      {!isLoading && !isError && !assets && (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <p className="text-gray-500 text-lg">No asset data found.</p>
        </div>
      )}
    </div>
  );
}
