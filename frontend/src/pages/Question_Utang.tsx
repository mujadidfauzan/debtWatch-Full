import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

const UtangPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasLoans, setHasLoans] = useState<string | null>(null);
  const [loans, setLoans] = useState<
    Array<{
      loan_type: string;
      monthly_payment: string;
      remaining_months: string;
      total_loan_amount: string;
      id?: string;
    }>
  >([]);
  const [currentLoan, setCurrentLoan] = useState({
    loan_type: '',
    monthly_payment: '',
    remaining_months: '',
    total_loan_amount: '',
  });
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined loan types
  const loanTypes = ['KTA', 'KPR', 'Cicilan Motor', 'Cicilan Elektronik', 'Kartu Kredit', 'Pinjaman Online', 'Lainnya'];

  // Handle changes in the current loan form
  const handleLoanChange = (field: string, value: string) => {
    setCurrentLoan((prev) => ({ ...prev, [field]: value }));
  };

  // Add current loan to the loans array
  const handleAddLoan = () => {
    // Validate loan data
    if (!currentLoan.loan_type || !currentLoan.monthly_payment || !currentLoan.remaining_months || !currentLoan.total_loan_amount) {
      setError('Mohon lengkapi semua informasi pinjaman.');
      return;
    }

    // Add the loan to the list
    setLoans((prev) => [...prev, { ...currentLoan }]);

    // Reset current loan form
    setCurrentLoan({
      loan_type: '',
      monthly_payment: '',
      remaining_months: '',
      total_loan_amount: '',
    });

    // Hide the add loan form
    setIsAddingLoan(false);
    setError(null);
  };

  // Remove a loan from the list
  const handleRemoveLoan = (index: number) => {
    setLoans((prev) => prev.filter((_, i) => i !== index));
  };

  // Format number with thousand separator
  const formatNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted number back to plain number
  const parseFormattedNumber = (value: string) => {
    return value.replace(/\./g, '');
  };

  // Handle saving all loans to Firestore
  const handleSaveLoans = async () => {
    setError(null);
    const user = auth.currentUser;

    if (!hasLoans) {
      setError('Mohon pilih apakah Anda memiliki utang atau tidak.');
      return;
    }

    if (hasLoans === 'Iya' && loans.length === 0) {
      setError('Mohon tambahkan minimal satu pinjaman.');
      return;
    }

    if (user) {
      setLoading(true);
      try {
        // First, delete any existing loans for this user
        const loansCollectionRef = collection(db, 'users', user.uid, 'active_loans');
        const existingLoans = await getDocs(loansCollectionRef);

        // Delete existing loan documents
        const deletePromises = existingLoans.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Add new loans if any
        if (hasLoans === 'Iya') {
          const addPromises = loans.map((loan) => {
            return addDoc(loansCollectionRef, {
              loan_type: loan.loan_type,
              monthly_payment: parseFloat(parseFormattedNumber(loan.monthly_payment)) || 0,
              remaining_months: parseInt(loan.remaining_months) || 0,
              total_loan_amount: parseFloat(parseFormattedNumber(loan.total_loan_amount)) || 0,
              created_at: new Date().toISOString(),
            });
          });
          await Promise.all(addPromises);
        }

        navigate('/load'); // Navigate to Loading page
      } catch (err) {
        console.error('Error saving loans:', err);
        setError('Gagal menyimpan informasi pinjaman. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Tidak ada user yang login. Silakan login kembali.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Background image */}
      <div className="relative h-[30vh] bg-cover bg-center z-0" style={{ backgroundImage: 'url(../loan.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-transparent opacity-70 z-0"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-yellow-400 rounded-t-3xl -mt-12 p-6 flex flex-col items-center z-10 relative">
        <div className="w-full max-w-md text-center space-y-6 mt-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">💸</span>
          </div>

          {/* Question */}
          <h2 className="text-white text-lg font-semibold">Apakah Anda Memiliki Utang?</h2>

          {/* Yes/No options */}
          <div className="flex justify-center gap-6 mt-4">
            {['Iya', 'Tidak'].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setHasLoans(option);
                  if (option === 'Tidak') setLoans([]);
                  setError(null);
                }}
                className={`py-2 px-6 rounded-full border-2 font-semibold transition-all duration-200
                  ${hasLoans === option ? 'bg-white text-blue-700 border-white scale-105' : 'bg-white text-black border-white'}`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Loan list and add form */}
          {hasLoans === 'Iya' && (
            <div className="mt-4 space-y-4">
              {/* List of added loans */}
              {loans.length > 0 && (
                <div className="bg-white rounded-xl p-4 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Daftar Pinjaman Anda:</h3>
                  <ul className="space-y-3">
                    {loans.map((loan, index) => (
                      <li key={index} className="bg-blue-50 rounded-lg p-3 relative">
                        <h4 className="font-semibold text-blue-700">{loan.loan_type}</h4>
                        <p className="text-sm text-gray-600">Cicilan: Rp {loan.monthly_payment}/bulan</p>
                        <p className="text-sm text-gray-600">Sisa: {loan.remaining_months} bulan</p>
                        <p className="text-sm text-gray-600">Total: Rp {loan.total_loan_amount}</p>
                        <button onClick={() => handleRemoveLoan(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add loan button or form */}
              {!isAddingLoan ? (
                <button onClick={() => setIsAddingLoan(true)} className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-50">
                  + Tambah Pinjaman
                </button>
              ) : (
                <div className="bg-white rounded-xl p-4 text-left">
                  <h3 className="font-semibold text-gray-800 mb-3">Detail Pinjaman</h3>

                  {/* Loan Type */}
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Jenis Pinjaman</label>
                    <select value={currentLoan.loan_type} onChange={(e) => handleLoanChange('loan_type', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih jenis pinjaman</option>
                      {loanTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Monthly Payment */}
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Cicilan per Bulan</label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">Rp</span>
                      <input
                        type="text"
                        value={currentLoan.monthly_payment}
                        onChange={(e) => handleLoanChange('monthly_payment', formatNumber(e.target.value))}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Remaining Months */}
                  <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Sisa Bulan Pembayaran</label>
                    <input
                      type="number"
                      min="1"
                      value={currentLoan.remaining_months}
                      onChange={(e) => handleLoanChange('remaining_months', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Total Loan Amount */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Total Jumlah Pinjaman</label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">Rp</span>
                      <input
                        type="text"
                        value={currentLoan.total_loan_amount}
                        onChange={(e) => handleLoanChange('total_loan_amount', formatNumber(e.target.value))}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Form buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setIsAddingLoan(false);
                        setCurrentLoan({
                          loan_type: '',
                          monthly_payment: '',
                          remaining_months: '',
                          total_loan_amount: '',
                        });
                      }}
                      className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button onClick={handleAddLoan} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Simpan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm bg-red-100 text-red-700 p-2 rounded-lg mt-2">{error}</p>}
        </div>

        {/* Back Button */}
        <div className="fixed bottom-8 left-12">
          <Button className="bg-yellow-100 bg-opacity-60 hover:bg-opacity-100 hover:bg-gray-100 text-gray-400 font-medium py-3 px-6 hover:text-black rounded-xl" onClick={() => navigate('/asset')}>
            Kembali
          </Button>
        </div>

        {/* Next Button */}
        <div className="fixed bottom-8 right-12">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg" onClick={handleSaveLoans} disabled={!hasLoans || (hasLoans === 'Iya' && loans.length === 0) || loading}>
            {loading ? 'Menyimpan...' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UtangPage;
