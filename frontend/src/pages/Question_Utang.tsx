import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UtangPage: React.FC = () => {
  const navigate = useNavigate();
  const [punyaUtang, setPunyaUtang] = useState<string | null>(null);
  const [jumlahUtang, setJumlahUtang] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Gambar background atas */}
      <div
        className="relative h-[40vh] bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(../loan.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-transparent opacity-70 z-0"></div>
      </div>

      {/* Konten utama */}
      <div className="flex-1 bg-yellow-400 rounded-t-3xl -mt-12 p-6 flex flex-col items-center justify-between z-10 relative">
        <div className="w-full max-w-sm text-center space-y-6 mt-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">💸</span>
          </div>

          {/* Pertanyaan */}
          <h2 className="text-white text-lg font-semibold">Apakah Anda Memiliki Utang?</h2>

          {/* Pilihan Ya / Tidak */}
          <div className="flex justify-center gap-6 mt-4">
            {['Iya', 'Tidak'].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setPunyaUtang(option);
                  if (option === 'Tidak') setJumlahUtang('');
                }}
                className={`py-2 px-6 rounded-full border-2 font-semibold transition-all duration-200
                  ${
                    punyaUtang === option
                      ? 'bg-white text-blue-700 border-white scale-105'
                      : 'bg-white text-black border-white'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Input jumlah utang jika memilih "Iya" */}
          {punyaUtang === 'Iya' && (
  <div className="relative mt-4">
    <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
    <input
      type="number"
      min="0"
      value={jumlahUtang}
      onChange={(e) => setJumlahUtang(e.target.value)}
      placeholder="Masukkan jumlah utang"
      className="no-spinner w-full rounded-lg bg-white text-center py-3 px-10 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-white"
    />
  </div>
)}

        </div>

        {/* Tombol Kembali */}
                <div className="fixed bottom-8 left-12">
                <Button
          className="bg-yellow-100 bg-opacity-60 hover:bg-opacity-100 hover:bg-grey-100 text-gray-400 font-medium py-3 px-6 hover:text-black rounded-xl"
          onClick={() => navigate('/asset')}
        >
          Kembali
        </Button>
        </div>

        {/* Tombol lanjut */}
        <div className="fixed bottom-8 right-12">
          <Button
           className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            onClick={() => navigate('/load')}
            disabled={!punyaUtang || (punyaUtang === 'Iya' && jumlahUtang === '')}
          >
            Lanjut
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UtangPage;
