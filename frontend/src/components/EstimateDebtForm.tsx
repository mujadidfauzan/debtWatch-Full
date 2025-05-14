// components/EstimateDebtForm.tsx
import React, { useState } from "react";

interface EstimateDebtFormProps {
  onClose: () => void;
  onSubmit: (amount: number, term: number, interest: number) => void;
}

const EstimateDebtForm: React.FC<EstimateDebtFormProps> = ({ onClose, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [interest, setInterest] = useState("");

  const handleSubmit = () => {
    if (amount && term && interest) {
      onSubmit(
        parseFloat(amount), 
        parseFloat(term), 
        parseFloat(interest)
      );
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h3 className="font-medium mb-4">Debt Estimation</h3>
      
      <div className="mb-3">
        <label className="block mb-1">Debt Amount</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      
      <div className="mb-3">
        <label className="block mb-1">Payment Term (months)</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Interest Rate (%)</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button 
          className="px-4 py-2 border rounded-md"
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 bg-app-blue text-white rounded-md"
          onClick={handleSubmit}
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

export default EstimateDebtForm;
