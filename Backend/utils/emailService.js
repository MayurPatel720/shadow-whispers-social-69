const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// FRONTEND URL FOR PASSWORD RESET
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // fallback for local dev

// Utility: generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email verification OTP email
const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Verify your email - UnderCover",
      html: `
        <div style="background: #1a1a2e; color: #fff; padding:40px; border-radius:12px; 
                    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;">
          <h1 style="color:#8b5cf6;font-size:2rem;font-weight:bold;margin:0 0 20px">🎭 UnderCover</h1>
          <h2 style="font-size:1.5rem; color:#e0e7ff; margin-bottom:24px;">Verify Your Email</h2>
          <p style="font-size:1.1rem; margin-bottom:18px;">
            Hi! Welcome to UnderCover.<br>
            Please enter the following code in the app to verify your email and join the shadow realm.
          </p>
          <div style="width:fit-content;margin:32px auto;padding:12px 36px;font-size:2rem;
                      font-weight:bold;letter-spacing:.16em;background:#a855f7;color:white;
                      border-radius:8px;box-shadow:0 4px 32px #a855f742">
            ${otp}
          </div>
          <p style="color: #9ca3af;font-size:.93rem; margin-top:24px;">
            This code will expire in <b>10 minutes</b>.<br>
            If you did not create an account, just ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();

    // Point to frontend reset password page instead of backend
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: '🔐 Reset Your UnderCover Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - UnderCover</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #0f0f23; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: white; margin-bottom: 8px;">🎭 UnderCover</div>
              <div style="font-size: 16px; color: rgba(255,255,255,0.9); font-weight: 500;">Password Reset Request</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 20px; background: rgba(139, 92, 246, 0.1); border-radius: 50%; margin-bottom: 20px;">
                  <div style="font-size: 48px;">🔑</div>
                </div>
                <h2 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 600;">Reset Your Password</h2>
              </div>
              
              <div style="background: rgba(255,255,255,0.05); border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #e5e7eb; line-height: 1.6;">
                  Hello there, shadow dweller! 👋<br><br>
                  Someone (hopefully you) requested to reset the password for your UnderCover account. 
                  Don't worry - your secret identity is safe with us!
                </p>
              </div>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3); transition: all 0.3s ease;">
                  🚀 Reset My Password
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px; text-align: center;">
                  Button not working? Copy and paste this link:
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; word-break: break-all; text-align: center;">
                  <a href="${resetUrl}" style="color: #8b5cf6; text-decoration: none; font-size: 14px;">${resetUrl}</a>
                </div>
              </div>
              
              <!-- Security Notice -->
              <div style="border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 20px; background: rgba(139, 92, 246, 0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 20px; margin-right: 10px;">⚠️</span>
                  <strong style="color: #8b5cf6;">Security Notice</strong>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #d1d5db; line-height: 1.6;">
                  <li>This link will expire in <strong>10 minutes</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: rgba(0,0,0,0.2); padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                Stay anonymous, stay secure 🛡️
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2024 UnderCover. All rights reserved.<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  generateOTP,
};
