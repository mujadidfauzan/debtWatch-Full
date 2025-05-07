// components/ContextMenu.tsx
import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onArchive: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onArchive, onDelete }) => {
  return (
    <div 
      className="absolute bg-white border rounded-lg shadow-md z-50 w-40"
      style={{ top: y, left: x }}
    >
      <button 
        className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-100 border-b"
        onClick={onArchive}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
          <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" 
            stroke="currentColor" strokeWidth="2" />
        </svg>
        Arsip
      </button>
      <button 
        className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-100 text-red-500"
        onClick={onDelete}
      >
        <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 24 24" fill="none">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            stroke="currentColor" strokeWidth="2" />
        </svg>
        Delete
      </button>
    </div>
  );
};

export default ContextMenu;
