import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@invoicemanagement.com',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">Invoice Management System</p>
    </div>
  `;

  return sendEmail(email, 'Password Reset Request', html);
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<boolean> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Verify Your Email</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Verify Email
      </a>
      <p>If you didn't create this account, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">Invoice Management System</p>
    </div>
  `;

  return sendEmail(email, 'Verify Your Email Address', html);
};

export const sendInvoiceEmail = async (
  email: string,
  invoiceNumber: string,
  pdfBuffer: Buffer
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@invoicemanagement.com',
      to: email,
      subject: `Invoice ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Invoice ${invoiceNumber}</h2>
          <p>Please find your invoice attached.</p>
          <p>Thank you for your business!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px;">Invoice Management System</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    logger.info(`Invoice email sent to ${email}: ${invoiceNumber}`);
    return true;
  } catch (error) {
    logger.error('Invoice email sending failed:', error);
    return false;
  }
};
