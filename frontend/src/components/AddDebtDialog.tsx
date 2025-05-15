import React, { useEffect, useState } from 'react';

interface DebtItemFromHome {
  id?: string; // Make id optional since it might be missing in the received data
  namaUtang: string;
  cicilanTotalBulan: number;
  cicilanSudahDibayar: number;
  bunga: number | string;
  cicilanPerbulan: number;
  created_at?: string; // Add this field since it's present in your data
  is_active?: boolean; // Add this field since it's present in your data
}

interface AddDebtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDebt?: (debtData: Omit<DebtItemFromHome, 'id'>) => void;
  onEditDebt?: (debtData: DebtItemFromHome) => void;
  initialData?: DebtItemFromHome | null;
  onDeleteDebt?: (debtId: string) => void;
  isLoading?: boolean;
}

const AddDebtDialog: React.FC<AddDebtDialogProps> = ({ isOpen, onClose, onAddDebt, onEditDebt, initialData, onDeleteDebt, isLoading = false }) => {
  const [namaUtang, setNamaUtang] = useState('');
  const [cicilanTotalBulan, setCicilanTotalBulan] = useState('');
  const [cicilanSudahDibayar, setCicilanSudahDibayar] = useState('');
  const [bunga, setBunga] = useState('');
  const [jumlahCicilanPerbulan, setJumlahCicilanPerbulan] = useState('');
  const [tanggalMulaiCicilan, setTanggalMulaiCicilan] = useState('');
  const [processingAction, setProcessingAction] = useState<'save' | 'delete' | null>(null);

  // Store document ID from Firebase (it might be in created_at or we need to generate one)
  const [documentId, setDocumentId] = useState<string | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData && isOpen) {
      // console.log('Initializing form with data:', initialData);

      // Extract or generate a usable ID
      let effectiveId = initialData.id;
      if (!effectiveId && initialData.created_at) {
        // Use created_at as fallback ID if available
        effectiveId = initialData.created_at;
      }

      // console.log('Effective ID to use:', effectiveId);
      setDocumentId(effectiveId || null);

      // Set form values
      setNamaUtang(initialData.namaUtang || '');
      setCicilanTotalBulan(initialData.cicilanTotalBulan?.toString() || '');
      setCicilanSudahDibayar(initialData.cicilanSudahDibayar?.toString() || '');
      setBunga(initialData.bunga?.toString().replace('%', '') || '');
      setJumlahCicilanPerbulan(initialData.cicilanPerbulan?.toString() || '');
    } else if (!isOpen) {
      // Reset form when dialog closes
      setNamaUtang('');
      setCicilanTotalBulan('');
      setCicilanSudahDibayar('');
      setBunga('');
      setJumlahCicilanPerbulan('');
      setTanggalMulaiCicilan('');
      setProcessingAction(null);
      setDocumentId(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessingAction('save');

    const commonData = {
      namaUtang,
      cicilanTotalBulan: parseInt(cicilanTotalBulan, 10) || 0,
      cicilanSudahDibayar: parseInt(cicilanSudahDibayar, 10) || 0,
      bunga: bunga,
      cicilanPerbulan: parseInt(jumlahCicilanPerbulan, 10) || 0,
    };

    try {
      if (isEditMode && onEditDebt && initialData) {
        // Use the stored document ID or fallback
        const idToUse = documentId || initialData.created_at || `debt_${Date.now()}`;
        await onEditDebt({ ...commonData, id: idToUse });
      } else if (!isEditMode && onAddDebt) {
        await onAddDebt(commonData);
      }
      // Close dialog on success
      onClose();
    } catch (error) {
      console.error('Error saving debt:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDelete = () => {
    // console.log('Delete button clicked');
    // console.log('initialData:', initialData);

    // Check if we have a document ID to use
    const idToDelete = documentId || initialData?.created_at;

    if (!idToDelete) {
      console.error('Cannot delete: No valid ID found');
      alert('Cannot delete this debt - no valid ID found');
      return;
    }

    // console.log('Using ID for deletion:', idToDelete);

    if (onDeleteDebt && window.confirm(`Apakah Anda yakin ingin menghapus utang "${namaUtang}"?`)) {
      setProcessingAction('delete');
      try {
        onDeleteDebt(idToDelete);
        // Dialog will be closed by the parent component after deletion
      } catch (error) {
        console.error('Error during deletion:', error);
        setProcessingAction(null);
      }
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Utang' : 'Tambah Utang Baru'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Close dialog" disabled={isLoading || processingAction !== null}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="namaUtang" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Utang
              </label>
              <input
                type="text"
                name="namaUtang"
                id="namaUtang"
                required
                value={namaUtang}
                onChange={(e) => setNamaUtang(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Contoh: KPR Rumah, Pinjol XYZ"
                disabled={isLoading || processingAction !== null}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cicilanTotalBulan" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cicilan (Bulan)
                </label>
                <input
                  type="number"
                  name="cicilanTotalBulan"
                  id="cicilanTotalBulan"
                  required
                  value={cicilanTotalBulan}
                  onChange={(e) => setCicilanTotalBulan(e.target.value)}
                  min="1"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contoh: 60"
                  disabled={isLoading || processingAction !== null}
                />
              </div>
              <div>
                <label htmlFor="cicilanSudahDibayar" className="block text-sm font-medium text-gray-700 mb-1">
                  Cicilan Sudah Dibayar (Bulan)
                </label>
                <input
                  type="number"
                  name="cicilanSudahDibayar"
                  id="cicilanSudahDibayar"
                  required
                  value={cicilanSudahDibayar}
                  onChange={(e) => setCicilanSudahDibayar(e.target.value)}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contoh: 12"
                  disabled={isLoading || processingAction !== null}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bunga" className="block text-sm font-medium text-gray-700 mb-1">
                  Bunga (%)
                </label>
                <input
                  type="number"
                  name="bunga"
                  id="bunga"
                  step="0.01"
                  value={bunga}
                  onChange={(e) => setBunga(e.target.value)}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contoh: 5.5"
                  disabled={isLoading || processingAction !== null}
                />
              </div>
              <div>
                <label htmlFor="jumlahCicilanPerbulan" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Cicilan Perbulan (Rp)
                </label>
                <input
                  type="number"
                  name="jumlahCicilanPerbulan"
                  id="jumlahCicilanPerbulan"
                  required
                  value={jumlahCicilanPerbulan}
                  onChange={(e) => setJumlahCicilanPerbulan(e.target.value)}
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Contoh: 1200000"
                  disabled={isLoading || processingAction !== null}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tanggalMulaiCicilan" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai Cicilan
              </label>
              <input
                type="date"
                name="tanggalMulaiCicilan"
                id="tanggalMulaiCicilan"
                required
                value={tanggalMulaiCicilan}
                onChange={(e) => setTanggalMulaiCicilan(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isLoading || processingAction !== null}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              {isEditMode && onDeleteDebt && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center" disabled={isLoading || processingAction !== null || !documentId}>
                  {processingAction === 'delete' && <LoadingSpinner />}
                  Hapus
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300" disabled={isLoading || processingAction !== null}>
                Batal
              </button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center" disabled={isLoading || processingAction !== null}>
                {processingAction === 'save' && <LoadingSpinner />}
                {isEditMode ? 'Simpan Perubahan' : 'Simpan Utang'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDebtDialog;
