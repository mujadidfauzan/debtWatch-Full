import React, { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle, DollarSign, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { addUserDebt, DebtItem } from '@/lib/api';

const Question_Utang = () => {
  const navigate = useNavigate();
  const [utangItems, setUtangItems] = useState([]);
  const [totalUtangPerbulan, setTotalUtangPerbulan] = useState(0);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const total = utangItems.reduce((sum, item) => sum + item.cicilanPerbulan, 0);
    setTotalUtangPerbulan(total);
  }, [utangItems]);

  const formatCurrency = (value) => {
    return `Rp ${formatToRupiah(value)}`;
  };

  const formatToRupiah = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseFromRupiah = (value) => {
    const numericValue = parseInt(value.replace(/\./g, ''), 10);
    return isNaN(numericValue) ? 0 : numericValue;
  };

  const handleUtangItemChange = (id, field, value) => {
    setUtangItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          if (field === 'cicilanPerbulan') {
            const numericValue = parseFromRupiah(value);
            return { ...item, [field]: numericValue };
          } else if (field === 'cicilanSudahDibayar' || field === 'cicilanTotalBulan' || field === 'bunga') {
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
    const newItem = {
      id: `utang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      namaUtang: '',
      cicilanSudahDibayar: 0,
      cicilanTotalBulan: 0,
      bunga: 0,
      cicilanPerbulan: 0,
    };
    setUtangItems((prevItems) => [...prevItems, newItem]);
  };

  const handleRemoveUtang = (idToRemove) => {
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
          namaUtang: item.namaUtang,
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
    <div className="bg-gradient-to-b from-blue-800 to-blue-600 min-h-screen p-4 flex flex-col items-center text-white">
      <div className="w-full max-w-lg p-4 rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Manage Your Debts</h1>

        <div className="mb-6 text-center">
          <p className="text-yellow-200 text-sm mb-2">Track all your debts in one place and see your total monthly payments</p>

          <button onClick={() => setShowTips(!showTips)} className="flex items-center justify-center mx-auto text-xs text-yellow-100 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-full">
            <AlertCircle size={14} className="mr-1" />
            {showTips ? 'Hide Tips' : 'Show Tips'}
          </button>

          {showTips && (
            <div className="mt-3 bg-blue-900 p-3 rounded-lg text-left text-sm">
              <ul className="list-disc pl-5 space-y-1 text-yellow-100">
                <li>Fill in the name of each debt (e.g., Mortgage, Car Loan)</li>
                <li>Enter how many installments you've paid out of the total</li>
                <li>Add the interest rate percentage</li>
                <li>Enter your monthly payment amount</li>
              </ul>
            </div>
          )}
        </div>

        {utangItems.length === 0 ? (
          <div className="bg-blue-900/50 rounded-lg p-6 text-center mb-4">
            <p className="text-yellow-100 mb-4">You haven't added any debts yet</p>
            <button onClick={handleAddUtang} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center">
              <Plus size={20} className="mr-2" />
              Add Your First Debt
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {utangItems.map((item) => (
                <div key={item.id} className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-blue-100 border-b border-blue-200">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={item.namaUtang}
                        onChange={(e) => handleUtangItemChange(item.id, 'namaUtang', e.target.value)}
                        placeholder="Debt Name"
                        className="font-medium bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none w-full px-1 py-1"
                      />
                      <button onClick={() => handleRemoveUtang(item.id)} className="text-red-500 hover:text-red-700 ml-2" title="Remove Debt">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Installments</label>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <input
                            type="number"
                            value={item.cicilanSudahDibayar || ''}
                            onChange={(e) => handleUtangItemChange(item.id, 'cicilanSudahDibayar', e.target.value)}
                            placeholder="0"
                            className="w-full p-2 bg-white text-center outline-none"
                            min="0"
                          />
                          <span className="bg-gray-100 px-2 text-gray-600">/</span>
                          <input
                            type="number"
                            value={item.cicilanTotalBulan || ''}
                            onChange={(e) => handleUtangItemChange(item.id, 'cicilanTotalBulan', e.target.value)}
                            placeholder="0"
                            className="w-full p-2 bg-white text-center outline-none"
                            min="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Interest Rate (%)</label>
                        <input
                          type="number"
                          value={item.bunga || ''}
                          onChange={(e) => handleUtangItemChange(item.id, 'bunga', e.target.value)}
                          placeholder="0.00"
                          className="w-full p-2 border rounded-md outline-none focus:border-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Monthly Payment</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                        <input
                          type="text"
                          value={formatToRupiah(item.cicilanPerbulan || 0)}
                          onChange={(e) => handleUtangItemChange(item.id, 'cicilanPerbulan', e.target.value)}
                          placeholder="1.000.000"
                          className="w-full p-2 pl-10 border rounded-md bg-white text-right font-medium outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {item.cicilanTotalBulan > 0 && item.cicilanSudahDibayar > 0 && (
                    <div className="px-4 pb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (item.cicilanSudahDibayar / item.cicilanTotalBulan) * 100)}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">{Math.round((item.cicilanSudahDibayar / item.cicilanTotalBulan) * 100)}% complete</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleAddUtang} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center mb-6">
              <Plus size={18} className="mr-1" />
              Add Another Debt
            </button>
          </>
        )}

        {utangItems.length > 0 && (
          <>
            <div className="bg-blue-900 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Monthly Payment</span>
                <span className="font-bold text-2xl text-yellow-300">{formatCurrency(totalUtangPerbulan)}</span>
              </div>
            </div>
          </>
        )}
        <button onClick={handleSaveAndNext} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-lg text-lg w-full flex items-center justify-center">
          Continue
          <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Question_Utang;
