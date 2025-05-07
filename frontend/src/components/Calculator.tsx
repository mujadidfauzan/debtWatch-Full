
import React from "react";

interface CalculatorProps {
  onKeyPress: (key: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onKeyPress }) => {
  const keys = [
    ["C", "÷", "×", "⌫"],
    ["7", "8", "9", "−"],
    ["4", "5", "6", "+"],
    ["1", "2", "3", ""],
    ["0", "000", ".", ""],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {keys.map((row, rowIndex) =>
        row.map((key, keyIndex) => {
          if (key === "") {
            if (rowIndex === 3 && keyIndex === 3) {
              return (
                <button
                  key={`${rowIndex}-${keyIndex}`}
                  className="calc-button calc-button-blue row-span-2 rounded-2xl"
                  onClick={() => onKeyPress("enter")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              );
            }
            return <div key={`${rowIndex}-${keyIndex}`}></div>;
          }

          const isSpecial = ["÷", "×", "−", "+", "⌫"].includes(key);
          const isDark = key === "⌫";
          const buttonClass = isDark 
            ? "calc-button calc-button-dark" 
            : isSpecial 
              ? "calc-button calc-button-blue" 
              : "calc-button calc-button-blue";

          return (
            <button
              key={`${rowIndex}-${keyIndex}`}
              className={buttonClass}
              onClick={() => onKeyPress(key)}
            >
              {key}
            </button>
          );
        })
      )}
    </div>
  );
};

export default Calculator;
