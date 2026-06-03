import { logger } from './logger';

// Mock email service until Resend or SendGrid is configured
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // In production, integrate Resend/SendGrid here
    logger.info(`Sending email to ${to} | Subject: ${subject}`);
    logger.debug(`Email content: ${html}`);
    
    // Simulate async email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    logger.error({ err: error }, `Failed to send email to ${to}`);
    throw new Error('Email sending failed');
  }
};
