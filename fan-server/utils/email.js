// ### Service: Email Verification with Brevo (formerly SendinBlue)
// Handles generation of email verification tokens and sending verification emails
// using Brevo's transactional email API.

const SibApiV3Sdk = require("sib-api-v3-sdk"); // Brevo (SendinBlue) SDK for email sending
const crypto = require("crypto"); // Node.js crypto module for secure token generation

// Configure API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Generate a secure random verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send a verification email to the user
const sendVerificationEmail = async (to, token, userName) => {
  const verificationUrl = `${
    process.env.CLIENT_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "כולם כבר ביציע – תאשר את המייל ותתפוס מקום!";
    sendSmtpEmail.htmlContent = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto; border-radius: 10px;">
        <h1 style="color: #15803d; margin-bottom: 20px;">ברוך הבא ליציע!</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">שלום ${
          userName || "אוהד"
        },</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">תודה שנרשמת לפלטפורמת היציע. כדי להשלים את תהליך הרישום, אנא אמת את כתובת הדוא"ל שלך על ידי לחיצה על הכפתור הבא:</p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">אמת את כתובת הדוא"ל שלי</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">או לחץ על הקישור הבא:</p>
        <p style="font-size: 14px; line-height: 1.5; margin-bottom: 30px; word-break: break-all; color: #3b82f6;">
          <a href="${verificationUrl}" style="color: #3b82f6; text-decoration: underline;">${verificationUrl}</a>
        </p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "HaYatzia",
      email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com",
    };

    sendSmtpEmail.to = [{ email: to, name: userName }];
    sendSmtpEmail.replyTo = {
      email: process.env.BREVO_REPLY_TO || "noreply@example.com",
      name: "HaYatzia Support",
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    // In development mode, don't block if email fails
    if (process.env.NODE_ENV !== "production") {
      return true;
    }

    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
