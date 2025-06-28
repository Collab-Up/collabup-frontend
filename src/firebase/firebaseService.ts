import { db } from './firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

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

interface Faculty {
  id: string;
  fullName: string;
  email: string;
  instituteName: string;
  researchInterests: string[];
}

export const enrollInProject = async (enrollmentData: {
  userId: string;
  projectId: number;
  startDate: string;
  idCardUrl: string;
  resumeUrl: string;
}) => {
  try {
    await addDoc(collection(db, 'enrollments'), {
      ...enrollmentData,
      enrolledAt: new Date(),
      status: 'pending'
    });
  } catch (error) {
    console.error('Error enrolling in project:', error);
    throw error;
  }
};

export const getProjects = async (
  userRole?: string | null,
  userData?: { expertiseAreas?: string[]; researchAreas?: string[] } | null
): Promise<Project[]> => {
  try {
    let projectsQuery = query(collection(db, 'startups'));
    if (userRole === 'mentor' && userData?.expertiseAreas) {
      projectsQuery = query(collection(db, 'startups'), where('domain', 'in', userData.expertiseAreas));
    } else if (userRole === 'faculty' && userData?.researchAreas) {
      projectsQuery = query(collection(db, 'startups'), where('domain', 'in', userData.researchAreas));
    }
    const querySnapshot = await getDocs(projectsQuery);
    return querySnapshot.docs.map((doc, index) => ({
      id: index + 1, // Convert to number as expected by component
      title: doc.data().title || '',
      imageUrl: doc.data().imageUrl || 'https://via.placeholder.com/256',
      domain: doc.data().domain || '',
      duration: doc.data().duration || '',
      level: doc.data().level || '',
      skills: doc.data().skills || [],
      company: doc.data().company || '',
      location: doc.data().location || '',
      matchScore: doc.data().matchScore || Math.floor(Math.random() * 20) + 80,
      certificate: doc.data().certificate || false,
      offeredBy: doc.data().offeredBy || '',
    } as Project));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getResearchProjects = async (
  userRole: string | null,
  userData: { researchAreas?: string[] } | null
): Promise<ResearchProject[]> => {
  try {
    let projectsQuery = query(collection(db, 'researchProjects'));
    if (userRole === 'faculty' && userData?.researchAreas) {
      projectsQuery = query(collection(db, 'researchProjects'), where('domain', 'in', userData.researchAreas));
    }
    const querySnapshot = await getDocs(projectsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || '',
      domain: doc.data().domain || '',
      description: doc.data().description || '',
      facultyId: doc.data().facultyId || '',
      skills: doc.data().skills || [],
      location: doc.data().location || '',
      duration: doc.data().duration || '',
      level: doc.data().level || '',
      certificate: doc.data().certificate || false,
    } as ResearchProject));
  } catch (error) {
    console.error('Error fetching research projects:', error);
    throw error;
  }
};

export const getFaculties = async (): Promise<Faculty[]> => {
  try {
    const facultyQuery = query(collection(db, 'users'), where('role', '==', 'faculty'));
    const querySnapshot = await getDocs(facultyQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      fullName: doc.data().fullName || 'Unknown',
      email: doc.data().email || '',
      instituteName: doc.data().instituteName || '',
      researchInterests: doc.data().researchInterests || [],
    } as Faculty));
  } catch (error) {
    console.error('Error fetching faculties:', error);
    throw error;
  }
};
