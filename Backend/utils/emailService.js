
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
      subject: "🎭 Verify Your UnderCover Email - Your Shadow Awaits",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - UnderCover</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%); color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%); padding: 50px 40px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"white\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.3;"></div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 48px; margin-bottom: 15px;">🎭</div>
                <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">UnderCover</h1>
                <div style="font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500; margin-top: 10px;">Email Verification</div>
              </div>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 50px 40px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; padding: 25px; background: rgba(139, 92, 246, 0.15); border-radius: 50%; margin-bottom: 25px; border: 2px solid rgba(139, 92, 246, 0.3);">
                  <div style="font-size: 56px;">🔐</div>
                </div>
                <h2 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700; line-height: 1.3;">Welcome to the Shadows!</h2>
                <p style="margin: 15px 0 0 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">Your anonymous identity awaits verification</p>
              </div>
              
              <!-- Welcome Message -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%); border-left: 4px solid #8b5cf6; padding: 25px; border-radius: 12px; margin-bottom: 40px;">
                <p style="margin: 0; color: #e2e8f0; line-height: 1.7; font-size: 16px;">
                  🌟 <strong>Welcome to UnderCover!</strong><br><br>
                  You're about to join a community where anonymity meets authenticity. Your shadow identity keeps you safe while you connect, share, and discover others in the realm of mysteries.
                </p>
              </div>
              
              <!-- OTP Section -->
              <div style="text-align: center; margin: 50px 0;">
                <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 16px;">
                  Enter this verification code in the app:
                </p>
                <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 20px 40px; border-radius: 16px; box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4); margin: 20px 0;">
                  <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: white; font-family: 'Courier New', monospace; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                    ${otp}
                  </div>
                </div>
                <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px;">
                  This code expires in <strong style="color: #8b5cf6;">10 minutes</strong>
                </p>
              </div>
              
              <!-- Features Preview -->
              <div style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 30px; margin: 40px 0;">
                <h3 style="margin: 0 0 20px 0; color: #8b5cf6; font-size: 20px; font-weight: 600; text-align: center;">🚀 What awaits you:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px;">
                  <div style="text-align: center; padding: 15px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">💬</div>
                    <div style="color: #e2e8f0; font-size: 14px; font-weight: 500;">Anonymous Whispers</div>
                  </div>
                  <div style="text-align: center; padding: 15px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🕵️</div>
                    <div style="color: #e2e8f0; font-size: 14px; font-weight: 500;">Identity Recognition</div>
                  </div>
                  <div style="text-align: center; padding: 15px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🎭</div>
                    <div style="color: #e2e8f0; font-size: 14px; font-weight: 500;">Ghost Circles</div>
                  </div>
                  <div style="text-align: center; padding: 15px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🌙</div>
                    <div style="color: #e2e8f0; font-size: 14px; font-weight: 500;">Shadow Posts</div>
                  </div>
                </div>
              </div>
              
              <!-- Security Notice -->
              <div style="border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 25px; background: rgba(139, 92, 246, 0.05); margin-top: 40px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="font-size: 24px; margin-right: 12px;">🛡️</span>
                  <strong style="color: #8b5cf6; font-size: 18px;">Security Notice</strong>
                </div>
                <ul style="margin: 0; padding-left: 25px; color: #cbd5e1; line-height: 1.7; font-size: 15px;">
                  <li>This code expires in <strong>10 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't create an account, ignore this email</li>
                  <li>Your identity remains anonymous until you choose to reveal it</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: rgba(0,0,0,0.3); padding: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
              <div style="margin-bottom: 15px;">
                <span style="font-size: 24px;">🌙</span>
                <span style="font-size: 24px; margin: 0 8px;">✨</span>
                <span style="font-size: 24px;">🎭</span>
              </div>
              <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 16px; font-weight: 500;">
                Welcome to the realm of mysteries
              </p>
              <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
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
