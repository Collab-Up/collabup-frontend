import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Code, Star, MapPin, MessageCircle, ChevronDown, Calendar, Clock, Video, X, PartyPopper } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
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

const mockMentors: Mentor[] = [
  {
    id: 'mock1',
    name: 'John Doe',
    imageUrl: 'https://via.placeholder.com/150',
    domain: 'Full Stack Development',
    pricing: '5000-10000',
    experience: 5,
    location: 'Mumbai, India',
    matchScore: 85,
    skills: ['React', 'Node.js', 'TypeScript'],
    email: 'john.doe@example.com',
  },
  {
    id: 'mock2',
    name: 'Jane Smith',
    imageUrl: 'https://via.placeholder.com/150',
    domain: 'Data Science',
    pricing: '10000-15000',
    experience: 3,
    location: 'Bangalore, India',
    matchScore: 90,
    skills: ['Python', 'TensorFlow', 'SQL'],
    email: 'jane.smith@example.com',
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
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
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

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init('wtGOHmGUOT5eVZGq4'); // Replace with your EmailJS Public Key

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
      }
      
      // Always start with mock data
      setMentors(mockMentors);
      setIsLoading(false);
    });

    // Fetch real mentors for students (in addition to mock data)
    const fetchRealMentors = async () => {
      if (!currentUser || userRole !== 'student') {
        return;
      }
      try {
        const mentorsQuery = query(collection(db, 'users'), where('role', '==', 'mentor'));
        const querySnapshot = await getDocs(mentorsQuery);
        const realMentorList: Mentor[] = querySnapshot.docs.map((doc) => {
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
        
        // Combine mock data with real data, ensuring no duplicates
        const existingIds = new Set(mockMentors.map(m => m.id));
        const uniqueRealMentors = realMentorList.filter(mentor => !existingIds.has(mentor.id));
        const combinedMentors = [...mockMentors, ...uniqueRealMentors];
        
        console.log('Combined mentors:', combinedMentors.length, 'Mock:', mockMentors.length, 'Real:', uniqueRealMentors.length);
        setMentors(combinedMentors);
      } catch (err) {
        console.error('Error fetching real mentors:', err);
        // Keep mock data even if real data fails to load
        setMentors(mockMentors);
      }
    };

    if (currentUser && userRole === 'student') {
      fetchRealMentors();
    }
    return () => unsubscribe();
  }, [currentUser, userRole]);

  const filteredMentors = mentors.filter(mentor => {
    const searchMatch = searchTerm === '' ||
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const domainMatch = !selectedDomain || mentor.domain === selectedDomain;
    const priceMatch = !selectedPrice || mentor.pricing === selectedPrice;
    const experienceMatch = !selectedExperience ||
      (selectedExperience === '3+' ? mentor.experience >= 3 : mentor.experience === selectedExperience);
    return searchMatch && domainMatch && priceMatch && experienceMatch;
  });

  const handleBookSession = (mentor: Mentor) => {
    if (!currentUser) {
      setIsSignInModalOpen(true);
      return;
    }
    if (userRole !== 'student') {
      setError('Only students can book mentorship sessions.');
      return;
    }
    setSelectedMentor(mentor);
    setIsBookingModalOpen(true);
  };

  const sendEmail = async (templateParams: any, templateId: string, recipient: string) => {
    try {
      // Try different parameter formats that might work with the template
      const params = {
        ...templateParams,
        // Alternative parameter names that might be expected
        user_name: templateParams.to_name,
        mentor_name: templateParams.from_name,
        student_name: templateParams.to_name,
        student_email: templateParams.to_email,
        mentor_email: templateParams.from_email,
        date: templateParams.date,
        time_slot: templateParams.time_slot,
        platform: templateParams.platform,
        message: templateParams.message,
        subject: templateParams.subject,
      };

      console.log(`Attempting to send email to ${recipient} with template ${templateId}`);
      console.log('Email parameters:', params);

      const result = await emailjs.send('service_qv37c1r', templateId, params);
      console.log(`Email sent successfully to ${recipient}:`, result);
      return true;
    } catch (error: any) {
      console.error(`Failed to send email to ${recipient}:`, error);
      console.error('Error details:', {
        message: error.message,
        text: error.text,
        status: error.status
      });
      return false;
    }
  };

  const testEmailService = async () => {
    try {
      console.log('Testing EmailJS service...');
      const result = await emailjs.send('service_qv37c1r', 'template_a9799k9', {
        to_name: 'Test User',
        to_email: 'test@example.com',
        from_name: 'Test Sender',
        from_email: 'sender@example.com',
        message: 'This is a test email',
        subject: 'Test Email'
      });
      console.log('EmailJS test successful:', result);
      return true;
    } catch (error: any) {
      console.error('EmailJS test failed:', error);
      return false;
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingDetails.date || !bookingDetails.timeSlot || !bookingDetails.platform || !currentUser || !selectedMentor) {
      setError('Please fill out all booking details.');
      return;
    }

    setIsLoading(true);
    try {
      // Save booking to database
      await addDoc(collection(db, 'bookings'), {
        userId: currentUser.uid,
        mentorId: selectedMentor.id,
        date: bookingDetails.date,
        timeSlot: bookingDetails.timeSlot,
        platform: bookingDetails.platform,
        createdAt: new Date().toISOString(),
      });

      console.log('Booking saved to database successfully');

      // Send email to mentor with student details
      try {
        const mentorEmailParams = {
          to_name: selectedMentor.name,
          to_email: selectedMentor.email,
          from_name: 'CollabUp Team',
          from_email: 'noreply@collabup.com',
          subject: 'New Mentorship Session Booking',
          message: `Hello ${selectedMentor.name},

A new mentorship session has been booked with you.

Student Details:
- Name: ${userData?.fullName || 'Student'}
- Email: ${userData?.email || currentUser.email}

Session Details:
- Date: ${bookingDetails.date}
- Time: ${bookingDetails.timeSlot}
- Platform: ${bookingDetails.platform}

Please contact the student at ${userData?.email || currentUser.email} to confirm the session details.

Best regards,
CollabUp Team`
        };

        await emailjs.send('service_qv37c1r', 'template_a9799k9', mentorEmailParams);
        console.log('Email sent to mentor successfully');
      } catch (emailErr) {
        console.error('Error sending email to mentor:', emailErr);
      }

      // Send confirmation email to user
      const userEmail = userData?.email || currentUser.email;
      if (userEmail) {
        try {
          const userEmailParams = {
            to_name: userData?.fullName || 'Student',
            to_email: userEmail,
            from_name: 'CollabUp Team',
            from_email: 'noreply@collabup.com',
            subject: 'Mentorship Session Confirmation',
            message: `Hello ${userData?.fullName || 'Student'},

Your mentorship session has been successfully booked!

Session Details:
- Mentor: ${selectedMentor.name}
- Date: ${bookingDetails.date}
- Time: ${bookingDetails.timeSlot}
- Platform: ${bookingDetails.platform}

Your details have been shared with the mentor. He will contact you soon.

Best regards,
CollabUp Team`
          };

          await emailjs.send('service_qv37c1r', 'template_a9799k9', userEmailParams);
          console.log('Email sent to user successfully');
        } catch (emailErr) {
          console.error('Error sending email to user:', emailErr);
        }
      }

      // Show success message
      setIsBookingModalOpen(false);
      setIsConfirmationModalOpen(true);
      setBookingDetails({ date: '', timeSlot: '', platform: '' });
      setError(null);

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
          {filteredMentors.map((mentor) => (
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
          ))}
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

      {isBookingModalOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Book Session with {selectedMentor.name}</h3>
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
            <h3 className="text-2xl font-semibold text-white mb-4">Booking Confirmed! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Your details have been shared with the mentor. He will contact you soon.
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