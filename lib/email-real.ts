// lib/email-real.ts
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create transporter with better error handling
const createTransporter = (): Transporter => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  console.log('📧 SMTP Configuration Check:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.auth.user);
  console.log('Has Password:', !!config.auth.pass);

  return nodemailer.createTransport(config);
};

// Test email configuration
const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error);
    return false;
  }
};

export const sendConfirmationEmail = async (email: string, name: string) => {
  try {
    console.log(`📧 Attempting to send REAL confirmation email to: ${email}`);
    
    // Verify configuration first
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      throw new Error('SMTP configuration is invalid');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'HOGIS Foundation Competition - Registration Confirmation',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HOGIS Foundation</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Public Speaking & Spoken Word Competition 2025</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Thank you for registering, ${name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We have successfully received your registration for the HOGIS Foundation Public Speaking & Spoken Word Competition 2025.
            </p>
            
            <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What happens next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                <li>Our team will review your application within 2-3 business days</li>
                <li>You will receive an email notification about your status</li>
                <li>If accepted, you'll get further details about the competition</li>
                <li>Prepare your speech on the given theme while waiting</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Competition Details:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                <li><strong>Theme:</strong> "Raising the Boy Child, Building the Total Man"</li>
                <li><strong>Preliminary Stage:</strong> 16th - 17th September 2025</li>
                <li><strong>Grand Finale:</strong> 27th September 2025, Calabar</li>
                <li><strong>Registration ID:</strong> #REG-${Date.now().toString().slice(-6)}</li>
              </ul>
            </div>
            
            <div style="background: #fef7ed; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Important:</strong> Please save this email for your records. You may need to reference your registration details later.
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
              We appreciate your interest and look forward to your participation in what promises to be an exciting competition!
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                For any questions or concerns, please contact:<br>
                <strong>Dejudge Glasgow</strong><br>
                Phone: <a href="tel:08034227242" style="color: #f59e0b; text-decoration: none;">08034227242</a><br>
                Email: <a href="mailto:hogisgrouphotels@gmail.com" style="color: #f59e0b; text-decoration: none;">hogisgrouphotels@gmail.com</a>
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2025 HOGIS Foundation. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ REAL confirmation email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error: any) {
    console.error('❌ Failed to send REAL confirmation email:', error);
    
    // Provide detailed error information
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check your email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed - check your SMTP settings');
    }
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export const sendAcceptanceEmail = async (email: string, name: string) => {
  try {
    console.log(`📧 Attempting to send REAL acceptance email to: ${email}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'HOGIS Foundation Competition - Registration Accepted! 🎉',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 CONGRATULATIONS! 🎉</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">HOGIS Foundation Competition 2025</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We are <strong>delighted</strong> to inform you that your registration for the HOGIS Foundation Public Speaking & Spoken Word Competition 2025 has been <strong style="color: #10b981;">ACCEPTED</strong>!
            </p>
            
            <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Competition Details:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
                <li><strong>Theme:</strong> "Raising the Boy Child, Building the Total Man"</li>
                <li><strong>Preliminary Stage:</strong> 16th - 17th September 2025</li>
                <li><strong>Grand Finale:</strong> 27th September 2025, Calabar</li>
                <li><strong>Your Participant ID:</strong> #PART-${Date.now().toString().slice(-6)}</li>
              </ul>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
              We look forward to your outstanding performance and wish you the very best in your preparation!
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                For any questions, contact:<br>
                <strong>Dejudge Glasgow</strong> at <a href="tel:08034227242" style="color: #f59e0b;">08034227242</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ REAL acceptance email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending REAL acceptance email:', error);
    throw error;
  }
};

export const sendRejectionEmail = async (email: string, name: string, reason?: string) => {
  try {
    console.log(`📧 Attempting to send REAL rejection email to: ${email}`);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'HOGIS Foundation Competition - Registration Update',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">HOGIS Foundation</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Public Speaking & Spoken Word Competition 2025</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Dear ${name},</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in the HOGIS Foundation Public Speaking & Spoken Word Competition 2025.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              After careful review, we regret to inform you that we cannot accept your registration at this time.
            </p>
            
            ${reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 15px;"><strong>Reason:</strong> ${reason}</p>
            </div>` : ''}
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 25px 0;">
              Please don't be discouraged. Keep practicing and look out for future opportunities to showcase your talent.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                For any questions, contact:<br>
                <strong>Dejudge Glasgow</strong> at <a href="tel:08034227242" style="color: #f59e0b;">08034227242</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ REAL rejection email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Error sending REAL rejection email:', error);
    throw error;
  }
};