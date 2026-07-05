import nodemailer from 'nodemailer';

export const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Missing required SMTP environment variables for Brevo.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_PORT === '465', // Brevo typically uses 587 (STARTTLS) which sets secure to false, or 465 (TLS) which sets secure to true.
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    }
  });
};
