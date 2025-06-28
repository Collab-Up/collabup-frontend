import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Code, Star, MapPin, GraduationCap, Clock, ChevronDown, Upload, X, Check, ArrowLeft } from 'lucide-react';
import { auth } from '../firebase/firebaseConfig';
import { enrollInProject, getProjects } from '../firebase/firebaseService';
import { useSearchParams } from 'react-router-dom';

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

const mockProjects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Healthcare Platform",
    company: "HealthTech Solutions",
    domain: "Machine Learning",
    duration: "3 Months",
    level: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Bangalore, India",
    matchScore: 95,
    skills: ["Python", "Machine Learning", "AWS", "Docker"],
    certificate: true,
    offeredBy: "MedAI Innovations"
  },
  {
    id: 2,
    title: "Smart City IoT Solution",
    company: "Urban Innovations",
    domain: "IoT",
    duration: "6 Months",
    level: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Mumbai, India",
    matchScore: 88,
    skills: ["IoT", "Python", "Cloud Computing", "Data Analytics"],
    certificate: true,
    offeredBy: "SmartCity Tech"
  },
  {
    id: 3,
    title: "E-commerce Mobile App",
    company: "RetailTech",
    domain: "Mobile Development",
    duration: "2 Months",
    level: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Delhi, India",
    matchScore: 92,
    skills: ["React Native", "JavaScript", "Firebase", "UI/UX"],
    certificate: true,
    offeredBy: "ShopEasy"
  },
  {
    id: 4,
    title: "Blockchain Supply Chain",
    company: "ChainTech",
    domain: "Blockchain",
    duration: "4 Months",
    level: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Chennai, India",
    matchScore: 85,
    skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"],
    certificate: true,
    offeredBy: "BlockChain Solutions"
  },
  {
    id: 5,
    title: "Cybersecurity Dashboard",
    company: "SecureTech",
    domain: "Cybersecurity",
    duration: "3 Months",
    level: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Hyderabad, India",
    matchScore: 90,
    skills: ["Python", "Cybersecurity", "React", "API Security"],
    certificate: true,
    offeredBy: "CyberShield"
  },
  {
    id: 6,
    title: "Cloud Migration Platform",
    company: "CloudTech",
    domain: "Cloud Computing",
    duration: "5 Months",
    level: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    location: "Pune, India",
    matchScore: 87,
    skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
    certificate: true,
    offeredBy: "CloudMigrate"
  }
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [displayedProject, setDisplayedProject] = useState<Project | null>(null);
  const searchParams = useSearchParams()[0];

  // Check for selected project in URL
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      setSelectedProjectId(selectedId);
    }
  }, [searchParams]);

  // Find selected project when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      const foundProject = projects.find(project => project.id.toString() === selectedProjectId);
      if (foundProject) {
        setDisplayedProject(foundProject);
      }
    } else {
      setDisplayedProject(null);
    }
    const fetchProjects = async () => {
      try {
        // Always start with mock data
        setProjects(mockProjects);
        
        // Check if user is signed in
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Fetch real projects and combine with mock data
          const fetchedProjects = await getProjects();
          const combinedProjects = [...mockProjects, ...fetchedProjects];
          setProjects(combinedProjects);
          console.log('Combined projects:', combinedProjects.length, 'Mock:', mockProjects.length, 'Real:', fetchedProjects.length);
        }
      } catch (error) {
        console.error('Error fetching real projects:', error);
        // Keep mock data even if real data fails to load
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredProjects = projects.filter(project => {
    const searchMatch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const domainMatch = !selectedDomain || project.domain === selectedDomain;
    const durationMatch = !selectedDuration || project.duration === selectedDuration;
    const levelMatch = !selectedLevel || project.level === selectedLevel;
    const skillsMatch = !selectedSkills || project.skills.includes(selectedSkills);
    
    return searchMatch && domainMatch && durationMatch && levelMatch && skillsMatch;
  });

  const handleEnrollClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleBackToAll = () => {
    setDisplayedProject(null);
  };

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

      {/* Show selected project or all projects */}
      {displayedProject ? (
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
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
              <div className="relative">
                <img
                  src={displayedProject.imageUrl}
                  alt={displayedProject.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400" size={16} fill="currentColor" />
                    <span className="font-semibold text-gray-200">{displayedProject.matchScore}%</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">{displayedProject.title}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm">{displayedProject.location}</span>
                  </div>
                </div>
                
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span className="font-medium text-gray-300">{displayedProject.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-400" />
                    <span className="text-gray-400">{displayedProject.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-400" />
                    <span className="text-gray-400">{displayedProject.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-indigo-400" />
                    <span className="text-gray-400">Offered By - {displayedProject.offeredBy}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {displayedProject.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {displayedProject.certificate && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <GraduationCap size={16} />
                      <span className="text-sm">Includes Certificate</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => handleEnrollClick(displayedProject)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Show all projects with filters
        <>
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
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
                <div className="relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover"
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
                    onClick={() => handleEnrollClick(project)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedProject && (
        <EnrollmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={selectedProject}
        />
      )}
    </div>
  );
}
export default StartupProj;