// utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,     // your Gmail address
    pass: process.env.GMAIL_APP_PASS, // Gmail App Password (not your regular password)
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"CampusVoice" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your CampusVoice Password Reset OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #64748b;">Use the OTP below to reset your CampusVoice password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #1e1b4b;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;