import React from "react";

interface AmountDisplayProps {
  amount: string;
  firstOperand?: string | null;
  operation?: string | null;
  waitingForSecondOperand?: boolean;
}

const formatAmount = (value: string) => {
  if (!value) return "0";
  // Remove any existing dots to avoid issues with parsing
  const numberValue = parseFloat(value.replace(/\./g, ''));
  if (isNaN(numberValue)) return "0";
  return numberValue.toLocaleString('id-ID');
};

const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, firstOperand, operation, waitingForSecondOperand }) => {
  let displayValue = formatAmount(amount);

  if (operation && firstOperand) {
    if (waitingForSecondOperand) {
      // E.g., "55 + "
      displayValue = `${formatAmount(firstOperand)} ${operation}`;
    } else {
      // E.g., "55 + 10"
      displayValue = `${formatAmount(firstOperand)} ${operation} ${formatAmount(amount)}`;
    }
  } else if (waitingForSecondOperand && firstOperand && operation) {
   
    displayValue = `${formatAmount(firstOperand)} ${operation}`;
  }
 


  return (
    <div className="bg-app-yellow rounded-2xl p-4 flex items-center justify-between">
      <div className="bg-black rounded-full px-3 py-1.5 text-white font-bold">
        Rp
      </div>
      <div className="flex-1 ml-4 text-3xl font-bold text-right">
        {displayValue}
      </div>
    </div>
  );
};

export default AmountDisplay;
