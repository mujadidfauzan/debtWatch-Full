import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Updated Asset interface
interface Asset {
  id: string;
  displayName: string;
  jumlah: number;
  hargaJual: number[];
  isCustom: boolean;
}

// Initial predefined assets
const initialAssetsData: Asset[] = [
  { id: 'rumah', displayName: 'Rumah', jumlah: 0, hargaJual: [], isCustom: false },
  { id: 'tanah', displayName: 'Tanah', jumlah: 0, hargaJual: [], isCustom: false },
  { id: 'kendaraan', displayName: 'Kendaraan', jumlah: 0, hargaJual: [], isCustom: false },
  { id: 'emas', displayName: 'Emas', jumlah: 0, hargaJual: [], isCustom: false },
];

let customAssetCounter = 0; // For default naming of new assets

const Question_Asset: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(initialAssetsData);
  const [totalAset, setTotalAset] = useState<number>(0);

  const handleJumlahChange = (assetId: string, value: string) => {
    let newJumlah = parseInt(value, 10);
    if (isNaN(newJumlah) || newJumlah < 0) {
      newJumlah = 0;
    }

    setAssets(prevAssets =>
      prevAssets.map(asset => {
        if (asset.id === assetId) {
          const currentHargaJual = asset.hargaJual;
          const newHargaJual = Array(newJumlah).fill(0).map((_, i) => currentHargaJual[i] || 0);
          return { ...asset, jumlah: newJumlah, hargaJual: newHargaJual };
        }
        return asset;
      })
    );
  };

  const handleHargaJualChange = (assetId: string, index: number, value: string) => {
    const numericValue = parseInt(value, 10);
    setAssets(prevAssets =>
      prevAssets.map(asset => {
        if (asset.id === assetId) {
          const newHargaJual = [...asset.hargaJual];
          newHargaJual[index] = isNaN(numericValue) ? 0 : numericValue;
          return { ...asset, hargaJual: newHargaJual };
        }
        return asset;
      })
    );
  };

  const handleAssetNameChange = (assetId: string, newName: string) => {
    setAssets(prevAssets =>
      prevAssets.map(asset =>
        asset.id === assetId ? { ...asset, displayName: newName } : asset
      )
    );
  };

  const handleAddAsset = () => {
    customAssetCounter++;
    const newAsset: Asset = {
      id: `custom_${Date.now()}_${customAssetCounter}`,
      displayName: `Aset Baru ${customAssetCounter}`,
      jumlah: 0,
      hargaJual: [],
      isCustom: true,
    };
    setAssets(prevAssets => [...prevAssets, newAsset]);
  };

  const handleRemoveAsset = (assetIdToRemove: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetIdToRemove));
  };

  useEffect(() => {
    let total = 0;
    assets.forEach(asset => {
      total += asset.hargaJual.reduce((sum, current) => sum + current, 0);
    });
    setTotalAset(total);
  }, [assets]);

  const formatCurrency = (value: number): string => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  return (
    <div className="bg-yellow-400 min-h-screen p-4 flex flex-col items-center">
      <div className="bg-yellow-400 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Detail Aset</h1>

        {assets.map(asset => (
          <div key={asset.id} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white/20 relative">
            <div className="flex justify-between items-start mb-2">
              {asset.isCustom ? (
                <input
                  type="text"
                  value={asset.displayName}
                  onChange={(e) => handleAssetNameChange(asset.id, e.target.value)}
                  className="text-lg font-semibold p-1 border border-blue-300 rounded w-full mr-2 bg-blue-50 placeholder-gray-500"
                  placeholder="Nama Aset"
                />
              ) : (
                <h2 className="text-lg font-semibold">{asset.displayName}</h2>
              )}
              <button 
                onClick={() => handleRemoveAsset(asset.id)}
                className="text-red-500 hover:text-red-700 font-semibold p-1 rounded-full flex items-center justify-center"
                aria-label={`Hapus ${asset.displayName}`}
                title={`Hapus ${asset.displayName}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
            <input
              type="number"
              placeholder="Jumlah"
              className="w-full p-2 mb-2 border border-gray-300 rounded-md bg-blue-100 placeholder-gray-500"
              value={asset.jumlah || ''}
              onChange={(e) => handleJumlahChange(asset.id, e.target.value)}
              min="0"
            />
            {asset.hargaJual.map((harga, index) => (
              <div key={index} className="relative mb-2">
                <input
                  type="number"
                  placeholder={`Harga Jual ${asset.displayName} ke-${index + 1}`}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white placeholder-gray-500"
                  value={harga || ''}
                  onChange={(e) => handleHargaJualChange(asset.id, index, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
        ))}

        {/* Buttons Section */}
        <div className="flex justify-between items-center mb-6 mt-2">
          <button 
            onClick={handleAddAsset} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Tambahkan Aset Lainnya
          </button>
          <button 
            onClick={() => navigate('/utang')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Lanjut
          </button>
        </div>

        {/* Total Aset Section */}
        <div className="bg-blue-600 p-4 rounded-lg text-white mt-4">
          <p className="text-lg font-semibold mb-2">Total Aset</p>
          <div className="bg-yellow-400 p-3 rounded-md text-black text-xl font-bold text-right">
            {formatCurrency(totalAset)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question_Asset;
