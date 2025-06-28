import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, Clock, ChevronDown, Upload, X, Check, Users, Plus, ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Project {
  id: string;
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
  matchScore?: number;
  projectOwnerEmail?: string;
  createdAt?: any;
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
    id: 'mock1',
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
    id: 'mock2',
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
    id: 'mock3',
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
    id: 'mock4',
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
    id: 'mock5',
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
    id: 'mock6',
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
      // Send email to project owner
      const templateParams = {
        to_name: project.ownerName,
        to_email: project.projectOwnerEmail || project.ownerEmail,
        from_name: userData.fullName,
        from_email: userData.email,
        project_title: project.title,
        message: `Hi ${project.ownerName}, I'm interested in collaborating on your project "${project.title}". Please let me know how we can proceed!`
      };

      await emailjs.send(
        'service_qv37c1r',
        'template_a9799k9',
        templateParams,
        'wtGOHmGUOT5eVZGq4'
      );

      setIsCollaborateModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error sending collaboration email:', error);
      alert('Error sending collaboration request. Please try again.');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600">
        <div className="relative">
          <img
            src={project.coverUrl}
            alt={project.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(project.level)}`}>
              {project.level}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
              {project.title}
            </h3>
            {project.matchScore && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={16} />
                <span className="text-sm font-medium">{project.matchScore}%</span>
              </div>
            )}
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {project.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{project.duration}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{project.ownerName}</p>
                <p className="text-xs text-gray-400">{project.domain}</p>
              </div>
            </div>
            <button 
              onClick={handleCollaborateClick}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Collaborate
            </button>
          </div>
        </div>
      </div>

      {/* Collaboration Modal */}
      {isCollaborateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Collaborate on "{project.title}"
            </h3>
            <p className="text-gray-300 mb-6">
              An email will be sent to the project owner with your collaboration request. They will contact you if they're interested.
            </p>
            <div className="flex gap-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Sign In Required
            </h3>
            <p className="text-gray-300 mb-6">
              You need to be signed in to collaborate on projects.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSignInModalOpen(false);
                  // You can add navigation to login here
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2">
                <Check size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Request Sent! 🎉
            </h3>
            <p className="text-gray-300 mb-6">
              Your collaboration request has been sent to the project owner. They will contact you if they're interested in working together.
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadSuccessModalOpen, setIsUploadSuccessModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ email: string; fullName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realProjects, setRealProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    domain: '',
    level: '',
    technologies: [] as string[],
    duration: '',
    location: '',
    projectOwnerEmail: ''
  });

  // Check for selected project in URL
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      setSelectedProjectId(selectedId);
    }
  }, [searchParams]);

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
            // Pre-fill the project owner email with user's email
            setUploadForm(prev => ({
              ...prev,
              projectOwnerEmail: data.email
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(collection(db, 'studentProjects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(projectsQuery);
        const projects = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            domain: data.domain,
            level: data.level,
            levelColor: getLevelColor(data.level),
            technologies: data.technologies || [],
            duration: data.duration,
            coverUrl: data.coverUrl || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80`,
            ownerId: data.ownerId,
            ownerEmail: data.ownerEmail,
            ownerName: data.ownerName,
            location: data.location,
            projectOwnerEmail: data.projectOwnerEmail,
            createdAt: data.createdAt
          } as Project;
        });
        setRealProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const handleUploadClick = () => {
    if (!currentUser) {
      // Show alert instead of redirecting
      alert('Please sign in to upload a project');
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    setIsSubmitting(true);
    try {
      // Create project data
      const projectData = {
        title: uploadForm.title,
        description: uploadForm.description,
        domain: uploadForm.domain,
        level: uploadForm.level,
        technologies: uploadForm.technologies,
        duration: uploadForm.duration,
        location: uploadForm.location,
        projectOwnerEmail: uploadForm.projectOwnerEmail,
        ownerId: currentUser.uid,
        ownerEmail: userData.email,
        ownerName: userData.fullName,
        coverUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'studentProjects'), projectData);

      // Reset form
      setUploadForm({
        title: '',
        description: '',
        domain: '',
        level: '',
        technologies: [],
        duration: '',
        location: '',
        projectOwnerEmail: userData.email
      });

      setIsUploadModalOpen(false);
      setIsUploadSuccessModalOpen(true);

      // Refresh projects list
      const projectsQuery = query(collection(db, 'studentProjects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(projectsQuery);
      const projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          domain: data.domain,
          level: data.level,
          levelColor: getLevelColor(data.level),
          technologies: data.technologies || [],
          duration: data.duration,
          coverUrl: data.coverUrl || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80`,
          ownerId: data.ownerId,
          ownerEmail: data.ownerEmail,
          ownerName: data.ownerName,
          location: data.location,
          projectOwnerEmail: data.projectOwnerEmail,
          createdAt: data.createdAt
        } as Project;
      });
      setRealProjects(projects);
    } catch (error) {
      console.error('Error uploading project:', error);
      alert('Error uploading project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechnologyChange = (tech: string) => {
    setUploadForm(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter(t => t !== tech)
        : [...prev.technologies, tech]
    }));
  };

  // Combine real and mock projects
  const allProjects = [...realProjects, ...mockProjects];

  // Find selected project when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const foundProject = allProjects.find(project => project.id === selectedProjectId);
      if (foundProject) {
        setSelectedProject(foundProject);
      } else {
        // If not found in current projects, try to fetch from Firestore
        const fetchSelectedProject = async () => {
          try {
            const projectDoc = await getDoc(doc(db, 'projects', selectedProjectId));
            if (projectDoc.exists()) {
              const data = projectDoc.data();
              const project: Project = {
                id: projectDoc.id,
                title: data.title,
                description: data.description,
                domain: data.domain,
                level: data.difficulty || 'Intermediate',
                levelColor: getLevelColor(data.difficulty || 'Intermediate'),
                technologies: data.skillsRequired || [],
                duration: data.duration,
                coverUrl: data.coverUrl || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80`,
                ownerId: data.creatorId || '',
                ownerEmail: data.projectOwnerEmail || '',
                ownerName: data.ownerName || 'Unknown',
                location: data.location || 'Unknown',
                projectOwnerEmail: data.projectOwnerEmail,
                createdAt: data.createdAt
              };
              setSelectedProject(project);
            }
          } catch (error) {
            console.error('Error fetching selected project:', error);
          }
        };
        fetchSelectedProject();
      }
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, allProjects]);

  const handleBackToAll = () => {
    setSelectedProjectId(null);
    setSelectedProject(null);
    navigate('/student-projects');
  };

  const filteredProjects = allProjects.filter(project => {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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

      {/* Show selected project or all projects */}
      {selectedProject ? (
        // Show single selected project
        <div>
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={handleBackToAll}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to All Projects
            </button>
          </div>
          
          {/* Selected project */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <ProjectCard project={selectedProject} />
          </div>
        </div>
      ) : (
        // Show all projects with filters
        <>
          {/* Upload Project Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Upload Project
            </button>
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
        </>
      )}

      {/* Upload Project Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-white">Upload Your Project</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter project title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your project in detail"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Domain *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={uploadForm.domain}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, domain: e.target.value }))}
                  >
                    <option value="">Select Domain</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={uploadForm.level}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, level: e.target.value }))}
                  >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={uploadForm.duration}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, duration: e.target.value }))}
                  >
                    <option value="">Select Duration</option>
                    {durations.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Bangalore, India"
                    value={uploadForm.location}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technologies Required *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {technologies.map((tech) => (
                    <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={uploadForm.technologies.includes(tech)}
                        onChange={() => handleTechnologyChange(tech)}
                        className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-300">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Owner Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Email for collaboration requests"
                  value={uploadForm.projectOwnerEmail}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, projectOwnerEmail: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">
                  This email will receive collaboration requests from interested students
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Success Modal */}
      {isUploadSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2">
                <Check size={32} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Project Uploaded Successfully! 🎉
            </h3>
            <p className="text-gray-300 mb-6">
              Your project has been uploaded and is now visible to other students. You'll receive collaboration requests at your specified email.
            </p>
            <button
              onClick={() => setIsUploadSuccessModalOpen(false)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
          </div>
        )}
    </div>
  );
};

export default StudentProjects;