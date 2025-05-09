import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase'; // Import auth and db
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const PekerjaanPage: React.FC = () => {
  const navigate = useNavigate();
  const [pekerjaan, setPekerjaan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setError(null);
    const user = auth.currentUser;

    if (!pekerjaan.trim()) {
      setError("Please enter your occupation.");
      return;
    }

    if (user) {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { 
          occupation: pekerjaan.trim()
        }, { merge: true }); 
        navigate('/asset'); // Navigate to Asset page
      } catch (err) {
        console.error("Error updating user occupation:", err);
        setError("Failed to save occupation. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("No user is logged in. Please log in again.");
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative h-[40vh] bg-cover bg-center z-0" style={{ backgroundImage: 'url(../job.jpg)' }}>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-transparent opacity-70 z-0"></div>
      </div>

      {/* Box bawah */}
      <div className="flex-1 bg-yellow-400 rounded-t-3xl -mt-12 p-6 flex flex-col items-center justify-between z-10 relative">
        <div className="w-full max-w-sm text-center space-y-6 mt-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">💼</span> {/* Ikon pekerjaan */}
          </div>

          {/* Pertanyaan */}
          <h2 className="text-black text-lg font-semibold">Apa Pekerjaan Anda?</h2>

          {/* Input pekerjaan */}
          <input
            type="text"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            placeholder="Masukkan pekerjaan"
            className="w-full rounded-lg bg-gray-200 text-center py-3 px-4 placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-white"
          />
          {error && <p className="text-sm text-red-700 mt-2">{error}</p>} {/* Error color adjusted for yellow bg */}
        </div>

{/* Tombol Kembali */}
        <div className="fixed bottom-8 left-12">
        <Button
  className="bg-yellow-100 bg-opacity-60 hover:bg-opacity-100 hover:bg-grey-100 text-gray-400 font-medium py-3 px-6 hover:text-black rounded-xl"
  onClick={() => navigate('/tanggungan')}
>
  Kembali
</Button>

          </div>

        <div className="fixed bottom-8 right-12">
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            onClick={handleNext}
            disabled={!pekerjaan.trim() || loading} 
          >
            {loading ? 'Saving...' : 'Lanjut'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PekerjaanPage;
