import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Link } from 'react-router-dom'; // Mungkin tidak perlu link di sini

const NewPasswordPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-blue-600 text-white">
      <div className="flex justify-center items-center pt-16 pb-8">
        <h1 className="text-3xl font-bold">New Password</h1>
      </div>
      <div className="flex-grow bg-white text-black rounded-t-3xl p-6 flex flex-col items-center">
        <div className="w-full max-w-sm mt-12 space-y-6">
          {/* New Password Input */}
          <div className="space-y-1 relative">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-gray-600">New Password</Label>
            <Input 
              id="newPassword" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 w-full py-3 pr-10" 
            />
            <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>
          {/* Confirm New Password Input */}
          <div className="space-y-1 relative">
            <Label htmlFor="confirmNewPassword" className="text-xs font-semibold text-gray-600">Confirm New Password</Label>
            <Input 
              id="confirmNewPassword" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 w-full py-3 pr-10" 
            />
             <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>

          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full mt-6">
            Change Password
          </Button>

        </div>
        
        {/* Spacer jika diperlukan untuk mendorong konten ke bawah jika ada footer */}
        {/* <div className="flex-grow"></div> */}

      </div>
    </div>
  );
};

export default NewPasswordPage; 