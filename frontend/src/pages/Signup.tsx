import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
  const [policyContent, setPolicyContent] = useState<'terms' | 'privacy' | null>(null);

  const handleShowPolicy = (type: 'terms' | 'privacy') => {
    setPolicyContent(type);
    setIsPolicyDialogOpen(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        full_name: fullName,
        email: user.email,
        mobile: mobile,
        dateOfBirth: dob,
        createdAt: serverTimestamp(),
      });

      navigate('/jk');
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
      console.error('Signup error:', err);
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
            <Label htmlFor="fullname" className="text-xs font-semibold text-gray-600">
              Full Name
            </Label>
            <Input id="fullname" type="text" placeholder="Your Full Name" className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-600">
              Email
            </Label>
            <Input id="email" type="email" placeholder="example@example.com" className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mobile" className="text-xs font-semibold text-gray-600">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+ 123 456 789"
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500"
              value={mobile}
              onChange={(e) => {
                let inputValue = e.target.value;
                // Allow '+' only as the first character, and then only digits
                if (inputValue.startsWith('+')) {
                  inputValue = '+' + inputValue.substring(1).replace(/[^\d]/g, '');
                } else {
                  inputValue = inputValue.replace(/[^\d]/g, '');
                }
                setMobile(inputValue);
              }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dob" className="text-xs font-semibold text-gray-600">
              Date Of Birth
            </Label>
            <Input id="dob" type="date" placeholder="DD / MM / YYYY" className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-600">
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="absolute right-3 top-7 text-gray-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <div className="space-y-1 relative">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-600">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••"
              className="bg-gray-100 border-none rounded-lg placeholder-gray-400 focus:ring-blue-500 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span className="absolute right-3 top-7 text-gray-400 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <p className="text-xs text-gray-500 text-center pt-2">
            By continuing, you agree to
            <Button variant="link" type="button" onClick={() => handleShowPolicy('terms')} className="text-blue-600 font-semibold p-0 h-auto inline">
              {' '}
              Terms of Use
            </Button>
            {' '}
            and
            <Button variant="link" type="button" onClick={() => handleShowPolicy('privacy')} className="text-blue-600 font-semibold p-0 h-auto inline">
              {' '}
              Privacy Policy
            </Button>
            .
          </p>

          <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-full mt-4" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          <p className="text-xs text-gray-500 text-center pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold">
              Log In
            </Link>
          </p>
        </form>
      </div>

      <Dialog open={isPolicyDialogOpen} onOpenChange={setIsPolicyDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {policyContent === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-sm">
            {policyContent === 'terms' && (
              <>
                <p>Welcome to <strong>Debtwach</strong>! These terms and conditions outline the rules and regulations for the use of <strong>Debtwach</strong>'s services.</p>
                <p>By accessing or using our service, we assume you accept these terms and conditions. Do not continue to use <strong>Debtwach</strong> if you do not agree to all of the terms and conditions stated on this page.</p>

                <h2 className="font-semibold text-base pt-2">1. License to Use</h2>
                <p>Unless otherwise stated, <strong>Debtwach</strong> and/or its licensors own the intellectual property rights for all material on <strong>Debtwach</strong>. All intellectual property rights are reserved. You may access this from <strong>Debtwach</strong> for your own personal use subjected to restrictions set in these terms and conditions.</p>
                <p>You must not:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Republish material from <strong>Debtwach</strong></li>
                  <li>Sell, rent or sub-license material from <strong>Debtwach</strong></li>
                  <li>Reproduce, duplicate or copy material from <strong>Debtwach</strong></li>
                  <li>Redistribute content from <strong>Debtwach</strong></li>
                </ul>

                <h2 className="font-semibold text-base pt-2">2. User Accounts</h2>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>

                <h2 className="font-semibold text-base pt-2">3. Content</h2>
                <p>Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (“Content”). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>

                <h2 className="font-semibold text-base pt-2">4. Prohibited Uses</h2>
                <p>You may use the Service only for lawful purposes and in accordance with Terms. You agree not to use the Service:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>In any way that violates any applicable national or international law or regulation.</li>
                  <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material, including any “junk mail”, “chain letter,” “spam,” or any other similar solicitation.</li>
                </ul>

                <h2 className="font-semibold text-base pt-2">5. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h2 className="font-semibold text-base pt-2">6. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide reasonable notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
              </>
            )}
            {policyContent === 'privacy' && (
              <>
                <p>Your privacy is important to us. It is <strong>Debtwach</strong>'s policy to respect your privacy regarding any information we may collect from you across our application, <strong>Debtwach</strong>.</p>

                <h2 className="font-semibold text-base pt-2">1. Information We Collect</h2>
                <p><strong>Log data:</strong> When you use our service, our servers may automatically log the standard data provided by your device and application. This data may include your device's Internet Protocol (IP) address, device type and version, activity within the app, time and date, and other details about your usage.</p>
                <p><strong>Personal information:</strong> We may ask for personal information, such as your:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Name</li>
                  <li>Email</li>
                  <li>Date of birth</li>
                  <li>Phone/mobile number</li>
                  <li>Information you provide during account setup or usage.</li>
                </ul>

                <h2 className="font-semibold text-base pt-2">2. Legal Bases for Processing</h2>
                <p>We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.</p>
                <p>These legal bases depend on the services you use and how you use them, meaning we collect and use your information only where:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>It's necessary for the performance of a contract to which you are a party or to take steps at your request before entering into such a contract (for example, when we provide a service you request from us);</li>
                  <li>It satisfies a legitimate interest (which is not overridden by your data protection interests), such as for research and development, to market and promote our services, and to protect our legal rights and interests;</li>
                  <li>You give us consent to do so for a specific purpose (for example, you might consent to us sending you our newsletter); or</li>
                  <li>We need to process your data to comply with a legal obligation.</li>
                </ul>

                <h2 className="font-semibold text-base pt-2">3. Use of Information</h2>
                <p>We may use information to:</p>
                <ul className="list-disc list-inside pl-4">
                    <li>Provide and maintain our Service;</li>
                    <li>Notify you about changes to our Service;</li>
                    <li>Allow you to participate in interactive features of our Service when you choose to do so;</li>
                    <li>Provide customer support;</li>
                    <li>Gather analysis or valuable information so that we can improve our Service;</li>
                    <li>Monitor the usage of our Service;</li>
                    <li>Detect, prevent and address technical issues.</li>
                </ul>

                <h2 className="font-semibold text-base pt-2">4. Security of Your Personal Information</h2>
                <p>We will protect personal information by reasonable security safeguards against loss or theft, as well as unauthorized access, disclosure, copying, use or modification. We will retain personal information only for as long as necessary for the fulfillment of those purposes.</p>

                <h2 className="font-semibold text-base pt-2">5. Children's Privacy</h2>
                <p>Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

                <h2 className="font-semibold text-base pt-2">6. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupPage;
