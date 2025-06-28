import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Settings, MessageCircle, X, ExternalLink, LayoutDashboard } from 'lucide-react';
import AuthModal from './AuthModal';
import Chatbot from './Chatbot';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { RecommendationService, RecommendationResponse } from '../services/recommendationService';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Search and recommendation states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchRecommendations(searchQuery);
      } else {
        setRecommendations(null);
        setShowRecommendations(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchRecommendations = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await RecommendationService.getRecommendations(query, 3);
      setRecommendations(results);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations(null);
    } finally {
      setIsLoading(false);
    }
  };

  const debugSearch = async (query: string) => {
    console.log('🔍 Debugging search for:', query);
    try {
      const debugData = await RecommendationService.debugQuery(query);
      if (debugData) {
        console.log('🔍 Debug results:', debugData);
      }
    } catch (error) {
      console.error('Error debugging search:', error);
    }
  };

  const openAuth = (type: 'login' | 'signup') => {
    setAuthType(type);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsProfileDropdownOpen(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim().length >= 2 && recommendations) {
      setShowRecommendations(true);
    }
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Don't hide immediately to allow clicking on recommendations
  };

  const clearSearch = () => {
    setSearchQuery('');
    setRecommendations(null);
    setShowRecommendations(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      e.preventDefault();
      fetchRecommendations(searchQuery);
      setShowRecommendations(true);
      // Also debug the search
      debugSearch(searchQuery);
    }
  };

  const handleRecommendationClick = (result: any, type: string) => {
    setShowRecommendations(false);
    setSearchQuery('');
    
    // Navigate to appropriate page with the selected item ID
    switch (type) {
      case 'student_projects':
        navigate(`/student-projects?selected=${result.id}`);
        break;
      case 'startup_projects':
        navigate(`/startup-proj?selected=${result.id}`);
        break;
      case 'mentor_profiles':
        navigate(`/mentorship?selected=${result.id}`);
        break;
      case 'research_projects':
        navigate(`/research-projects?selected=${result.id}`);
        break;
      default:
        break;
    }
  };

  const getRecommendationCount = () => {
    if (!recommendations) return 0;
    return (
      recommendations.student_projects.length +
      recommendations.startup_projects.length +
      recommendations.mentor_profiles.length +
      recommendations.research_projects.length
    );
  };

  return (
    <>
      <nav className="bg-[#0F172A] border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold gradient-text hover:scale-110 transition-transform duration-300">
              C&lt;&gt;llabUp
            </Link>
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search live projects"
                  className="bg-[#1E293B] text-gray-300 pl-10 pr-10 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Recommendations Dropdown */}
              {showRecommendations && (searchQuery.trim().length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2">Searching...</p>
                    </div>
                  ) : recommendations && getRecommendationCount() > 0 ? (
                    <div className="p-4">
                      {/* Student Projects */}
                      {recommendations.student_projects.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                            Student Projects
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              {recommendations.student_projects.length}
                            </span>
                          </h3>
                          {recommendations.student_projects.map((project, index) => (
                            <div key={index} className="mb-2 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleRecommendationClick(project, 'student_projects')}>
                              <div className="text-sm font-medium text-white">{project.title}</div>
                              <div className="text-xs text-gray-400">{project.domain} • {project.difficulty}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {project.skillsRequired?.slice(0, 3).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Startup Projects */}
                      {recommendations.startup_projects.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            Startup Projects
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              {recommendations.startup_projects.length}
                            </span>
                          </h3>
                          {recommendations.startup_projects.map((project, index) => (
                            <div key={index} className="mb-2 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleRecommendationClick(project, 'startup_projects')}>
                              <div className="text-sm font-medium text-white">{project.name}</div>
                              <div className="text-xs text-gray-400">{project.domain} • {project.location}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {project.mission}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mentor Profiles */}
                      {recommendations.mentor_profiles.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                            Mentors
                            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                              {recommendations.mentor_profiles.length}
                            </span>
                          </h3>
                          {recommendations.mentor_profiles.map((mentor, index) => (
                            <div key={index} className="mb-2 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleRecommendationClick(mentor, 'mentor_profiles')}>
                              <div className="text-sm font-medium text-white">{mentor.name}</div>
                              <div className="text-xs text-gray-400">{mentor.currentCompany} • {mentor.designation}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {mentor.expertise?.slice(0, 3).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Research Projects */}
                      {recommendations.research_projects.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                            Research Projects
                            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                              {recommendations.research_projects.length}
                            </span>
                          </h3>
                          {recommendations.research_projects.map((project, index) => (
                            <div key={index} className="mb-2 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleRecommendationClick(project, 'research_projects')}>
                              <div className="text-sm font-medium text-white">{project.name}</div>
                              <div className="text-xs text-gray-400">{project.department} • {project.designation}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {project.researchAreas?.slice(0, 3).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-400 text-center">
                          Click to view specific details
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="text-gray-300 hover:text-blue-400 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-800"
              title="Chat with Assistant"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
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
            {currentUser && [
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
      
      {/* Chatbot Component */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default Navbar;