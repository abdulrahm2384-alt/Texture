import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Load SMTP configurations safely
const SMTP_HOST = process.env.SMTP_HOST?.trim();

let parsedPort = 587;
if (process.env.SMTP_PORT) {
  const p = parseInt(process.env.SMTP_PORT.trim(), 10);
  if (!isNaN(p)) {
    parsedPort = p;
  }
}
const SMTP_PORT = parsedPort;

const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.trim();

// Secure is true if explicitly configured, or defaults to true if port is 465
const SMTP_SECURE = process.env.SMTP_SECURE?.trim().toLowerCase() === "true" || 
                    process.env.SMTP_SECURE?.trim().toLowerCase() === "yes" || 
                    SMTP_PORT === 465;

// Optional custom sender, fallback to SMTP_USER if it is an email, otherwise ADMIN_EMAIL
const SMTP_FROM = process.env.SMTP_FROM?.trim() || 
                  (SMTP_USER && SMTP_USER.includes("@") ? SMTP_USER : null) || 
                  (process.env.ADMIN_EMAIL?.trim()) || 
                  "admin@oluwashola-atelier.com";

// Secure Admin Email configured on DirectAdmin
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@oluwashola-atelier.com").toLowerCase().trim();

/**
 * Validate if an email has administrative privileges
 */
export function isAdminEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return lower === ADMIN_EMAIL;
}

// In-Memory OTP store (lightweight, highly secure, automatic expiry)
// Key: email -> Value: { otp: string, expiresAt: number }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

/**
 * Generate a random 6-digit OTP
 */
export function generateOtp(): string {
  // Generates 6 digits securely
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Send OTP via SMTP
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; error?: string }> {
  // Enforce lowercase
  const targetEmail = toEmail.toLowerCase().trim();

  // 1. Verify SMTP configurations are set
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const errMsg = "SMTP mail server configuration is missing in environment variables (.env)";
    console.error(`[OTP Error] ${errMsg}`);
    
    // Developer fallback log so testing isn't blocked on incomplete configurations
    console.log(`\n======================================================`);
    console.log(`[DEVELOPER NOTICE] Admin OTP requested for: ${targetEmail}`);
    console.log(`OTP Code: ${otpCode} (Expires in 5 minutes)`);
    console.log(`======================================================\n`);
    
    return { 
      success: false, 
      error: "Mail server credentials are not configured. If in development, check your server console log." 
    };
  }

  try {
    // 2. Create SMTP transport with debug capabilities and robust timeouts
    console.log(`[SMTP Debug] Preparing SMTP connection:`);
    console.log(`  Host: ${SMTP_HOST}`);
    console.log(`  Port: ${SMTP_PORT}`);
    console.log(`  Secure Mode: ${SMTP_SECURE}`);
    console.log(`  Auth User: ${SMTP_USER}`);
    console.log(`  From Header: ${SMTP_FROM}`);
    console.log(`  To Recipient: ${targetEmail}`);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        // Prevent self-signed certificate errors common in custom mail servers / DirectAdmin
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000, // 15 seconds connection timeout
      greetingTimeout: 15000,   // 15 seconds greeting timeout
      socketTimeout: 20000,     // 20 seconds socket timeout
      debug: true,              // Enable Nodemailer internal SMTP handshake debug logs
      logger: true,             // Log SMTP conversation trace to process stdout/console
    });

    // 3. Define luxurious rich-text email template matching Oluwashola style
    const mailOptions = {
      from: `"Oluwashola Atelier" <${SMTP_FROM}>`,
      to: targetEmail,
      subject: "🔒 Admin Access Verification - OLUWASHOLA ATELIER",
      text: `Your OLUWASHOLA ATELIER Admin Access OTP code is: ${otpCode}. It will expire in 5 minutes. If you did not request this, please secure your server credentials.`,
      html: `
        <div style="font-family: 'Georgia', serif; background-color: #0c0a09; color: #f5f5f4; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #1c1917; border: 1px solid #d97706; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
            
            <h1 style="color: #f5f5f4; font-size: 20px; font-weight: normal; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 30px; border-bottom: 1px solid #44403c; padding-bottom: 15px;">
              OLUWASHOLA ATELIER
            </h1>
            
            <p style="font-size: 14px; line-height: 1.6; color: #d6d3d1; margin-bottom: 25px;">
              A request was initiated for administrative login authorization. Use the temporary verification key below to grant entry:
            </p>
            
            <div style="background-color: #292524; border: 1px solid #78350f; color: #f59e0b; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 0.25em; padding: 15px 0; border-radius: 12px; margin: 25px 0; user-select: all;">
              ${otpCode}
            </div>
            
            <p style="font-size: 11px; color: #a8a29e; line-height: 1.5; margin-top: 25px;">
              ⌛ This access token is strictly valid for <strong>5 minutes</strong> and will render inactive immediately upon initial verification attempts (One-Time Use).
            </p>
            
            <p style="font-size: 10px; color: #78716c; margin-top: 40px; border-top: 1px solid #44403c; padding-top: 20px;">
              If you did not request administrative authorization, please review your hosting security immediately.
            </p>
            
          </div>
        </div>
      `,
    };

    // 4. Dispatch email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[OTP Sent] Code successfully dispatched to ${targetEmail}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[SMTP Transmission Error] Failed to send OTP to ${targetEmail}:`, err);
    
    // Fallback log for development/troubleshooting so developer gets the code
    console.log(`\n======================================================`);
    console.log(`[DEVELOPER BACKUP LOG] Failed to send SMTP mail to ${targetEmail}`);
    console.log(`OTP Code: ${otpCode} (Expires in 5 minutes)`);
    console.log(`Error Details: ${err.message || err}`);
    console.log(`======================================================\n`);

    return { 
      success: false, 
      error: `Email delivery failed: ${err.message || "Unknown mail server error"}` 
    };
  }
}

/**
 * Save OTP to temporary state
 */
export function storeOtp(email: string, otp: string) {
  const targetEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 Minutes
  otpStore.set(targetEmail, { otp, expiresAt });
}

/**
 * Verify OTP - One-time use constraint enforced
 */
export function verifyOtp(email: string, userEnteredOtp: string): { success: boolean; error?: string } {
  const targetEmail = email.toLowerCase().trim();
  const entry = otpStore.get(targetEmail);

  // 1. Check if OTP exists
  if (!entry) {
    return { success: false, error: "No verification process is active for this email. Request a new OTP." };
  }

  // 2. Enforce one-time use immediately by clearing the OTP from memory upon first verification attempt
  otpStore.delete(targetEmail);

  // 3. Check for expiration (5 minutes constraint)
  if (Date.now() > entry.expiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new 6-digit OTP." };
  }

  // 4. Match check
  if (entry.otp !== userEnteredOtp.trim()) {
    return { success: false, error: "Incorrect verification code. Access denied." };
  }

  return { success: true };
}
