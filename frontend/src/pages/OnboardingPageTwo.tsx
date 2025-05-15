import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// TODO: Confirm actual image path for the phone mockup
const phoneMockupImage = '/assets/uinya.png';

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

      <div className="flex flex-col min-h-screen bg-[#2a43d2] text-white p-8 relative justify-between">
        {/* Main Content */}
        <div className="flex flex-col items-center text-center flex-grow justify-center">
          <h2 className="text-3xl font-bold mb-4 leading-tight">A Smarter Plan to Avoid Default Risk</h2>
          <p className="text-sm mb-8 opacity-90 max-w-md mx-auto">
            Powered by AI, DebtWatch analyzes your spending habits, detects risky behavior, and offers simple financial tips to help you stay in control and steer clear of unmanageable debt.
          </p>
          <img src={phoneMockupImage} alt="DebtWatch app mockup" className="max-w-xs w-[60%] sm:w-[50%] md:w-[40%] object-contain my-6" />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center mt-10">
        <Button variant="ghost" size="icon" onClick={handlePrev} className="text-white hover:bg-white/20 rounded-full p-2">
          <ChevronLeft className="w-7 h-7" />
        </Button>

        <div className="flex space-x-2">
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
        </div>

        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-3 shadow-lg" size="icon" onClick={handleNext}>
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPageTwo;
