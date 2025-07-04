// Utility function to send email via backend
interface SendCollabEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  type?: 'collab' | 'feedback';
}

export async function sendCollabEmail({
  to,
  subject,
  text,
  html,
  type = 'collab'
}: SendCollabEmailParams) {
  // Basic validation
  if (!to || to.trim() === '') {
    console.error("❌ sendCollabEmail failed: 'to' field is empty.");
    throw new Error("Recipient email address cannot be empty.");
  }
  if (!subject || subject.trim() === '') {
    console.error("❌ sendCollabEmail failed: 'subject' field is empty.");
    throw new Error("Subject cannot be empty.");
  }

  // Choose the endpoint based on type
  const endpoint =
    type === 'feedback'
      ? import.meta.env.VITE_FEEDBACK_API_URL
      : import.meta.env.VITE_EMAIL_API_URL;

  // Compose request body
  const body =
    type === 'feedback'
      ? JSON.stringify({ name: to, email: subject, message: text || '' })
      : JSON.stringify({ to, subject, text, html });

  console.log(`📧 Sending ${type} email to: ${to}, subject: ${subject}`);

  try {
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
      console.error("⚠️ Non-JSON response from server:", raw);
      throw new Error(`Server returned non-JSON response: ${raw}`);
    }

    if (!response.ok) {
      console.error("❌ Email send failed:", responseBody);
      throw new Error(responseBody.error || 'Failed to send email');
    }

    console.log("✅ Email sent successfully:", responseBody);
    return responseBody;

  } catch (err: any) {
    console.error("🔥 sendCollabEmail error:", err.message);
    throw err;
  }
}
