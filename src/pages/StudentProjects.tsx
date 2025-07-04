import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, Clock, ChevronDown, Upload, X, Check, Users } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { sendCollabEmail } from '../utils/sendCollabEmail';
import { useNavigate, useLocation } from 'react-router-dom';

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
    ownerId: "me22b2044@iiitdm.ac.in",
    ownerEmail: "me22b2044@iiitdm.ac.in",
    ownerName: "Subhash Bishnoi",
    location: "Jodhpur, India",
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
    ownerId: "me22b1051@iiitdm.ac.in",
    ownerEmail: "me22b1051@iiitdm.ac.in",
    ownerName: "Vikas Yadav",
    location: "Gurgaon, India",
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
    ownerId: "me22b1069@iiitdm.ac.in",
    ownerEmail: "me22b1069@iiitdm.ac.in",
    ownerName: "Prashant Tyagi",
    location: "Meerut, India",
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
    ownerId: "cs22b2050@iiitdm.ac.in",
    ownerEmail: "cs22b2050@iiitdm.ac.in",
    ownerName: "Ashutosh Shandilya",
    location: "Kanpur, India",
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
    ownerId: "cs22b2047@iiitdm.ac.in",
    ownerEmail: "cs22b2047@iiitdm.ac.in",
    ownerName: "Nitin Thaber",
    location: "Delhi, India",
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
    ownerId: "cs22b2051@iiitdm.ac.in",
    ownerEmail: "cs22b2051@iiitdm.ac.in",
    ownerName: "Anshu Saini",
    location: "Chennai, India",
    matchScore: 92
  },
  {
    id: 7,
    title: "Data Science for Social Good",
    description: "A project using data science to solve social issues and improve community well-being.",
    domain: "Data Science",
    level: "Beginner",
    levelColor: "bg-green-500/20 text-green-400",
    technologies: ["Python", "Pandas", "Data Visualization"],
    duration: "2 Months",
    coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "me22b1078@iiitdm.ac.in",
    ownerEmail: "me22b1078@iiitdm.ac.in",
    ownerName: "Arpita Roy",
    location: "Kolkata, India",
    matchScore: 89
  },
  {
    id: 8,
    title: "IoT for Smart Cities",
    description: "A project focused on using IoT to improve urban infrastructure and services.",
    domain: "IoT",
    level: "Advanced",
    levelColor: "bg-red-500/20 text-red-400",
    technologies: ["Arduino", "IoT", "Python"],
    duration: "6 Months",
    coverUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "me22b2017@iiitdm.ac.in",
    ownerEmail: "me22b2017@iiitdm.ac.in",
    ownerName: "Rishit Rastogi",
    location: "Lucknow, India",
    matchScore: 91
  },
  {
    id: 9,
    title: "Blockchain for Secure Voting",
    description: "A blockchain-based voting system to ensure secure and transparent elections.",
    domain: "Blockchain",
    level: "Intermediate",
    levelColor: "bg-yellow-500/20 text-yellow-400",
    technologies: ["Solidity", "Web3.js", "React"],
    duration: "4 Months",
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    ownerId: "cs22b2010@iiitdm.ac.in",
    ownerEmail: "cs22b2010@iiitdm.ac.in",
    ownerName: "Kush Jain",
    location: "Jaipur, India",
    matchScore: 86
  },
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
      await sendCollabEmail({
        to: project.ownerEmail,
        subject: `Collaboration Request for ${project.title}`,
        text: `${userData.fullName} (${userData.email}) wants to collaborate on your project "${project.title}".`,
        html: `<p>${userData.fullName} (${userData.email}) wants to collaborate on your project "${project.title}".</p>`
        // type: 'collab' // default
      });

      // Email to collaborator
      await sendCollabEmail({
        to: userData.email,
        subject: `Collaboration Request Sent for ${project.title}`,
        text: `You have successfully requested to collaborate on "${project.title}". The project owner ${project.ownerName} has been notified and will contact you at ${userData.email}.`,
        html: `<p>You have successfully requested to collaborate on "${project.title}". The project owner ${project.ownerName} has been notified and will contact you at ${userData.email}.</p>`
        // type: 'collab' // default
      });

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
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: '',
    level: '',
    technologies: '',
    duration: '',
    ownerName: '',
    ownerEmail: '',
    location: '',
    coverUrl: '',
  });
  const [showForm, setShowForm] = useState(false);
  const location = useLocation();

  // If an ID is present, show only the selected project card (with fallback for string/number IDs)
  const params = new URLSearchParams(location.search);
  const selectedId = params.get('id');
  let selectedProject: Project | undefined = undefined;
  if (selectedId) {
    selectedProject = projects.find(p => String(p.id) === String(selectedId));
    if (!selectedProject) {
      // Fallback: try to parse as number for mock data
      const numId = Number(selectedId);
      if (!isNaN(numId)) {
        selectedProject = projects.find(p => p.id === numId);
      }
    }
  }

  if (selectedId && selectedProject) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="text-blue-400 hover:underline mb-4">&larr; Back</button>
        </div>
        <ProjectCard project={selectedProject} />
      </div>
    );
  }

  const filteredProjects = !selectedId
    ? projects.filter(project => {
        const searchMatch = searchTerm === '' || 
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
        const domainMatch = !selectedDomain || project.domain === selectedDomain;
        const levelMatch = !selectedLevel || project.level === selectedLevel;
        const durationMatch = !selectedDuration || project.duration === selectedDuration;
        const technologyMatch = !selectedTechnology || project.technologies.includes(selectedTechnology);
        return searchMatch && domainMatch && levelMatch && durationMatch && technologyMatch;
      })
    : [];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      // Compose email body
      const html = `<h2>New Student Project Submission</h2><ul>${Object.entries(form).map(([k,v]) => `<li><b>${k}:</b> ${v}</li>`).join('')}</ul>`;
      await sendCollabEmail({
        to: 'collabup4@gmail.com',
        subject: '[URGENT]! Project Review',
        text: `New project submitted: ${form.title} by ${form.ownerName} (${form.ownerEmail})`,
        html,
        // type: 'collab' // default
      });
      setShowThankYou(true);
      setProjects([
        {
          ...form,
          id: Date.now(),
          technologies: form.technologies.split(',').map(t => t.trim()),
          levelColor: 'bg-green-500/20 text-green-400',
          matchScore: 100,
        } as Project,
        ...projects
      ]);
      setForm({ title: '', description: '', domain: '', level: '', technologies: '', duration: '', ownerName: '', ownerEmail: '', location: '', coverUrl: '' });
    } catch (err: any) {
      setSubmitError('Failed to submit project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Upload Project Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300"
        >
          <Upload size={20} /> Upload Project
        </button>
      </div>
      {/* Project Submission Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 border border-indigo-700 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={28} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Submit Your Project</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleProjectSubmit}>
              <input name="title" value={form.title} onChange={handleFormChange} required placeholder="Project Title" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="ownerName" value={form.ownerName} onChange={handleFormChange} required placeholder="Your Name" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="ownerEmail" value={form.ownerEmail} onChange={handleFormChange} required type="email" placeholder="Your Email" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="location" value={form.location} onChange={handleFormChange} required placeholder="Location" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="domain" value={form.domain} onChange={handleFormChange} required placeholder="Domain (e.g. AI, Web)" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="level" value={form.level} onChange={handleFormChange} required placeholder="Level (Beginner/Intermediate/Advanced)" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="duration" value={form.duration} onChange={handleFormChange} required placeholder="Duration (e.g. 3 Months)" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="coverUrl" value={form.coverUrl} onChange={handleFormChange} placeholder="Cover Image URL (optional)" className="p-2 rounded bg-gray-800 text-white border border-gray-700" />
              <input name="technologies" value={form.technologies} onChange={handleFormChange} required placeholder="Technologies (comma separated)" className="p-2 rounded bg-gray-800 text-white border border-gray-700 md:col-span-2" />
              <textarea name="description" value={form.description} onChange={handleFormChange} required placeholder="Project Description" className="p-2 rounded bg-gray-800 text-white border border-gray-700 md:col-span-2" rows={3} />
              <div className="md:col-span-2 flex gap-4 items-center">
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold">
                  {submitting ? 'Submitting...' : 'Submit Project'}
                </button>
                {submitError && <span className="text-red-400">{submitError}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-green-700 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2"><Check size={32} className="text-white" /></div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Thank you for your submission! 🎉</h3>
            <p className="text-gray-300 mb-6">Your project has been submitted for review. We will contact you soon.</p>
            <button onClick={() => setShowThankYou(false)} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">Close</button>
          </div>
        </div>
      )}
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
        {selectedId && !selectedProject ? (
          <div className="col-span-full text-center text-red-400 font-semibold text-lg">Project not found.</div>
        ) : selectedProject ? (
          <ProjectCard key={selectedProject.id} project={selectedProject} />
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
};

export default StudentProjects;