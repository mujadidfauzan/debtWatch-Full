import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// TODO: Ask user for the actual illustration image
const illustrationPlaceholder = "/assets/finance.png";

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  // TODO: Implement multi-slide logic if needed
  const handleNext = () => {
    // For now, navigate to auth page or another appropriate page
    navigate('/onboarding-2');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Section - Blue Background */}
      <div className="bg-[#2a43d2] h-[50vh] flex flex-col items-center justify-center p-6 relative">
        <h1 className="text-white text-2xl font-bold absolute top-8">DebtWatch</h1>
        <img 
          src={illustrationPlaceholder} 
          alt="Financial risk illustration" 
          className="max-w-xs w-full object-contain" 
        />
      </div>

      {/* Bottom Section - White Background with Rounded Top */}
      <div className="bg-white flex-grow rounded-t-[3rem] -mt-12 p-8 flex flex-col items-center text-center relative">
        <div className="flex-grow flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Cek Resiko Utangmu
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-xs">
            DebtWatch adalah aplikasi berbasis AI yang bertujuan membantu pengguna untuk mendeteksi dini risiko jeratan utang
          </p>
        </div>

        {/* Dot Indicators */}
        <div className="flex space-x-2 mb-8">
          <span className="w-2.5 h-2.5 bg-[#2a43d2] rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
        </div>

        {/* Next Button */}
        <Button
          className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-4 absolute bottom-8 right-8 shadow-lg"
          size="icon"
          onClick={handleNext}
          
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage; 