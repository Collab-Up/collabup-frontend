import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Handshake, 
  Lightbulb, 
  Rocket, 
  GraduationCap, 
  FlaskConical, 
  MessageCircle, 
  HelpCircle,
  BookOpen,
  Code,
  Star,
  MapPin,
  Clock,
  User,
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface UserData {
  role: string;
  fullName?: string;
  startupName?: string;
  founderName?: string;
  email: string;
  college?: string;
  institute?: string;
  currentCompany?: string;
  designation?: string;
  expertiseAreas?: string[];
  researchAreas?: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  domain: string;
  level: string;
  status: string;
  createdAt: any;
  technologies?: string[];
  skills?: string[];
  duration?: string;
  location?: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
}

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  projectTitle: string;
  status: string;
  enrolledAt: any;
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            await loadUserSpecificData(data, user.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserSpecificData = async (userData: UserData, userId: string) => {
    try {
      if (userData.role === 'student') {
        // Load student's uploaded projects
        const projectsQuery = query(collection(db, 'studentProjects'), where('ownerId', '==', userId));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setUserProjects(projects);
      } else if (userData.role === 'faculty') {
        // Load faculty's research projects
        const projectsQuery = query(collection(db, 'researchProjects'), where('facultyId', '==', userId));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setUserProjects(projects);
      } else if (userData.role === 'startup') {
        // Load startup's projects
        const projectsQuery = query(collection(db, 'startups'), where('founderId', '==', userId));
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setUserProjects(projects);
      } else if (userData.role === 'mentor') {
        // Load mentor's sessions/bookings
        const enrollmentsQuery = query(collection(db, 'mentorshipBookings'), where('mentorId', '==', userId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const mentorEnrollments = enrollmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setEnrollments(mentorEnrollments);
      }
    } catch (error) {
      console.error('Error loading user-specific data:', error);
    }
  };

  const getUserName = () => {
    if (!userData) return 'User';
    return userData.fullName || userData.startupName || userData.founderName || 'User';
  };

  const getRoleDisplayName = () => {
    if (!userData) return '';
    const roleNames = {
      student: 'Student',
      faculty: 'Faculty Member',
      startup: 'Startup Founder',
      mentor: 'Professional Mentor'
    };
    return roleNames[userData.role as keyof typeof roleNames] || userData.role;
  };

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {getUserName()}! 👋</h1>
        <p className="text-blue-100">Ready to collaborate and grow? Here's what's happening in your student community.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/student-projects" className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Find Projects</h3>
          </div>
          <p className="text-gray-400 text-sm">Discover and join exciting student projects</p>
        </Link>

        <Link to="/buddy-finder" className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold">Find Buddies</h3>
          </div>
          <p className="text-gray-400 text-sm">Connect with study and project partners</p>
        </Link>

        <Link to="/mentorship" className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold">Get Mentored</h3>
          </div>
          <p className="text-gray-400 text-sm">Learn from experienced professionals</p>
        </Link>

        <Link to="/research-projects" className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold">Research</h3>
          </div>
          <p className="text-gray-400 text-sm">Join faculty research projects</p>
        </Link>
      </div>

      {/* My Projects Section */}
      <div className="bg-[#1E293B] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Projects</h2>
          <Link to="/student-projects" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Upload Project
          </Link>
        </div>
        
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProjects.map((project) => (
              <div key={project.id} className="bg-[#0F172A] p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{project.description.substring(0, 100)}...</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{project.domain}</span>
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{project.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{project.status}</span>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't uploaded any projects yet.</p>
            <Link to="/student-projects" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Your First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderFacultyDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {getUserName()}! 🎓</h1>
        <p className="text-orange-100">Manage your research projects and guide students in their academic journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="w-8 h-8 text-orange-400" />
            <div>
              <h3 className="text-2xl font-bold">{userProjects.length}</h3>
              <p className="text-gray-400">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold">{enrollments.length}</h3>
              <p className="text-gray-400">Student Enrollments</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold">85%</h3>
              <p className="text-gray-400">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Research Projects */}
      <div className="bg-[#1E293B] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Research Projects</h2>
          <button className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
        
        {userProjects.length > 0 ? (
          <div className="space-y-4">
            {userProjects.map((project) => (
              <div key={project.id} className="bg-[#0F172A] p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">{project.domain}</span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{project.level}</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{project.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {project.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                    <span>Duration: {project.duration}</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FlaskConical className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't created any research projects yet.</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStartupDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {getUserName()}! 🚀</h1>
        <p className="text-purple-100">Scale your startup with talented student collaborators and innovative projects.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold">{userProjects.length}</h3>
              <p className="text-gray-400">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold">24</h3>
              <p className="text-gray-400">Student Applications</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold">92%</h3>
              <p className="text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Startup Projects */}
      <div className="bg-[#1E293B] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Startup Projects</h2>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Post Project
          </button>
        </div>
        
        {userProjects.length > 0 ? (
          <div className="space-y-4">
            {userProjects.map((project) => (
              <div key={project.id} className="bg-[#0F172A] p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">{project.domain}</span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{project.level}</span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{project.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {project.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                    <span>Duration: {project.duration}</span>
                  </div>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    View Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Rocket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't posted any startup projects yet.</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Post Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMentorDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {getUserName()}! 💡</h1>
        <p className="text-green-100">Share your expertise and guide the next generation of professionals.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold">{enrollments.length}</h3>
              <p className="text-gray-400">Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-2xl font-bold">4.8</h3>
              <p className="text-gray-400">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold">₹12K</h3>
              <p className="text-gray-400">Monthly Earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-[#1E293B] rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Sessions</h2>
        
        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="bg-[#0F172A] p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{enrollment.studentName}</h3>
                    <p className="text-gray-400 mb-2">{enrollment.studentEmail}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{enrollment.status}</span>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">1 Hour Session</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="text-green-400 hover:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Booked: {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                    <span>₹2,000/hour</span>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Join Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No upcoming sessions scheduled.</p>
            <p className="text-gray-500 text-sm">Students will be able to book sessions with you once your profile is complete.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <p className="text-gray-400">You need to be logged in to view your personalized dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getUserName()}</h1>
            <p className="text-gray-400">{getRoleDisplayName()}</p>
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      {userData.role === 'student' && renderStudentDashboard()}
      {userData.role === 'faculty' && renderFacultyDashboard()}
      {userData.role === 'startup' && renderStartupDashboard()}
      {userData.role === 'mentor' && renderMentorDashboard()}
    </div>
  );
};

export default Dashboard; 