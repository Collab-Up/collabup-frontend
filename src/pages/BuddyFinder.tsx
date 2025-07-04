import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Code, Users, Star, MapPin, MessageCircle, User } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { sendCollabEmail } from '../utils/sendCollabEmail';

interface BuddyProfile {
  id: number;
  name: string;
  avatar: string;
  domain: string;
  level: string;
  skills: string[];
  location: string;
  matchScore: number;
  hackathons?: string[];
  email: string;
}

const indianHackathons = [
  "Smart India Hackathon",
  "HackVerse",
  "HackBout",
  "InOut Hackathon",
  "HackCBS",
  "HackRush",
  "CodeUtsava",
  "HackIndia",
  "DevsHouse",
];

const mockProfiles: BuddyProfile[] = [
  {
    id: 1,
    name: "Subhash Bishnoi",
    avatar: "anshu.png",
    domain: "Web Development",
    level: "Intermediate",
    skills: ["React", "Node.js", "TypeScript", "Tailwind CSS"],
    location: "Jodhpur, India",
    matchScore: 95,
    hackathons: ["Smart India Hackathon", "DevsHouse"],
    email: "me22b2044@iiitdm.ac.in",
  },
  {
    id: 2,
    name: "Vikas Yadav",
    avatar: "prince.png",
    domain: "UX Design",
    level: "Advanced",
    skills: ["Figma", "UI Design", "User Research"],
    location: "Gurgaon, India",
    matchScore: 88,
    hackathons: ["HackCBS", "DevsHouse"],
    email: "me22b1051@iiitdm.ac.in",
  },
  {
    id: 3,
    name: "Prashant Tyagi",
    avatar: "anshu.png",
    domain: "AI/ML",
    level: "Intermediate",
    skills: ["Python", "Machine Learning", "Data Science"],
    location: "Meerut, India",
    matchScore: 90,
    hackathons: ["HackVerse", "HackBout"],
    email: "me22b1069@iiitdm.ac.in",
  },
  {
    id: 4,
    name: "Ashutosh Shandilya",
    avatar: "prince.png",
    domain: "Cloud Computing",
    level: "Beginner",
    skills: ["AWS", "Docker", "Kubernetes"],
    location: "Kanpur, India",
    matchScore: 85,
    hackathons: ["HackIndia", "CodeUtsava"],
    email: "cs22b2050@iiitdm.ac.in",
  },
  {
    id: 5,
    name: "Nitin Thaber",
    avatar: "anshu.png",
    domain: "Cybersecurity",
    level: "Advanced",
    skills: ["Network Security", "Python", "Linux"],
    location: "Delhi, India",
    matchScore: 87,
    hackathons: ["HackRush", "HackCBS"],
    email: "cs22b2047@iiitdm.ac.in",
  },
  {
    id: 6,
    name: "Anshu Saini",
    avatar: "anshu.png",
    domain: "Mobile Development",
    level: "Intermediate",
    skills: ["Flutter", "React Native", "Android"],
    location: "Chennai, India",
    matchScore: 92,
    hackathons: ["HackBout", "HackIndia"],
    email: "cs22b2051@iiitdm.ac.in",
  },
  {
    id: 7,
    name: "Arpita Roy",
    avatar: "prince.png",
    domain: "Data Science",
    level: "Beginner",
    skills: ["Python", "Pandas", "Data Visualization"],
    location: "Kolkata, India",
    matchScore: 89,
    hackathons: ["HackVerse", "HackCBS"],
    email: "me22b1078@iiitdm.ac.in",
  },
  {
    id: 8,
    name: "Rishit Rastogi",
    avatar: "anshu.png",
    domain: "IoT",
    level: "Advanced",
    skills: ["Arduino", "Raspberry Pi", "C++"],
    location: "Lucknow, India",
    matchScore: 91,
    hackathons: ["Smart India Hackathon", "HackRush"],
    email: "me22b2017@iiitdm.ac.in",
  },
  {
    id: 9,
    name: "Kush Jain",
    avatar: "prince.png",
    domain: "Blockchain",
    level: "Intermediate",
    skills: ["Solidity", "Web3.js", "React"],
    location: "Jaipur, India",
    matchScore: 86,
    hackathons: ["HackCBS", "HackIndia"],
    email: "cs22b2010@iiitdm.ac.in",
  },
];

// Name to email mapping for buddies (for fallback)
const buddyEmailMap: Record<string, string> = {
  "Subhash Bishnoi": "me22b2044@iiitdm.ac.in",
  "Vikas Yadav": "me22b1051@iiitdm.ac.in",
  "Prashant Tyagi": "me22b1069@iiitdm.ac.in",
  "Ashutosh Shandilya": "cs22b2050@iiitdm.ac.in",
  "Nitin Thaber": "cs22b2047@iiitdm.ac.in",
  "Anshu Saini": "cs22b2051@iiitdm.ac.in",
  "Arpita Roy": "me22b1078@iiitdm.ac.in",
  "Rishit Rastogi": "me22b2017@iiitdm.ac.in",
  "Kush Jain": "cs22b2010@iiitdm.ac.in",
};

const BuddyFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedHackathon, setSelectedHackathon] = useState('all');
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Fetch logged-in user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.fullName || 'User',
              email: data.email || user.email || 'unknown@example.com',
            });
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };
    fetchUserData();
  }, []);

  const filteredProfiles = mockProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || profile.domain.toLowerCase() === selectedDomain;
    const matchesLevel = selectedLevel === 'all' || profile.level.toLowerCase() === selectedLevel.toLowerCase();
    const matchesHackathon = selectedHackathon === 'all' || 
      (profile.hackathons && profile.hackathons.includes(selectedHackathon));
    
    return matchesSearch && matchesDomain && matchesLevel && matchesHackathon;
  });

  const handleConnect = async (buddy: BuddyProfile) => {
    if (!userData || !userData.email) {
      setModalMessage('Please sign in to connect with a buddy.');
      setShowModal(true);
      return;
    }

    // Always use mapping for buddy email, fallback to profile email, then show error
    const buddyEmail = buddyEmailMap[buddy.name] || buddy.email || '';
    if (!buddyEmail || buddyEmail.trim() === '') {
      setModalMessage('Could not find a valid email for the selected buddy.');
      setShowModal(true);
      return;
    }

    try {
      // Email to logged-in user
      await sendCollabEmail({
        to: userData.email,
        subject: `Buddy Connection Request: ${buddy.name}`,
        text: `You have requested to connect with ${buddy.name} (${buddyEmail}).`,
        html: `<p>You have requested to connect with <b>${buddy.name}</b> (${buddyEmail}).</p>`
      });
      // Email to buddy
      await sendCollabEmail({
        to: buddyEmail,
        subject: `Buddy Connection Request from ${userData.name}`,
        text: `${userData.name} (${userData.email}) wants to connect with you via CollabUp Buddy Finder!`,
        html: `<p><b>${userData.name}</b> (${userData.email}) wants to connect with you via CollabUp Buddy Finder!</p>`
      });
      setModalMessage('You can reach out to the project owner with the credentials shared via mail.');
      setShowModal(true);
    } catch (err: any) {
      console.error('Email sending error:', err);
      setModalMessage('Failed to send connection emails. Please try again.');
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <p className="text-gray-200 mb-4">{modalMessage}</p>
            <button
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12 pt-6">
        <h1 className="text-4xl font-bold text-white mb-4">Buddy Finder</h1>
        <p className="text-lg text-gray-400">
          Find the perfect study partner based on your interests and skill level
        </p>
      </div>

      {/* Search and Filter Section */}
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
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="all">Domains</option>
                <option value="web development">Web Development</option>
                <option value="ux design">UX Design</option>
                <option value="artificial intelligence">Artificial Intelligence</option>
                <option value="machine learning">Machine Learning</option>
                <option value="blockchain">Blockchain</option>
                <option value="iot">IOT</option>
                <option value="cyber security">Cyber Security</option>
              </select>
            </div>
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="relative">
              <select
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
              >
                <option value="all">Hackathons</option>
                {indianHackathons.map((hackathon) => (
                  <option key={hackathon} value={hackathon}>
                    {hackathon}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Buddy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-gray-700">
            <div className="relative">
              <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full shadow-md border border-gray-700">
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={16} fill="currentColor" />
                  <span className="font-semibold text-gray-200">{profile.matchScore}%</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">{profile.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  <span className="font-medium text-gray-300">{profile.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <span className="text-gray-400">{profile.level}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-indigo-300 rounded-full text-sm border border-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {profile.hackathons && profile.hackathons.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Hackathons:</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.hackathons.map((hackathon, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm border border-indigo-800"
                      >
                        {hackathon}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => handleConnect(profile)}
              >
                <MessageCircle size={20} />
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuddyFinder;