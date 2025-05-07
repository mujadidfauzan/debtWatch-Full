
import React from "react";

interface AmountDisplayProps {
  amount: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount }) => {
  return (
    <div className="bg-app-yellow rounded-2xl p-4 flex items-center">
      <div className="bg-black rounded-full px-3 py-1.5 text-white font-bold">
        Rp
      </div>
      <div className="flex-1 ml-4 text-3xl font-bold">
        {amount}
      </div>
    </div>
  );
};

export default AmountDisplay;
