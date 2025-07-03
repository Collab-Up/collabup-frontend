import { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, MessageCircle, ChevronDown, Calendar, Clock, Video, X, PartyPopper } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { sendCollabEmail } from '../utils/sendCollabEmail';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserRole } from '../utils/getUserRole'; // From previous artifact

interface Mentor {
  id: string;
  name: string;
  imageUrl: string;
  domain: string;
  pricing: string;
  experience: number;
  location: string;
  matchScore: number;
  skills: string[];
  email: string;
}

interface BookingDetails {
  date: string;
  timeSlot: string;
  platform: string;
}

const domains = [
  'Full Stack Development', 'Frontend Development', 'Backend Development',
  'Mobile Development', 'DevOps', 'Cloud Computing', 'Data Science',
  'Machine Learning', 'Artificial Intelligence', 'Blockchain', 'Cybersecurity',
  'UI/UX Design',
];

const priceRanges = ['2000-5000', '5000-10000', '10000-15000', '15000-20000', '20000+'];
const experienceYears = [2, 3, '3+'];
const platforms = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Skype'];
const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

const mentorImages = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/men/77.jpg',
  'https://randomuser.me/api/portraits/women/88.jpg',
  'https://randomuser.me/api/portraits/men/99.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
];

const mockMentors: Mentor[] = [
  {
    id: 'mock1',
    name: 'Ashutosh Shandilya',
    imageUrl: mentorImages[0],
    domain: 'Cloud Computing',
    pricing: '5000-10000',
    experience: 5,
    location: 'Kanpur, India',
    matchScore: 85,
    skills: ['AWS', 'Docker', 'Kubernetes'],
    email: 'cs22b2050@iiitdm.ac.in',
  },
  {
    id: 'mock2',
    name: 'Nitin Thaber',
    imageUrl: mentorImages[1],
    domain: 'Cybersecurity',
    pricing: '10000-15000',
    experience: 3,
    location: 'Delhi, India',
    matchScore: 90,
    skills: ['Network Security', 'Python', 'Linux'],
    email: 'cs22b2047@iiitdm.ac.in',
  },
  {
    id: 'mock3',
    name: 'Anshu Saini',
    imageUrl: mentorImages[2],
    domain: 'Mobile Development',
    pricing: '2000-5000',
    experience: 4,
    location: 'Chennai, India',
    matchScore: 92,
    skills: ['Flutter', 'React Native', 'Android'],
    email: 'cs22b2051@iiitdm.ac.in',
  },
  {
    id: 'mock4',
    name: 'Prashant Tyagi',
    imageUrl: mentorImages[3],
    domain: 'AI/ML',
    pricing: '5000-10000',
    experience: 7,
    location: 'Meerut, India',
    matchScore: 89,
    skills: ['Python', 'Machine Learning', 'Data Science'],
    email: 'me22b1069@iiitdm.ac.in',
  },
  {
    id: 'mock5',
    name: 'Arpita Roy',
    imageUrl: mentorImages[4],
    domain: 'Data Science',
    pricing: '2000-5000',
    experience: 2,
    location: 'Kolkata, India',
    matchScore: 88,
    skills: ['Python', 'Pandas', 'Data Visualization'],
    email: 'me22b1078@iiitdm.ac.in',
  },
  {
    id: 'mock6',
    name: 'Rishit Rastogi',
    imageUrl: mentorImages[5],
    domain: 'IoT',
    pricing: '10000-15000',
    experience: 6,
    location: 'Lucknow, India',
    matchScore: 91,
    skills: ['Arduino', 'Raspberry Pi', 'C++'],
    email: 'me22b2017@iiitdm.ac.in',
  },
  {
    id: 'mock7',
    name: 'Kush Jain',
    imageUrl: mentorImages[6],
    domain: 'Blockchain',
    pricing: '5000-10000',
    experience: 3,
    location: 'Jaipur, India',
    matchScore: 86,
    skills: ['Solidity', 'Web3.js', 'React'],
    email: 'cs22b2010@iiitdm.ac.in',
  },
];

function Mentorship() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<string | number>('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: '',
    timeSlot: '',
    platform: '',
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ email: string; fullName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status and fetch user role
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const role = await getUserRole();
        setUserRole(role);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({ email: data.email, fullName: data.fullName || data.startupName || data.founderName || '' });
        }
      } else {
        // Non-logged-in users see mock data
        // Filter by ID if present in query string
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) {
          const filtered = mockMentors.filter((m) => m.id === id);
          setMentors(filtered);
        } else {
          setMentors(mockMentors);
        }
        setIsLoading(false);
      }
    });

    // Fetch mentors for students or mentors
    const fetchMentors = async () => {
      if (!currentUser || userRole !== 'student') {
        setIsLoading(false);
        return;
      }
      try {
        const mentorsQuery = query(collection(db, 'users'), where('role', '==', 'mentor'));
        const querySnapshot = await getDocs(mentorsQuery);
        const mentorList: Mentor[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.fullName,
            email: data.email,
            imageUrl: data.profilePicUrl || 'https://via.placeholder.com/150',
            domain: data.expertiseAreas?.[0] || 'Unknown',
            pricing: data.pricing || '5000-10000',
            experience: data.yearsOfExperience || 0,
            location: data.institute || 'Unknown',
            matchScore: Math.floor(Math.random() * 20) + 80, // Random for demo
            skills: data.expertiseAreas || [],
          };
        });
        setMentors(mentorList);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && userRole === 'student') {
      fetchMentors();
    }
    return () => unsubscribe();
  }, [currentUser, userRole, location.search]);

  // If an ID is present, show only the selected mentor card (with fallback for string/number IDs)
  const params = new URLSearchParams(location.search);
  const selectedId = params.get('id');
  let selectedMentor: Mentor | undefined = undefined;
  if (selectedId) {
    selectedMentor = mentors.find(m => String(m.id) === String(selectedId));
    if (!selectedMentor) {
      // Fallback: try to parse as number for mock data
      const numId = Number(selectedId);
      if (!isNaN(numId)) {
        selectedMentor = mentors.find(m => String(m.id) === String(numId));
      }
    }
  }

  if (selectedId && selectedMentor) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="text-blue-400 hover:underline mb-4">&larr; Back</button>
        </div>
        {/* Render the single selected mentor card here, similar to your normal card UI */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
            <div className="relative">
              <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={16} fill="currentColor" />
                  <span className="font-semibold text-gray-200">{selectedMentor.matchScore}%</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedMentor.imageUrl}
                  alt={selectedMentor.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">{selectedMentor.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm">{selectedMentor.location}</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span className="font-medium text-gray-300">{selectedMentor.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{selectedMentor.experience} Years Experience</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMentor.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Price Range:</div>
                <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-800">
                  ₹{selectedMentor.pricing}
                </span>
              </div>
              <button
                onClick={() => handleBookSession(selectedMentor)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MessageCircle size={20} />
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedId && !selectedMentor) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="text-blue-400 hover:underline mb-4">&larr; Back</button>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-gray-300">
          <h2 className="text-2xl font-bold mb-4">Mentor Not Found</h2>
          <p>The mentor you are looking for does not exist or is not available in the current data set.</p>
        </div>
      </div>
    );
  }

  const filteredMentors = !selectedId
    ? mentors.filter(mentor => {
        const searchMatch = searchTerm === '' ||
          mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          mentor.location.toLowerCase().includes(searchTerm.toLowerCase());
        const domainMatch = !selectedDomain || mentor.domain === selectedDomain;
        const priceMatch = !selectedPrice || mentor.pricing === selectedPrice;
        const experienceMatch = !selectedExperience ||
          (selectedExperience === '3+' ? mentor.experience >= 3 : mentor.experience === selectedExperience);
        return searchMatch && domainMatch && priceMatch && experienceMatch;
      })
    : [];

  const handleBookSession = (mentor: Mentor) => {
    if (!currentUser) {
      setIsSignInModalOpen(true);
      // Do NOT redirect here. Wait for sign-in.
      return;
    }
    // Removed userRole check: allow any authenticated user to book
    setBookingMentor(mentor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingDetails.date || !bookingDetails.timeSlot || !bookingDetails.platform || !currentUser || !bookingMentor) {
      setError('Please fill out all booking details.');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: currentUser.uid,
        mentorId: bookingMentor.id,
        date: bookingDetails.date,
        timeSlot: bookingDetails.timeSlot,
        platform: bookingDetails.platform,
        createdAt: new Date().toISOString(),
      });

      // Email to mentor
      await sendCollabEmail({
        to: bookingMentor.email,
        subject: `Mentorship Session Booking with ${bookingMentor.name}`,
        text: `${userData?.fullName || 'User'} (${userData?.email || currentUser.email}) has booked a mentorship session with you. Date: ${bookingDetails.date}, Time: ${bookingDetails.timeSlot}, Platform: ${bookingDetails.platform}`,
        html: `<p>${userData?.fullName || 'User'} (${userData?.email || currentUser.email}) has booked a mentorship session with you.<br/>Date: ${bookingDetails.date}<br/>Time: ${bookingDetails.timeSlot}<br/>Platform: ${bookingDetails.platform}</p>`
      });

      // Email to user (confirmation)
      await sendCollabEmail({
        to: userData?.email ?? currentUser.email ?? '',
        subject: `Mentorship Session Booking Confirmation`,
        text: `Your mentorship session with ${bookingMentor.name} has been booked. Date: ${bookingDetails.date}, Time: ${bookingDetails.timeSlot}, Platform: ${bookingDetails.platform}`,
        html: `<p>Your mentorship session with ${bookingMentor.name} has been booked.<br/>Date: ${bookingDetails.date}<br/>Time: ${bookingDetails.timeSlot}<br/>Platform: ${bookingDetails.platform}</p>`
      });

      setIsBookingModalOpen(false);
      setIsConfirmationModalOpen(true);
      setBookingDetails({ date: '', timeSlot: '', platform: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking.');
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12 pt-6">
        <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Mentor</h1>
        <p className="text-lg text-gray-400">Connect with expert mentors based on your learning goals</p>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, skills, or location..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative inline-block">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            <div className="relative inline-block">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="">All Prices</option>
                {priceRanges.map((range) => (
                  <option key={range} value={range}>₹{range}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            <div className="relative inline-block">
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="">All Experience</option>
                {experienceYears.map((year) => (
                  <option key={year} value={year}>{year} {typeof year === 'number' ? 'Years' : 'Years'}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800">{error}</div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400">Loading mentors...</div>
      )}

      {!isLoading && filteredMentors.length === 0 && (
        <div className="text-center text-gray-400">No mentors found.</div>
      )}
      {!isLoading && filteredMentors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedMentor ? (
            <div key={selectedMentor.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
              <div className="relative">
                <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                    <span className="font-semibold text-gray-200">{selectedMentor.matchScore}%</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedMentor.imageUrl}
                    alt={selectedMentor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200">{selectedMentor.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />
                      <span className="text-sm">{selectedMentor.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span className="font-medium text-gray-300">{selectedMentor.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-indigo-400" />
                    <span className="text-gray-400">{selectedMentor.experience} Years Experience</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMentor.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Price Range:</div>
                  <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-800">
                    ₹{selectedMentor.pricing}
                  </span>
                </div>
                <button
                  onClick={() => handleBookSession(selectedMentor)}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <MessageCircle size={20} />
                  Book Session
                </button>
              </div>
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
                <div className="relative">
                  <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} fill="currentColor" />
                      <span className="font-semibold text-gray-200">{mentor.matchScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-200">{mentor.name}</h3>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} />
                        <span className="text-sm">{mentor.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={16} className="text-indigo-400" />
                      <span className="font-medium text-gray-300">{mentor.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code size={16} className="text-indigo-400" />
                      <span className="text-gray-400">{mentor.experience} Years Experience</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Price Range:</div>
                    <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-800">
                      ₹{mentor.pricing}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookSession(mentor)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <MessageCircle size={20} />
                    Book Session
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6">Please sign in to book a mentorship session.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSignInModalOpen(false);
                  navigate('/signin');
                }}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isBookingModalOpen && bookingMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Book Session with {bookingMentor.name}</h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Select Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select
                    value={bookingDetails.timeSlot}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, timeSlot: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Select Platform</label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select
                    value={bookingDetails.platform}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, platform: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a platform</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleConfirmBooking}
                disabled={isLoading || !bookingDetails.date || !bookingDetails.timeSlot || !bookingDetails.platform}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <PartyPopper size={48} className="text-yellow-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Thanks for Connecting! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Our mentors will connect with you on {bookingDetails.date} at {bookingDetails.timeSlot} via {bookingDetails.platform}
            </p>
            <button
              onClick={() => setIsConfirmationModalOpen(false)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentorship;