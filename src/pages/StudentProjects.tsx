import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, Clock, ChevronDown, Upload, X, Check, Users } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  description: string;
  domain: string;
  level: string;
  levelColor: string;
  technologies: string[];
  duration: string;
  coverUrl: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  location: string;
  matchScore: number;
}

const domains = [
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Data Science',
  'IoT',
  'Blockchain',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'UI/UX Design'
];

const levels = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

const durations = [
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months'
];

const technologies = [
  'React',
  'Node.js',
  'Python',
  'Java',
  'Machine Learning',
  'AWS',
  'Docker',
  'Kubernetes',
  'Flutter',
  'UI/UX'
];

// Mock data for student projects
const mockProjects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Study Assistant",
    description: "An intelligent chatbot that helps students with homework, provides explanations, and tracks study progress using natural language processing.",
    domain: "Machine Learning",
    level: "Intermediate",
    levelColor: "bg-yellow-500/20 text-yellow-400",
    technologies: ["Python", "Machine Learning", "NLP", "Flask"],
    duration: "3 Months",
    coverUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user1",
    ownerEmail: "alice.smith@example.com",
    ownerName: "Alice Smith",
    location: "Bangalore, India",
    matchScore: 95
  },
  {
    id: 2,
    title: "Smart Campus Navigation",
    description: "A mobile app that provides real-time navigation within college campuses, including class schedules and room availability.",
    domain: "Mobile Development",
    level: "Beginner",
    levelColor: "bg-green-500/20 text-green-400",
    technologies: ["React Native", "Firebase", "Maps API", "JavaScript"],
    duration: "2 Months",
    coverUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user2",
    ownerEmail: "bob.johnson@example.com",
    ownerName: "Bob Johnson",
    location: "Mumbai, India",
    matchScore: 88
  },
  {
    id: 3,
    title: "Blockchain-based Certificate Verification",
    description: "A decentralized system for verifying academic certificates and preventing fraud using blockchain technology.",
    domain: "Blockchain",
    level: "Advanced",
    levelColor: "bg-red-500/20 text-red-400",
    technologies: ["Solidity", "Web3.js", "React", "IPFS"],
    duration: "6 Months",
    coverUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user3",
    ownerEmail: "carol.davis@example.com",
    ownerName: "Carol Davis",
    location: "Delhi, India",
    matchScore: 92
  },
  {
    id: 4,
    title: "IoT Smart Agriculture System",
    description: "An IoT-based system that monitors soil moisture, temperature, and humidity to optimize crop irrigation and increase yield.",
    domain: "IoT",
    level: "Intermediate",
    levelColor: "bg-yellow-500/20 text-yellow-400",
    technologies: ["Arduino", "Python", "IoT", "Data Analytics"],
    duration: "4 Months",
    coverUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user4",
    ownerEmail: "david.wilson@example.com",
    ownerName: "David Wilson",
    location: "Chennai, India",
    matchScore: 85
  },
  {
    id: 5,
    title: "Cybersecurity Threat Detection",
    description: "A machine learning-based system that detects and prevents cyber threats in real-time using network traffic analysis.",
    domain: "Cybersecurity",
    level: "Advanced",
    levelColor: "bg-red-500/20 text-red-400",
    technologies: ["Python", "Machine Learning", "Network Security", "Docker"],
    duration: "5 Months",
    coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user5",
    ownerEmail: "emma.brown@example.com",
    ownerName: "Emma Brown",
    location: "Pune, India",
    matchScore: 90
  },
  {
    id: 6,
    title: "Cloud-based Student Management System",
    description: "A comprehensive web application for managing student records, attendance, and academic performance using cloud services.",
    domain: "Cloud Computing",
    level: "Intermediate",
    levelColor: "bg-yellow-500/20 text-yellow-400",
    technologies: ["AWS", "React", "Node.js", "MongoDB"],
    duration: "3 Months",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "user6",
    ownerEmail: "frank.miller@example.com",
    ownerName: "Frank Miller",
    location: "Hyderabad, India",
    matchScore: 87
  }
];

const ProjectCard = ({ project }: { project: Project }) => {
  const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ email: string; fullName: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({ 
              email: data.email, 
              fullName: data.fullName || data.startupName || data.founderName || 'User' 
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCollaborateClick = () => {
    if (!currentUser) {
      setIsSignInModalOpen(true);
      return;
    }
    setIsCollaborateModalOpen(true);
  };

  const handleCollaborateConfirm = async () => {
    if (!currentUser || !userData) return;

    try {
      // Email to project owner
      const ownerTemplateParams = {
        to_email: project.ownerEmail,
        to_name: project.ownerName,
        from_name: userData.fullName,
        from_email: userData.email,
        project_title: project.title,
        message: `${userData.fullName} wants to collaborate on your project "${project.title}". Contact them at ${userData.email} to discuss collaboration details.`
      };

      await emailjs.send(
        'service_qv37c1r',
        'template_a9799k9',
        ownerTemplateParams,
        'wtGOHmGUOT5eVZGq4'
      );

      // Email to collaborator
      const collaboratorTemplateParams = {
        to_email: userData.email,
        to_name: userData.fullName,
        project_owner_name: project.ownerName,
        project_owner_email: project.ownerEmail,
        project_title: project.title,
        message: `You have successfully requested to collaborate on "${project.title}". The project owner ${project.ownerName} has been notified and will contact you at ${userData.email}.`
      };

      await emailjs.send(
        'service_qv37c1r',
        'template_a9799k9',
        collaboratorTemplateParams,
        'wtGOHmGUOT5eVZGq4'
      );

      setIsCollaborateModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send collaboration request. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
        <div className="relative">
          <img
            src={project.coverUrl}
            alt={project.title}
            className="w-full h-48 object-cover"
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x256/1f2937/6b7280?text=Project')}
          />
          <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-400" size={16} fill="currentColor" />
              <span className="font-semibold text-gray-200">{project.matchScore}%</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">{project.title}</h3>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span className="text-sm">{project.location}</span>
            </div>
          </div>
          
          <p className="text-gray-400 mb-4 line-clamp-3">{project.description}</p>
          
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              <span className="font-medium text-gray-300">{project.domain}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              <span className="text-gray-400">{project.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Code size={16} className="text-indigo-400" />
              <span className={`px-2 py-1 rounded-full text-sm ${project.levelColor}`}>
                {project.level}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
              >
                {tech}
              </span>
            ))}
          </div>

          <button 
            onClick={handleCollaborateClick}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Collaborate
          </button>
        </div>
      </div>

      {/* Collaboration Modal */}
      {isCollaborateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setIsCollaborateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Collaborate on Project</h2>
            <h3 className="text-lg text-gray-200 mb-6">{project.title}</h3>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                You're about to send a collaboration request to <strong>{project.ownerName}</strong>.
              </p>
              <p className="text-gray-300">
                Both you and the project owner will receive each other's contact details via email.
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setIsCollaborateModalOpen(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCollaborateConfirm}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6">
              Please sign in to collaborate on this project.
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

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2">
                <Check size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Collaboration Request Sent! 🎉
            </h3>
            <p className="text-gray-300 mb-6">
              You have received the details of the project owner via mail.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const StudentProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');

  const filteredProjects = mockProjects.filter(project => {
    const searchMatch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const domainMatch = !selectedDomain || project.domain === selectedDomain;
    const levelMatch = !selectedLevel || project.level === selectedLevel;
    const durationMatch = !selectedDuration || project.duration === selectedDuration;
    const technologyMatch = !selectedTechnology || project.technologies.includes(selectedTechnology);
    
    return searchMatch && domainMatch && levelMatch && durationMatch && technologyMatch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12 pt-6">
        <h1 className="text-4xl font-bold text-white mb-4">
          Student Projects
        </h1>
        <p className="text-lg text-gray-400">
          Discover and collaborate on innovative student projects
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by project title, description, or technologies..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative inline-block">
              <div className="relative">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
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
            </div>
            <div className="relative inline-block">
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
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
            <div className="relative inline-block">
              <div className="relative">
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">All Durations</option>
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="relative inline-block">
              <div className="relative">
                <select
                  value={selectedTechnology}
                  onChange={(e) => setSelectedTechnology(e.target.value)}
                  className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">All Technologies</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default StudentProjects;