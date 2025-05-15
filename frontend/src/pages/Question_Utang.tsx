import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { addUserDebt, DebtItem } from '@/lib/api'; // Pastikan path ini benar

let utangIdCounter = 0;

const Question_Utang: React.FC = () => {
  const navigate = useNavigate();
  const [utangItems, setUtangItems] = useState<DebtItem[]>([]);
  const [totalUtangPerbulan, setTotalUtangPerbulan] = useState<number>(0);

  useEffect(() => {
    const total = utangItems.reduce((sum, item) => sum + item.cicilanPerbulan, 0);
    setTotalUtangPerbulan(total);
  }, [utangItems]);

  const formatCurrency = (value: number): string => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const handleUtangItemChange = (id: string, field: keyof DebtItem, value: string) => {
    setUtangItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (field === 'cicilanPerbulan' || field === 'cicilanSudahDibayar' || field === 'cicilanTotalBulan' || field === 'bunga') {
            const numericValue = parseFloat(value);
            return { ...item, [field]: isNaN(numericValue) ? 0 : numericValue };
          } else {
            return { ...item, [field]: value };
          }
        }
        return item;
      })
    );
  };

  const handleAddUtang = () => {
    utangIdCounter++;
    const newItem: DebtItem = {
      id: `utang_${Date.now()}_${utangIdCounter}`,
      namaUtang: '',
      cicilanSudahDibayar: 0, // Updated
      cicilanTotalBulan: 0, // Updated
      bunga: 0, // Updated to 0
      cicilanPerbulan: 0,
    };
    setUtangItems((prevItems) => [...prevItems, newItem]);
  };

  const handleRemoveUtang = (idToRemove: string) => {
    setUtangItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
  };

  const handleSaveAndNext = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in first.');
      return;
    }

    try {
      const savePromises = utangItems.map((item) => {
        const debtPayload = {
          namaUtang: item.namaUtang, // 🟢 gunakan namaUtang sesuai interface
          cicilanTotalBulan: item.cicilanTotalBulan,
          cicilanSudahDibayar: item.cicilanSudahDibayar,
          bunga: item.bunga,
          cicilanPerbulan: item.cicilanPerbulan,
        };

        return addUserDebt(user.uid, debtPayload);
      });

      await Promise.all(savePromises);
      navigate('/onboarding');
    } catch (error) {
      console.error('Failed to save debt data:', error);
      alert('An error occurred while saving debt data.');
    }
  };

  return (
    <div className="bg-blue-700 min-h-screen p-4 flex flex-col items-center text-white">
      <div className="w-full max-w-2xl p-6 rounded-lg">
        {' '}
        {/* Increased max-w for wider table */}
        <h1 className="text-3xl font-bold text-center mb-8">Manage Debts</h1>
        <div className="grid grid-cols-12 gap-x-2 bg-yellow-400 text-black p-3 rounded-t-lg font-semibold text-sm sticky top-0 z-10">
          <div className="col-span-3">Debt Name</div>
          <div className="col-span-3 text-center">Installments Paid</div> {/* Spans 3 (input / input) */}
          <div className="col-span-2 text-center">Interest (%)</div>
          <div className="col-span-3 text-right">Monthly Payment</div> {/* Spans 3 */}
          <div className="col-span-1"></div> {/* For remove button */}
        </div>
        <div className="bg-gray-200 text-black rounded-b-lg max-h-[50vh] overflow-y-auto">
          {utangItems.length === 0 && <p className="p-4 text-center text-gray-500">No debt data yet. Please add some.</p>}
          {utangItems.map((item, index) => (
            <div key={item.id} className={`grid grid-cols-12 gap-x-2 p-3 items-center text-sm ${index < utangItems.length - 1 ? 'border-b border-gray-300' : ''}`}>
              <input type="text" value={item.namaUtang} onChange={(e) => handleUtangItemChange(item.id, 'namaUtang', e.target.value)} placeholder="Mortgage, Car, etc." className="col-span-3 p-2 border rounded bg-white" />
              {/* Cicilan Terbayar split into two inputs */}
              <div className="col-span-3 flex items-center justify-center space-x-1">
                <input
                  type="number"
                  value={item.cicilanSudahDibayar || ''}
                  onChange={(e) => handleUtangItemChange(item.id, 'cicilanSudahDibayar', e.target.value)}
                  placeholder="Paid"
                  className="w-1/2 p-2 border rounded bg-white text-center"
                  min="0"
                />
                <span className="text-gray-500">/</span>
                <input
                  type="number"
                  value={item.cicilanTotalBulan || ''}
                  onChange={(e) => handleUtangItemChange(item.id, 'cicilanTotalBulan', e.target.value)}
                  placeholder="Total"
                  className="w-1/2 p-2 border rounded bg-white text-center"
                  min="0"
                />
              </div>
              <input type="number" value={item.bunga || ''} onChange={(e) => handleUtangItemChange(item.id, 'bunga', e.target.value)} placeholder="5" className="col-span-2 p-2 border rounded bg-white text-center" min="0" step="0.01" />
              <input
                type="number"
                value={item.cicilanPerbulan || ''}
                onChange={(e) => handleUtangItemChange(item.id, 'cicilanPerbulan', e.target.value)}
                placeholder="1000000"
                className="col-span-3 p-2 border rounded bg-white text-right"
                min="0"
              />
              <button onClick={() => handleRemoveUtang(item.id)} className="col-span-1 text-red-500 hover:text-red-700 p-1 rounded-full flex items-center justify-center" title="Remove Debt">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddUtang} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full">
          + Add New Debt
        </button>
        {/* Total Utang Section */}
        <div className="mt-8 flex justify-between items-center text-lg">
          <span className="font-semibold">Total Monthly Debt</span>
          <span className="font-bold text-yellow-400">{formatCurrency(totalUtangPerbulan)}</span>
        </div>
        {/* Navigation Button */}
        <div className="mt-10 flex justify-end">
          <button onClick={handleSaveAndNext} className="bg-yellow-400 hover:bg-yellow-500 text-blue-700 font-bold py-3 px-6 rounded-lg text-lg">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Question_Utang;
