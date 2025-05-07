import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-700 text-white p-4">
      <div className="w-full max-w-xs flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-12">Welcome</h1>

        <div className="w-full space-y-4 mb-6">
          <div className="space-y-1 text-left">
            <Label htmlFor="email" className="text-xs font-medium text-white">Username Or Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@example.com" 
              className="bg-white-600 border-b border-white-400 rounded-none placeholder-gray-300 !placeholder-gray-300 focus:border-white focus:ring-0"  
            />
          </div>
          <div className="space-y-1 text-left relative">
            <Label htmlFor="password" className="text-xs font-medium text-white">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="bg-white-600 border-b border-white-400 rounded-none placeholder-gray-300  !placeholder-gray-300 focus:border-white focus:ring-0" 
            />
          
            <span className="absolute right-2 top-8 text-gray-400 cursor-pointer">👁️</span> 
          </div>
        </div>

        <div className="w-full space-y-3 mb-6">
          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full">
            Log In
          </Button>
           <button 
            className="text-xs text-gray-300 hover:text-white w-full text-center"
            onClick={() => navigate('/forgot-password')}
           >
            Forgot Password?
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-200">
            Don't have an account? 
            <Link to="/signup" className="font-semibold text-white hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 