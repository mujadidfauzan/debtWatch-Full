import React, { useState } from 'react';

interface AddAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (assetData: { name: string; quantity: number; price: number }) => void;
}

const AddAssetDialog: React.FC<AddAssetDialogProps> = ({ isOpen, onClose, onAddAsset }) => {
  const [assetName, setAssetName] = useState('');
  const [assetQuantity, setAssetQuantity] = useState<number | ''>('');
  const [assetPrice, setAssetPrice] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || assetQuantity === '' || assetPrice === '') {
      // Basic validation, can be improved
      alert('Please fill in all fields.');
      return;
    }
    onAddAsset({
      name: assetName,
      quantity: Number(assetQuantity),
      price: Number(assetPrice),
    });
    // Reset fields and close
    setAssetName('');
    setAssetQuantity('');
    setAssetPrice('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Asset</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              id="assetName"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="assetQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="assetQuantity"
              value={assetQuantity}
              onChange={(e) => setAssetQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              min="0"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="assetPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit (Rp)
            </label>
            <input
              type="number"
              id="assetPrice"
              value={assetPrice}
              onChange={(e) => setAssetPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetDialog; 