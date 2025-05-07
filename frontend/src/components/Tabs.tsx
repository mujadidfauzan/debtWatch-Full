import React, { useState } from "react";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("Monthly"); // default tab

  const tabs = ["Daily", "Weekly", "Monthly"];

  return (
    <div className="flex justify-between bg-gray-200 rounded-full mt-6 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 rounded-full font-medium transition-colors duration-200 ${
            activeTab === tab ? "bg-blue-600 text-white" : "text-black"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
