import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Secure Admin Email configured (supports single or comma-separated emails, e.g. "admin@domain.com,gloria@gmail.com")
export const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || "")
  .toLowerCase()
  .split(",")
  .map(email => email.trim())
  .filter(email => email !== "");

/**
 * Validate if an email has administrative privileges
 */
export function isAdminEmail(email: string): boolean {
  if (ADMIN_EMAILS.length === 0) {
    console.error("[OTP Config Error] ADMIN_EMAIL is not configured in your environment variables (.env). Administrative login cannot proceed.");
    return false;
  }
  const lower = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(lower);
}

// Lazy initializer for Resend client to prevent crashes if key is initially absent
let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is required to send emails via Resend.");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

/**
 * Dynamically determine the Resend From address by checking verified domains
 */
export async function getResendFromAddress(): Promise<string> {
  // 1. Explicitly configured RESEND_FROM environment variable
  if (process.env.RESEND_FROM?.trim()) {
    return process.env.RESEND_FROM.trim();
  }

  // 2. Query Resend account at runtime to automatically detect verified custom domains
  try {
    const resend = getResendClient();
    console.log("[Resend Dynamic] Querying Resend API for verified domains...");
    const domainsResponse = await resend.domains.list();
    
    let domainsList: any[] = [];
    if (domainsResponse) {
      if (Array.isArray(domainsResponse)) {
        domainsList = domainsResponse;
      } else if (domainsResponse.data && Array.isArray(domainsResponse.data)) {
        domainsList = domainsResponse.data;
      } else if (typeof domainsResponse === "object") {
        // Look for any property on the object that contains an array
        for (const val of Object.values(domainsResponse)) {
          if (Array.isArray(val)) {
            domainsList = val;
            break;
          }
        }
      }
    }

    if (domainsList && domainsList.length > 0) {
      console.log("[Resend Dynamic] Domains registered in your Resend account:", JSON.stringify(domainsList));
      
      // Filter for verified, active, or true verified domains
      const verifiedDomains = domainsList.filter(
        (d: any) => d && (d.status === "verified" || d.status === "active" || d.verified === true)
      );

      if (verifiedDomains.length > 0) {
        const d = verifiedDomains[0];
        const domainName = d.name || d.domain;
        if (domainName) {
          console.log(`[Resend Dynamic] Automatically selected verified domain: ${domainName}`);
          return `no-reply@${domainName}`;
        }
      } else {
        // Fallback to the first domain in the registered list if none are strictly marked verified
        const d = domainsList[0];
        const domainName = d.name || d.domain;
        if (domainName) {
          console.log(`[Resend Dynamic] No verified status domains found, using first registered domain: ${domainName}`);
          return `no-reply@${domainName}`;
        }
      }
    }
  } catch (err: any) {
    console.warn("[Resend Dynamic] Warning: Failed to fetch domains list from Resend API (restricted API key might lack domains:list access):", err.message || err);
  }

  // 3. Fallback to checking if any of the configured ADMIN_EMAILS has a custom domain
  const genericDomains = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
    "icloud.com", "aol.com", "zoho.com", "mail.com", "yandex.com",
    "proton.me", "protonmail.com", "gmx.com", "mail.ru"
  ];

  for (const email of ADMIN_EMAILS) {
    const domain = email.split("@")[1];
    if (domain && !genericDomains.includes(domain)) {
      console.log(`[Resend Dynamic] Automatically selected sender from admin domain list: no-reply@${domain}`);
      return `no-reply@${domain}`;
    }
  }

  // 4. Absolute fallback to Resend's default sandbox sender
  console.log("[Resend Dynamic] No verified domains detected in Resend account or admin list. Falling back to default onboarding@resend.dev");
  return "onboarding@resend.dev";
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
 * Send OTP via Resend
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; error?: string }> {
  // Enforce lowercase
  const targetEmail = toEmail.toLowerCase().trim();

  // 1. Verify Resend configurations are set
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    const errMsg = "RESEND_API_KEY is missing in environment variables (.env)";
    console.error(`[OTP Error] ${errMsg}`);
    
    // Developer fallback log so testing isn't blocked on incomplete configurations
    console.log(`\n======================================================`);
    console.log(`[DEVELOPER NOTICE] Admin OTP requested for: ${targetEmail}`);
    console.log(`OTP Code: ${otpCode} (Expires in 5 minutes)`);
    console.log(`======================================================\n`);
    
    return { 
      success: false, 
      error: "Resend API Key is not configured. If in development, check your server console log." 
    };
  }

  try {
    const fromAddress = await getResendFromAddress();
    console.log(`[Resend Debug] Preparing email via Resend:`);
    console.log(`  From Header: ${fromAddress}`);
    console.log(`  To Recipient: ${targetEmail}`);

    const resend = getResendClient();
    const currentYear = new Date().getFullYear();

    const fromHeader = fromAddress.includes("<") ? fromAddress : `"Oluwashola Atelier" <${fromAddress}>`;

    // 2. Define html template
    const textContent = `Hello,\n\nYou requested a one-time verification code to access the Oluwashola Atelier administrative panel. Please enter this code to securely complete your login:\n\n${otpCode}\n\nThis verification code is valid for 5 minutes. It can only be used once.\n\nIf you did not make this request, please ignore this email.\n\nBest regards,\nOluwashola Atelier`;
    
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; padding: 48px 16px; color: #292524; line-height: 1.5; -webkit-font-smoothing: antialiased;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f5f5f4;">
                <span style="font-size: 16px; font-weight: 600; letter-spacing: 0.15em; color: #1c1917; text-transform: uppercase;">
                  OLUWASHOLA ATELIER
                </span>
              </td>
            </tr>
            <!-- Content Body -->
            <tr>
              <td style="padding: 32px;">
                <p style="font-size: 14px; color: #44403c; margin: 0 0 16px 0;">
                  Hello,
                </p>
                <p style="font-size: 14px; color: #44403c; margin: 0 0 24px 0; line-height: 1.6;">
                  You requested a one-time verification code to access the Oluwashola Atelier administrative panel. Please enter this code to securely complete your login:
                </p>
                
                <!-- OTP Display Card -->
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                  <tr>
                    <td align="center" style="background-color: #f5f5f4; border: 1px solid #e7e5e4; padding: 18px; border-radius: 8px;">
                      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 700; letter-spacing: 0.25em; color: #b45309; text-align: center; display: inline-block; padding-left: 0.25em;">
                        ${otpCode}
                      </span>
                    </td>
                  </tr>
                </table>
                
                <p style="font-size: 12px; color: #78716c; margin: 24px 0 0 0; line-height: 1.6;">
                  ⌛ This verification code is valid for <strong>5 minutes</strong>. It can only be used once.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 32px; background-color: #fafaf9; border-top: 1px solid #f5f5f4; text-align: center;">
                <p style="font-size: 11px; color: #a8a29e; margin: 0 0 8px 0; line-height: 1.5;">
                  If you did not make this request, please ignore this email. No action is required to keep your account secure.
                </p>
                <p style="font-size: 10px; color: #c2c1be; margin: 12px 0 0 0; letter-spacing: 0.05em; text-transform: uppercase;">
                  Oluwashola Atelier &copy; ${currentYear}
                </p>
              </td>
            </tr>
          </table>
        </div>
      `;

    // 3. Dispatch email using Resend
    const response = await resend.emails.send({
      from: fromHeader,
      to: targetEmail,
      subject: `Oluwashola Atelier verification code: ${otpCode}`,
      text: textContent,
      html: htmlContent,
    });

    if (response.error) {
      throw new Error(response.error.message || JSON.stringify(response.error));
    }

    console.log(`[Resend OTP Sent] Code successfully dispatched to ${targetEmail}. Message ID: ${response.data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Resend Transmission Error] Failed to send OTP to ${targetEmail}:`, err);
    
    // Fallback log for development/troubleshooting so developer gets the code
    console.log(`\n======================================================`);
    console.log(`[DEVELOPER BACKUP LOG] Failed to send Resend mail to ${targetEmail}`);
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
