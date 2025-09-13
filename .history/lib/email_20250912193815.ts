import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendAcceptanceEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'HOGIS Foundation Competition - Registration Accepted! 🎉',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">HOGIS Foundation</h1>
          <p style="color: white; margin: 10px 0;">Public Speaking & Spoken Word Competition 2025</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Congratulations, ${name}!</h2>
          <p>We are pleased to inform you that your registration for the HOGIS Foundation Public Speaking & Spoken Word Competition 2025 has been <strong>ACCEPTED</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Competition Details:</h3>
            <ul style="color: #4b5563;">
              <li><strong>Theme:</strong> "Raising the Boy Child, Building the Total Man"</li>
              <li><strong>Preliminary Stage:</strong> 16th - 17th September 2025</li>
              <li><strong>Grand Finale:</strong> 27th September 2025, Calabar</li>
            </ul>
          </div>
          
          <p>Please prepare well and we look forward to your outstanding performance!</p>
          
          <p style="color: #6b7280;">
            For any questions, contact Dejudge Glasgow at 08034227242.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRejectionEmail = async (email: string, name: string, reason?: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'HOGIS Foundation Competition - Registration Update',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">HOGIS Foundation</h1>
          <p style="color: white; margin: 10px 0;">Public Speaking & Spoken Word Competition 2025</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Dear ${name},</h2>
          <p>Thank you for your interest in the HOGIS Foundation Public Speaking & Spoken Word Competition 2025.</p>
          
          <p>After careful review, we regret to inform you that we cannot accept your registration at this time.</p>
          
          ${reason ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
          </div>` : ''}
          
          <p>We encourage you to continue developing your speaking skills and consider participating in future competitions.</p>
          
          <p style="color: #6b7280;">
            For any questions, contact Dejudge Glasgow at 08034227242.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'HOGIS Foundation Competition - Registration Confirmation',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">HOGIS Foundation</h1>
          <p style="color: white; margin: 10px 0;">Public Speaking & Spoken Word Competition 2025</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #1f2937;">Thank you for registering, ${name}!</h2>
          <p>We have successfully received your registration for the HOGIS Foundation Public Speaking & Spoken Word Competition 2025.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h3 style="color: #1f2937; margin-top: 0;">What happens next?</h3>
            <ul style="color: #4b5563; margin: 0;">
              <li>Our team will review your application</li>
              <li>You will receive an email notification about your status</li>
              <li>If accepted, you'll get further details about the competition</li>
            </ul>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Competition Details:</h3>
            <ul style="color: #4b5563;">
              <li><strong>Theme:</strong> "Raising the Boy Child, Building the Total Man"</li>
              <li><strong>Preliminary Stage:</strong> 16th - 17th September 2025</li>
              <li><strong>Grand Finale:</strong> 27th September 2025, Calabar</li>
            </ul>
          </div>
          
          <p>We appreciate your interest and look forward to your participation!</p>
          
          <p style="color: #6b7280;">
            For any questions, contact Dejudge Glasgow at 08034227242.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};