import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AssetPage: React.FC = () => {
  const navigate = useNavigate();
  const [pilihan, setPilihan] = useState<string[]>([]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === 'Tidak ada') {
      setPilihan((prev) => (prev.includes('Tidak ada') ? [] : ['Tidak ada']));
    } else {
      setPilihan((prev) => {
        const filtered = prev.filter((item) => item !== 'Tidak ada');
        return filtered.includes(value)
          ? filtered.filter((item) => item !== value)
          : [...filtered, value];
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div
        className="relative h-[40vh] bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(../asset.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-transparent opacity-70 z-0"></div>
      </div>

      <div className="flex-1 bg-blue-700 rounded-t-3xl -mt-12 p-6 flex flex-col items-center justify-between z-10 relative overflow-y-auto">
        <div className="w-full max-w-sm text-center space-y-6 mt-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🪙</span>
          </div>

          <h2 className="text-white text-lg font-semibold">Apa saja aset yang Anda miliki?</h2>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {['Rumah', 'Tanah', 'Emas', 'Mobil', 'Lainnya', 'Tidak ada'].map((item) => {
              let emoji = '';
              switch (item) {
                case 'Rumah': emoji = '🏠'; break;
                case 'Tanah': emoji = '⛱'; break;
                case 'Emas': emoji = '💎'; break;
                case 'Mobil': emoji = '🚗'; break;
                case 'Lainnya': emoji = '✨'; break;
                case 'Tidak ada': emoji = '❌'; break;
              }

              const isSelected = pilihan.includes(item);
              const isDisabled = item !== 'Tidak ada' && pilihan.includes('Tidak ada');

              return (
                <label
                  key={item}
                  className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-xl shadow-md cursor-pointer w-32 text-center transition-all duration-200
                    ${isSelected ? 'bg-white scale-105' : 'bg-blue-500 border border-white text-white'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    value={item}
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    disabled={isDisabled}
                    className="hidden"
                  />
                  <span className="text-2xl">{emoji}</span>
                  <span className={`text-lg ${isSelected ? 'text-black font-bold' : 'text-white'}`}>
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tombol navigasi */}
      <div className="flex justify-between px-12 py-4 bg-blue-700">
        <Button
          className="bg-yellow-100 bg-opacity-60 hover:bg-opacity-100 hover:bg-gray-200 text-black hover:text-blue-700 font-medium py-3 px-6 rounded-xl"
          onClick={() => navigate('/pekerjaan')}
        >
          Kembali
        </Button>

        <Button
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow-lg"
          onClick={() => navigate('/utang')}
          disabled={pilihan.length === 0}
        >
          Lanjut
        </Button>
      </div>
    </div>
  );
};

export default AssetPage;
