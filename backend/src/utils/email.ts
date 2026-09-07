import nodemailer from 'nodemailer';
import { logger } from './logger';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  const from = process.env.EMAIL_FROM || user;

  if (!user || !password || !from) {
    throw new Error('Email service is not configured. Set EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass: password },
  });

  try {
    const result = await transporter.sendMail({ from, to, subject, html });
    logger.info(`Email sent to ${to} | Subject: ${subject} | ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logger.error({ err: error }, `Failed to send email to ${to}`);
    throw new Error('Email sending failed. Check Gmail SMTP credentials and App Password.');
  }
};
