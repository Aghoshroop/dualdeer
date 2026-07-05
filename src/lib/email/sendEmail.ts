import { getTransporter } from './transporter';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: any }> => {
  console.log(`[Email Service] Attempting to send email to ${to}`);
  
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || '"DualDeer" <hello@dualdeer.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[Email Service] Successfully sent email to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};
