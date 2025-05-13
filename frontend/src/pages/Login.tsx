import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else {
        setError('Failed to log in. Please try again.');
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-700 text-white p-4">
      <div className="w-full max-w-xs flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-12">Welcome</h1>
        <form onSubmit={handleLogin} className="w-full space-y-4 mb-6">
          <div className="space-y-1 text-left">
            <Label htmlFor="email" className="text-xs font-medium text-white">Username Or Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@example.com" 
              className="bg-white-600 border-b border-white-400 rounded-none text-black placeholder-gray-300 !placeholder-gray-300 focus:border-white focus:ring-0"  
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-left relative">
            <Label htmlFor="password" className="text-xs font-medium text-white">Password</Label>
            <Input 
              id="password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              className="bg-white-600 border-b border-white-400 rounded-none text-black placeholder-gray-300  !placeholder-gray-300 focus:border-white focus:ring-0" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Replace with your "eye-off" icon component, e.g., from lucide-react
                // <EyeOffIcon className="h-5 w-5" />
                <></>
              ) : (
                // Replace with your "eye" icon component, e.g., from lucide-react
                // <EyeIcon className="h-5 w-5" />
                <></>
              )}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 text-center py-2">{error}</p>}
          <div className="w-full space-y-3 pt-2">
            <Button 
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
            <button 
              type="button"
              className="text-xs text-gray-300 hover:text-white w-full text-center"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        </form>

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