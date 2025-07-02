import React, { useState, FormEvent } from 'react';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const FacultyForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [institute, setInstitute] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [facultyIdFile, setFacultyIdFile] = useState<File | null>(null);
  const [researchAreas, setResearchAreas] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Faculty ID must be a PDF file.');
        setFacultyIdFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Faculty ID file size must be less than 5MB.');
        setFacultyIdFile(null);
        return;
      }
      setFacultyIdFile(file);
      setError(null);
    }
    e.target.blur();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!fullName || !institute || !email || !password || !facultyIdFile || !researchAreas) {
        throw new Error('Please fill out all required fields and upload a valid faculty ID.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Authenticated user:', user.uid);
      await user.getIdToken(true);
      console.log('Token refreshed');

      // Upload faculty ID with retry mechanism
      const facultyIdFileName = `${uuidv4()}-${facultyIdFile.name}`;
      const facultyIdRef = ref(storage, `faculty-ids/${user.uid}/${facultyIdFileName}`);
      console.log('Uploading faculty ID to:', facultyIdRef.fullPath);

      let facultyIdUrl: string | null = null;
      const maxRetries = 3;
      let attempt = 0;
      let uploadError: any = null;
      while (attempt < maxRetries) {
        try {
          const uploadTask = await uploadBytes(facultyIdRef, facultyIdFile);
          console.log('Faculty ID uploaded:', uploadTask.metadata.fullPath);
          facultyIdUrl = await getDownloadURL(facultyIdRef);
          console.log('Faculty ID download URL:', facultyIdUrl);
          break;
        } catch (err: any) {
          attempt++;
          uploadError = err;
          console.error(`Faculty ID upload attempt ${attempt} failed:`, err.code, err.message);
          if (err.code === 'storage/unauthorized' && attempt < maxRetries) {
            console.log('Retrying faculty ID upload with refreshed token...');
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            await user.getIdToken(true);
            continue;
          }
          console.error('Faculty ID upload failed after retries:', err.code, err.message);
          break;
        }
      }

      if (!facultyIdUrl && uploadError) {
        throw new Error(`Failed to upload faculty ID: ${uploadError.message}`);
      }

      // Parse research areas into an array
      const researchAreasArray = researchAreas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

      // Store faculty data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        institute,
        email,
        facultyIdUrl,
        researchAreas: researchAreasArray.length > 0 ? researchAreasArray : null,
        role: 'faculty',
        createdAt: new Date().toISOString(),
      });
      console.log('Firestore document saved for user:', user.uid);

      setSuccess('Faculty account created successfully!');
      setFullName('');
      setInstitute('');
      setEmail('');
      setFacultyIdFile(null);
      setResearchAreas('');
      setPassword('');
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => (input.value = ''));
    } catch (err: any) {
      let errorMessage = 'An error occurred during signup.';
      if (err.code === 'storage/unauthorized') {
        errorMessage = 'Failed to upload file: Unauthorized access. Please check Firebase Storage rules.';
      } else if (err.code === 'storage/canceled') {
        errorMessage = 'File upload canceled. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
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
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Faculty Sign Up</h2>
      
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
          <label className="block text-sm font-medium text-gray-300">Institute</label>
          <input
            type="text"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your institute name"
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
          <label className="block text-sm font-medium text-gray-300">Research Areas (comma-separated)</label>
          <input
            type="text"
            value={researchAreas}
            onChange={(e) => setResearchAreas(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Machine Learning, AI, Data Science"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Faculty ID Card (PDF, max 5MB)</label>
          <div className="mt-1 flex items-center justify-center w-full relative">
            <label
              className="w-full flex flex-col items-center px-4 py-6 bg-[#1E293B] text-gray-300 rounded-lg border-2 border-gray-600 border-dashed cursor-pointer hover:border-blue-500 hover:bg-[#2D3B4F] transition-all duration-300"
              style={{ position: 'relative' }}
            >
              <svg
                className="w-8 h-8 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-400">
                {facultyIdFile ? facultyIdFile.name : 'Upload your faculty ID card'}
              </span>
              <span className="text-xs text-gray-500 mt-1">PDF only, max 5MB</span>
              <input
                type="file"
                name="facultyId"
                className="absolute opacity-0 w-full h-full cursor-pointer top-0 left-0"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>
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

export default FacultyForm;