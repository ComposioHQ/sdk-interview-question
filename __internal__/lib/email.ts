import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Composio Challenge <challenge@composio.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send an invitation email to a candidate
 */
export async function sendInvitationEmail(email: string, token: string) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/download/${token}`;
  
  return await sendEmail({
    to: email,
    subject: 'Your Composio SDK Design Challenge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6; margin-bottom: 24px;">Welcome to the Composio SDK Design Challenge!</h1>
        
        <p style="margin-bottom: 16px; font-size: 16px; line-height: 1.5;">
          We're excited to see your approach to this challenge.
        </p>
        
        <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.5;">
          Please click the button below to download the challenge repository:
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${downloadUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Download Challenge Repository
          </a>
        </div>
        
        <p style="margin-bottom: 16px; font-size: 16px; line-height: 1.5;">
          Instructions are included in the README.md file.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5;">
          Good luck!
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>The Composio Team</p>
        </div>
      </div>
    `,
  });
}