import React, { useState, FormEvent } from 'react';
import { auth, db } from '../firebase/firebaseConfig'; // Adjust path if needed (e.g., '@/firebase/firebase')
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { signInWithGoogle } from '../firebase/authService';

const StartupForm: React.FC = () => {
  const [startupName, setStartupName] = useState<string>('');
  const [founderName, setFounderName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [companyDescription, setCompanyDescription] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!startupName || !founderName || !email || !password || !industry || !companyDescription) {
        throw new Error('Please fill out all required fields.');
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store startup data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        startupName,
        founderName,
        email,
        website: website || null,
        industry,
        companyDescription,
        role: 'startup',
        createdAt: new Date().toISOString(),
      });

      setSuccess('Startup account created successfully!');
      // Reset form
      setStartupName('');
      setFounderName('');
      setEmail('');
      setWebsite('');
      setIndustry('');
      setCompanyDescription('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      await setDoc(doc(db, 'users', user.uid), {
        startupName: user.displayName || '',
        email: user.email,
        role: 'startup',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setSuccess('Signed up with Google! Please complete your profile.');
      // Optionally redirect or update UI
    } catch (err: any) {
      setError('Google sign-in failed. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1E293B] p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Startup Sign Up</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg border border-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Startup Name</label>
          <input
            type="text"
            value={startupName}
            onChange={(e) => setStartupName(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your startup name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Founder Name</label>
          <input
            type="text"
            value={founderName}
            onChange={(e) => setFounderName(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter founder name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="https://yourstartup.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g., Technology, Healthcare, Finance"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Company Description</label>
          <textarea
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="Describe your startup and what you do..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        className="w-full mb-4 flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-2 rounded-lg shadow hover:bg-gray-100 transition-all"
        disabled={isLoading}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Sign up with Google
      </button>
    </div>
  );
};

export default StartupForm;