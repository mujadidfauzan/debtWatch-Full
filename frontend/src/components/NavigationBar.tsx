import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation from react-router-dom

const NavigationBar = () => {
  const location = useLocation(); // Get the current location (route)

  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-t-3xl shadow-md"
      style={{ boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.16)" }}>

      <Link to="/home">
        <button
          className={`flex flex-col items-center ${location.pathname === "/home" ? "bg-app-yellow rounded-full p-3" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </button>
      </Link>

      <Link to="/chatbot">
        <button
          className={`flex flex-col items-center ${location.pathname === "/chatbot" ? "bg-app-yellow rounded-full p-3" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400">
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
          </svg>
        </button>
      </Link>

      <Link to="/input">
        <button
          className={`flex flex-col items-center ${location.pathname === "/input" ? "bg-app-yellow rounded-full p-3" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
  <path d="M4 20h4l10.5-10.5a2.828 2.828 0 10-4-4L4 16v4z" />
  <path d="M13.5 6.5l4 4" />
</svg>


        </button>
      </Link>

    </div>
  );
};

export default NavigationBar;
