import React from "react";
import { Link } from "react-router-dom";

interface UserProfileProps {
  userName?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName = "User" }) => {
  return (
    <Link to="/detail">
      <div className="flex items-center gap-2 bg-black bg-opacity-20 rounded-full px-3 py-1.5 w-fit">
        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-white font-semibold">{userName}</span>
      </div>
    </Link>
  );
};

export default UserProfile;
