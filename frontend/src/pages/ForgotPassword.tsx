import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom'; // Untuk link "Sign Up"

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-blue-600 text-white">
      <div className="flex justify-center items-center pt-16 pb-8">
        <h1 className="text-3xl font-bold">Forgot Password</h1>
      </div>
      <div className="flex-grow bg-white text-black rounded-t-3xl p-6 flex flex-col items-center">
        <div className="w-full max-w-sm mt-8 space-y-6">
          <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Reset Password?</h2>
              <p className="text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
          </div>
          {/* Email Input */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Enter Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@example.com" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 w-full py-3" 
            />
          </div>

          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full mt-4">
            Enter
          </Button>

        </div>
        
        {/* Geser biar dia lebih kebawah */}
        <div className="flex-grow"></div> 

        {/* tombol sign up-nya */}
        <div className="text-center mb-8">
          <p className="text-xs text-gray-500">
            Don't have an account? 
            <Link to="/signup" className="font-semibold text-blue-600 hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 