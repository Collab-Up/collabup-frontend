import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      try {
        const res = await fetch(
          import.meta.env.VITE_RECOMMENDATION_API_URL,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: value, top_n: 5 })
          }
        );
        const data = await res.json();
        setRecommendations(data);
        setShowDropdown(true);
      } catch (err) {
        setRecommendations(null);
        setShowDropdown(false);
      }
    } else {
      setRecommendations(null);
      setShowDropdown(false);
    }
  };

  return (
    <>
      <nav className="bg-[#0F172A] border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-110 transition-transform duration-300">
              C&lt;&gt;llabUp
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search live projects"
                className="bg-[#1E293B] text-gray-300 pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => { if (recommendations) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && recommendations && (
                <div className="absolute left-0 mt-2 w-96 bg-[#1E293B] text-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 border border-blue-900 animate-fade-in backdrop-blur-md ring-1 ring-blue-900">
                  {recommendations.student_projects?.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 font-semibold border-b border-blue-900 bg-[#172136] text-blue-300 sticky top-0 rounded-t-2xl">
                      <span className="bg-blue-900 rounded-full p-1"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" /></svg></span>Student Projects
                    </div>
                  )}
                  {recommendations.student_projects?.map((proj: any) => (
                    <div key={proj.id} className="px-4 py-3 border-b border-blue-900 hover:bg-blue-900/40 cursor-pointer transition-all rounded-xl flex flex-col gap-1 group"
                      onPointerDown={() => {
                        setShowDropdown(false);
                        navigate(`/student-projects?id=${encodeURIComponent(String(proj.id))}`);
                      }}>
                      <div className="font-medium text-blue-200 truncate group-hover:underline">{proj.title}</div>
                      <div className="text-xs text-gray-400 truncate">{proj.description}</div>
                    </div>
                  ))}
                  {recommendations.startup_projects?.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 font-semibold border-b border-purple-900 bg-[#22172b] text-purple-300 sticky top-0">
                      <span className="bg-purple-900 rounded-full p-1"><svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></span>Startup Projects
                    </div>
                  )}
                  {recommendations.startup_projects?.map((proj: any) => (
                    <div key={proj.id} className="px-4 py-3 border-b border-purple-900 hover:bg-purple-900/40 cursor-pointer transition-all rounded-xl flex flex-col gap-1 group"
                      onPointerDown={() => {
                        setShowDropdown(false);
                        navigate(`/startup-proj?id=${encodeURIComponent(String(proj.id))}`);
                      }}>
                      <div className="font-medium text-purple-200 truncate group-hover:underline">{proj.title || proj.name}</div>
                      <div className="text-xs text-gray-400 truncate">{proj.description}</div>
                    </div>
                  ))}
                  {recommendations.research_projects?.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 font-semibold border-b border-green-900 bg-[#172b1a] text-green-300 sticky top-0">
                      <span className="bg-green-900 rounded-full p-1"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg></span>Research Projects
                    </div>
                  )}
                  {recommendations.research_projects?.map((proj: any) => (
                    <div key={proj.id} className="px-4 py-3 border-b border-green-900 hover:bg-green-900/40 cursor-pointer transition-all rounded-xl flex flex-col gap-1 group"
                      onPointerDown={() => {
                        setShowDropdown(false);
                        navigate(`/research-projects?id=${encodeURIComponent(String(proj.id))}`);
                      }}>
                      <div className="font-medium text-green-200 truncate group-hover:underline">{proj.title}</div>
                      <div className="text-xs text-gray-400 truncate">{proj.description}</div>
                    </div>
                  ))}
                  {recommendations.mentor_profiles?.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 font-semibold border-b border-yellow-900 bg-[#2b2717] text-yellow-300 sticky top-0">
                      <span className="bg-yellow-900 rounded-full p-1"><svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2" /></svg></span>Mentors
                    </div>
                  )}
                  {recommendations.mentor_profiles?.map((mentor: any) => (
                    <div key={mentor.id} className="px-4 py-3 border-b border-yellow-900 hover:bg-yellow-900/40 cursor-pointer transition-all rounded-xl flex flex-col gap-1 group"
                      onPointerDown={() => {
                        setShowDropdown(false);
                        navigate(`/mentorship?id=${encodeURIComponent(String(mentor.id))}`);
                      }}>
                      <div className="font-medium text-yellow-200 truncate group-hover:underline">{mentor.fullName || mentor.name}</div>
                      <div className="text-xs text-gray-400 truncate">{mentor.email}</div>
                    </div>
                  ))}
                  {(!recommendations.student_projects?.length && !recommendations.startup_projects?.length && !recommendations.research_projects?.length && !recommendations.mentor_profiles?.length) && (
                    <div className="px-4 py-6 text-gray-500 text-center">No results found.</div>
                  )}
                </div>
              )}
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