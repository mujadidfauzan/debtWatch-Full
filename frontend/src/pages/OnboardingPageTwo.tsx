import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// TODO: Confirm actual image path for the phone mockup
const phoneMockupImage = "/assets/uinya.png"; 

const OnboardingPageTwo: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    // TODO: Navigate to OnboardingPageThree or /auth
    navigate('/onboarding-3');
  };

  const handlePrev = () => {
    navigate('/onboarding');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2a43d2] text-white p-8 relative justify-between">
      {/* Top Navigation/Status Bar area (visual only for now) */}
      <div className="flex justify-between items-center mb-10">
        <span className="text-sm font-medium">9:41</span>
        <div className="flex items-center space-x-1">
          {/* Wifi and Battery icons - visual placeholders */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reception-4" viewBox="0 0 16 16">
            <path d="M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v-4a.5.5 0 0 1-.5-.5h-2a.5.5 0 0 1-.5.5zm4-6a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm4-4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-battery-full" viewBox="0 0 16 16">
            <path d="M2 6h10v4H2z"/>
            <path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm10 1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM14.5 6.5a.5.5 0 0 0-.5-.5v-1a.5.5 0 0 0-1 0v1h-.5a.5.5 0 0 0 0 1h.5v1a.5.5 0 0 0 1 0v-1h.5a.5.5 0 0 0 0-1z"/>
          </svg>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col items-center text-center flex-grow justify-center">
        <h2 className="text-3xl font-bold mb-4 leading-tight">
          Plan untuk Hindari Resiko Gagal Bayar
        </h2>
        <p className="text-sm mb-8 opacity-90 max-w-md mx-auto">
          Dilengkapi AI Debtwatch mampu memberikan analisis otomatis mengenai pola pengeluaran, mendeteksi kebiasaan berisiko, serta memberikan rekomendasi finansial sederhana demi mencegah terjadinya utang yang tidak terkendal
        </p>
        <img 
          src={phoneMockupImage} 
          alt="Mockup aplikasi DebtWatch" 
          className="max-w-xs w-[60%] sm:w-[50%] md:w-[40%] object-contain my-6"
        />
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center mt-10">
        <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
          <ChevronLeft className="w-7 h-7" />
        </Button>
        
        <div className="flex space-x-2">
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
        </div>

        <Button
          className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-3 shadow-lg"
          size="icon"
          onClick={handleNext}
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPageTwo; 