import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, LogOut, Settings } from 'lucide-react';
import AuthModal from './AuthModal';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.fullName || data.startupName || data.founderName || 'User');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const openAuth = (type: 'login' | 'signup') => {
    setAuthType(type);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[#0F172A] border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold gradient-text hover:scale-110 transition-transform duration-300">
              C&lt;&gt;llabUp
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search live projects"
                className="bg-[#1E293B] text-gray-300 pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {!currentUser ? (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] rounded-lg shadow-lg py-2 border border-gray-700 z-50">
                    <div className="px-4 py-2 text-gray-300 border-b border-gray-700">
                      {userName}
                    </div>
                    <Link
                      to="/edit-profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#0F172A] flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#0F172A] flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {[
              ['Student Proj', '/student-projects'],
              ['Buddy Finder', '/buddy-finder'],
              ['Mentorship', '/mentorship'],
              ['Startup Proj', '/startup-proj'],
            ].map(([title, path]) => (
              <Link
                key={path}
                to={path}
                className="relative text-gray-300 hover:text-blue-400 transition-colors duration-300 group"
              >
                {title}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        type={authType}
      />
    </>
  );
};

export default Navbar;