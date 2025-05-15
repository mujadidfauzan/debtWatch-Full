import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  userName?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userName = 'User' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link to="/detail">
        <div className="flex items-center gap-2 bg-black bg-opacity-20 rounded-full px-3 py-1.5 w-fit cursor-pointer hover:bg-opacity-30 transition-colors">
          <div className="w-6 h-6  md:w-7 md:h-7 rounded-full bg-black flex items-center justify-center ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4 md:w-5 md:h-5">
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-white font-semibold">{userName}</span>
        </div>
      </Link>
      <Button onClick={handleLogout} variant="outline" className="text-black border-white hover:bg-white hover:text-blue-700 py-1.5 px-3 h-auto text-sm md:text-xl">
        Logout
      </Button>
    </div>
  );
};

export default UserProfile;
