import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div
      className="relative flex flex-col items-center justify-end min-h-screen bg-cover bg-top"
      style={{ backgroundImage: "url('../image.png')",
               backgroundSize: "300px 340px", 
              backgroundPosition: "top", 
              backgroundRepeat: "no-repeat",
               backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/70 to-white/90 h-[50%]" />


      {/* Konten utama */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center p-4 pb-12">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">DebtWatch</h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Monitor risks, achieve your financial stability
        </p>

        <div className="w-full space-y-4">
          <Button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full"
            onClick={handleLoginClick}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-200 text-yellow-800 font-semibold py-3 rounded-full"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
