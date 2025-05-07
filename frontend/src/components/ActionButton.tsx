
import React, { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label }) => {
  return (
    <div className="bg-white rounded-full p-3 flex items-center w-full">
      <div className="text-app-blue mr-3">{icon}</div>
      <div className="text-gray-500 font-medium">{label}</div>
    </div>
  );
};

export default ActionButton;
