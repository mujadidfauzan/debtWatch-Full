import React from "react";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, onContextMenu }) => {
  return (
    <div
      onContextMenu={onContextMenu}
      className={`max-w-xs md:max-w-md px-4 py-3 rounded-lg mb-3 break-words ${
        isUser 
          ? "bg-blue-500 text-white self-end" 
          : "bg-white text-gray-900 self-start shadow-sm"
      }`}
    >
      {message}
    </div>
  );
};

export default ChatBubble;
