import React, { useState, FormEvent } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const MentorForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [expertiseAreas, setExpertiseAreas] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [linkedInUrl, setLinkedInUrl] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!fullName || !email || !password || !expertiseAreas || yearsOfExperience === '') {
        throw new Error('Please fill out all required fields.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (yearsOfExperience < 0) {
        throw new Error('Years of experience cannot be negative.');
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Authenticated user:', user.uid);
      await user.getIdToken(true);
      console.log('Token refreshed');

      // Parse expertise areas into an array
      const expertiseArray = expertiseAreas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

      // Store mentor data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        expertiseAreas: expertiseArray.length > 0 ? expertiseArray : null,
        yearsOfExperience: Number(yearsOfExperience),
        linkedInUrl: linkedInUrl || null,
        role: 'mentor',
        createdAt: new Date().toISOString(),
      });
      console.log('Firestore document saved for user:', user.uid);

      setSuccess('Mentor account created successfully! Redirecting to mentorship...');
      setFullName('');
      setEmail('');
      setExpertiseAreas('');
      setYearsOfExperience('');
      setLinkedInUrl('');
      setPassword('');

      // Redirect to mentorship page after a short delay
      setTimeout(() => {
        navigate('/mentorship');
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'An error occurred during signup.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (err.code === 'firestore/permission-denied') {
        errorMessage = 'Permission denied: Check Firestore rules.';
      } else if (err.code) {
        errorMessage = `Error: ${err.code} - ${err.message}`;
      }
      setError(errorMessage);
      console.error('Signup error:', err.code, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1E293B] p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Mentor Sign Up</h2>
      
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
          <label className="block text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Expertise Areas (comma-separated)</label>
          <input
            type="text"
            value={expertiseAreas}
            onChange={(e) => setExpertiseAreas(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Web Development, Machine Learning, UI/UX"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Years of Experience</label>
          <input
            type="number"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter years of experience"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">LinkedIn Profile URL</label>
          <input
            type="url"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/yourusername"
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
    </div>
  );
};

export default MentorForm;