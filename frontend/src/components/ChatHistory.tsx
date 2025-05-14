// components/ChatHistory.tsx
import React from "react";

interface ChatHistoryProps {
  onChatSelect: (chatId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onChatSelect }) => {
  return (
    <div className="w-64 h-full bg-white border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="font-medium mb-2">Today</h2>
        <div className="ml-2 mb-4">
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-kpr")}
          >
            Home Loan Debt
          </div>
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-usaha")}
          >
            Business Debt
          </div>
        </div>
        
        <h2 className="font-medium mb-2">Yesterday</h2>
        <div className="ml-2">
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-bank")}
          >
            Bank Debt
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
