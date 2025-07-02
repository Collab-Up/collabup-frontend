import React, { useState, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ArrowLeft } from 'lucide-react';
import { auth } from '../firebase/firebaseConfig'; // Adjust path if needed (e.g., '@/firebase/firebase')
import { signInWithEmailAndPassword } from 'firebase/auth';
import StudentForm from './StudentForm';
import FacultyForm from './FacultyForm';
import StartupForm from './StartupForm';
import MentorForm from './MentorForm';

type Role = 'student' | 'faculty' | 'startup' | 'mentor';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!email || !password) {
        throw new Error('Please fill out all required fields.');
      }

      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      setSuccess('Logged in successfully!');
      setEmail('');
      setPassword('');
      // Optionally close the modal after a brief delay to show the success message
      setTimeout(onClose, 1500);
      // Optional: Redirect to dashboard (uncomment if using react-router-dom)
      // import { useNavigate } from 'react-router-dom';
      // const navigate = useNavigate();
      // navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (type === 'login') {
      return (
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-lg bg-[#1E293B] border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-lg bg-[#1E293B] border-gray-600 text-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      );
    }

    if (!selectedRole) {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-center text-white">Choose your role</h3>
          <div className="grid grid-cols-2 gap-4">
            {(['student', 'faculty', 'startup', 'mentor'] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="p-6 bg-[#1E293B] rounded-lg hover:bg-[#2D3B4F] transition-all duration-300 border border-gray-700 group"
              >
                <div className="text-gray-300 group-hover:text-white capitalize font-medium">{role}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const FormComponent = {
      student: StudentForm,
      faculty: FacultyForm,
      startup: StartupForm,
      mentor: MentorForm,
    }[selectedRole];

    return (
      <div>
        <button
          onClick={() => setSelectedRole(null)}
          className="flex items-center text-gray-400 hover:text-gray-300 mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to roles
        </button>
        <FormComponent />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0F172A] p-6 text-left align-middle shadow-xl transition-all border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-medium text-white">
              {type === 'login' ? 'Welcome Back' : 'Join CollabUp'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {renderForm()}
          </div>
          {type === 'login' && (
            <p className="mt-4 text-sm text-center text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => onClose()} className="text-blue-400 hover:text-blue-300">
                Sign up
              </button>
            </p>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}