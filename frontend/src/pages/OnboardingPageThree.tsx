import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// TODO: Confirm actual image path for the illustration
const illustrationSlideThree = '/assets/business_plan.png';

const OnboardingPageThree: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/home');
  };

  const handlePrev = () => {
    navigate('/onboarding-2');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#2a43d2] text-white p-8 relative justify-between">
      {/* Top Navigation/Status Bar area (visual only for now) */}
      <div className="flex justify-between items-center mb-10">
        {/* Intentionally left blank or could add status bar elements if needed */}
        <span></span> {/* Spacer to balance the layout if no back button */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center text-center flex-grow justify-center mt-[-4rem]">
        <h2 className="text-3xl font-bold mb-6 leading-tight">Track dan Ask AI</h2>
        {/* No descriptive text for this slide based on the image */}
        <img src={illustrationSlideThree} alt="Ilustrasi melacak dan bertanya pada AI" className="max-w-full w-[80%] sm:w-[70%] md:w-[60%] object-contain my-6 max-h-[50vh]" />
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-center mt-10">
        <Button variant="ghost" size="icon" onClick={handlePrev} className="text-white hover:bg-white/20 rounded-full p-2">
          <ChevronLeft className="w-7 h-7" />
        </Button>

        <div className="flex space-x-2">
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-white/50 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span>
        </div>

        <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-3 shadow-lg" size="icon" onClick={handleNext}>
          <ChevronRight className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPageThree;
