import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom'; // Untuk link "Log In"

const SignupPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-blue-600 text-white">
      <div className="flex justify-center items-center pt-16 pb-8">
        <h1 className="text-3xl font-bold">Create Account</h1>
      </div>
      <div className="flex-grow bg-white text-black rounded-t-3xl p-6">
        <div className="w-full max-w-sm mx-auto space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullname" className="text-xs font-semibold text-gray-600">Full Name</Label>
            <Input 
              id="fullname" 
              type="text" 
              placeholder="example@example.com" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
            />
          </div>
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@example.com" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
            />
          </div>
          {/* Mobile Number */}
          <div className="space-y-1">
            <Label htmlFor="mobile" className="text-xs font-semibold text-gray-600">Mobile Number</Label>
            <Input 
              id="mobile" 
              type="tel" 
              placeholder="+ 123 456 789" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
            />
          </div>
          {/* tanggal lahir */}
          <div className="space-y-1">
            <Label htmlFor="dob" className="text-xs font-semibold text-gray-600">Date Of Birth</Label>
            <Input 
              id="dob" 
              type="text" // Bisa diganti type="date" kalau pengen
              placeholder="DD / MM / YYYY" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
            />
          </div>
          {/* pw */}
          <div className="space-y-1 relative">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10" 
            />
            <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>
          {/* confirm pw */}
          <div className="space-y-1 relative">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10" 
            />
             <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>

          <p className="text-xs text-gray-500 text-center pt-2">
            By continuing, you agree to 
            <a href="#" className="text-blue-600 font-semibold"> Terms of Use</a> and 
            <a href="#" className="text-blue-600 font-semibold"> Privacy Policy</a>.
          </p>

          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full mt-4">
            Sign Up
          </Button>

          <p className="text-xs text-gray-500 text-center pt-2">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 