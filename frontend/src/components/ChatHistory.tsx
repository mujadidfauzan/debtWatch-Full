// components/ChatHistory.tsx
import React from "react";

interface ChatHistoryProps {
  onChatSelect: (chatId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onChatSelect }) => {
  return (
    <div className="w-64 h-full bg-white border-r overflow-y-auto">
      <div className="p-4">
        <h2 className="font-medium mb-2">Hari ini</h2>
        <div className="ml-2 mb-4">
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-kpr")}
          >
            Hutang KPR
          </div>
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-usaha")}
          >
            Hutang Usaha
          </div>
        </div>
        
        <h2 className="font-medium mb-2">Kemarin</h2>
        <div className="ml-2">
          <div 
            className="py-1 cursor-pointer hover:bg-gray-100"
            onClick={() => onChatSelect("hutang-bank")}
          >
            Hutang Bank
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
