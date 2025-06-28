import { functions } from './firebaseConfig';

interface CollaborationRequest {
  projectTitle: string;
  projectOwnerEmail: string;
  collaboratorEmail: string;
  collaboratorPhone: string;
  collaboratorSkills: string;
}

export const sendCollaborationEmail = async (request: CollaborationRequest) => {
  try {
    const emailFunction = functions.httpsCallable('sendCollaborationEmail');
    await emailFunction(request);
    return true;
  } catch (error) {
    console.error('Error sending collaboration email:', error);
    throw error;
  }
};