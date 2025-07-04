import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, GraduationCap, Clock, ChevronDown, Upload, X, Check } from 'lucide-react';
import { auth } from '../firebase/firebaseConfig';
import { enrollInProject, getProjects } from '../firebase/firebaseService';
import { useLocation } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  imageUrl: string;
  domain: string;
  duration: string;
  level: string;
  skills: string[];
  company: string;
  location: string;
  matchScore: number;
  certificate: boolean;
  offeredBy: string;
  description: string;
}

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const startDateOptions = [
  'Immediately',
  'Within 1 week',
  'Within 2 weeks',
  'Within 1 month'
];

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

const durations = [
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months'
];

const levels = [
  'Beginner',
  'Intermediate',
  'Advanced'
];

const skillsList = [
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

const startupImages = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=256&q=80',
];

const projects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Healthcare Platform",
    company: "HealthTech Solutions",
    domain: "Machine Learning",
    duration: "3 Months",
    level: "Intermediate",
    imageUrl: startupImages[0],
    location: "Bangalore, India",
    matchScore: 95,
    skills: ["Python", "Machine Learning", "AWS", "Docker"],
    certificate: true,
    offeredBy: "MedAI Innovations",
    description: "A platform leveraging AI to assist doctors in diagnosis and patient management."
  },
  {
    id: 2,
    title: "Smart City IoT Solution",
    company: "Urban Innovations",
    domain: "IoT",
    duration: "6 Months",
    level: "Advanced",
    imageUrl: startupImages[1],
    location: "Mumbai, India",
    matchScore: 88,
    skills: ["IoT", "Python", "Cloud Computing", "Data Analytics"],
    certificate: true,
    offeredBy: "SmartCity Tech",
    description: "IoT-based solution for smart city infrastructure and analytics."
  },
  {
    id: 3,
    title: "Blockchain-based Voting System",
    company: "SecureVote",
    domain: "Blockchain",
    duration: "4 Months",
    level: "Intermediate",
    imageUrl: startupImages[2],
    location: "Delhi, India",
    matchScore: 90,
    skills: ["Solidity", "Web3.js", "React"],
    certificate: true,
    offeredBy: "SecureVote Labs",
    description: "A secure, transparent voting platform using blockchain technology."
  },
  {
    id: 4,
    title: "EdTech Learning Platform",
    company: "Learnify",
    domain: "Web Development",
    duration: "2 Months",
    level: "Beginner",
    imageUrl: startupImages[3],
    location: "Chennai, India",
    matchScore: 85,
    skills: ["React", "Node.js", "UI/UX"],
    certificate: true,
    offeredBy: "Learnify Pvt Ltd",
    description: "Interactive learning platform for students and teachers."
  },
  {
    id: 5,
    title: "Cloud-based Student Management System",
    company: "EduCloud",
    domain: "Cloud Computing",
    duration: "3 Months",
    level: "Intermediate",
    imageUrl: startupImages[4],
    location: "Hyderabad, India",
    matchScore: 92,
    skills: ["AWS", "React", "Node.js", "MongoDB"],
    certificate: true,
    offeredBy: "EduCloud Solutions",
    description: "Manage student records, attendance, and performance in the cloud."
  },
  // ...existing code for more projects, update their imageUrl and add description as above...
];

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, project }) => {
  const [idCard, setIdCard] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [startDate, setStartDate] = useState(startDateOptions[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!idCard || !resume) {
      alert('Please upload both ID Card and Resume');
      return;
    }

    if (!auth.currentUser) {
      alert('Please sign in to enroll in a project');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement file upload to Firebase Storage
      const idCardUrl = 'placeholder-url';
      const resumeUrl = 'placeholder-url';

      await enrollInProject({
        userId: auth.currentUser.uid,
        projectId: project.id,
        startDate,
        idCardUrl,
        resumeUrl
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset form
        setIdCard(null);
        setResume(null);
        setStartDate(startDateOptions[0]);
      }, 3000);
    } catch (error) {
      console.error('Error enrolling in project:', error);
      alert('Failed to enroll in project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 relative">
        {!showSuccess ? (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Enroll in Project</h2>
            <h3 className="text-lg text-gray-200 mb-6">{project.title}</h3>

            <div className="space-y-6">
              {/* ID Card Upload */}
              <div>
                <label className="block text-gray-300 mb-2">Upload ID Card</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                    className="hidden"
                    id="idCard"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="idCard"
                    className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <Upload size={20} className="mr-2 text-indigo-400" />
                    <span className="text-gray-300">
                      {idCard ? idCard.name : 'Choose ID Card'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-gray-300 mb-2">Upload Resume</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="resume"
                    className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <Upload size={20} className="mr-2 text-indigo-400" />
                    <span className="text-gray-300">
                      {resume ? resume.name : 'Choose Resume'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Start Date Selection */}
              <div>
                <label className="block text-gray-300 mb-2">
                  When can you start?
                </label>
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {startDateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enrolling...' : 'Confirm Enrollment'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2">
                <Check size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Thanks For Enrolling! 🎉
            </h2>
            <p className="text-gray-300">
              The startup will contact you within the next 12 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function StartupProj() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState('');
  const [modalProject, setModalProject] = useState<Project | null>(null); // NEW: track which project to show in modal
  const location = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        const params = new URLSearchParams(location.search);
        const selectedId = params.get('id');
        if (selectedId) {
          const found = fetchedProjects.find(p => String(p.id) === selectedId);
          setProjects(found ? [found] : []);
        } else {
          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
            <div className="relative">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                className="w-full h-48 object-cover"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x256/1f2937/6b7280?text=Project')}
              />
              <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={16} fill="currentColor" />
                  <span className="font-semibold text-gray-200">{selectedProject.matchScore}%</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">{selectedProject.title}</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span className="text-sm">{selectedProject.location}</span>
                </div>
                <p className="text-gray-400 mb-4 line-clamp-3">{selectedProject.description || 'No description available.'}</p>
              </div>
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span className="font-medium text-gray-300">{selectedProject.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{selectedProject.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{selectedProject.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{selectedProject.company}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProject.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setModalProject(selectedProject)} // FIX: open modal for this project
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Enroll
              </button>
            </div>
          </div>
          {modalProject && (
            <EnrollmentModal isOpen={true} onClose={() => setModalProject(null)} project={modalProject} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12 pt-6">
        <h1 className="text-4xl font-bold text-white mb-4">
          Startup and Industrial Projects
        </h1>
        <p className="text-lg text-gray-400">
          Gain real-world experience through industry projects and earn certifications
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by project, company, or skills..."
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
                  value={selectedSkills}
                  onChange={(e) => setSelectedSkills(e.target.value)}
                  className="appearance-none w-48 pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="">All Skills</option>
                  {skillsList.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
            <div className="relative">
              <img
                src={project.imageUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=256&q=80'}
                alt={project.title}
                className="w-full h-48 object-cover"
                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=256&q=80')}
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
                <p className="text-gray-400 mb-4 line-clamp-3">{project.description || 'No description available.'}</p>
              </div>
              
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
                  <GraduationCap size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{project.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <span className="text-gray-400">Offered By - {project.offeredBy}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {project.certificate && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <GraduationCap size={16} />
                    <span className="text-sm">Includes Certificate</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setModalProject(project)} // FIX: open modal for this project
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render modal for selected project */}
      {modalProject && (
        <EnrollmentModal
          isOpen={true}
          onClose={() => setModalProject(null)}
          project={modalProject}
        />
      )}
    </div>
  );
}
export default StartupProj;