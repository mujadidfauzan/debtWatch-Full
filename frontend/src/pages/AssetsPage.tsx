import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
// We'll assume you will create this function in lib/api.ts
// and that AssetPayload is already defined there or you'll add it.
import { AssetPayload } from '../lib/api'; // Assuming AssetPayload is suitable for listing
// import { getUserAssets } from '../lib/api'; // You'll need to implement and uncomment this

// Placeholder for getUserAssets until it's implemented in lib/api.ts
// Replace this with the actual import once getUserAssets is created
const getUserAssets = async (userId: string): Promise<AssetPayload[]> => {
  console.log(`Fetching assets for userId: ${userId}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  // This is placeholder data. Your actual API should return this.
  // Ensure the structure matches what your backend will provide.
  // For example, if your backend stores 'price' instead of 'hargaJual' for individual assets,
  // you might need a different type for listing vs. payload for adding.
  // For now, we use AssetPayload which has 'hargaJual' as an array.
  return [
    { name: 'Saham BBCA', jumlah: 100, hargaJual: [9000] },
    { name: 'Rumah KPR', jumlah: 1, hargaJual: [500000000] },
    { name: 'Emas Antam', jumlah: 10, hargaJual: [1000000] },
  ];
  // throw new Error("Simulated API error"); // Uncomment to test error state
};


export default function AssetsPage() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const {
    data: assets,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userAssets', userId],
    queryFn: () => getUserAssets(userId!),
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <p className="text-xl text-red-600">User not logged in.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <header className="mb-6">
        <button
          onClick={() => navigate('/home')} // Navigate to Home/Dashboard
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
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
          {/* You can add a spinner here */}
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
              {assets.map((asset, index) => (
                <li key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {asset.jumlah}</p>
                    </div>
                    <p className="text-md font-medium text-gray-800">
                      {/* Assuming hargaJual is an array and we display the first price, or a sum/average */}
                      Value: Rp. {(asset.hargaJual[0] * asset.jumlah).toLocaleString('id-ID')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 bg-white shadow-md rounded-lg">
              <p className="text-gray-500 text-lg">You have no assets listed yet.</p>
              {/* You might want a button here to add an asset, linking to the dialog on Home or a dedicated add asset page */}
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