import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, onContextMenu }) => {
  const bubbleClasses = isUser
    ? "bg-app-blue text-white self-end"
    : "bg-gray-200 text-gray-800 self-start";

  return (
    <div 
      className={`max-w-[70%] p-3 rounded-lg mb-2 break-words ${bubbleClasses}`}
      onContextMenu={onContextMenu}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message}
      </ReactMarkdown>
    </div>
  );
};

export default ChatBubble;
