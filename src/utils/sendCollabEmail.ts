// Utility function to send email via backend
interface SendCollabEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  type?: 'collab' | 'feedback'; // New: type to select endpoint
}

export async function sendCollabEmail({ to, subject, text, html, type = 'collab' }: SendCollabEmailParams) {
  // Choose endpoint based on type
  const endpoint = type === 'feedback'
    ? import.meta.env.VITE_FEEDBACK_API_URL
    : import.meta.env.VITE_EMAIL_API_URL;

  // For feedback, backend expects { name, email, message }
  const body = type === 'feedback'
    ? JSON.stringify({ name: to, email: subject, message: text }) // Map fields for feedback
    : JSON.stringify({ to, subject, text, html });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  const raw = await response.text();
  let responseBody;
  try {
    responseBody = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Server returned non-JSON response: ${raw}`);
  }
  if (!response.ok) {
    throw new Error(responseBody.error || 'Failed to send email');
  }
  return responseBody;
}