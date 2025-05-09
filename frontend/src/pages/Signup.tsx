import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        full_name: fullName,
        email: user.email,
        mobile: mobile,
        dateOfBirth: dob,
        createdAt: serverTimestamp(),
      });

      navigate('/usia');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-600 text-white">
      <div className="flex justify-center items-center pt-16 pb-8">
        <h1 className="text-3xl font-bold">Create Account</h1>
      </div>
      <div className="flex-grow bg-white text-black rounded-t-3xl p-6">
        <form onSubmit={handleSignup} className="w-full max-w-sm mx-auto space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullname" className="text-xs font-semibold text-gray-600">Full Name</Label>
            <Input 
              id="fullname" 
              type="text" 
              placeholder="Your Full Name" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@example.com" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mobile" className="text-xs font-semibold text-gray-600">Mobile Number</Label>
            <Input 
              id="mobile" 
              type="tel" 
              placeholder="+ 123 456 789" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dob" className="text-xs font-semibold text-gray-600">Date Of Birth</Label>
            <Input 
              id="dob" 
              type="text" 
              placeholder="DD / MM / YYYY" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••••" 
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
             <span className="absolute right-3 top-7 text-gray-400 cursor-pointer">👁️</span> 
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <p className="text-xs text-gray-500 text-center pt-2">
            By continuing, you agree to 
            <a href="#" className="text-blue-600 font-semibold"> Terms of Use</a> and 
            <a href="#" className="text-blue-600 font-semibold"> Privacy Policy</a>.
          </p>

          <Button 
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full mt-4"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <p className="text-xs text-gray-500 text-center pt-2">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;