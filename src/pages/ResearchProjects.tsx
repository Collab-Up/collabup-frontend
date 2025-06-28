import React, { useState, useEffect, FormEvent } from 'react';
import { Users, Calendar, Trophy, Send, X, Search, ChevronDown } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { getUserRole } from '../utils/getUserRole';
import { getResearchProjects, getFaculties } from '../firebase/firebaseService';

interface Faculty {
  id: string;
  fullName: string;
  email: string;
  instituteName: string;
  researchInterests: string[];
  spotsAvailable: number;
  startDate: string;
}

interface ResearchProject {
  id: string;
  title: string;
  domain: string;
  description: string;
  facultyId: string;
  skills: string[];
  location: string;
  duration: string;
  level: string;
  certificate: boolean;
}

interface ApplicationFormData {
  projectTitle: string;
  proposal: string;
  currentSemester: string;
  currentCGPA: string;
  resume: File | null;
}

interface UserData {
  instituteName: string;
  role: string | null; // Allow null
  fullName: string;
  email: string;
  researchAreas?: string[];
}

const mockFaculties: Faculty[] = [
  {
    id: 'faculty1',
    fullName: 'Dr. Anil Kumar',
    email: 'anil.kumar@example.com',
    instituteName: 'IIT Delhi',
    researchInterests: ['Quantum Computing', 'Cryptography'],
    spotsAvailable: 5,
    startDate: '2024-01-01',
  },
  {
    id: 'faculty2',
    fullName: 'Dr. Priya Sharma',
    email: 'priya.sharma@example.com',
    instituteName: 'IIT Chennai',
    researchInterests: ['Artificial Intelligence', 'Climate Modeling'],
    spotsAvailable: 3,
    startDate: '2024-02-01',
  },
  {
    id: 'faculty3',
    fullName: 'Dr. Rajesh Verma',
    email: 'rajesh.verma@example.com',
    instituteName: 'IIT Bombay',
    researchInterests: ['Machine Learning', 'Computer Vision'],
    spotsAvailable: 2,
    startDate: '2024-03-01',
  },
  {
    id: 'faculty4',
    fullName: 'Dr. Meera Patel',
    email: 'meera.patel@example.com',
    instituteName: 'IIT Kanpur',
    researchInterests: ['Data Science', 'Big Data Analytics'],
    spotsAvailable: 4,
    startDate: '2024-04-01',
  },
  {
    id: 'faculty5',
    fullName: 'Dr. Amit Singh',
    email: 'amit.singh@example.com',
    instituteName: 'IIT Madras',
    researchInterests: ['Blockchain', 'Distributed Systems'],
    spotsAvailable: 1,
    startDate: '2024-05-01',
  },
  {
    id: 'faculty6',
    fullName: 'Dr. Neha Gupta',
    email: 'neha.gupta@example.com',
    instituteName: 'IIT Kharagpur',
    researchInterests: ['Cybersecurity', 'Network Security'],
    spotsAvailable: 2,
    startDate: '2024-06-01',
  },
  {
    id: 'faculty7',
    fullName: 'Dr. Sanjay Kumar',
    email: 'sanjay.kumar@example.com',
    instituteName: 'IIT Roorkee',
    researchInterests: ['IoT', 'Embedded Systems'],
    spotsAvailable: 3,
    startDate: '2024-07-01',
  },
  {
    id: 'faculty8',
    fullName: 'Dr. Kavita Sharma',
    email: 'kavita.sharma@example.com',
    instituteName: 'IIT Guwahati',
    researchInterests: ['Robotics', 'Control Systems'],
    spotsAvailable: 1,
    startDate: '2024-08-01',
  },
  {
    id: 'faculty9',
    fullName: 'Dr. Vikram Malhotra',
    email: 'vikram.malhotra@example.com',
    instituteName: 'IIT Hyderabad',
    researchInterests: ['Natural Language Processing', 'Deep Learning'],
    spotsAvailable: 2,
    startDate: '2024-09-01',
  },
  {
    id: 'faculty10',
    fullName: 'Dr. Sunita Reddy',
    email: 'sunita.reddy@example.com',
    instituteName: 'IIT Gandhinagar',
    researchInterests: ['Biomedical Engineering', 'Signal Processing'],
    spotsAvailable: 3,
    startDate: '2024-10-01',
  },
];

const mockResearchProjects: ResearchProject[] = [
  {
    id: 'research1',
    title: 'Quantum Computing Algorithms',
    domain: 'Quantum Computing',
    description: 'Developing novel algorithms for quantum systems.',
    facultyId: 'faculty1',
    skills: ['Python', 'Quantum Mechanics', 'C++'],
    location: 'Delhi, India',
    duration: '6 Months',
    level: 'Advanced',
    certificate: true,
  },
  {
    id: 'research2',
    title: 'AI for Climate Modeling',
    domain: 'Artificial Intelligence',
    description: 'Using AI to improve climate prediction models.',
    facultyId: 'faculty2',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    location: 'Chennai, India',
    duration: '4 Months',
    level: 'Intermediate',
    certificate: true,
  },
  {
    id: 'research3',
    title: 'Computer Vision for Autonomous Vehicles',
    domain: 'Computer Vision',
    description: 'Developing computer vision algorithms for self-driving cars.',
    facultyId: 'faculty3',
    skills: ['Python', 'OpenCV', 'TensorFlow'],
    location: 'Mumbai, India',
    duration: '8 Months',
    level: 'Advanced',
    certificate: true,
  },
  {
    id: 'research4',
    title: 'Big Data Analytics for Healthcare',
    domain: 'Data Science',
    description: 'Analyzing healthcare data to improve patient outcomes.',
    facultyId: 'faculty4',
    skills: ['Python', 'R', 'SQL', 'Hadoop'],
    location: 'Kanpur, India',
    duration: '5 Months',
    level: 'Intermediate',
    certificate: true,
  },
  {
    id: 'research5',
    title: 'Blockchain for Supply Chain Management',
    domain: 'Blockchain',
    description: 'Implementing blockchain solutions for supply chain transparency.',
    facultyId: 'faculty5',
    skills: ['Solidity', 'JavaScript', 'Web3.js'],
    location: 'Chennai, India',
    duration: '7 Months',
    level: 'Advanced',
    certificate: true,
  },
  {
    id: 'research6',
    title: 'Network Security Protocols',
    domain: 'Cybersecurity',
    description: 'Developing secure communication protocols for IoT networks.',
    facultyId: 'faculty6',
    skills: ['C++', 'Network Programming', 'Cryptography'],
    location: 'Kharagpur, India',
    duration: '6 Months',
    level: 'Advanced',
    certificate: true,
  },
  {
    id: 'research7',
    title: 'IoT-based Smart Agriculture',
    domain: 'IoT',
    description: 'Building IoT systems for precision agriculture.',
    facultyId: 'faculty7',
    skills: ['Arduino', 'Python', 'IoT Protocols'],
    location: 'Roorkee, India',
    duration: '4 Months',
    level: 'Intermediate',
    certificate: true,
  },
  {
    id: 'research8',
    title: 'Robotic Process Automation',
    domain: 'Robotics',
    description: 'Developing robots for industrial automation.',
    facultyId: 'faculty8',
    skills: ['ROS', 'Python', 'Control Systems'],
    location: 'Guwahati, India',
    duration: '9 Months',
    level: 'Advanced',
    certificate: true,
  },
  {
    id: 'research9',
    title: 'Natural Language Processing for Indian Languages',
    domain: 'Natural Language Processing',
    description: 'Building NLP models for Indian regional languages.',
    facultyId: 'faculty9',
    skills: ['Python', 'TensorFlow', 'NLP Libraries'],
    location: 'Hyderabad, India',
    duration: '6 Months',
    level: 'Intermediate',
    certificate: true,
  },
  {
    id: 'research10',
    title: 'Biomedical Signal Processing',
    domain: 'Biomedical Engineering',
    description: 'Processing and analyzing biomedical signals for diagnosis.',
    facultyId: 'faculty10',
    skills: ['MATLAB', 'Python', 'Signal Processing'],
    location: 'Gandhinagar, India',
    duration: '5 Months',
    level: 'Advanced',
    certificate: true,
  },
];

const ResearchProject = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({ projectTitle: '', proposal: '', currentSemester: '', currentCGPA: '', resume: null });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const institutes = [
    'IIT Delhi', 'IIT Chennai', 'IIT Bombay', 'IIT Kanpur', 'IIT Madras', 
    'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT Gandhinagar'
  ];

  const domains = [
    'Quantum Computing', 'Artificial Intelligence', 'Computer Vision', 'Data Science',
    'Blockchain', 'Cybersecurity', 'IoT', 'Robotics', 'Natural Language Processing', 'Biomedical Engineering'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const role = await getUserRole();
          if (!role) {
            setError('User role not found. Please sign in again.');
            setIsLoading(false);
            return;
          }
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              instituteName: data.instituteName || '',
              role: role || data.role || null, // Use null instead of empty string
              fullName: data.fullName || 'User',
              email: data.email || user.email || '',
              researchAreas: data.researchAreas || [],
            });
            if (!['student', 'faculty'].includes(role)) {
              setError('Only students and faculty can access research projects.');
              setIsLoading(false);
              return;
            }
          } else {
            setError('User data not found. Please complete your profile.');
            setIsLoading(false);
            return;
          }
        } catch (err) {
          setError('Failed to fetch user data.');
          setIsLoading(false);
          console.error('Error fetching user data:', err);
        }
      }
      
      // Always start with mock data
      setFacultyList(mockFaculties);
      setResearchProjects(mockResearchProjects);
      setSelectedInstitute('IIT Delhi');
      setIsLoading(false);
    });

    const fetchData = async () => {
      if (!currentUser || !userData || !userData.role) {
        return;
      }
      try {
        // Fetch research projects
        const projects = await getResearchProjects(userData.role, userData);
        
        // Fetch faculties
        const faculties = await getFaculties();
        
        // Transform real faculty data to match mock data structure
        const transformedFaculties = faculties.map(faculty => ({
          ...faculty,
          spotsAvailable: Math.floor(Math.random() * 5) + 1, // Random spots for real faculty
          startDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random start date
        }));
        
        // Combine mock data with real data
        const combinedFaculties = [...mockFaculties, ...transformedFaculties];
        const combinedProjects = [...mockResearchProjects, ...projects];
        
        setFacultyList(combinedFaculties);
        setResearchProjects(combinedProjects);
      } catch (err) {
        console.error('Error fetching real data:', err);
        // Keep mock data even if real data fails to load
        setFacultyList(mockFaculties);
        setResearchProjects(mockResearchProjects);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && userData) {
      fetchData();
    }

    return () => unsubscribeAuth();
  }, [currentUser, userData]);

  const handleApply = (faculty: Faculty) => {
    if (!currentUser || !userData) {
      setIsSignInModalOpen(true);
      return;
    }
    if (userData.role !== 'student') {
      setError('Only students can apply for research projects.');
      return;
    }
    setSelectedFaculty(faculty);
    setIsApplicationModalOpen(true);
  };

  const handleSubmitApplication = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData || !selectedFaculty) {
      setError('You must be signed in to apply.');
      return;
    }
    if (!formData.projectTitle.trim() || !formData.proposal.trim() || !formData.currentSemester.trim() || !formData.currentCGPA.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'applications'), {
        studentId: currentUser.uid,
        studentName: userData.fullName,
        studentEmail: userData.email,
        studentInstitute: userData.instituteName,
        facultyId: selectedFaculty.id,
        facultyName: selectedFaculty.fullName,
        facultyEmail: selectedFaculty.email,
        projectTitle: formData.projectTitle,
        proposal: formData.proposal,
        currentSemester: formData.currentSemester,
        currentCGPA: formData.currentCGPA,
        resumeUploaded: formData.resume ? true : false,
        timestamp: new Date().toISOString(),
      });

      const templateParams = {
        studentName: userData.fullName,
        studentEmail: userData.email,
        studentInstitute: userData.instituteName,
        facultyName: selectedFaculty.fullName,
        facultyEmail: selectedFaculty.email,
        projectTitle: formData.projectTitle,
        proposal: formData.proposal,
        currentSemester: formData.currentSemester,
        currentCGPA: formData.currentCGPA,
        resumeUploaded: formData.resume ? 'Yes' : 'No',
      };

      await emailjs.send(
        'service_qv37c1r', // Replace with your EmailJS Service ID
        'template_a9799k9', // Replace with your EmailJS Template ID
        templateParams,
        'wtGOHmGUOT5eVZGq4' // Replace with your EmailJS Public Key
      );

      setIsApplicationModalOpen(false);
      setFormData({ projectTitle: '', proposal: '', currentSemester: '', currentCGPA: '', resume: null });
      setError(null);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError('Failed to submit application or send email.');
      console.error('Error submitting application:', err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const filteredProjects = researchProjects.filter(project => {
    const faculty = facultyList.find(f => f.id === project.facultyId);
    const searchMatch = searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      faculty?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const instituteMatch = selectedInstitute === '' || faculty?.instituteName === selectedInstitute;
    const domainMatch = selectedDomain === '' || project.domain === selectedDomain;
    const levelMatch = selectedLevel === '' || project.level === selectedLevel;
    
    return searchMatch && instituteMatch && domainMatch && levelMatch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12 pt-6">
        <h1 className="text-4xl font-bold text-white mb-4">Research Projects</h1>
        <p className="text-lg text-gray-400">Discover research opportunities and connect with faculty members</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-400">Loading...</div>
      )}

      {!isLoading && (
        <>
          {/* Search and Filter Section */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by project title, description, skills, or faculty name..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <select
                    className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedInstitute}
                    onChange={(e) => setSelectedInstitute(e.target.value)}
                  >
                    <option value="">All Institutes</option>
                    {institutes.map((institute) => (
                      <option key={institute} value={institute}>
                        {institute}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                  >
                    <option value="">All Domains</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Users className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{facultyList.length}</h3>
              <p className="text-gray-400">Faculty Members</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Calendar className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{researchProjects.length}</h3>
              <p className="text-gray-400">Research Opportunities</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{researchProjects.length * 2}+</h3>
              <p className="text-gray-400">Published Papers</p>
            </div>
            <div className="bg-[#1E293B] p-6 rounded-xl">
              <Trophy className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{institutes.length}</h3>
              <p className="text-gray-400">Partner Institutes</p>
            </div>
          </div>

          <div className="bg-[#1E293B] p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 text-white">Research Projects</h2>
            {filteredProjects.length === 0 && (
              <p className="text-gray-400">No research projects found matching your criteria.</p>
            )}
            <div className="space-y-6">
              {filteredProjects.map((project) => {
                const faculty = facultyList.find(f => f.id === project.facultyId);
                return (
                  <div key={project.id} className="bg-[#0F172A] rounded-lg p-6 border border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                        <p className="text-gray-400 mb-3">{project.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Faculty:</span> {faculty?.fullName || 'Unknown'}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Institute:</span> {faculty?.instituteName || 'Unknown'}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Domain:</span> {project.domain}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Level:</span> {project.level}</p>
                          </div>
                          <div>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Skills:</span> {project.skills.join(', ')}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Location:</span> {project.location}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Duration:</span> {project.duration}</p>
                            <p className="text-gray-400"><span className="text-gray-300 font-medium">Start Date:</span> {faculty?.startDate ? new Date(faculty.startDate).toLocaleDateString() : 'TBD'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400">
                              <span className="text-gray-300 font-medium">Spots Available:</span> {faculty?.spotsAvailable || 0}
                            </span>
                          </div>
                          {faculty?.spotsAvailable === 0 && (
                            <span className="text-red-400 text-sm font-medium">No spots available</span>
                          )}
                        </div>
                      </div>
                      {userData?.role === 'student' && faculty && faculty.spotsAvailable > 0 && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleApply(faculty)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            Apply Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6">
              Please sign in to access research projects.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSignInModalOpen(false);
                  navigate('/login');
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

      {isApplicationModalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] rounded-xl p-6 max-w-lg w-full border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Apply to {selectedFaculty.fullName}</h2>
              <button onClick={() => setIsApplicationModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-300">
                  Project Title
                </label>
                <input
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleFormChange}
                  className="w-full bg-[#0F172A] p-3 rounded-lg text-white"
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div>
                <label htmlFor="proposal" className="block text-sm font-medium text-gray-300">
                  Research Proposal
                </label>
                <textarea
                  id="proposal"
                  name="proposal"
                  value={formData.proposal}
                  onChange={handleFormChange}
                  className="w-full bg-[#0F172A] p-3 rounded-lg text-white"
                  rows={5}
                  placeholder="Describe your research proposal"
                  required
                />
              </div>
              <div>
                <label htmlFor="currentSemester" className="block text-sm font-medium text-gray-300">
                  Current Semester
                </label>
                <input
                  type="text"
                  id="currentSemester"
                  name="currentSemester"
                  value={formData.currentSemester}
                  onChange={handleFormChange}
                  className="w-full bg-[#0F172A] p-3 rounded-lg text-white"
                  placeholder="Enter current semester"
                  required
                />
              </div>
              <div>
                <label htmlFor="currentCGPA" className="block text-sm font-medium text-gray-300">
                  Current CGPA
                </label>
                <input
                  type="text"
                  id="currentCGPA"
                  name="currentCGPA"
                  value={formData.currentCGPA}
                  onChange={handleFormChange}
                  className="w-full bg-[#0F172A] p-3 rounded-lg text-white"
                  placeholder="Enter current CGPA"
                  required
                />
              </div>
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-300">
                  Resume
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleResumeChange}
                  className="w-full bg-[#0F172A] p-3 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setIsApplicationModalOpen(false)}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <Trophy size={48} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Application Submitted! 🎉</h3>
            <p className="text-gray-300 mb-6">
              Your details have been shared with the faculty. You will be contacted soon.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchProject;
