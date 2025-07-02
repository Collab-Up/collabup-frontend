import React, { useState, FormEvent } from 'react';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import 'cors';

const StudentForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [instituteName, setInstituteName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string>('');
  const [leetCodeUrl, setLeetCodeUrl] = useState<string>('');
  const [codeForcesUrl, setCodeForcesUrl] = useState<string>('');
  const [linkedInUrl, setLinkedInUrl] = useState<string>('');
  const [gitHubUrl, setGitHubUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('College ID must be a PDF file.');
        setCollegeIdFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('College ID file size must be less than 5MB.');
        setCollegeIdFile(null);
        return;
      }
      setCollegeIdFile(file);
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
      if (!fullName || !instituteName || !email || !password || !collegeIdFile) {
        throw new Error('Please fill out all required fields and upload a valid college ID.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Create user and refresh token
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Authenticated user:', user.uid);
      await user.getIdToken(true);
      console.log('Token refreshed');

      // Upload college ID with retry mechanism
      let collegeIdUrl: string | null = null;
      const collegeIdFileName = `${uuidv4()}-${collegeIdFile.name}`;
      const collegeIdRef = ref(storage, `college-ids/${user.uid}/${collegeIdFileName}`);
      console.log('Uploading college ID to:', collegeIdRef.fullPath);

      const maxRetries = 3;
      let attempt = 0;
      let uploadError: any = null;
      while (attempt < maxRetries) {
        try {
          const uploadTask = await uploadBytes(collegeIdRef, collegeIdFile);
          console.log('College ID uploaded:', uploadTask.metadata.fullPath);
          collegeIdUrl = await getDownloadURL(collegeIdRef);
          console.log('College ID download URL:', collegeIdUrl);
          break;
        } catch (err: any) {
          attempt++;
          uploadError = err;
          console.error(`College ID upload attempt ${attempt} failed:`, err.code, err.message);
          if (err.code === 'storage/unauthorized' && attempt < maxRetries) {
            console.log('Retrying college ID upload with refreshed token...');
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff
            await user.getIdToken(true);
            continue;
          }
          console.error('College ID upload failed after retries:', err.code, err.message);
          break;
        }
      }

      if (!collegeIdUrl && uploadError) {
        throw new Error(`Failed to upload college ID: ${uploadError.message}`);
      }

      // Parse skills
      const skillsArray = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        instituteName,
        email,
        collegeIdUrl,
        skills: skillsArray.length > 0 ? skillsArray : null,
        leetCodeUrl: leetCodeUrl || null,
        codeForcesUrl: codeForcesUrl || null,
        linkedInUrl: linkedInUrl || null,
        gitHubUrl: gitHubUrl || null,
        role: 'student',
        createdAt: new Date().toISOString(),
      });
      console.log('Firestore document saved for user:', user.uid);

      // Send confirmation email
      const templateParams = {
        to_name: fullName,
        to_email: email,
      };
      await emailjs.send(
        'service_qv37c1r', // Replace with your EmailJS Service ID
        'template_a9799k9', // Replace with your EmailJS Template ID
        templateParams,
        'wtGOHmGUOT5eVZGq4' // Replace with your EmailJS Public Key
      );
      console.log('Confirmation email sent to:', email);

      setSuccess('Account created, please sign in.');
      setFullName('');
      setInstituteName('');
      setEmail('');
      setPassword('');
      setCollegeIdFile(null);
      setSkills('');
      setLeetCodeUrl('');
      setCodeForcesUrl('');
      setLinkedInUrl('');
      setGitHubUrl('');
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => (input.value = ''));

      navigate('/signin');
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
      } else if (err.message.includes('EmailJS')) {
        errorMessage = 'Failed to send confirmation email. Account created, but please check email configuration.';
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
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Student Sign Up</h2>
      
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
          <label className="block text-sm font-medium text-gray-300">Institute Name</label>
          <input
            type="text"
            value={instituteName}
            onChange={(e) => setInstituteName(e.target.value)}
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
          <label className="block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., React, Node.js, Python"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">LeetCode Profile URL</label>
          <input
            type="url"
            value={leetCodeUrl}
            onChange={(e) => setLeetCodeUrl(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://leetcode.com/yourusername"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">CodeForces Profile URL</label>
          <input
            type="url"
            value={codeForcesUrl}
            onChange={(e) => setCodeForcesUrl(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://codeforces.com/profile/yourusername"
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

        <div>
          <label className="block text-sm font-medium text-gray-300">GitHub Profile URL</label>
          <input
            type="url"
            value={gitHubUrl}
            onChange={(e) => setGitHubUrl(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-[#0F172A] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">College ID Card (PDF, max 5MB)</label>
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
                {collegeIdFile ? collegeIdFile.name : 'Upload your college ID card'}
              </span>
              <span className="text-xs text-gray-500 mt-1">PDF only, max 5MB</span>
              <input
                type="file"
                name="collegeid"
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

export default StudentForm;