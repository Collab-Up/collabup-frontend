import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { User as UserIcon, Upload, Save, ArrowLeft } from 'lucide-react';

interface UserData {
  fullName?: string;
  startupName?: string;
  founderName?: string;
  instituteName?: string;
  institute?: string;
  email: string;
  skills?: string[];
  researchAreas?: string[];
  expertiseAreas?: string[];
  yearsOfExperience?: number;
  leetCodeUrl?: string;
  codeForcesUrl?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  website?: string;
  industry?: string;
  companyDescription?: string;
  profilePicUrl?: string;
  role: string;
}

const EditProfile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [skills, setSkills] = useState('');
  const [researchAreas, setResearchAreas] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [leetCodeUrl, setLeetCodeUrl] = useState('');
  const [codeForcesUrl, setCodeForcesUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            
            // Set form fields based on user role
            setFullName(data.fullName || data.startupName || data.founderName || '');
            setInstituteName(data.instituteName || data.institute || '');
            setSkills(data.skills ? data.skills.join(', ') : '');
            setResearchAreas(data.researchAreas ? data.researchAreas.join(', ') : '');
            setExpertiseAreas(data.expertiseAreas ? data.expertiseAreas.join(', ') : '');
            setYearsOfExperience(data.yearsOfExperience || '');
            setLeetCodeUrl(data.leetCodeUrl || '');
            setCodeForcesUrl(data.codeForcesUrl || '');
            setLinkedInUrl(data.linkedInUrl || '');
            setGitHubUrl(data.gitHubUrl || '');
            setWebsite(data.website || '');
            setIndustry(data.industry || '');
            setCompanyDescription(data.companyDescription || '');
            setPreviewUrl(data.profilePicUrl || null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setError('Profile picture must be a PNG or JPEG image.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Profile picture size must be less than 2MB.');
        return;
      }
      setProfilePic(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let profilePicUrl = userData.profilePicUrl;

      // Upload new profile picture if selected
      if (profilePic) {
        const profilePicFileName = `${uuidv4()}-${profilePic.name}`;
        const profilePicRef = ref(storage, `profile-pics/${currentUser.uid}/${profilePicFileName}`);
        
        const uploadTask = await uploadBytes(profilePicRef, profilePic);
        profilePicUrl = await getDownloadURL(uploadTask.ref);
      }

      // Prepare update data based on user role
      const updateData: any = {
        profilePicUrl,
        updatedAt: new Date().toISOString()
      };

      if (userData.role === 'student') {
        updateData.fullName = fullName;
        updateData.instituteName = instituteName;
        updateData.skills = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        updateData.leetCodeUrl = leetCodeUrl || null;
        updateData.codeForcesUrl = codeForcesUrl || null;
        updateData.linkedInUrl = linkedInUrl || null;
        updateData.gitHubUrl = gitHubUrl || null;
      } else if (userData.role === 'faculty') {
        updateData.fullName = fullName;
        updateData.institute = instituteName;
        updateData.researchAreas = researchAreas.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      } else if (userData.role === 'mentor') {
        updateData.fullName = fullName;
        updateData.expertiseAreas = expertiseAreas.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        updateData.yearsOfExperience = Number(yearsOfExperience);
        updateData.linkedInUrl = linkedInUrl || null;
      } else if (userData.role === 'startup') {
        updateData.startupName = fullName;
        updateData.founderName = fullName;
        updateData.website = website || null;
        updateData.industry = industry;
        updateData.companyDescription = companyDescription;
      }

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
      setSuccess('Profile updated successfully!');
      
      // Update local state
      setUserData({ ...userData, ...updateData });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to edit your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Edit Profile</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 text-green-300 rounded-lg border border-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">Click the upload icon to change your profile picture</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {userData.role === 'startup' ? 'Startup Name' : 'Full Name'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={userData.role === 'startup' ? 'Enter startup name' : 'Enter your full name'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {userData.role === 'startup' ? 'Founder Name' : 'Institute/Organization'}
              </label>
              <input
                type="text"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={userData.role === 'startup' ? 'Enter founder name' : 'Enter institute name'}
                required
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {userData.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., React, Node.js, Python"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LeetCode Profile URL</label>
                  <input
                    type="url"
                    value={leetCodeUrl}
                    onChange={(e) => setLeetCodeUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://leetcode.com/yourusername"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CodeForces Profile URL</label>
                  <input
                    type="url"
                    value={codeForcesUrl}
                    onChange={(e) => setCodeForcesUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://codeforces.com/profile/yourusername"
                  />
                </div>
              </div>
            </>
          )}

          {userData.role === 'faculty' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Research Areas (comma-separated)</label>
              <input
                type="text"
                value={researchAreas}
                onChange={(e) => setResearchAreas(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Machine Learning, AI, Data Science"
              />
            </div>
          )}

          {userData.role === 'mentor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Expertise Areas (comma-separated)</label>
                <input
                  type="text"
                  value={expertiseAreas}
                  onChange={(e) => setExpertiseAreas(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Web Development, Machine Learning, UI/UX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter years of experience"
                  min="0"
                />
              </div>
            </>
          )}

          {userData.role === 'startup' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://yourstartup.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your startup and what you do..."
                  required
                />
              </div>
            </>
          )}

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Profile URL</label>
              <input
                type="url"
                value={gitHubUrl}
                onChange={(e) => setGitHubUrl(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 