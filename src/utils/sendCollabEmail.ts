// Utility function to send email via backend
interface SendCollabEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendCollabEmail({ to, subject, text, html }: SendCollabEmailParams) {
  const response = await fetch('http://localhost:5050/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, text, html })
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