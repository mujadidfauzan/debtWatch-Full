
import React from "react";

interface TabSelectorProps {
  activeTab: "income" | "expense";
  setActiveTab: (tab: "income" | "expense") => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex bg-black bg-opacity-30 rounded-full p-1.5">
      <button
        className={`flex-1 py-2 px-4 rounded-full text-white font-bold text-center ${
          activeTab === "income" ? "bg-app-green" : "bg-transparent"
        }`}
        onClick={() => setActiveTab("income")}
      >
        Income
      </button>
      <button
        className={`flex-1 py-2 px-4 rounded-full text-black font-bold text-center ${
          activeTab === "expense" ? "bg-white" : "bg-transparent text-white"
        }`}
        onClick={() => setActiveTab("expense")}
      >
        Expense
      </button>
    </div>
  );
};

export default TabSelector;
