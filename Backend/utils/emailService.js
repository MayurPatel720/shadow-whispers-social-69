
const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM || "your-email@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password",
    },
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with OTP
const sendVerificationEmail = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: email,
    subject: "UnderKover - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(147, 51, 234, 0.3);
          }
          
          .header {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
          }
          
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .message {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
          }
          
          .otp-container {
            background: rgba(147, 51, 234, 0.1);
            border: 2px solid #9333ea;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
          }
          
          .otp-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #9333ea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          
          .expiry {
            font-size: 14px;
            color: #ef4444;
            margin-top: 15px;
          }
          
          .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid rgba(147, 51, 234, 0.2);
          }
          
          .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.5;
          }
          
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .tagline {
              font-size: 14px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .title {
              font-size: 22px;
            }
            
            .message {
              font-size: 15px;
            }
            
            .otp-container {
              padding: 20px;
              margin: 25px 0;
            }
            
            .otp-code {
              font-size: 30px;
              letter-spacing: 6px;
            }
            
            .footer {
              padding: 20px;
            }
          }
          
          @media only screen and (max-width: 400px) {
            .otp-code {
              font-size: 24px;
              letter-spacing: 4px;
            }
            
            .logo {
              font-size: 24px;
            }
            
            .title {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">UnderKover</div>
            <div class="tagline">Share your truth, find your tribe</div>
          </div>
          
          <div class="content">
            <h1 class="title">Verify Your Email</h1>
            <p class="message">
              Welcome to the underground! Use the verification code below to complete your registration and start sharing your secrets anonymously.
            </p>
            
            <div class="otp-container">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry">Expires in 10 minutes</div>
            </div>
            
            <p class="message">
              If you didn't create an account with UnderKover, you can safely ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is an automated message from UnderKover.<br>
              Your secrets are safe with us. 🎭
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  
  // Updated reset URL to match the frontend route
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: email,
    subject: "UnderKover - Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
            margin: 0;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(147, 51, 234, 0.3);
          }
          
          .header {
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
          }
          
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
          }
          
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .title {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .message {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
          }
          
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(147, 51, 234, 0.3);
            transition: all 0.3s ease;
          }
          
          .reset-button:hover {
            background: linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(147, 51, 234, 0.4);
          }
          
          .expiry-warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          
          .expiry-text {
            color: #fca5a5;
            font-size: 14px;
            font-weight: 500;
          }
          
          .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid rgba(147, 51, 234, 0.2);
          }
          
          .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            line-height: 1.5;
          }
          
          .alternative-link {
            word-break: break-all;
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
          }
          
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .tagline {
              font-size: 14px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .title {
              font-size: 22px;
            }
            
            .message {
              font-size: 15px;
            }
            
            .reset-button {
              padding: 12px 30px;
              font-size: 15px;
            }
            
            .footer {
              padding: 20px;
            }
            
            .alternative-link {
              font-size: 11px;
              padding: 12px;
            }
          }
          
          @media only screen and (max-width: 400px) {
            .logo {
              font-size: 24px;
            }
            
            .title {
              font-size: 20px;
            }
            
            .reset-button {
              padding: 10px 25px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">UnderKover</div>
            <div class="tagline">Share your truth, find your tribe</div>
          </div>
          
          <div class="content">
            <h1 class="title">Reset Your Password</h1>
            <p class="message">
              We received a request to reset your password. Click the button below to create a new password for your UnderKover account.
            </p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            
            <div class="expiry-warning">
              <p class="expiry-text">⚠️ This link expires in 10 minutes for security</p>
            </div>
            
            <p class="message">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <div class="alternative-link">
              ${resetUrl}
            </div>
            
            <p class="message">
              If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is an automated message from UnderKover.<br>
              Your privacy and security are our priority. 🔒
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateOTP,
};
