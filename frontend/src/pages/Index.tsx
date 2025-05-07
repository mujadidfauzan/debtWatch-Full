import React, { useState } from "react";
import UserProfile from "@/components/UserProfile";
import TabSelector from "@/components/TabSelector";
import AmountDisplay from "@/components/AmountDisplay";
import ActionButton from "@/components/ActionButton";
import Calculator from "@/components/Calculator";
import NavigationBar from "@/components/NavigationBar";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState<string>("0");

  const handleKeyPress = (key: string) => {
    if (key === "C") {
      setAmount("0");
    } else if (key === "⌫") {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    } else if (key === "enter") {
      console.log("Submit amount:", amount);
    } else if (["÷", "×", "−", "+"].includes(key)) {
      console.log("Operation:", key);
    } else {
      setAmount(prev => {
        if (prev === "0" && key !== ".") {
          return key;
        } else {
          if (key === "." && prev.includes(".")) {
            return prev;
          }
          return prev + key;
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-app-blue to-blue-600">
      <div className="p-4 flex-1 flex flex-col">
        {/* Profil User, belum di develop masih dummy */}
        <div className="mb-6">
          <UserProfile />
        </div>

        {/* Tab Selector */}
        <div className="mb-4">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Amount Display */}
        <div className="mb-4">
          <AmountDisplay amount={amount} />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <ActionButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            } 
            label="Pilih Kategori" 
          />
          <ActionButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6.905 9.97a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72V18a.75.75 0 001.5 0v-4.19l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
                <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
              </svg>
            } 
            label="Tulis Catatan" 
          />
          <ActionButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
              </svg>
            } 
            label="Hari Ini" 
          />
        </div>

        {/* Kalkulator */}
        <div className="mt-auto">
          <Calculator onKeyPress={handleKeyPress} />
        </div>
      </div>

      {/* Navigation bar, sama ini juga masih dummy */}
      <NavigationBar />
    </div>
  );
};

export default Index;
