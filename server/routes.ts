import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";
import { rephraseAnswers, generateBusinessPlan, generateMeetingQuestions, generateMentorDraftResponse } from "./aiService";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";

let supabase: ReturnType<typeof createClient> | null = null;
async function getResendClient(): Promise<{ client: Resend; fromEmail: string } | null> {
  try {
    if (process.env.RESEND_API_KEY) {
      console.log("[RESEND] Using RESEND_API_KEY environment variable");
      return {
        client: new Resend(process.env.RESEND_API_KEY),
        fromEmail: process.env.RESEND_FROM_EMAIL || "hello@touchconnectpro.com"
      };
    }

    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken || !hostname) {
      console.log("[RESEND] No RESEND_API_KEY and no Replit connector available");
      return null;
    }

    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    if (!response.ok) {
      console.log("[RESEND] Failed to fetch connection settings, status:", response.status);
      return null;
    }

    const connections = await response.json();
    const connectionSettings = connections?.items?.[0];

    if (!connectionSettings?.settings?.api_key) {
      console.log("[RESEND] No API key found in connection settings");
      return null;
    }

    console.log("[RESEND] Using Replit connector, from:", connectionSettings.settings.from_email);
    return {
      client: new Resend(connectionSettings.settings.api_key),
      fromEmail: connectionSettings.settings.from_email || "hello@touchconnectpro.com"
    };
  } catch (error) {
    console.error("[RESEND] Error getting client:", error);
    return null;
  }
}

async function createPasswordToken(email: string, userType: string, applicationId: string) {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) return null;
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await (supabaseClient
    .from("password_tokens")
    .insert({
      email,
      token,
      user_type: userType,
      application_id: applicationId,
      status: "pending",
      expires_at: expiresAt.toISOString()
    })
    .select() as any);

  if (error) {
    console.error("[TOKEN ERROR]:", error);
    return null;
  }

  return token;
}

async function sendPaymentWelcomeEmail(email: string, fullName: string) {
  console.log("[PAYMENT EMAIL] Sending welcome email to:", email);
  
  const resendData = await getResendClient();
  
  if (!resendData) {
    console.log("[PAYMENT EMAIL] Resend not configured, skipping email for:", email);
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://touchconnectpro.com");
  
  const subject = "Welcome to TouchConnectPro - Your Membership is Active!";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${fullName}!</h1>
        </div>
        <div class="content">
          <p>Congratulations! Your payment has been confirmed and your TouchConnectPro membership is now <strong style="color: #10b981;">active</strong>!</p>
          
          <div class="highlight-box">
            <p style="margin: 0;"><strong>What's Next:</strong> A mentor will be assigned to you shortly. You'll receive a notification once your mentor is ready to connect with you.</p>
          </div>
          
          <p>You now have full access to your entrepreneur dashboard where you can:</p>
          <ul>
            <li>View and refine your business plan</li>
            <li>Connect with your assigned mentor</li>
            <li>Access exclusive resources and tools</li>
            <li>Track your progress on your entrepreneurial journey</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${FRONTEND_URL}/login" class="button">Go to Your Dashboard</a>
          </p>
          
          <p>We're excited to support you on your journey to building a fundable business!</p>
          
          <p>Best regards,<br>The TouchConnectPro Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: htmlContent
    });
    
    console.log("[PAYMENT EMAIL] Success! To:", email, "MessageID:", result.id);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("[PAYMENT EMAIL] Failed to send:", error.message);
    return { success: false, error: error.message };
  }
}

async function sendStatusEmail(email: string, fullName: string, userType: string, status: string, applicationId: string, wasPreApproved: boolean = false) {
  console.log("[EMAIL] Starting email send process for:", email, "userType:", userType, "status:", status, "wasPreApproved:", wasPreApproved);
  
  const resendData = await getResendClient();
  
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping email for:", email);
    console.log("[EMAIL] RESEND_API_KEY present?", !!process.env.RESEND_API_KEY);
    console.log("[EMAIL] REPLIT_CONNECTORS_HOSTNAME present?", !!process.env.REPLIT_CONNECTORS_HOSTNAME);
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  console.log("[EMAIL] Using fromEmail:", fromEmail);
  
  const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://touchconnectpro.com");
  
  let subject, htmlContent;
  
  if (status === "approved") {
    // For entrepreneurs who were pre-approved, they already have a login - don't ask them to set password again
    if (userType === "entrepreneur" && wasPreApproved) {
      subject = `Congratulations! Your TouchConnectPro Membership is Now Active!`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .highlight-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Congratulations, ${fullName}!</h1>
            </div>
            <div class="content">
              <p>Great news! Your membership to TouchConnectPro has been <strong style="color: #10b981;">fully activated</strong>!</p>
              
              <p>You're now an official member of our exclusive community connecting entrepreneurs with mentors, coaches, and investors.</p>
              
              <div class="highlight-box">
                <p style="margin: 0;"><strong>What's Next:</strong> A mentor will be assigned to you soon to help guide your entrepreneurial journey. You'll receive a notification when your mentor is ready to connect with you.</p>
              </div>
              
              <p>In the meantime, you have full access to your dashboard where you can:</p>
              <ul>
                <li>View and update your business plan</li>
                <li>Explore our coach marketplace</li>
                <li>Prepare for your upcoming mentor sessions</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${FRONTEND_URL}/login" class="button">Go to Your Dashboard</a>
              </p>
              
              <p>We're excited to support your entrepreneurial journey!</p>
              
              <p>Best regards,<br>The TouchConnectPro Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // For other user types or direct approvals (not pre-approved first), ask them to set password
      const token = await createPasswordToken(email, userType, applicationId);
      
      if (!token) {
        console.error("[EMAIL] Failed to create password token for:", email);
        return { success: false, reason: "Failed to create password token" };
      }
      
      const setPasswordUrl = `${FRONTEND_URL}/set-password?token=${token}`;
      
      subject = `Welcome to TouchConnectPro - Your ${userType.charAt(0).toUpperCase() + userType.slice(1)} Application is Approved!`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Congratulations, ${fullName}!</h1>
            </div>
            <div class="content">
              <p>Great news! Your application to join TouchConnectPro as a <strong>${userType}</strong> has been <strong style="color: #10b981;">approved</strong>!</p>
              
              <p>You're now part of our exclusive community connecting entrepreneurs with mentors, coaches, and investors.</p>
              
              <p>To access your dashboard, please set up your password by clicking the button below:</p>
              
              <p style="text-align: center;">
                <a href="${setPasswordUrl}" class="button">Set Up Your Password</a>
              </p>
              
              <p style="font-size: 14px; color: #64748b;">This link will expire in 7 days. If you didn't apply to TouchConnectPro, please ignore this email.</p>
              
              <p>We're excited to have you on board!</p>
              
              <p>Best regards,<br>The TouchConnectPro Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  } else if (status === "pre-approved") {
    const token = await createPasswordToken(email, userType, applicationId);
    
    if (!token) {
      console.error("[EMAIL] Failed to create password token for:", email);
      return { success: false, reason: "Failed to create password token" };
    }
    
    const setPasswordUrl = `${FRONTEND_URL}/set-password?token=${token}`;
    
    subject = `TouchConnectPro - Your Application is Pre-Approved! Complete Your Membership`;
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .highlight-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Great News, ${fullName}!</h1>
          </div>
          <div class="content">
            <p>Your application to join TouchConnectPro as an <strong>entrepreneur</strong> has been <strong style="color: #f59e0b;">pre-approved</strong>!</p>
            
            <div class="highlight-box">
              <p style="margin: 0;"><strong>Next Step:</strong> Complete your membership payment to unlock full access to your dashboard and connect with mentors.</p>
            </div>
            
            <p>In the meantime, you can access your dashboard in <strong>view-only mode</strong> to review your application and business plan.</p>
            
            <p>To access your dashboard, please set up your password by clicking the button below:</p>
            
            <p style="text-align: center;">
              <a href="${setPasswordUrl}" class="button">Set Up Your Password</a>
            </p>
            
            <p style="font-size: 14px; color: #64748b;">This link will expire in 7 days. If you didn't apply to TouchConnectPro, please ignore this email.</p>
            
            <p>Once you complete your membership payment, your account will be fully activated and you'll have access to all platform features.</p>
            
            <p>Best regards,<br>The TouchConnectPro Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    subject = `TouchConnectPro - Application Update`;
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #64748b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
          </div>
          <div class="content">
            <p>Dear ${fullName},</p>
            
            <p>Thank you for your interest in joining TouchConnectPro as a <strong>${userType}</strong>.</p>
            
            <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
            
            <p>This decision doesn't reflect on your qualifications or potential. We encourage you to continue building your expertise and consider reapplying in the future.</p>
            
            <p>If you have any questions, please feel free to reach out to our team.</p>
            
            <p>Best regards,<br>The TouchConnectPro Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  try {
    console.log("[EMAIL SEND] Attempting to send from:", fromEmail, "to:", email);
    const result = await client.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: htmlContent
    });
    
    console.log("[EMAIL SENT] Success! To:", email, "Status:", status, "MessageID:", result.id);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("[EMAIL ERROR] Failed to send:", {
      to: email,
      from: fromEmail,
      status: status,
      errorMessage: error.message,
      errorCode: error.code,
      fullError: error
    });
    return { success: false, error: error.message };
  }
}

function getSupabaseClient() {
  try {
    if (supabase) return supabase;
    
    const supabaseUrl = "https://mfkxbjtrxwajlyxnxzdn.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("[Supabase] URL:", supabaseUrl ? "✓" : "✗");
    console.log("[Supabase] Key present:", supabaseServiceKey ? "✓" : "✗");
    console.log("[Supabase] Key length:", supabaseServiceKey?.length);
    console.log("[Supabase] Key starts with:", supabaseServiceKey?.substring(0, 10));
    console.log("[Supabase] Key ends with:", supabaseServiceKey?.substring(-20));
    
    // Check if it's the anon key (shorter) vs service role key (longer)
    // Service role keys are typically ~200+ chars, anon keys are shorter
    if (supabaseServiceKey && supabaseServiceKey.length < 200) {
      console.error("[Supabase] WARNING: Key seems too short for service role key!");
    }
    
    if (!supabaseServiceKey) {
      console.error("[Supabase] MISSING SERVICE ROLE KEY!");
      return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[Supabase] ✓ Client initialized");
    return supabase;
  } catch (err: any) {
    console.error("[Supabase] Init failed:", err.message);
    return null;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/test-resend", async (_req, res) => {
    try {
      const resendData = await getResendClient();
      if (!resendData) {
        return res.json({ status: "error", message: "Resend not configured - no API key or connector available" });
      }
      const { client, fromEmail } = resendData;
      const result = await client.emails.send({
        from: fromEmail,
        to: "buhler.lionel@gmail.com",
        subject: "TouchConnectPro - Email Test",
        html: "<p>This is a test email from TouchConnectPro to verify Resend is working correctly.</p><p>Sent at: " + new Date().toISOString() + "</p>"
      });
      console.log("[RESEND TEST] Result:", JSON.stringify(result));
      return res.json({ status: "ok", fromEmail, result });
    } catch (error: any) {
      console.error("[RESEND TEST] Error:", error);
      return res.json({ status: "error", message: error.message });
    }
  });

  // Config endpoint - serves Supabase credentials to frontend
  app.get("/api/config", (_req, res) => {
    // Prefer VITE_ prefixed vars (shared env), fallback to secrets, then hardcoded
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://mfkxbjtrxwajlyxnxzdn.supabase.co";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    
    console.log("[CONFIG] Serving Supabase URL:", supabaseUrl ? "yes" : "no");
    console.log("[CONFIG] Serving Supabase anon key:", supabaseAnonKey ? "yes" : "no");
    
    return res.json({
      supabaseUrl,
      supabaseAnonKey,
    });
  });

  // Notify admin when someone completes Founder Focus quiz without registering
  app.post("/api/founder-focus-completed", async (req, res) => {
    console.log("[FOUNDER FOCUS] Quiz completed notification received");
    try {
      const { scores, overallScore, topBlocker, track, trackLabel } = req.body;

      const resendData = await getResendClient();
      if (resendData) {
        const { client, fromEmail } = resendData;
        const categoryBreakdown = scores
          ? Object.entries(scores).map(([cat, score]) => `${cat}: ${score}/10`).join(", ")
          : "N/A";

        await client.emails.send({
          from: fromEmail,
          to: ADMIN_EMAIL,
          subject: `Founder Focus Score Completed — ${trackLabel || "Unknown Track"} (Unregistered)`,
          html: `
            <h2>New Founder Focus Score Completion</h2>
            <p>A visitor has completed all 8 questions on the Founder Focus Score page <strong>without registering</strong>.</p>
            <hr />
            <p><strong>Profile Track:</strong> ${trackLabel || "N/A"} (${track || "N/A"})</p>
            <p><strong>Overall Score:</strong> ${overallScore || "N/A"}/10</p>
            <p><strong>Category Scores:</strong> ${categoryBreakdown}</p>
            <p><strong>Top Blocker:</strong> ${topBlocker || "N/A"}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">This visitor may be interested in joining. Consider follow-up if they register later.</p>
          `,
        });
        console.log("[FOUNDER FOCUS] Admin notification email sent");
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("[FOUNDER FOCUS] Error sending notification:", error);
      return res.json({ success: true });
    }
  });

  // BYPASS TEST - minimal test endpoint
  app.get("/api/bypass-test", (_req, res) => {
    console.log("[BYPASS TEST] Endpoint hit, sending response...");
    return res.json({ test: "bypass", timestamp: Date.now() });
  });

  // ============================================
  // SEO ENDPOINTS
  // ============================================

  // Dynamic sitemap.xml
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = "https://www.touchconnectpro.com";
      const today = new Date().toISOString().split('T')[0];
      
      // Static pages
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/coaches", priority: "0.9", changefreq: "daily" },
        { url: "/mentors", priority: "0.9", changefreq: "daily" },
        { url: "/login", priority: "0.5", changefreq: "monthly" },
        { url: "/signup", priority: "0.6", changefreq: "monthly" },
        { url: "/apply/entrepreneur", priority: "0.8", changefreq: "monthly" },
        { url: "/apply/mentor", priority: "0.7", changefreq: "monthly" },
        { url: "/apply/coach", priority: "0.7", changefreq: "monthly" },
        { url: "/apply/investor", priority: "0.7", changefreq: "monthly" },
        { url: "/insights", priority: "0.9", changefreq: "weekly" },
        { url: "/insights/business-idea-no-roadmap", priority: "0.8", changefreq: "monthly" },
        { url: "/insights/startup-roadmap-without-overthinking", priority: "0.8", changefreq: "monthly" },
        { url: "/insights/experienced-guidance-for-founders", priority: "0.8", changefreq: "monthly" },
        { url: "/insights/prepare-startup-for-launch", priority: "0.8", changefreq: "monthly" },
        { url: "/insights/when-to-scale-startup", priority: "0.8", changefreq: "monthly" },
        { url: "/founder-focus", priority: "0.8", changefreq: "monthly" },
      ];

      let urls = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('');

      // Dynamic mentor/coach pages from database
      const client = getSupabaseClient();
      if (client) {
        // Fetch approved mentors
        const { data: mentors } = await (client
          .from("mentor_applications")
          .select("id, full_name")
          .eq("status", "approved") as any);
        
        if (mentors) {
          mentors.forEach((mentor: any) => {
            const slug = mentor.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            urls += `
    <url>
      <loc>${baseUrl}/mentors/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
          });
        }

        // Fetch approved coaches
        const { data: coaches } = await (client
          .from("coach_applications")
          .select("id, full_name")
          .eq("status", "approved") as any);
        
        if (coaches) {
          coaches.forEach((coach: any) => {
            const slug = coach.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            urls += `
    <url>
      <loc>${baseUrl}/coaches/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
          });
        }
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

      res.header("Content-Type", "application/xml");
      return res.send(sitemap);
    } catch (error: any) {
      console.error("[SITEMAP] Error:", error.message);
      return res.status(500).send("Error generating sitemap");
    }
  });

  // JSON-LD structured data for mentor profile
  app.get("/api/seo/mentor-schema/:mentorId", async (req, res) => {
    try {
      const { mentorId } = req.params;
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data: mentor, error } = await (client
        .from("mentor_applications")
        .select("*")
        .eq("id", mentorId)
        .single() as any);

      if (error || !mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }

      const slug = mentor.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": mentor.full_name,
        "jobTitle": `${mentor.specialty || 'Startup'} Mentor for Startups`,
        "worksFor": {
          "@type": "Organization",
          "name": "TouchConnectPro"
        },
        "url": `https://www.touchconnectpro.com/mentors/${slug}`,
        "description": `Connect with ${mentor.full_name}, an experienced ${mentor.specialty || 'startup'} mentor helping startup founders grow their businesses.`
      };

      return res.json(schema);
    } catch (error: any) {
      console.error("[SEO MENTOR SCHEMA] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // JSON-LD structured data for coach profile
  app.get("/api/seo/coach-schema/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data: coach, error } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .single() as any);

      if (error || !coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      const slug = coach.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": coach.full_name,
        "jobTitle": `${coach.specialty || 'Business'} Coach for Startups`,
        "worksFor": {
          "@type": "Organization",
          "name": "TouchConnectPro"
        },
        "url": `https://www.touchconnectpro.com/coaches/${slug}`,
        "description": `Connect with ${coach.full_name}, an experienced ${coach.specialty || 'business'} coach helping startup founders grow their businesses.`
      };

      return res.json(schema);
    } catch (error: any) {
      console.error("[SEO COACH SCHEMA] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Organization schema for homepage
  app.get("/api/seo/organization-schema", (_req, res) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TouchConnectPro",
      "url": "https://www.touchconnectpro.com",
      "logo": "https://www.touchconnectpro.com/assets/logo.png",
      "description": "Online mentorship platform connecting startup founders with experienced mentors, coaches, and investors.",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "hello@touchconnectpro.com"
      }
    };
    return res.json(schema);
  });

  // AI: Rephrase entrepreneur answers
  app.post("/api/ai/rephrase", async (req, res) => {
    console.log("[AI REPHRASE] Processing request...");
    try {
      const { answers } = req.body;
      
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      const result = await rephraseAnswers({ answers });
      console.log("[AI REPHRASE] Success - processed", Object.keys(result.answers).length, "answers");
      return res.json(result);
    } catch (error: any) {
      console.error("[AI REPHRASE ERROR]:", error.message);
      return res.status(500).json({ error: "Failed to process answers with AI" });
    }
  });

  // AI: Generate business plan from answers
  app.post("/api/ai/generate-plan", async (req, res) => {
    console.log("[AI GENERATE PLAN] Processing request...");
    try {
      const { answers } = req.body;
      
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      const result = await generateBusinessPlan({ answers });
      console.log("[AI GENERATE PLAN] Success - generated business plan");
      return res.json(result);
    } catch (error: any) {
      console.error("[AI GENERATE PLAN ERROR]:", error.message);
      return res.status(500).json({ error: "Failed to generate business plan with AI" });
    }
  });

  // AI: Generate meeting questions from business plan (Admin only)
  app.post("/api/ai/generate-questions", async (req, res) => {
    console.log("[AI GENERATE QUESTIONS] Processing request...");
    try {
      const { entrepreneurId } = req.body;
      
      if (!entrepreneurId) {
        return res.status(400).json({ error: "entrepreneurId is required" });
      }

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Fetch entrepreneur data
      const { data: entrepreneur, error: fetchError } = await (client
        .from("ideas")
        .select("*")
        .eq("id", entrepreneurId)
        .single() as any);

      if (fetchError || !entrepreneur) {
        console.error("[AI GENERATE QUESTIONS] Entrepreneur not found:", fetchError);
        return res.status(404).json({ error: "Entrepreneur not found" });
      }

      const businessPlan = entrepreneur.business_plan;
      if (!businessPlan || Object.keys(businessPlan).length === 0) {
        return res.status(400).json({ error: "Entrepreneur has no business plan to analyze" });
      }

      const fullBio = entrepreneur.data?.fullBio || entrepreneur.data?.bio || "";
      const ideaName = entrepreneur.data?.ideaName || entrepreneur.idea_name || "";

      // Generate questions using AI
      const questions = await generateMeetingQuestions({
        businessPlan,
        fullBio,
        ideaName
      });

      console.log("[AI GENERATE QUESTIONS] Generated questions for:", entrepreneurId);

      // Save questions to the database
      const updatedData = {
        ...entrepreneur.data,
        meetingQuestions: questions,
        meetingQuestionsGeneratedAt: new Date().toISOString()
      };

      const { error: updateError } = await (client
        .from("ideas")
        .update({ data: updatedData } as any)
        .eq("id", entrepreneurId) as any);

      if (updateError) {
        console.error("[AI GENERATE QUESTIONS] Failed to save:", updateError);
        return res.status(500).json({ error: "Failed to save generated questions" });
      }

      console.log("[AI GENERATE QUESTIONS] Saved questions for:", entrepreneurId);
      return res.json({ success: true, questions });
    } catch (error: any) {
      console.error("[AI GENERATE QUESTIONS ERROR]:", error.message);
      return res.status(500).json({ error: "Failed to generate questions with AI" });
    }
  });

  // Save entrepreneur idea submission
  app.post("/api/ideas", async (req, res) => {
    console.log("[POST /api/ideas] Called");
    console.log("[Incoming payload]:", JSON.stringify(req.body));
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.error("[ERROR] Supabase client not available");
        console.error("[ENV] SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
        console.error("[ENV] SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING");
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fullName, email, ideaName, businessPlan, ideaReview, linkedinWebsite, formData } = req.body;

      if (!email || !fullName) {
        console.error("[VALIDATION] Missing required fields: email or fullName");
        return res.status(400).json({ error: "Name and email required" });
      }

      // Check if there's an existing application with this email
      const { data: existingApp } = await (client
        .from("ideas")
        .select("id, status")
        .eq("entrepreneur_email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (existingApp && existingApp.length > 0) {
        const existing = existingApp[0];
        
        if (existing.status === "approved") {
          return res.status(400).json({ error: "You already have an approved application. Please login to access your dashboard." });
        }
        
        if (existing.status === "pending" || existing.status === "submitted") {
          return res.status(400).json({ error: "You already have a pending application. Please wait for admin review." });
        }
        
        // If rejected or pre-approved (Community Free), update the existing record
        if (existing.status === "rejected" || existing.status === "pre-approved") {
          console.log("[UPDATE] Updating", existing.status, "entrepreneur application for:", email);
          const existingData = existing.status === "pre-approved" ? (await (client.from("ideas").select("data").eq("id", existing.id).single() as any))?.data?.data : {};
          const mergedData = { ...(existingData || {}), ...(formData || {}) };
          const { data, error } = await (client
            .from("ideas")
            .update({
              entrepreneur_name: fullName,
              data: mergedData,
              business_plan: businessPlan || {},
              linkedin_profile: linkedinWebsite || "",
              status: "pre-approved"
            } as any)
            .eq("id", existing.id)
            .select() as any);

          if (error) {
            console.error("[DB ERROR]:", error);
            return res.status(400).json({ error: error.message });
          }

          console.log("[SUCCESS] Entrepreneur application updated");

          // Send confirmation email to user and notify admin for resubmission
          const emailIdeaName = ideaName || formData?.ideaName || "their business idea";
          try {
            const resendData = await getResendClient();
            if (resendData) {
              const { client: resendClient, fromEmail } = resendData;
              await resendClient.emails.send({
                from: fromEmail,
                to: email,
                subject: "Idea Submission Received - TouchConnectPro",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0ea5e9;">Your Idea Has Been Submitted!</h2>
                    <p>Hi ${fullName},</p>
                    <p>Thank you for submitting your business idea${emailIdeaName !== "their business idea" ? ` "<strong>${emailIdeaName}</strong>"` : ""} to TouchConnectPro.</p>
                    <p>Our team will review your submission and get back to you shortly. You'll receive an email once your application has been reviewed.</p>
                    <p><a href="https://touchconnectpro.com/login" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Log In to Your Dashboard</a></p>
                    <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
                  </div>
                `
              });
              console.log("[POST /api/ideas] Confirmation email sent to:", email);

              await resendClient.emails.send({
                from: fromEmail,
                to: ADMIN_EMAIL,
                subject: `Idea Resubmission: ${fullName} - ${emailIdeaName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0ea5e9;">Updated Idea Submission</h2>
                    <p>An entrepreneur has resubmitted their business idea.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                      <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${fullName}</td></tr>
                      <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
                      <tr><td style="padding: 8px; font-weight: bold;">Idea</td><td style="padding: 8px;">${emailIdeaName}</td></tr>
                    </table>
                    <p><a href="https://touchconnectpro.com/admin-dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Review in Admin Dashboard</a></p>
                    <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
                  </div>
                `
              });
              console.log("[POST /api/ideas] Admin notification sent for resubmission from:", email);
            }
          } catch (emailErr) {
            console.error("[POST /api/ideas] Email error (non-blocking):", emailErr);
          }

          return res.json({ success: true, id: data?.[0]?.id, resubmission: true });
        }
      }

      console.log("[INSERT] Saving new entry to ideas table for:", email);
      const { data, error } = await (client
        .from("ideas")
        .insert({
          status: "submitted",
          entrepreneur_email: email,
          entrepreneur_name: fullName,
          data: formData || {},
          business_plan: businessPlan || {},
          linkedin_profile: linkedinWebsite || "",
          user_id: null,
        } as any)
        .select() as any);

      console.log("[INSERT RESPONSE]:", { data, error });

      if (error) {
        console.error("[DB ERROR]:", error);
        console.error("[DB ERROR DETAILS]:", JSON.stringify(error));
        return res.status(400).json({ error: error.message });
      }

      console.log("[SUCCESS] Project saved, returning:", JSON.stringify({ success: true, id: data?.[0]?.id }));

      // Send confirmation email to applicant and notify admin
      const emailIdeaName2 = ideaName || formData?.ideaName || "their business idea";
      try {
        const resendData = await getResendClient();
        if (resendData) {
          const { client: resendClient, fromEmail } = resendData;
          await resendClient.emails.send({
            from: fromEmail,
            to: email,
            subject: "Application Received - TouchConnectPro Entrepreneur",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0ea5e9;">Application Received!</h2>
                <p>Hi ${fullName},</p>
                <p>Thank you for submitting your application to join TouchConnectPro as an <strong>Entrepreneur</strong>${emailIdeaName2 !== "their business idea" ? ` for "<strong>${emailIdeaName2}</strong>"` : ""}.</p>
                <p>Our team will review your submission and get back to you shortly. You'll receive an email once your application has been reviewed.</p>
                <p>In the meantime, feel free to explore our resources and community.</p>
                <p><a href="https://touchconnectpro.com" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Visit TouchConnectPro</a></p>
                <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
              </div>
            `
          });
          console.log("[POST /api/ideas] Confirmation email sent to:", email);

          await resendClient.emails.send({
            from: fromEmail,
            to: ADMIN_EMAIL,
            subject: `New Entrepreneur Application: ${fullName} - ${emailIdeaName2}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0ea5e9;">New Entrepreneur Application</h2>
                <p>A new entrepreneur has submitted their business idea for review.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${fullName}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Idea</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${emailIdeaName2}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Application ID</td><td style="padding: 8px;">${data?.[0]?.id || 'N/A'}</td></tr>
                </table>
                <p><a href="https://touchconnectpro.com/admin-dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Review in Admin Dashboard</a></p>
                <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
              </div>
            `
          });
          console.log("[POST /api/ideas] Admin notification sent for new application from:", email);
        }
      } catch (emailErr) {
        console.error("[POST /api/ideas] Email error (non-blocking):", emailErr);
      }

      return res.json({ success: true, id: data?.[0]?.id });
    } catch (error: any) {
      console.error("[EXCEPTION]:", error);
      return res.status(500).json({ error: error.message || "Server error" });
    }
  });

  // Get all ideas (for admin)
  app.get("/api/ideas", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await client
        .from("ideas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Approve/reject/pre-approve idea
  app.patch("/api/ideas/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Get entrepreneur email, name, and current status before updating
      const { data: existingData, error: fetchError } = await (client
        .from("ideas")
        .select("entrepreneur_email, entrepreneur_name, status")
        .eq("id", id)
        .single() as any);

      if (fetchError) {
        return res.status(400).json({ error: fetchError.message });
      }

      const previousStatus = existingData.status;

      const { data, error } = await (client
        .from("ideas")
        .update({ status } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Send status email - pass wasPreApproved so approved entrepreneurs don't get password setup prompt again
      const wasPreApproved = previousStatus === "pre-approved";
      const emailResult = await sendStatusEmail(
        existingData.entrepreneur_email,
        existingData.entrepreneur_name,
        "entrepreneur",
        status,
        id,
        wasPreApproved
      );

      return res.json({ success: true, idea: data?.[0], emailSent: emailResult.success });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle entrepreneur disabled status
  app.patch("/api/ideas/:id/toggle-disabled", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      
      // First get current state
      const { data: current, error: getError } = await (client
        .from("ideas")
        .select("is_disabled")
        .eq("id", id)
        .single() as any);

      if (getError) {
        return res.status(400).json({ error: getError.message });
      }

      const newState = !current?.is_disabled;
      
      const { data, error } = await (client
        .from("ideas")
        .update({ is_disabled: newState } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, is_disabled: newState, idea: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update entrepreneur profile by email
  app.put("/api/entrepreneurs/profile/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      const { fullName, country, bio, linkedIn, website, profileImage } = req.body;

      console.log("[PUT /api/entrepreneurs/profile/:email] Updating profile for:", decodedEmail);

      // First fetch the current data to merge with updates
      const { data: currentData, error: fetchError } = await (client
        .from("ideas")
        .select("data")
        .eq("entrepreneur_email", decodedEmail)
        .single() as any);

      if (fetchError) {
        console.error("[PUT /api/entrepreneurs/profile/:email] Fetch error:", fetchError);
        return res.status(400).json({ error: fetchError.message });
      }

      // Merge the profile updates into the existing data object
      // linkedIn = LinkedIn profile URL (stored in linkedin_profile column)
      // website = personal/business website (stored in data.website field)
      // bio is saved to both bio and fullBio for consistency (fullBio was used in original application)
      const updatedData = {
        ...currentData?.data,
        fullName: fullName,
        country: country,
        bio: bio || "",
        fullBio: bio || "",
        website: website || currentData?.data?.website || "",
        profileImage: profileImage || currentData?.data?.profileImage || ""
      };

      // Update the ideas table with merged data
      const { data, error } = await (client
        .from("ideas")
        .update({
          entrepreneur_name: fullName,
          linkedin_profile: linkedIn || "",
          data: updatedData
        } as any)
        .eq("entrepreneur_email", decodedEmail)
        .select() as any);

      if (error) {
        console.error("[PUT /api/entrepreneurs/profile/:email] Update error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, entrepreneur: data?.[0] });
    } catch (error: any) {
      console.error("[PUT /api/entrepreneurs/profile/:email] Exception:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Save mentor application
  app.post("/api/mentors", async (req, res) => {
    console.log("[POST /api/mentors] Called");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fullName, email, linkedin, bio, expertise, experience, country, state } = req.body;

      if (!email || !fullName || !bio || !expertise || !experience || !country) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("[INSERT] Saving mentor application for:", email);
      const { data, error } = await (client
        .from("mentor_applications")
        .insert({
          full_name: fullName,
          email,
          linkedin: linkedin || null,
          bio,
          expertise,
          experience,
          country,
          state: state || null,
          status: "submitted"
        } as any)
        .select() as any);

      if (error) {
        console.error("[DB ERROR]:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[SUCCESS] Mentor application saved");
      return res.json({ success: true, id: data?.[0]?.id });
    } catch (error: any) {
      console.error("[EXCEPTION]:", error);
      return res.status(500).json({ error: error.message || "Server error" });
    }
  });

  // Get all mentor applications (for admin)
  app.get("/api/mentors", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await client
        .from("mentor_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Approve/reject mentor
  app.patch("/api/mentors/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data, error } = await (client
        .from("mentor_applications")
        .update({ status, reviewed_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, mentor: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle mentor disabled status
  app.patch("/api/mentors/:id/toggle-disabled", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      
      const { data: current, error: getError } = await (client
        .from("mentor_applications")
        .select("is_disabled")
        .eq("id", id)
        .single() as any);

      if (getError) {
        return res.status(400).json({ error: getError.message });
      }

      const newState = !current?.is_disabled;
      
      const { data, error } = await (client
        .from("mentor_applications")
        .update({ is_disabled: newState } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, is_disabled: newState, mentor: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get mentor profile by email
  app.get("/api/mentors/profile/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      
      console.log("[GET /api/mentors/profile/:email] Looking up profile for:", decodedEmail);
      
      const { data, error } = await (client
        .from("mentor_applications")
        .select("*")
        .eq("email", decodedEmail)
        .eq("status", "approved")
        .single() as any);

      console.log("[GET /api/mentors/profile/:email] Result:", { found: !!data, error: error?.message });

      if (error || !data) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(data);
    } catch (error: any) {
      console.error("[GET /api/mentors/profile/:email] Exception:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Update mentor profile by ID
  app.put("/api/mentors/profile/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { fullName, bio, expertise, experience, linkedin, profileImage } = req.body;

      console.log("[PUT /api/mentors/profile/:id] Updating profile:", id);

      // Build update object - store profileImage in data JSONB field
      const updateData: any = {
        bio,
        expertise,
        experience,
        linkedin: linkedin || null
      };

      // Update full_name if provided
      if (fullName) {
        updateData.full_name = fullName;
      }

      // If profileImage is provided, merge it into the data JSONB field
      if (profileImage !== undefined) {
        const { data: existingData } = await (client
          .from("mentor_applications")
          .select("data")
          .eq("id", id)
          .single() as any);
        
        updateData.data = {
          ...(existingData?.data || {}),
          profileImage: profileImage
        };
      }

      const { data, error } = await (client
        .from("mentor_applications")
        .update(updateData)
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[PUT /api/mentors/profile/:id] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, mentor: data?.[0] });
    } catch (error: any) {
      console.error("[PUT /api/mentors/profile/:id] Exception:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== MENTOR ASSIGNMENTS ENDPOINTS =====

  // Get all mentor assignments (for admin dashboard badges)
  app.get("/api/mentor-assignments", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      console.log("[GET /api/mentor-assignments] Fetching all active assignments...");
      const { data: assignments, error: assignmentError } = await (client
        .from("mentor_assignments")
        .select("*")
        .eq("status", "active") as any);

      console.log("[GET /api/mentor-assignments] Query result:", { count: assignments?.length, error: assignmentError?.message });

      if (assignmentError) {
        console.error("[GET /api/mentor-assignments] Error:", assignmentError);
        return res.status(400).json({ error: assignmentError.message });
      }

      if (!assignments || assignments.length === 0) {
        console.log("[GET /api/mentor-assignments] No active assignments found");
        return res.json({ assignments: [] });
      }

      // Fetch all mentor names for the assignments
      const mentorIds = Array.from(new Set(assignments.map((a: any) => a.mentor_id)));
      console.log("[GET /api/mentor-assignments] Looking up mentor IDs:", mentorIds);
      
      const { data: mentors, error: mentorError } = await (client
        .from("mentor_applications")
        .select("id, full_name")
        .in("id", mentorIds) as any);

      console.log("[GET /api/mentor-assignments] Mentor lookup result:", { mentors, error: mentorError?.message });

      // Map mentor names to assignments
      const assignmentsWithMentorNames = assignments.map((a: any) => {
        const mentor = mentors?.find((m: any) => m.id === a.mentor_id);
        const mentorName = mentor?.full_name || "Mentor";
        console.log("[GET /api/mentor-assignments] Mapping mentor for assignment:", { 
          mentor_id: a.mentor_id, 
          found_mentor: !!mentor,
          mentor_name: mentorName 
        });
        return {
          ...a,
          mentor_name: mentorName
        };
      });

      console.log("[GET /api/mentor-assignments] Returning", assignmentsWithMentorNames.length, "assignments");
      return res.json({ assignments: assignmentsWithMentorNames });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Create or update mentor assignment
  app.post("/api/mentor-assignments", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { entrepreneurId, mentorId, portfolioNumber, meetingLink } = req.body;
      console.log("[POST /api/mentor-assignments] Request received:", { entrepreneurId, mentorId, portfolioNumber });

      if (!entrepreneurId || !mentorId || !portfolioNumber) {
        return res.status(400).json({ error: "Missing required fields (entrepreneurId, mentorId, portfolioNumber)" });
      }

      // Check if entrepreneur already has an assignment
      const { data: existing } = await (client
        .from("mentor_assignments")
        .select("id")
        .eq("entrepreneur_id", entrepreneurId)
        .eq("status", "active")
        .single() as any);

      if (existing) {
        // Update existing assignment
        const { data, error } = await (client
          .from("mentor_assignments")
          .update({
            mentor_id: mentorId,
            portfolio_number: portfolioNumber,
            meeting_link: meetingLink || null
          } as any)
          .eq("id", existing.id)
          .select() as any);

        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.json({ success: true, assignment: data?.[0], updated: true });
      }

      // Create new assignment
      console.log("[POST /api/mentor-assignments] Creating assignment with mentor_id:", mentorId);
      const { data, error } = await (client
        .from("mentor_assignments")
        .insert({
          entrepreneur_id: entrepreneurId,
          mentor_id: mentorId,
          portfolio_number: portfolioNumber,
          meeting_link: meetingLink || null,
          status: "active"
        } as any)
        .select() as any);

      console.log("[POST /api/mentor-assignments] Assignment created:", data?.[0]?.id, "Error:", error?.message);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Fetch entrepreneur and mentor details for system messages
      const { data: entrepreneur } = await (client
        .from("entrepreneur_applications")
        .select("email, full_name")
        .eq("id", entrepreneurId)
        .single() as any);
      
      const { data: mentor } = await (client
        .from("mentor_applications")
        .select("email, full_name")
        .eq("id", mentorId)
        .single() as any);

      if (entrepreneur && mentor) {
        const entrepreneurEmail = entrepreneur.email;
        const entrepreneurName = entrepreneur.full_name || "Entrepreneur";
        const mentorEmail = mentor.email;
        const mentorName = mentor.full_name || "Mentor";

        // Send system message to entrepreneur about mentor assignment
        await (client.from("messages").insert({
          from_name: "System",
          from_email: "admin@touchconnectpro.com",
          to_name: entrepreneurName,
          to_email: entrepreneurEmail,
          message: `Great news! You have been assigned to ${mentorName}'s Portfolio ${portfolioNumber}. Visit your dashboard to see your mentor's profile and connect with them.`,
          is_read: false
        } as any) as any);

        // Send system message to mentor about new entrepreneur
        await (client.from("messages").insert({
          from_name: "System",
          from_email: "admin@touchconnectpro.com",
          to_name: mentorName,
          to_email: mentorEmail,
          message: `${entrepreneurName} has been added to your Portfolio ${portfolioNumber}. Visit your dashboard to view their profile and business idea.`,
          is_read: false
        } as any) as any);
      }

      return res.json({ success: true, assignment: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get mentor's assigned entrepreneurs by email (portfolio)
  app.get("/api/mentor-assignments/mentor-email/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      console.log("[GET /api/mentor-assignments/mentor-email/:email] Looking for mentor with email:", decodedEmail);

      // First, find the mentor by email
      const { data: mentorData, error: mentorError } = await (client
        .from("mentor_applications")
        .select("id, email, full_name")
        .eq("email", decodedEmail)
        .single() as any);

      console.log("[GET /api/mentor-assignments/mentor-email/:email] Mentor lookup result:", mentorData);

      if (mentorError || !mentorData) {
        console.error("[GET /api/mentor-assignments/mentor-email/:email] Mentor not found with email:", decodedEmail, "Error:", mentorError?.message);
        return res.json({ entrepreneurs: [] });
      }

      const mentorId = mentorData.id;
      console.log("[GET /api/mentor-assignments/mentor-email/:email] Found mentor ID:", mentorId, "Name:", mentorData.full_name);

      // Now fetch assignments for this mentor
      const { data: assignments, error: assignmentError } = await (client
        .from("mentor_assignments")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("status", "active") as any);

      console.log("[GET /api/mentor-assignments/mentor-email/:email] Assignments found:", assignments?.length || 0);
      console.log("[GET /api/mentor-assignments/mentor-email/:email] First assignment raw:", JSON.stringify(assignments?.[0]));

      if (assignmentError) {
        console.error("[GET /api/mentor-assignments/mentor-email/:email] Error:", assignmentError);
        return res.status(400).json({ error: assignmentError.message });
      }

      if (!assignments || assignments.length === 0) {
        console.log("[GET /api/mentor-assignments/mentor-email/:email] No assignments found");
        return res.json({ entrepreneurs: [] });
      }

      // Fetch entrepreneur profiles from ideas table (where assignments point to)
      const entrepreneurIds = assignments.map((a: any) => a.entrepreneur_id);
      console.log("[GET /api/mentor-assignments/mentor-email/:email] Looking up entrepreneur IDs:", entrepreneurIds);
      
      const { data: entrepreneurs, error: entError } = await (client
        .from("ideas")
        .select("*")
        .in("id", entrepreneurIds) as any);

      console.log("[GET /api/mentor-assignments/mentor-email/:email] Entrepreneur lookup result:", { 
        count: entrepreneurs?.length, 
        error: entError?.message,
        entrepreneurs: entrepreneurs?.map((e: any) => ({ id: e.id, name: e.entrepreneur_name, email: e.entrepreneur_email }))
      });

      if (entError) {
        console.error("[GET /api/mentor-assignments/mentor-email/:email] Error fetching entrepreneurs:", entError);
        return res.json({ entrepreneurs: [] });
      }

      // Combine data - ideas table has data in different structure
      const portfolioData = assignments.map((assignment: any) => {
        const entrepreneur = entrepreneurs?.find((e: any) => e.id === assignment.entrepreneur_id);
        const entData = entrepreneur?.data || {};
        
        // Parse mentor_notes from JSON if needed, ensuring each note has an ID
        let parsedNotes: any[] = [];
        if (assignment.mentor_notes) {
          try {
            let rawNotes = typeof assignment.mentor_notes === 'string'
              ? JSON.parse(assignment.mentor_notes)
              : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
            // Normalize notes to ensure each has an ID and responses array
            parsedNotes = rawNotes.map((note: any, idx: number) => {
              if (typeof note === 'string') {
                return { id: `note_legacy_${idx}_${Date.now()}`, text: note, timestamp: null, responses: [] };
              }
              return {
                ...note,
                id: note.id || `note_legacy_${idx}_${Date.now()}`,
                responses: note.responses || []
              };
            });
          } catch (e) {
            parsedNotes = [{ id: `note_legacy_0_${Date.now()}`, text: String(assignment.mentor_notes), timestamp: null, responses: [] }];
          }
        }
        
        return {
          assignment_id: assignment.id,
          portfolio_number: assignment.portfolio_number,
          meeting_link: assignment.meeting_link,
          mentor_notes: parsedNotes,
          entrepreneur: entrepreneur ? {
            id: entrepreneur.id,
            full_name: entrepreneur.entrepreneur_name || entData.fullName || "",
            email: entrepreneur.entrepreneur_email || entData.email || "",
            linkedin: entrepreneur.linkedin_profile || entData.linkedin || entData.linkedinWebsite || "",
            website: entData.website || entData.linkedinWebsite || "",
            business_idea: entData.ideaDescription || entData.ideaName || "",
            idea_name: entData.ideaName || "",
            country: entData.country || "",
            state: entData.state || "",
            photo_url: entData.profileImage || "",
            ideaReview: entData.ideaReview || entData,
            businessPlan: entrepreneur.business_plan || {},
            meetingQuestions: entData.meetingQuestions || null,
            meetingQuestionsGeneratedAt: entData.meetingQuestionsGeneratedAt || null,
            bio: entData.bio || "",
            fullBio: entData.fullBio || ""
          } : null
        };
      });

      console.log("[GET /api/mentor-assignments/mentor-email/:email] Returning portfolio data:", portfolioData.length);
      return res.json({ entrepreneurs: portfolioData });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get entrepreneur's assigned mentor
  app.get("/api/mentor-assignments/entrepreneur/:entrepreneurId", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { entrepreneurId } = req.params;

      const { data: assignment, error: assignmentError } = await (client
        .from("mentor_assignments")
        .select("*")
        .eq("entrepreneur_id", entrepreneurId)
        .eq("status", "active")
        .single() as any);

      if (assignmentError || !assignment) {
        return res.json({ mentor: null });
      }

      // Parse mentor_notes from JSON if needed, ensuring each note has an ID
      let parsedNotes: any[] = [];
      if (assignment.mentor_notes) {
        try {
          let rawNotes = typeof assignment.mentor_notes === 'string'
            ? JSON.parse(assignment.mentor_notes)
            : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
          // Normalize notes to ensure each has an ID and responses array
          parsedNotes = rawNotes.map((note: any, idx: number) => {
            if (typeof note === 'string') {
              return { id: `note_legacy_${idx}_${Date.now()}`, text: note, timestamp: null, responses: [] };
            }
            return {
              ...note,
              id: note.id || `note_legacy_${idx}_${Date.now()}`,
              responses: note.responses || []
            };
          });
        } catch (e) {
          parsedNotes = [{ id: `note_legacy_0_${Date.now()}`, text: String(assignment.mentor_notes), timestamp: null, responses: [] }];
        }
      }

      // Fetch mentor profile
      const { data: mentor, error: mentorError } = await (client
        .from("mentor_applications")
        .select("*")
        .eq("id", assignment.mentor_id)
        .single() as any);

      if (mentorError || !mentor) {
        return res.json({ mentor: null, mentor_notes: parsedNotes });
      }

      return res.json({
        mentor: {
          id: mentor.id,
          full_name: mentor.full_name,
          email: mentor.email,
          linkedin: mentor.linkedin,
          bio: mentor.bio,
          expertise: mentor.expertise,
          experience: mentor.experience,
          photo_url: mentor.photo_url || mentor.photoUrl || mentor.data?.profileImage || ""
        },
        portfolio_number: assignment.portfolio_number,
        meeting_link: assignment.meeting_link,
        mentor_notes: parsedNotes
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle note completion status
  app.patch("/api/mentor-assignments/:id/toggle-note/:noteIndex", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id, noteIndex } = req.params;
      const { completed } = req.body;
      const noteIdxNum = parseInt(noteIndex);

      const { data: assignment, error: fetchError } = await (client
        .from("mentor_assignments")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (fetchError || !assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      let notes: any[] = [];
      if (assignment.mentor_notes) {
        try {
          notes = typeof assignment.mentor_notes === 'string'
            ? JSON.parse(assignment.mentor_notes)
            : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
        } catch (e) {
          notes = [assignment.mentor_notes];
        }
      }

      if (noteIdxNum >= 0 && noteIdxNum < notes.length) {
        const note = notes[noteIdxNum];
        // Preserve all existing fields (including id, responses) when toggling completion
        notes[noteIdxNum] = {
          ...(typeof note === 'object' ? note : {}),
          text: typeof note === 'string' ? note : note.text,
          timestamp: typeof note === 'string' ? new Date().toISOString() : (note.timestamp || new Date().toISOString()),
          completed: completed || false
        };
      }

      const { error: updateError } = await (client
        .from("mentor_assignments")
        .update({ mentor_notes: JSON.stringify(notes) })
        .eq("id", id) as any);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      // Send email notification to entrepreneur when mentor marks note as completed
      if (completed && noteIdxNum >= 0 && noteIdxNum < notes.length) {
        try {
          const noteText = notes[noteIdxNum]?.text || "a task";
          
          const { data: mentor } = await (client
            .from("mentor_applications")
            .select("full_name, email")
            .eq("id", assignment.mentor_id)
            .single() as any);

          const { data: entrepreneur } = await (client
            .from("ideas")
            .select("entrepreneur_name, entrepreneur_email")
            .eq("id", assignment.entrepreneur_id)
            .single() as any);

          if (entrepreneur?.entrepreneur_email && mentor) {
            const resendData = await getResendClient();
            if (resendData) {
              const { client: resend, fromEmail } = resendData;
              const FRONTEND_URL = process.env.FRONTEND_URL || "https://touchconnectpro.com";
              
              await resend.emails.send({
                from: fromEmail,
                to: entrepreneur.entrepreneur_email,
                subject: `Your mentor marked a task as complete`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                      .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                      .completed-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
                      .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                      .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>Task Completed!</h1>
                      </div>
                      <div class="content">
                        <p>Hi ${entrepreneur.entrepreneur_name || "there"},</p>
                        <p>Great news! Your mentor <strong>${mentor.full_name}</strong> has marked the following task as complete:</p>
                        
                        <div class="completed-box">
                          <p style="margin: 0;"><strong style="color: #10b981;">✓</strong> ${noteText}</p>
                        </div>
                        
                        <p>Keep up the great work on your entrepreneurial journey!</p>
                        
                        <p style="text-align: center;">
                          <a href="${FRONTEND_URL}/dashboard-entrepreneur" class="button">View Your Dashboard</a>
                        </p>
                        
                        <p>Best regards,<br>The TouchConnectPro Team</p>
                      </div>
                      <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
                      </div>
                    </div>
                  </body>
                  </html>
                `
              });
              console.log("[TOGGLE-NOTE] Email sent to entrepreneur:", entrepreneur.entrepreneur_email);
            }
          }
        } catch (emailError: any) {
          console.error("[TOGGLE-NOTE] Email notification failed:", emailError.message);
        }
      }

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update mentor assignment (e.g., meeting link, notes)
  app.patch("/api/mentor-assignments/:id", async (req, res) => {
    console.log("[PATCH /api/mentor-assignments/:id] Request received for ID:", req.params.id);
    console.log("[PATCH /api/mentor-assignments/:id] Body:", JSON.stringify(req.body));
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.log("[PATCH /api/mentor-assignments/:id] Supabase not configured");
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { meetingLink, status, mentorNotes } = req.body;

      // If mentorNotes is provided, append it to existing notes (keep history)
      let updates: any = {};
      if (meetingLink !== undefined) updates.meeting_link = meetingLink;
      if (status !== undefined) updates.status = status;

      if (mentorNotes !== undefined) {
        console.log("[PATCH /api/mentor-assignments/:id] Processing mentorNotes:", mentorNotes);
        
        // Get current assignment to check existing notes
        const { data: currentAssignment, error: fetchError } = await (client
          .from("mentor_assignments")
          .select("mentor_notes")
          .eq("id", id)
          .single() as any);

        console.log("[PATCH /api/mentor-assignments/:id] Current assignment:", currentAssignment, "Error:", fetchError?.message);

        let existingNotes: any[] = [];
        if (currentAssignment?.mentor_notes) {
          try {
            existingNotes = typeof currentAssignment.mentor_notes === 'string'
              ? JSON.parse(currentAssignment.mentor_notes)
              : (Array.isArray(currentAssignment.mentor_notes) ? currentAssignment.mentor_notes : []);
          } catch (e) {
            existingNotes = [currentAssignment.mentor_notes];
          }
        }

        // Append new note with timestamp and unique ID
        const newNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: mentorNotes,
          timestamp: new Date().toISOString(),
          responses: []
        };
        
        const updatedNotes = [...existingNotes, newNote];
        updates.mentor_notes = JSON.stringify(updatedNotes);
        console.log("[PATCH /api/mentor-assignments/:id] Updated notes:", updates.mentor_notes);
      }

      console.log("[PATCH /api/mentor-assignments/:id] Sending update:", updates);
      
      const { data, error } = await (client
        .from("mentor_assignments")
        .update(updates)
        .eq("id", id)
        .select() as any);

      console.log("[PATCH /api/mentor-assignments/:id] Update result:", { data, error: error?.message });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, assignment: data?.[0] });
    } catch (error: any) {
      console.error("[PATCH /api/mentor-assignments/:id] Exception:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Submit response to a mentor note (entrepreneur)
  app.post("/api/mentor-assignments/:assignmentId/notes/:noteId/respond", async (req, res) => {
    console.log("[POST /api/note-respond] Request received");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { assignmentId, noteId } = req.params;
      const { responseText, attachmentUrl, attachmentName, attachmentSize, attachmentType } = req.body;

      if (!responseText && !attachmentUrl) {
        return res.status(400).json({ error: "Response text or attachment is required" });
      }

      // Get current assignment
      const { data: assignment, error: fetchError } = await (client
        .from("mentor_assignments")
        .select("mentor_notes")
        .eq("id", assignmentId)
        .single() as any);

      if (fetchError || !assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Parse existing notes
      let notes: any[] = [];
      if (assignment.mentor_notes) {
        try {
          notes = typeof assignment.mentor_notes === 'string'
            ? JSON.parse(assignment.mentor_notes)
            : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : []);
        } catch (e) {
          notes = [];
        }
      }

      // Find the note and add response
      let noteFound = false;
      notes = notes.map((note: any, idx: number) => {
        // Match by ID or by index for notes without IDs
        const noteIdMatch = note.id === noteId || `note_idx_${idx}` === noteId;
        if (noteIdMatch) {
          noteFound = true;
          const responses = note.responses || [];
          const newResponse = {
            id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: responseText || "",
            timestamp: new Date().toISOString(),
            attachmentUrl: attachmentUrl || null,
            attachmentName: attachmentName || null,
            attachmentSize: attachmentSize || null,
            attachmentType: attachmentType || null
          };
          return { ...note, responses: [...responses, newResponse] };
        }
        return note;
      });

      if (!noteFound) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Update the assignment
      const { error: updateError } = await (client
        .from("mentor_assignments")
        .update({ mentor_notes: JSON.stringify(notes) })
        .eq("id", assignmentId) as any);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      console.log("[POST /api/note-respond] Response added successfully");

      // Send email notification to mentor about entrepreneur's response
      try {
        const { data: fullAssignment } = await (client
          .from("mentor_assignments")
          .select("mentor_id, entrepreneur_id")
          .eq("id", assignmentId)
          .single() as any);

        if (fullAssignment) {
          const { data: mentor } = await (client
            .from("mentor_applications")
            .select("email, full_name")
            .eq("id", fullAssignment.mentor_id)
            .single() as any);

          const { data: entrepreneur } = await (client
            .from("ideas")
            .select("entrepreneur_name, entrepreneur_email")
            .eq("id", fullAssignment.entrepreneur_id)
            .single() as any);

          if (mentor?.email && entrepreneur) {
            const resendData = await getResendClient();
            if (resendData) {
              const { client: resend, fromEmail } = resendData;
              const FRONTEND_URL = process.env.FRONTEND_URL || "https://touchconnectpro.com";
              const notePreview = notes.find((n: any) => n.id === noteId)?.text || "your note";
              const responsePreview = responseText ? (responseText.length > 100 ? responseText.substring(0, 100) + "..." : responseText) : "";
              
              await resend.emails.send({
                from: fromEmail,
                to: mentor.email,
                subject: `${entrepreneur.entrepreneur_name || "Your entrepreneur"} responded to your note`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>
                      body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #0891b2, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                      .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                      .note-box { background: #e0f2fe; border-left: 4px solid #0891b2; padding: 15px; margin: 15px 0; border-radius: 4px; }
                      .response-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
                      .button { display: inline-block; background: #0891b2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                      .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>New Response to Your Note</h1>
                      </div>
                      <div class="content">
                        <p>Hi ${mentor.full_name},</p>
                        <p><strong>${entrepreneur.entrepreneur_name || "Your entrepreneur"}</strong> has responded to your note:</p>
                        
                        <div class="note-box">
                          <p style="margin: 0; font-style: italic;">"${notePreview}"</p>
                        </div>
                        
                        ${responsePreview ? `<div class="response-box"><p style="margin: 0;"><strong>Their response:</strong><br>${responsePreview}</p></div>` : ""}
                        ${attachmentName ? `<p><strong>📎 Attachment:</strong> ${attachmentName}</p>` : ""}
                        
                        <p style="text-align: center;">
                          <a href="${FRONTEND_URL}/mentor-dashboard" class="button">View in Dashboard</a>
                        </p>
                        
                        <p>Best regards,<br>The TouchConnectPro Team</p>
                      </div>
                      <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
                      </div>
                    </div>
                  </body>
                  </html>
                `
              });
              console.log("[POST /api/note-respond] Email sent to mentor:", mentor.email);
            }
          }
        }
      } catch (emailError: any) {
        console.error("[POST /api/note-respond] Email notification failed:", emailError.message);
      }

      return res.json({ success: true, notes });
    } catch (error: any) {
      console.error("[POST /api/note-respond] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Upload file for note response (Supabase Storage)
  app.post("/api/upload-note-attachment", async (req, res) => {
    console.log("[POST /api/upload-note-attachment] Request received");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fileName, fileData, fileType, assignmentId } = req.body;

      if (!fileName || !fileData) {
        return res.status(400).json({ error: "fileName and fileData are required" });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (fileType && !allowedTypes.includes(fileType)) {
        return res.status(400).json({ error: "File type not allowed. Allowed: PDF, Word, Excel, CSV, TXT, images" });
      }

      // Convert base64 to buffer
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size (10MB max)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `note-attachments/${assignmentId || 'general'}/${timestamp}_${sanitizedFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await client.storage
        .from('note-attachments')
        .upload(filePath, buffer, {
          contentType: fileType || 'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error("[UPLOAD] Storage error:", error);
        // If bucket doesn't exist, try to create it
        if (error.message.includes('not found') || error.message.includes('Bucket')) {
          return res.status(500).json({ error: "Storage bucket 'note-attachments' needs to be created in Supabase. Please create it manually in Supabase dashboard." });
        }
        return res.status(500).json({ error: error.message });
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from('note-attachments')
        .getPublicUrl(filePath);

      console.log("[UPLOAD] File uploaded successfully:", filePath);
      return res.json({
        success: true,
        url: urlData.publicUrl,
        path: filePath,
        name: fileName,
        size: buffer.length
      });
    } catch (error: any) {
      console.error("[UPLOAD] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Test endpoint to verify Supabase connection
  app.get("/api/test", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase client not initialized" });
      }

      // Test 1: Count ideas
      const { data: ideas, error: ideasError } = await client
        .from("ideas")
        .select("id", { count: "exact" });

      if (ideasError) {
        return res.status(400).json({ 
          error: "Failed to query ideas",
          details: ideasError.message 
        });
      }

      return res.status(200).json({
        status: "✓ Connected to Supabase",
        ideas_count: ideas?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({ 
        error: "Server error",
        details: error.message 
      });
    }
  });

  // Get entrepreneur data by email (for entrepreneur dashboard)
  app.get("/api/entrepreneur/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      
      console.log("[API] Looking for entrepreneur with email:", decodedEmail);

      // Get entrepreneur's idea/application (use ilike for case-insensitive match)
      const { data: ideaData, error: ideaError } = await (client
        .from("ideas")
        .select("*")
        .ilike("entrepreneur_email", decodedEmail)
        .single() as any);

      console.log("[API] Query result - data:", !!ideaData, "error:", ideaError?.message);

      if (ideaError || !ideaData) {
        // Debug: list all entrepreneur emails to see what's in the database
        const { data: allIdeas } = await (client
          .from("ideas")
          .select("entrepreneur_email, status")
          .limit(20) as any);
        console.log("[API] Available entrepreneur emails:", allIdeas?.map((i: any) => i.entrepreneur_email));
        return res.status(404).json({ error: "Entrepreneur not found" });
      }

      // Get mentor assignment if exists
      const { data: assignmentData } = await (client
        .from("mentor_assignments")
        .select("*")
        .eq("entrepreneur_id", ideaData.id)
        .eq("status", "active")
        .single() as any);

      let mentorProfile = null;
      let mentorNotes: any[] = [];

      if (assignmentData) {
        // Fetch mentor profile from mentor_applications table
        const { data: mentorData } = await (client
          .from("mentor_applications")
          .select("*")
          .eq("id", assignmentData.mentor_id)
          .single() as any);

        if (mentorData) {
          mentorProfile = {
            id: mentorData.id,
            full_name: mentorData.full_name || mentorData.fullName || "",
            email: mentorData.email || "",
            expertise: mentorData.expertise || "",
            experience: mentorData.experience || "",
            linkedin: mentorData.linkedin || "",
            bio: mentorData.bio || "",
            photo_url: mentorData.photo_url || mentorData.photoUrl || mentorData.data?.profileImage || ""
          };
        }

        // Get mentor notes from mentor_assignments table (stored as JSON array)
        if (assignmentData.mentor_notes) {
          try {
            mentorNotes = typeof assignmentData.mentor_notes === 'string' 
              ? JSON.parse(assignmentData.mentor_notes) 
              : (Array.isArray(assignmentData.mentor_notes) ? assignmentData.mentor_notes : [assignmentData.mentor_notes]);
          } catch (e) {
            mentorNotes = [assignmentData.mentor_notes];
          }
        }
      }

      return res.json({
        ...ideaData,
        mentorAssignment: assignmentData ? {
          ...assignmentData,
          status: "active",
          mentor: mentorProfile
        } : null,
        mentorNotes
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST message
  app.post("/api/messages", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fromName, fromEmail, toName, toEmail, message } = req.body;

      if (!fromEmail || !toEmail || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { data, error } = await (client
        .from("messages")
        .insert({
          from_name: fromName || "Unknown",
          from_email: fromEmail,
          to_name: toName || "Unknown",
          to_email: toEmail,
          message: message,
          is_read: false
        } as any)
        .select() as any);

      if (error) {
        console.error("[POST /api/messages] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log(`[POST /api/messages] Message sent from ${fromEmail} to ${toEmail}`);
      return res.json({ success: true, message: data?.[0] });
    } catch (error: any) {
      console.error("[POST /api/messages] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get messages for a user (by email)
  app.get("/api/messages/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);

      const { data, error } = await (client
        .from("messages")
        .select("*")
        .or(`from_email.eq.${decodedEmail},to_email.eq.${decodedEmail}`)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/messages/:email] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ messages: data || [] });
    } catch (error: any) {
      console.error("[GET /api/messages/:email] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all messages (for admin)
  app.get("/api/messages", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await (client
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/messages] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ messages: data || [] });
    } catch (error: any) {
      console.error("[GET /api/messages] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;

      const { data, error } = await (client
        .from("messages")
        .update({ is_read: true })
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[PATCH /api/messages/:id/read] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, message: data?.[0] });
    } catch (error: any) {
      console.error("[PATCH /api/messages/:id/read] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // =====================================================
  // ASK A MENTOR - Community Questions & Answers
  // =====================================================

  app.post("/api/mentor-questions", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { entrepreneurEmail, entrepreneurName, question, ideaId } = req.body;
      console.log("[POST /api/mentor-questions] Creating question from:", entrepreneurEmail);

      const { data, error } = await (client
        .from("mentor_questions")
        .insert({
          entrepreneur_email: entrepreneurEmail,
          entrepreneur_name: entrepreneurName,
          question,
          idea_id: ideaId || null,
          status: "pending",
          created_at: new Date().toISOString(),
          admin_reply: null,
          replied_at: null,
          ai_draft: null,
          is_read_by_admin: false
        })
        .select() as any);

      if (error) {
        console.error("[POST /api/mentor-questions] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("[POST /api/mentor-questions] Question created successfully");

      try {
        const resendData = await getResendClient();
        if (resendData) {
          const { client: resend, fromEmail } = resendData;
          const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://touchconnectpro.com");
          await resend.emails.send({
            from: fromEmail,
            to: ADMIN_EMAIL,
            subject: `New "Ask a Mentor" Question from ${entrepreneurName || entrepreneurEmail}`,
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h2 style="margin: 0;">New Mentor Question</h2>
                </div>
                <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 10px 10px;">
                  <p><strong>From:</strong> ${entrepreneurName || "Unknown"} (${entrepreneurEmail})</p>
                  <div style="background: white; border-left: 4px solid #6366f1; padding: 16px; margin: 16px 0; border-radius: 4px;">
                    <p style="margin: 0; white-space: pre-wrap;">${question}</p>
                  </div>
                  <a href="${FRONTEND_URL}/admin-dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Admin Dashboard</a>
                </div>
              </div>
            `
          });
          console.log("[POST /api/mentor-questions] Admin notification email sent to:", ADMIN_EMAIL);
        }
      } catch (emailError: any) {
        console.error("[POST /api/mentor-questions] Failed to send admin notification email:", emailError.message);
      }

      return res.json({ success: true, question: data?.[0] });
    } catch (error: any) {
      console.error("[POST /api/mentor-questions] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mentor-questions/entrepreneur/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      console.log("[GET /api/mentor-questions/entrepreneur] Fetching for:", decodedEmail);

      const { data, error } = await (client
        .from("mentor_questions")
        .select("*")
        .eq("entrepreneur_email", decodedEmail)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/mentor-questions/entrepreneur] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, questions: data || [] });
    } catch (error: any) {
      console.error("[GET /api/mentor-questions/entrepreneur] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mentor-questions", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      console.log("[GET /api/mentor-questions] Fetching all questions for admin");

      const { data: questions, error } = await (client
        .from("mentor_questions")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/mentor-questions] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      const enrichedQuestions = [];
      for (const q of (questions || [])) {
        let ideaData = null;
        if (q.idea_id) {
          const { data: idea } = await (client
            .from("ideas")
            .select("*")
            .eq("id", q.idea_id)
            .single() as any);
          ideaData = idea;
        } else if (q.entrepreneur_email) {
          const { data: idea } = await (client
            .from("ideas")
            .select("*")
            .eq("entrepreneur_email", q.entrepreneur_email)
            .order("created_at", { ascending: false })
            .limit(1)
            .single() as any);
          ideaData = idea;
        }
        enrichedQuestions.push({ ...q, ideaData });
      }

      return res.json({ success: true, questions: enrichedQuestions });
    } catch (error: any) {
      console.error("[GET /api/mentor-questions] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mentor-questions/:id/reply", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { reply } = req.body;
      console.log("[POST /api/mentor-questions/:id/reply] Replying to question:", id);

      let result = await (client
        .from("mentor_questions")
        .update({
          admin_reply: reply,
          replied_at: new Date().toISOString(),
          status: "answered",
          is_read_by_entrepreneur: false
        })
        .eq("id", id)
        .select() as any);

      if (result.error) {
        console.log("[POST /api/mentor-questions/:id/reply] Retrying without is_read_by_entrepreneur column");
        result = await (client
          .from("mentor_questions")
          .update({
            admin_reply: reply,
            replied_at: new Date().toISOString(),
            status: "answered"
          })
          .eq("id", id)
          .select() as any);
      }

      if (result.error) {
        console.error("[POST /api/mentor-questions/:id/reply] Error:", result.error);
        return res.status(500).json({ error: result.error.message });
      }

      console.log("[POST /api/mentor-questions/:id/reply] Reply saved successfully");

      const answeredQuestion = result.data?.[0];
      if (answeredQuestion?.entrepreneur_email) {
        try {
          const resendData = await getResendClient();
          if (resendData) {
            const { client: resend, fromEmail } = resendData;
            const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://touchconnectpro.com");
            await resend.emails.send({
              from: fromEmail,
              to: answeredQuestion.entrepreneur_email,
              subject: "Your Mentor Question Has Been Answered - TouchConnectPro",
              html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h2 style="margin: 0;">Your Question Has Been Answered!</h2>
                  </div>
                  <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 10px 10px;">
                    <p>Hi ${answeredQuestion.entrepreneur_name || "there"},</p>
                    <p>A mentor has responded to your question on TouchConnectPro.</p>
                    <div style="background: #f1f5f9; border-left: 4px solid #94a3b8; padding: 16px; margin: 16px 0; border-radius: 4px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">Your Question:</p>
                      <p style="margin: 0; white-space: pre-wrap;">${answeredQuestion.question}</p>
                    </div>
                    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 16px 0; border-radius: 4px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #065f46;">Mentor's Answer:</p>
                      <p style="margin: 0; white-space: pre-wrap;">${reply}</p>
                    </div>
                    <a href="${FRONTEND_URL}/login" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Your Dashboard</a>
                    <p style="margin-top: 20px; color: #64748b; font-size: 14px;">Keep building. We're here to help you succeed.</p>
                  </div>
                </div>
              `
            });
            console.log("[POST /api/mentor-questions/:id/reply] Entrepreneur notification email sent to:", answeredQuestion.entrepreneur_email);
          }
        } catch (emailError: any) {
          console.error("[POST /api/mentor-questions/:id/reply] Failed to send entrepreneur notification email:", emailError.message);
        }
      }

      return res.json({ success: true, question: answeredQuestion });
    } catch (error: any) {
      console.error("[POST /api/mentor-questions/:id/reply] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mentor-questions/:id/generate-draft", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      console.log("[POST /api/mentor-questions/:id/generate-draft] Generating AI draft for question:", id);

      const { data: questionData, error: qError } = await (client
        .from("mentor_questions")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (qError || !questionData) {
        console.error("[POST /api/mentor-questions/:id/generate-draft] Question not found:", qError);
        return res.status(404).json({ error: "Question not found" });
      }

      let ideaData = null;
      if (questionData.idea_id) {
        const { data: idea } = await (client
          .from("ideas")
          .select("*")
          .eq("id", questionData.idea_id)
          .single() as any);
        ideaData = idea;
      } else if (questionData.entrepreneur_email) {
        const { data: idea } = await (client
          .from("ideas")
          .select("*")
          .eq("entrepreneur_email", questionData.entrepreneur_email)
          .order("created_at", { ascending: false })
          .limit(1)
          .single() as any);
        ideaData = idea;
      }

      const draftResult = await generateMentorDraftResponse({
        entrepreneurName: questionData.entrepreneur_name,
        threadSubject: "Ask a Mentor Question",
        ideaProposal: ideaData?.answers || ideaData || undefined,
        businessPlan: ideaData?.business_plan || undefined,
        entrepreneurQuestion: questionData.question,
        mentorName: "TouchConnectPro Mentor"
      });

      const { error: updateError } = await (client
        .from("mentor_questions")
        .update({ ai_draft: draftResult.draft })
        .eq("id", id) as any);

      if (updateError) {
        console.error("[POST /api/mentor-questions/:id/generate-draft] Update error:", updateError);
      }

      console.log("[POST /api/mentor-questions/:id/generate-draft] AI draft generated successfully");
      return res.json({ success: true, draft: draftResult.draft });
    } catch (error: any) {
      console.error("[POST /api/mentor-questions/:id/generate-draft] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/mentor-questions/:id/read", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      console.log("[PATCH /api/mentor-questions/:id/read] Marking as read:", id);

      const { data, error } = await (client
        .from("mentor_questions")
        .update({ is_read_by_admin: true })
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[PATCH /api/mentor-questions/:id/read] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, question: data?.[0] });
    } catch (error: any) {
      console.error("[PATCH /api/mentor-questions/:id/read] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/mentor-questions/mark-read-entrepreneur/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      console.log("[PATCH /api/mentor-questions/mark-read-entrepreneur] Marking all answered as read for:", decodedEmail);

      const { data, error } = await (client
        .from("mentor_questions")
        .update({ is_read_by_entrepreneur: true })
        .eq("entrepreneur_email", decodedEmail)
        .eq("status", "answered")
        .eq("is_read_by_entrepreneur", false)
        .select() as any);

      if (error) {
        console.error("[PATCH /api/mentor-questions/mark-read-entrepreneur] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, updated: data?.length || 0 });
    } catch (error: any) {
      console.error("[PATCH /api/mentor-questions/mark-read-entrepreneur] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Create mentor_questions table if it doesn't exist
  app.post("/api/admin/create-mentor-questions-table", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.mentor_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrepreneur_email TEXT NOT NULL,
  entrepreneur_name TEXT,
  question TEXT NOT NULL,
  idea_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  ai_draft TEXT,
  is_read_by_admin BOOLEAN DEFAULT FALSE,
  is_read_by_entrepreneur BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_mentor_questions_email ON public.mentor_questions(entrepreneur_email);
CREATE INDEX IF NOT EXISTS idx_mentor_questions_status ON public.mentor_questions(status);

ALTER TABLE public.mentor_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on mentor_questions" ON public.mentor_questions
  FOR ALL USING (true) WITH CHECK (true);
`;

      const { error } = await (client.rpc("exec_sql", { sql: createTableSQL }) as any);
      
      if (error) {
        console.log("[CREATE MENTOR_QUESTIONS TABLE] RPC failed, returning SQL for manual creation");
        return res.json({
          success: false,
          message: "Please run this SQL in Supabase SQL Editor to create the mentor_questions table:",
          sql: createTableSQL
        });
      }

      console.log("[CREATE MENTOR_QUESTIONS TABLE] Table created successfully");
      return res.json({ success: true, message: "mentor_questions table created" });
    } catch (error: any) {
      console.error("[CREATE MENTOR_QUESTIONS TABLE] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // =====================================================
  // MESSAGE THREADS - Threaded Conversations (Entrepreneur <-> Mentor)
  // =====================================================

  // Get all threads for a user (by email - matches entrepreneur_email OR mentor_email)
  app.get("/api/message-threads/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);

      // Get threads where user is entrepreneur OR mentor
      const { data: entrepreneurThreads, error: e1 } = await (client
        .from("message_threads")
        .select("*")
        .eq("entrepreneur_email", decodedEmail)
        .order("updated_at", { ascending: false }) as any);

      const { data: mentorThreads, error: e2 } = await (client
        .from("message_threads")
        .select("*")
        .eq("mentor_email", decodedEmail)
        .order("updated_at", { ascending: false }) as any);

      if (e1 || e2) {
        console.error("[GET /api/message-threads/:email] Error:", e1 || e2);
        return res.status(500).json({ error: (e1 || e2)?.message });
      }

      // Combine and deduplicate
      const allThreads = [...(entrepreneurThreads || []), ...(mentorThreads || [])];
      const uniqueThreads = allThreads.filter((thread, index, self) =>
        index === self.findIndex(t => t.id === thread.id)
      );

      return res.json({ threads: uniqueThreads });
    } catch (error: any) {
      console.error("[GET /api/message-threads/:email] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Create a new thread
  app.post("/api/message-threads", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { entrepreneurEmail, mentorEmail, subject, message, senderRole, senderName, attachments } = req.body;

      if (!entrepreneurEmail || !mentorEmail || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const initialEntry = {
        id: crypto.randomUUID(),
        message,
        senderRole: senderRole || "entrepreneur",
        senderName: senderName || "Entrepreneur",
        createdAt: new Date().toISOString(),
        attachments: attachments || []
      };

      const { data, error } = await (client
        .from("message_threads")
        .insert({
          entrepreneur_email: entrepreneurEmail,
          mentor_email: mentorEmail,
          subject,
          status: "open",
          entries: [initialEntry],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single() as any);

      if (error) {
        console.error("[POST /api/message-threads] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Send email notification to mentor
      try {
        const resendData = await getResendClient();
        if (resendData) {
          await resendData.client.emails.send({
            from: resendData.fromEmail,
            to: mentorEmail,
            subject: `New conversation from ${senderName}: ${subject}`,
            html: `
              <p>Hello,</p>
              <p><strong>${senderName}</strong> started a new conversation with you.</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="border-left:3px solid #10b981;padding-left:12px;margin:12px 0;">${message}</blockquote>
              <p><a href="https://www.touchconnectpro.com/dashboard/mentor" style="background:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">View in Dashboard</a></p>
              <p>Best,<br>TouchConnectPro Team</p>
            `
          });
        }
      } catch (emailError) {
        console.error("[POST /api/message-threads] Email error:", emailError);
      }

      return res.json({ thread: data });
    } catch (error: any) {
      console.error("[POST /api/message-threads] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Add reply to thread
  app.post("/api/message-threads/:id/reply", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { message, senderRole, senderName, attachments } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get existing thread
      const { data: thread, error: fetchError } = await (client
        .from("message_threads")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (fetchError || !thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      const newEntry = {
        id: crypto.randomUUID(),
        message,
        senderRole: senderRole || "entrepreneur",
        senderName: senderName || "User",
        createdAt: new Date().toISOString(),
        attachments: attachments || []
      };

      const updatedEntries = [...(thread.entries || []), newEntry];

      const { data, error } = await (client
        .from("message_threads")
        .update({
          entries: updatedEntries,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single() as any);

      if (error) {
        console.error("[POST /api/message-threads/:id/reply] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Send email notification to the other party
      try {
        const resendData = await getResendClient();
        if (resendData) {
          const recipientEmail = senderRole === "mentor" ? thread.entrepreneur_email : thread.mentor_email;
          await resendData.client.emails.send({
            from: resendData.fromEmail,
            to: recipientEmail,
            subject: `New reply: ${thread.subject}`,
            html: `
              <p>Hello,</p>
              <p><strong>${senderName}</strong> replied to your conversation.</p>
              <p><strong>Subject:</strong> ${thread.subject}</p>
              <p><strong>Reply:</strong></p>
              <blockquote style="border-left:3px solid #10b981;padding-left:12px;margin:12px 0;">${message}</blockquote>
              <p><a href="https://www.touchconnectpro.com/dashboard/${senderRole === 'mentor' ? 'entrepreneur' : 'mentor'}" style="background:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">View in Dashboard</a></p>
              <p>Best,<br>TouchConnectPro Team</p>
            `
          });
        }
      } catch (emailError) {
        console.error("[POST /api/message-threads/:id/reply] Email error:", emailError);
      }

      return res.json({ thread: data });
    } catch (error: any) {
      console.error("[POST /api/message-threads/:id/reply] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Update thread status (open/closed) - mentor only
  app.patch("/api/message-threads/:id/status", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'open' or 'closed'" });
      }

      const { data, error } = await (client
        .from("message_threads")
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single() as any);

      if (error) {
        console.error("[PATCH /api/message-threads/:id/status] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ thread: data });
    } catch (error: any) {
      console.error("[PATCH /api/message-threads/:id/status] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Upload attachment for message threads (using Supabase Storage)
  // NOTE: This route MUST come BEFORE /thread/:id to avoid "upload" matching as :id
  app.post("/api/message-threads/upload", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Expected: base64 file data with metadata
      const { fileName, fileType, fileData, userEmail } = req.body;

      if (!fileName || !fileType || !fileData) {
        return res.status(400).json({ error: "Missing file data" });
      }

      // Decode base64
      const buffer = Buffer.from(fileData, "base64");
      
      // Generate unique filename
      const ext = fileName.split('.').pop() || 'bin';
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const storagePath = `message-attachments/${userEmail || 'anonymous'}/${uniqueName}`;

      const { data, error } = await client.storage
        .from("attachments")
        .upload(storagePath, buffer, {
          contentType: fileType,
          upsert: false
        });

      if (error) {
        console.error("[POST /api/message-threads/upload] Storage error:", error);
        return res.status(500).json({ error: error.message });
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from("attachments")
        .getPublicUrl(storagePath);

      return res.json({
        success: true,
        attachment: {
          name: fileName,
          type: fileType,
          url: urlData.publicUrl,
          path: storagePath
        }
      });
    } catch (error: any) {
      console.error("[POST /api/message-threads/upload] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get single thread by ID
  app.get("/api/message-threads/thread/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;

      const { data, error } = await (client
        .from("message_threads")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (error || !data) {
        return res.status(404).json({ error: "Thread not found" });
      }

      return res.json({ thread: data });
    } catch (error: any) {
      console.error("[GET /api/message-threads/thread/:id] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Generate AI draft response for mentor
  app.post("/api/message-threads/:id/ai-draft", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { mentorName, mentorEmail } = req.body;

      // Get the thread
      const { data: thread, error: threadError } = await (client
        .from("message_threads")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (threadError || !thread) {
        return res.status(404).json({ error: "Thread not found" });
      }

      // Get the latest entrepreneur message from thread entries
      const entries = thread.entries || [];
      const entrepreneurMessages = entries.filter((e: any) => 
        e.senderRole === "entrepreneur" || e.sender_role === "entrepreneur"
      );
      const latestMessage = entrepreneurMessages.length > 0 
        ? entrepreneurMessages[entrepreneurMessages.length - 1].message 
        : entries[entries.length - 1]?.message || "";

      // Find entrepreneur by email from thread
      const entrepreneurEmail = thread.entrepreneur_email;
      console.log("[AI-DRAFT] Looking up entrepreneur:", entrepreneurEmail);
      
      // Look up entrepreneur in ideas table to get idea proposal and business plan
      const { data: entrepreneur, error: entError } = await (client
        .from("ideas")
        .select("*")
        .eq("entrepreneur_email", entrepreneurEmail)
        .single() as any);

      let ideaProposal: Record<string, any> = {};
      let businessPlan: Record<string, any> = {};
      let entrepreneurName = thread.entrepreneur_email;

      if (entrepreneur) {
        console.log("[AI-DRAFT] Found entrepreneur data, has business_plan:", !!entrepreneur.business_plan, "has data:", !!entrepreneur.data);
        entrepreneurName = entrepreneur.entrepreneur_name || entrepreneurEmail;
        
        // Parse idea proposal from 'data' column (contains the 42 questions)
        try {
          const formData = typeof entrepreneur.data === 'string' 
            ? JSON.parse(entrepreneur.data) 
            : entrepreneur.data || {};
          // Check for nested ideaReview or use the data directly
          ideaProposal = formData.ideaReview || formData;
          console.log("[AI-DRAFT] Idea proposal keys:", Object.keys(ideaProposal).length);
        } catch (e) {
          console.log("[AI-DRAFT] Could not parse idea proposal");
        }

        // Get business plan from 'business_plan' column
        try {
          businessPlan = typeof entrepreneur.business_plan === 'string'
            ? JSON.parse(entrepreneur.business_plan)
            : entrepreneur.business_plan || {};
          console.log("[AI-DRAFT] Business plan keys:", Object.keys(businessPlan).length);
        } catch (e) {
          console.log("[AI-DRAFT] Could not parse business plan");
        }
      } else {
        console.log("[AI-DRAFT] Entrepreneur not found in ideas table, error:", entError?.message);
      }

      // Generate AI draft
      const result = await generateMentorDraftResponse({
        entrepreneurName,
        entrepreneurQuestion: latestMessage,
        ideaProposal,
        businessPlan,
        mentorName: mentorName || "Mentor",
        threadSubject: thread.subject
      });

      return res.json({ draft: result.draft });
    } catch (error: any) {
      console.error("[POST /api/message-threads/:id/ai-draft] Error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate AI draft" });
    }
  });

  // Admin-only: Get all coaches with full data including profile_url
  app.get("/api/admin/coaches", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Admin token required" });
      }

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Verify admin token
      const { data: session, error: sessionError } = await (client
        .from("admin_sessions")
        .select("*")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single() as any);

      if (sessionError || !session) {
        return res.status(401).json({ error: "Invalid or expired admin token" });
      }

      const { data, error } = await (client
        .from("coach_applications")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/admin/coaches] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Return full data including profile_url for admin
      return res.json(data || []);
    } catch (error: any) {
      console.error("[GET /api/admin/coaches] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Admin: Verify or unverify coach external reputation
  app.put("/api/admin/coaches/:id/verify-reputation", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Admin token required" });
      }

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Verify admin token
      const { data: session, error: sessionError } = await (client
        .from("admin_sessions")
        .select("*")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single() as any);

      if (sessionError || !session) {
        return res.status(401).json({ error: "Invalid or expired admin token" });
      }

      const { id } = req.params;
      const { verified, adminEmail, notes } = req.body;

      // Get current external reputation
      const { data: coach, error: fetchError } = await (client
        .from("coach_applications")
        .select("external_reputation")
        .eq("id", id)
        .single() as any);

      if (fetchError || !coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      const currentReputation = coach.external_reputation || {};
      const updatedReputation = {
        ...currentReputation,
        verified: verified,
        verified_by_admin_id: verified ? adminEmail : null,
        verified_at: verified ? new Date().toISOString() : null,
        verification_notes: notes || null
      };

      const { data, error } = await (client
        .from("coach_applications")
        .update({ external_reputation: updatedReputation })
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[PUT /api/admin/coaches/:id/verify-reputation] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, coach: data?.[0] });
    } catch (error: any) {
      console.error("[PUT /api/admin/coaches/:id/verify-reputation] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all coaches (public - strips profile_url for privacy)
  app.get("/api/coaches", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await (client
        .from("coach_applications")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/coaches] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Strip profile_url from external_reputation for privacy (admin-only field)
      const safeData = (data || []).map((coach: any) => {
        if (coach.external_reputation) {
          const { profile_url, ...safeReputation } = coach.external_reputation;
          return { ...coach, external_reputation: safeReputation };
        }
        return coach;
      });

      return res.json(safeData);
    } catch (error: any) {
      console.error("[GET /api/coaches] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get approved coaches only (for entrepreneur dashboard)
  app.get("/api/coaches/approved", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await (client
        .from("coach_applications")
        .select("*")
        .eq("status", "approved")
        .or("is_disabled.is.null,is_disabled.eq.false")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/coaches/approved] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[GET /api/coaches/approved] Returning", data?.length || 0, "coaches");
      // Strip profile_url from external_reputation for privacy (admin-only field)
      const safeData = (data || []).map((coach: any) => {
        if (coach.external_reputation) {
          const { profile_url, ...safeReputation } = coach.external_reputation;
          return { ...coach, external_reputation: safeReputation };
        }
        return coach;
      });
      return res.json(safeData);
    } catch (error: any) {
      console.error("[GET /api/coaches/approved] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle coach disabled status
  app.patch("/api/coaches/:id/toggle-disabled", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      
      const { data: current, error: getError } = await (client
        .from("coach_applications")
        .select("is_disabled")
        .eq("id", id)
        .single() as any);

      if (getError) {
        return res.status(400).json({ error: getError.message });
      }

      const newState = !current?.is_disabled;
      
      const { data, error } = await (client
        .from("coach_applications")
        .update({ is_disabled: newState } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, is_disabled: newState, coach: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle investor disabled status
  app.patch("/api/investors/:id/toggle-disabled", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      
      const { data: current, error: getError } = await (client
        .from("investor_applications")
        .select("is_disabled")
        .eq("id", id)
        .single() as any);

      if (getError) {
        return res.status(400).json({ error: getError.message });
      }

      const newState = !current?.is_disabled;
      
      const { data, error } = await (client
        .from("investor_applications")
        .update({ is_disabled: newState } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, is_disabled: newState, investor: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get coach profile by email
  app.get("/api/coaches/profile/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      
      const { data, error } = await (client
        .from("coach_applications")
        .select("*")
        .eq("email", decodedEmail)
        .eq("status", "approved")
        .single() as any);

      if (error || !data) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update coach profile by ID
  app.put("/api/coaches/profile/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { expertise, focusAreas, introCallRate, sessionRate, monthlyRate, monthlyRetainerDescription, hourlyRate, linkedin, bio, profileImage } = req.body;
      
      const ratesProvided = introCallRate && sessionRate && monthlyRate;
      const rateValue = ratesProvided 
        ? JSON.stringify({ introCallRate, sessionRate, monthlyRate, monthlyRetainerDescription: monthlyRetainerDescription || "" })
        : hourlyRate;

      const updateData: any = {
        expertise,
        focus_areas: focusAreas,
        hourly_rate: rateValue,
        linkedin: linkedin || null
      };
      
      // Add bio and profile_image if provided
      if (bio !== undefined) updateData.bio = bio;
      if (profileImage !== undefined) updateData.profile_image = profileImage;

      const { data, error } = await (client
        .from("coach_applications")
        .update(updateData)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, coach: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get coach clients (entrepreneurs who have purchased coaching services)
  app.get("/api/coaches/:coachId/clients", async (req, res) => {
    try {
      const { coachId } = req.params;
      console.log("[GET /api/coaches/:coachId/clients] Fetching clients for coach:", coachId);
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ clients: [] });
      }
      
      // Query coach_purchases table for unique clients
      const { data: purchases, error } = await (client
        .from("coach_purchases")
        .select("entrepreneur_email, entrepreneur_name, service_name, created_at")
        .eq("coach_id", coachId)
        .eq("status", "completed")
        .order("created_at", { ascending: false }) as any);
      
      if (error) {
        console.error("[GET /api/coaches/:coachId/clients] Database error:", error);
        return res.json({ clients: [] });
      }
      
      // Get unique clients (by email)
      const clientMap = new Map();
      for (const purchase of purchases || []) {
        if (!clientMap.has(purchase.entrepreneur_email)) {
          clientMap.set(purchase.entrepreneur_email, {
            id: purchase.entrepreneur_email,
            name: purchase.entrepreneur_name || 'Entrepreneur',
            email: purchase.entrepreneur_email,
            status: 'active',
            joinedAt: purchase.created_at
          });
        }
      }
      
      return res.json({ clients: Array.from(clientMap.values()) });
    } catch (error: any) {
      console.error("[GET /api/coaches/:coachId/clients] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get coach transactions/earnings history
  app.get("/api/coaches/:coachId/transactions", async (req, res) => {
    try {
      const { coachId } = req.params;
      console.log("[GET /api/coaches/:coachId/transactions] Fetching transactions for coach:", coachId);
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ transactions: [] });
      }
      
      // Query coach_purchases table for transactions
      const { data: purchases, error } = await (client
        .from("coach_purchases")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false }) as any);
      
      if (error) {
        console.error("[GET /api/coaches/:coachId/transactions] Database error:", error);
        return res.json({ transactions: [] });
      }
      
      // Transform to transaction format (amounts are in cents)
      const transactions = (purchases || []).map((p: any) => ({
        id: p.id,
        clientName: p.entrepreneur_name || 'Entrepreneur',
        clientEmail: p.entrepreneur_email,
        amount: (p.amount || 0) / 100,
        commission: (p.platform_fee || 0) / 100,
        netEarnings: (p.coach_earnings || 0) / 100,
        type: p.service_name || p.service_type,
        date: p.created_at,
        status: p.status
      }));
      
      return res.json({ transactions });
    } catch (error: any) {
      console.error("[GET /api/coaches/:coachId/transactions] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get entrepreneur's coach purchases history
  app.get("/api/entrepreneurs/:email/coach-purchases", async (req, res) => {
    try {
      const { email } = req.params;
      console.log("[GET /api/entrepreneurs/:email/coach-purchases] Fetching purchases for:", email);
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ purchases: [] });
      }
      
      const { data: purchases, error } = await (client
        .from("coach_purchases")
        .select("*")
        .eq("entrepreneur_email", decodeURIComponent(email))
        .order("created_at", { ascending: false }) as any);
      
      if (error) {
        console.error("[GET /api/entrepreneurs/:email/coach-purchases] Database error:", error);
        return res.json({ purchases: [] });
      }
      
      // Transform for frontend
      const formattedPurchases = (purchases || []).map((p: any) => ({
        id: p.id,
        coachName: p.coach_name,
        serviceName: p.service_name,
        serviceType: p.service_type,
        amount: (p.amount || 0) / 100,
        date: p.created_at,
        status: p.status
      }));
      
      return res.json({ purchases: formattedPurchases });
    } catch (error: any) {
      console.error("[GET /api/entrepreneurs/:email/coach-purchases] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== ADMIN EARNINGS ENDPOINT =====

  // Get all coach purchases for admin earnings dashboard
  app.get("/api/admin/earnings", async (req, res) => {
    try {
      console.log("[GET /api/admin/earnings] Fetching all coach purchases");
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ purchases: [], totals: { totalRevenue: 0, platformFees: 0, coachEarnings: 0 } });
      }
      
      const { data: purchases, error } = await (client
        .from("coach_purchases")
        .select("*")
        .order("created_at", { ascending: false }) as any);
      
      if (error) {
        console.error("[GET /api/admin/earnings] Database error:", error);
        return res.json({ purchases: [], totals: { totalRevenue: 0, platformFees: 0, coachEarnings: 0 } });
      }
      
      // Calculate totals (amounts are in cents)
      const totals = (purchases || []).reduce((acc: any, p: any) => {
        acc.totalRevenue += (p.amount || 0);
        acc.platformFees += (p.platform_fee || 0);
        acc.coachEarnings += (p.coach_earnings || 0);
        return acc;
      }, { totalRevenue: 0, platformFees: 0, coachEarnings: 0 });
      
      // Transform for frontend (convert cents to dollars)
      const formattedPurchases = (purchases || []).map((p: any) => ({
        id: p.id,
        coachId: p.coach_id,
        coachName: p.coach_name || 'Coach',
        entrepreneurEmail: p.entrepreneur_email,
        entrepreneurName: p.entrepreneur_name || 'Entrepreneur',
        serviceName: p.service_name,
        serviceType: p.service_type,
        amount: (p.amount || 0) / 100,
        platformFee: (p.platform_fee || 0) / 100,
        coachEarnings: (p.coach_earnings || 0) / 100,
        date: p.created_at,
        status: p.status,
        stripeSessionId: p.stripe_session_id
      }));
      
      return res.json({ 
        purchases: formattedPurchases,
        totals: {
          totalRevenue: totals.totalRevenue / 100,
          platformFees: totals.platformFees / 100,
          coachEarnings: totals.coachEarnings / 100
        }
      });
    } catch (error: any) {
      console.error("[GET /api/admin/earnings] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get subscription revenue for admin earnings dashboard
  app.get("/api/admin/subscription-revenue", async (req, res) => {
    try {
      console.log("[GET /api/admin/subscription-revenue] Fetching subscription payments");
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ subscriptions: [], totals: { totalRevenue: 0, count: 0 } });
      }
      
      // Fetch all paid entrepreneurs from ideas table
      const { data: paidEntrepreneurs, error } = await (client
        .from("ideas")
        .select("id, entrepreneur_name, entrepreneur_email, payment_date, payment_status, stripe_customer_id")
        .eq("payment_status", "paid")
        .order("payment_date", { ascending: false }) as any);
      
      if (error) {
        console.error("[GET /api/admin/subscription-revenue] Database error:", error);
        return res.json({ subscriptions: [], totals: { totalRevenue: 0, count: 0 } });
      }
      
      const subscriptionAmount = 9.99; // $9.99/month Founders Circle subscription
      const subscriptions = (paidEntrepreneurs || []).map((e: any) => ({
        id: e.id,
        entrepreneurName: e.entrepreneur_name || 'Entrepreneur',
        entrepreneurEmail: e.entrepreneur_email,
        amount: subscriptionAmount,
        date: e.payment_date,
        status: 'active',
        stripeCustomerId: e.stripe_customer_id
      }));
      
      const totalRevenue = subscriptions.length * subscriptionAmount;
      
      return res.json({ 
        subscriptions,
        totals: {
          totalRevenue,
          count: subscriptions.length
        }
      });
    } catch (error: any) {
      console.error("[GET /api/admin/subscription-revenue] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== COACH CONTACT REQUESTS (One-Time Messaging) =====

  // Send a one-time contact request from entrepreneur to coach
  app.post("/api/coach-contact-requests", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { coachId, coachName, coachEmail, entrepreneurEmail, entrepreneurName, message } = req.body;

      if (!coachId || !entrepreneurEmail || !message) {
        return res.status(400).json({ error: "Coach ID, entrepreneur email, and message are required" });
      }

      // Block messages containing email addresses or URLs
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const urlPattern = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|app|dev|me|info|biz|xyz)[^\s]*/i;
      
      if (emailPattern.test(message)) {
        return res.status(400).json({ error: "Please do not include email addresses in your message. Use the platform to communicate." });
      }
      
      if (urlPattern.test(message)) {
        return res.status(400).json({ error: "Please do not include website links in your message. Use the platform to communicate." });
      }

      // Check if entrepreneur has already sent a request to this coach
      const { data: existingRequest, error: checkError } = await (client
        .from("coach_contact_requests")
        .select("id, status")
        .eq("coach_id", coachId)
        .eq("entrepreneur_email", entrepreneurEmail)
        .single() as any);

      if (existingRequest) {
        return res.status(400).json({ 
          error: "You have already sent a message to this coach. Only one initial message is allowed per coach." 
        });
      }

      // Create the contact request
      const { data, error } = await (client
        .from("coach_contact_requests")
        .insert({
          coach_id: coachId,
          coach_name: coachName || 'Coach',
          coach_email: coachEmail,
          entrepreneur_email: entrepreneurEmail,
          entrepreneur_name: entrepreneurName || 'Entrepreneur',
          message: message,
          status: 'pending' // pending, replied, closed
        })
        .select() as any);

      if (error) {
        console.error("[POST /api/coach-contact-requests] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Send email notification to coach (no email addresses shown, just names)
      try {
        const resendConfig = await getResendClient();
        
        if (resendConfig && coachEmail) {
          await resendConfig.client.emails.send({
            from: resendConfig.fromEmail,
            to: coachEmail,
            subject: `New Contact Request from ${entrepreneurName || 'An Entrepreneur'}`,
            html: `
              <h2>New Contact Request</h2>
              <p><strong>${entrepreneurName || 'An entrepreneur'}</strong> would like to connect with you on TouchConnectPro.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p><em>This is a one-time contact request. You may send one reply to continue the conversation.</em></p>
              <p>Log in to your dashboard to respond.</p>
            `
          });
          console.log("[POST /api/coach-contact-requests] Email sent to coach");
        } else {
          console.log("[POST /api/coach-contact-requests] Resend not configured, skipping coach email");
        }
      } catch (emailError) {
        console.error("[POST /api/coach-contact-requests] Email error:", emailError);
      }

      // Send copy to admin (names only, no emails shown)
      try {
        const resendConfig = await getResendClient();
        const adminEmail = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";
        
        if (resendConfig) {
          await resendConfig.client.emails.send({
            from: resendConfig.fromEmail,
            to: adminEmail,
            subject: `[Admin] New Coach Contact Request: ${entrepreneurName} → ${coachName}`,
            html: `
              <h2>New Coach Contact Request</h2>
              <p><strong>From:</strong> ${entrepreneurName}</p>
              <p><strong>To Coach:</strong> ${coachName}</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            `
          });
          console.log("[POST /api/coach-contact-requests] Email sent to admin");
        }
      } catch (emailError) {
        console.error("[POST /api/coach-contact-requests] Admin email error:", emailError);
      }

      console.log("[POST /api/coach-contact-requests] Request created:", data?.[0]?.id);
      return res.json({ success: true, request: data?.[0] });
    } catch (error: any) {
      console.error("[POST /api/coach-contact-requests] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Coach replies to a contact request (one-time reply)
  app.post("/api/coach-contact-requests/:id/reply", async (req, res) => {
    try {
      const { id } = req.params;
      const { reply, coachEmail } = req.body;

      if (!reply) {
        return res.status(400).json({ error: "Reply message is required" });
      }

      // Block replies containing email addresses or URLs
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const urlPattern = /(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|app|dev|me|info|biz|xyz)[^\s]*/i;
      
      if (emailPattern.test(reply)) {
        return res.status(400).json({ error: "Please do not include email addresses in your reply. Use the platform to communicate." });
      }
      
      if (urlPattern.test(reply)) {
        return res.status(400).json({ error: "Please do not include website links in your reply. Use the platform to communicate." });
      }

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Get the request
      const { data: request, error: fetchError } = await (client
        .from("coach_contact_requests")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (fetchError || !request) {
        return res.status(404).json({ error: "Contact request not found" });
      }

      // Verify the replying coach owns this request
      if (coachEmail && request.coach_email && coachEmail !== request.coach_email) {
        return res.status(403).json({ error: "You are not authorized to reply to this request" });
      }

      if (request.status === 'replied' || request.status === 'closed') {
        return res.status(400).json({ error: "This conversation has already been replied to or closed" });
      }

      // Update the request with the reply
      const { data, error } = await (client
        .from("coach_contact_requests")
        .update({
          reply: reply,
          replied_at: new Date().toISOString(),
          status: 'closed' // Conversation closed after reply
        })
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[POST /api/coach-contact-requests/:id/reply] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Send email notification to entrepreneur (names only, no emails shown)
      try {
        const resendConfig = await getResendClient();
        
        if (resendConfig && request.entrepreneur_email) {
          await resendConfig.client.emails.send({
            from: resendConfig.fromEmail,
            to: request.entrepreneur_email,
            subject: `Reply from ${request.coach_name || 'Coach'}`,
            html: `
              <h2>Reply from ${request.coach_name || 'Your Coach'}</h2>
              <p><strong>${request.coach_name}</strong> has replied to your contact request.</p>
              <div style="background: #e8f4e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your original message:</strong></p>
                <p style="white-space: pre-wrap;">${request.message}</p>
              </div>
              <div style="background: #e8f0f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Coach's reply:</strong></p>
                <p style="white-space: pre-wrap;">${reply}</p>
              </div>
              <p><em>This was a one-time contact. To continue working with this coach, consider booking their services through the platform.</em></p>
            `
          });
          console.log("[POST /api/coach-contact-requests/:id/reply] Email sent to entrepreneur");
        } else {
          console.log("[POST /api/coach-contact-requests/:id/reply] Resend not configured, skipping entrepreneur email");
        }
      } catch (emailError) {
        console.error("[POST /api/coach-contact-requests/:id/reply] Email error:", emailError);
      }

      // Send copy to admin (names only, no emails shown)
      try {
        const resendConfig = await getResendClient();
        const adminEmail = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";
        
        if (resendConfig) {
          await resendConfig.client.emails.send({
            from: resendConfig.fromEmail,
            to: adminEmail,
            subject: `[Admin] Coach Reply: ${request.coach_name} → ${request.entrepreneur_name}`,
            html: `
              <h2>Coach Replied to Contact Request</h2>
              <p><strong>Coach:</strong> ${request.coach_name}</p>
              <p><strong>To Entrepreneur:</strong> ${request.entrepreneur_name}</p>
              <div style="background: #e8f4e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Original message:</strong></p>
                <p style="white-space: pre-wrap;">${request.message}</p>
              </div>
              <div style="background: #e8f0f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Coach's reply:</strong></p>
                <p style="white-space: pre-wrap;">${reply}</p>
              </div>
              <p><em>Conversation is now closed.</em></p>
            `
          });
          console.log("[POST /api/coach-contact-requests/:id/reply] Email sent to admin");
        }
      } catch (emailError) {
        console.error("[POST /api/coach-contact-requests/:id/reply] Admin email error:", emailError);
      }

      console.log("[POST /api/coach-contact-requests/:id/reply] Reply sent for request:", id);
      return res.json({ success: true, request: data?.[0] });
    } catch (error: any) {
      console.error("[POST /api/coach-contact-requests/:id/reply] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get contact requests for a coach
  app.get("/api/coaches/:coachId/contact-requests", async (req, res) => {
    try {
      const { coachId } = req.params;
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ requests: [] });
      }

      const { data: requests, error } = await (client
        .from("coach_contact_requests")
        .select("*")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/coaches/:coachId/contact-requests] Error:", error);
        return res.json({ requests: [] });
      }

      return res.json({ requests: requests || [] });
    } catch (error: any) {
      console.error("[GET /api/coaches/:coachId/contact-requests] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get single coach by ID (public profile) - MUST BE AFTER all other /api/coaches/:coachId/* routes
  app.get("/api/coaches/:coachId", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { coachId } = req.params;
      
      const { data, error } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .eq("status", "approved")
        .or("is_disabled.is.null,is_disabled.eq.false")
        .single() as any);

      if (error) {
        console.error("[GET /api/coaches/:coachId] Error:", error);
        return res.status(404).json({ error: "Coach not found" });
      }

      return res.json(data);
    } catch (error: any) {
      console.error("[GET /api/coaches/:coachId] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get contact requests sent by an entrepreneur
  app.get("/api/entrepreneurs/:email/contact-requests", async (req, res) => {
    try {
      const { email } = req.params;
      
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ requests: [] });
      }

      const { data: requests, error } = await (client
        .from("coach_contact_requests")
        .select("*")
        .eq("entrepreneur_email", decodeURIComponent(email))
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/entrepreneurs/:email/contact-requests] Error:", error);
        return res.json({ requests: [] });
      }

      return res.json({ requests: requests || [] });
    } catch (error: any) {
      console.error("[GET /api/entrepreneurs/:email/contact-requests] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all contact requests for admin
  app.get("/api/admin/contact-requests", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ requests: [] });
      }

      const { data: requests, error } = await (client
        .from("coach_contact_requests")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/admin/contact-requests] Error:", error);
        return res.json({ requests: [] });
      }

      return res.json({ requests: requests || [] });
    } catch (error: any) {
      console.error("[GET /api/admin/contact-requests] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/admin/update-user-email - Update user email (requires admin token)
  app.patch("/api/admin/update-user-email", async (req, res) => {
    console.log("[PATCH /api/admin/update-user-email] Updating user email");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const token = req.headers.authorization?.replace("Bearer ", "");
      const { userType, userId, newEmail } = req.body;

      // Verify requesting user is an admin
      const { data: session, error: sessionError } = await (client
        .from("admin_sessions")
        .select("*, admin_users(*)")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single() as any);

      if (sessionError || !session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!userType || !userId || !newEmail) {
        return res.status(400).json({ error: "userType, userId, and newEmail are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Determine table and email column based on userType
      const tableConfig: {[key: string]: {table: string; emailColumn: string}} = {
        entrepreneur: { table: "ideas", emailColumn: "entrepreneur_email" },
        mentor: { table: "mentor_applications", emailColumn: "email" },
        coach: { table: "coach_applications", emailColumn: "email" },
        investor: { table: "investor_applications", emailColumn: "email" }
      };

      const config = tableConfig[userType];
      if (!config) {
        return res.status(400).json({ error: "Invalid userType. Must be entrepreneur, mentor, coach, or investor" });
      }

      // Get the current/old email from the application table
      const { data: currentUser, error: fetchError } = await (client
        .from(config.table)
        .select(config.emailColumn)
        .eq("id", userId)
        .single() as any);

      if (fetchError || !currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const oldEmail = currentUser[config.emailColumn];
      console.log(`[ADMIN] Changing email from ${oldEmail} to ${newEmail}`);

      // Check if new email already exists in this table
      const { data: existingUser } = await (client
        .from(config.table)
        .select("id")
        .eq(config.emailColumn, newEmail.toLowerCase())
        .neq("id", userId)
        .single() as any);

      if (existingUser) {
        return res.status(400).json({ error: `A ${userType} with this email already exists` });
      }

      // Update Supabase Auth email if user exists in auth system
      let authUpdateSuccess = false;
      try {
        const { data: authListData, error: listError } = await (client.auth.admin.listUsers() as any);
        const users = authListData?.users;
        if (!listError && users) {
          const authUser = users.find((u: any) => u.email?.toLowerCase() === oldEmail.toLowerCase());
          if (authUser) {
            console.log(`[ADMIN] Found auth user ${authUser.id}, updating email`);
            const { error: authUpdateError } = await (client.auth.admin.updateUserById(
              authUser.id,
              { email: newEmail.toLowerCase(), email_confirm: true }
            ) as any);
            if (authUpdateError) {
              console.error("[ADMIN] Auth email update error:", authUpdateError);
            } else {
              authUpdateSuccess = true;
              console.log(`[ADMIN] Successfully updated auth email to ${newEmail}`);
            }
          } else {
            console.log(`[ADMIN] No auth user found for ${oldEmail}`);
          }
        }
      } catch (authErr: any) {
        console.error("[ADMIN] Error updating auth email:", authErr);
      }

      // Update the users table if it has this email
      try {
        const { error: usersUpdateError } = await (client
          .from("users")
          .update({ email: newEmail.toLowerCase() })
          .eq("email", oldEmail.toLowerCase()) as any);
        if (!usersUpdateError) {
          console.log(`[ADMIN] Updated users table email`);
        }
      } catch (err: any) {
        console.error("[ADMIN] Error updating users table:", err);
      }

      // Update the application table email
      const updateData: {[key: string]: string} = {};
      updateData[config.emailColumn] = newEmail.toLowerCase();

      const { data, error } = await (client
        .from(config.table)
        .update(updateData)
        .eq("id", userId)
        .select() as any);

      if (error) {
        console.error("[ADMIN] Update email error:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`[ADMIN] Updated ${userType} email for ID ${userId} to ${newEmail}`);
      return res.json({ 
        success: true, 
        user: data[0],
        authUpdated: authUpdateSuccess,
        message: authUpdateSuccess 
          ? "Email updated in all systems. User can now log in with the new email."
          : "Email updated in application records. Note: User may not have set up login yet."
      });
    } catch (error: any) {
      console.error("[ADMIN] Update email error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/resend-invite - Resend registration email (requires admin token)
  app.post("/api/admin/resend-invite", async (req, res) => {
    console.log("[POST /api/admin/resend-invite] Resending invite");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const token = req.headers.authorization?.replace("Bearer ", "");
      const { userType, userId } = req.body;

      // Verify requesting user is an admin
      const { data: session, error: sessionError } = await (client
        .from("admin_sessions")
        .select("*, admin_users(*)")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .single() as any);

      if (sessionError || !session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!userType || !userId) {
        return res.status(400).json({ error: "userType and userId are required" });
      }

      // Determine table and email column based on userType
      const tableConfig: {[key: string]: {table: string, emailColumn: string, nameColumn: string}} = {
        entrepreneur: { table: "ideas", emailColumn: "entrepreneur_email", nameColumn: "entrepreneur_name" },
        mentor: { table: "mentor_applications", emailColumn: "email", nameColumn: "full_name" },
        coach: { table: "coach_applications", emailColumn: "email", nameColumn: "full_name" },
        investor: { table: "investor_applications", emailColumn: "email", nameColumn: "full_name" }
      };

      const config = tableConfig[userType];
      if (!config) {
        return res.status(400).json({ error: "Invalid userType. Must be entrepreneur, mentor, coach, or investor" });
      }

      // Get user's email and name from the application table
      const { data: userData, error: fetchError } = await (client
        .from(config.table)
        .select(`${config.emailColumn}, ${config.nameColumn}, status`)
        .eq("id", userId)
        .single() as any);

      if (fetchError || !userData) {
        return res.status(404).json({ error: "User not found" });
      }

      const email = userData[config.emailColumn];
      const fullName = userData[config.nameColumn];
      const status = userData.status;

      // Only allow resend for approved or pre-approved users
      if (!["approved", "pre-approved"].includes(status)) {
        return res.status(400).json({ error: `Cannot resend invite. User status is "${status}". Must be approved or pre-approved.` });
      }

      console.log(`[ADMIN] Resending invite to ${email} (${fullName}) for ${userType}`);

      // Check if user already has a Supabase auth account (already registered)
      let userHasAuth = false;
      try {
        const { data: authUsers } = await client.auth.admin.listUsers();
        if (authUsers?.users) {
          userHasAuth = authUsers.users.some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        }
      } catch (authErr: any) {
        console.error("[ADMIN] Error checking auth status:", authErr);
      }

      if (userHasAuth) {
        // User already has login credentials - send a login reminder instead
        console.log(`[ADMIN] User ${email} already has auth account - sending login reminder`);
        
        const resendData = await getResendClient();
        if (resendData) {
          const { client: resendClient, fromEmail } = resendData;
          const FRONTEND_URL = process.env.NODE_ENV === 'production' 
            ? 'https://touchconnectpro.com' 
            : 'http://localhost:5000';
          try {
            await resendClient.emails.send({
              from: fromEmail,
              to: email,
              subject: "TouchConnectPro - Login Reminder",
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Hello, ${fullName}!</h1>
                    </div>
                    <div class="content">
                      <p>This is a reminder that you already have an account with TouchConnectPro.</p>
                      
                      <p>You can log in anytime using your email: <strong>${email}</strong></p>
                      
                      <p style="text-align: center;">
                        <a href="${FRONTEND_URL}/login" class="button">Go to Login</a>
                      </p>
                      
                      <p style="font-size: 14px; color: #64748b;">If you forgot your password, you can reset it from the login page.</p>
                      
                      <p>Best regards,<br>The TouchConnectPro Team</p>
                    </div>
                    <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            return res.json({ 
              success: true, 
              message: `Login reminder sent to ${email}. They already have an account and can log in with their existing password.`
            });
          } catch (emailErr: any) {
            console.error("[ADMIN] Error sending login reminder:", emailErr);
            return res.status(500).json({ error: "Failed to send login reminder email" });
          }
        } else {
          return res.status(500).json({ error: "Email service not configured" });
        }
      }

      // User doesn't have auth yet - expire old tokens and send new password setup link
      // Expire any existing pending tokens for this user
      const { error: expireError } = await (client
        .from("password_tokens")
        .update({ status: "expired" })
        .eq("email", email)
        .eq("status", "pending") as any);

      if (expireError) {
        console.error("[ADMIN] Error expiring old tokens:", expireError);
      } else {
        console.log(`[ADMIN] Expired old pending tokens for ${email}`);
      }

      // For resend, we always want to send the password setup email (wasPreApproved = false)
      const wasPreApproved = false;

      // Send the status email which creates a new token
      const emailResult = await sendStatusEmail(email, fullName, userType, status, userId, wasPreApproved);

      if (emailResult.success) {
        console.log(`[ADMIN] Successfully resent invite to ${email}`);
        return res.json({ 
          success: true, 
          message: `Invite email sent to ${email}. The link is valid for 7 days.`
        });
      } else {
        console.error(`[ADMIN] Failed to resend invite:`, emailResult.reason);
        return res.status(500).json({ 
          error: `Failed to send email: ${emailResult.reason || "Unknown error"}`
        });
      }
    } catch (error: any) {
      console.error("[ADMIN] Resend invite error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Check if entrepreneur has already contacted a specific coach
  app.get("/api/coach-contact-requests/check", async (req, res) => {
    try {
      const { coachId, entrepreneurEmail } = req.query;
      
      if (!coachId || !entrepreneurEmail) {
        return res.status(400).json({ error: "Coach ID and entrepreneur email are required" });
      }

      const client = getSupabaseClient();
      if (!client) {
        return res.json({ hasContacted: false });
      }

      const { data: existingRequest, error } = await (client
        .from("coach_contact_requests")
        .select("id, status")
        .eq("coach_id", coachId)
        .eq("entrepreneur_email", entrepreneurEmail)
        .single() as any);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("[GET /api/coach-contact-requests/check] Error:", error);
      }

      return res.json({ 
        hasContacted: !!existingRequest, 
        status: existingRequest?.status || null 
      });
    } catch (error: any) {
      console.error("[GET /api/coach-contact-requests/check] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== COACH RATINGS ENDPOINTS =====

  // Submit a coach rating
  app.post("/api/coach-ratings", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { coachId, raterEmail, rating, review } = req.body;

      if (!coachId || !raterEmail || !rating) {
        return res.status(400).json({ error: "Coach ID, rater email, and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const { data, error } = await (client
        .from("coach_ratings")
        .insert({
          coach_id: coachId,
          rater_email: raterEmail,
          rating: rating,
          review: review || null
        })
        .select() as any);

      if (error) {
        console.error("[POST /api/coach-ratings] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[POST /api/coach-ratings] Rating submitted for coach:", coachId);
      
      // Send email notification to the coach
      try {
        const { data: coachData } = await (client
          .from("coach_applications")
          .select("email, full_name")
          .eq("id", coachId)
          .single() as any);
        
        if (coachData?.email) {
          const resendConfig = await getResendClient();
          if (resendConfig) {
            const starsDisplay = "★".repeat(rating) + "☆".repeat(5 - rating);
            const reviewPreview = review ? (review.length > 200 ? review.substring(0, 200) + "..." : review) : null;
            
            await resendConfig.client.emails.send({
              from: resendConfig.fromEmail,
              to: coachData.email,
              subject: `New ${rating}-Star Review on TouchConnectPro`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .stars { font-size: 28px; color: #f59e0b; text-align: center; margin: 15px 0; }
                    .review-box { background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #06b6d4; font-style: italic; }
                    .button { display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>You Received a New Review!</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${coachData.full_name || "Coach"},</p>
                      <p>Great news! An entrepreneur has left you a review on TouchConnectPro.</p>
                      <div class="stars">${starsDisplay}</div>
                      <p style="text-align: center; font-size: 18px; font-weight: 600;">${rating} out of 5 stars</p>
                      ${reviewPreview ? `<div class="review-box"><p style="margin: 0;">"${reviewPreview}"</p></div>` : '<p style="text-align: center; color: #64748b;">No written review was provided.</p>'}
                      <p>This review is now visible on your public profile page. Keep up the great work!</p>
                      <p style="text-align: center;"><a href="https://touchconnectpro.com/login" class="button">View Your Dashboard</a></p>
                      <p>Best regards,<br>The TouchConnectPro Team</p>
                    </div>
                    <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            console.log("[POST /api/coach-ratings] Email notification sent to coach:", coachData.email);
          }
        }
      } catch (emailErr: any) {
        console.error("[POST /api/coach-ratings] Error sending email:", emailErr.message);
      }
      
      // Return rating without email for privacy
      const { rater_email, ...safeRating } = data?.[0] || {};
      return res.json({ success: true, rating: safeRating });
    } catch (error: any) {
      console.error("[POST /api/coach-ratings] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all coach ratings (aggregated by coach) - privacy-safe, no emails returned
  app.get("/api/coach-ratings", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Only select coach_id and rating - no email or review data for privacy
      const { data, error } = await (client
        .from("coach_ratings")
        .select("coach_id, rating") as any);

      if (error) {
        console.error("[GET /api/coach-ratings] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Aggregate ratings by coach_id - only return averageRating and totalRatings
      const aggregated: { [coachId: string]: { averageRating: number; totalRatings: number } } = {};
      
      for (const r of (data || [])) {
        if (!aggregated[r.coach_id]) {
          aggregated[r.coach_id] = { averageRating: 0, totalRatings: 0 };
        }
        aggregated[r.coach_id].totalRatings++;
      }

      // Calculate averages using a second pass
      const ratingsByCoach: { [coachId: string]: number[] } = {};
      for (const r of (data || [])) {
        if (!ratingsByCoach[r.coach_id]) {
          ratingsByCoach[r.coach_id] = [];
        }
        ratingsByCoach[r.coach_id].push(r.rating);
      }

      for (const coachId in aggregated) {
        const ratings = ratingsByCoach[coachId];
        const sum = ratings.reduce((acc: number, r: number) => acc + r, 0);
        aggregated[coachId].averageRating = Math.round((sum / ratings.length) * 10) / 10;
      }

      return res.json(aggregated);
    } catch (error: any) {
      console.error("[GET /api/coach-ratings] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get reviews for a specific coach (emails hidden for privacy - public endpoint)
  app.get("/api/coach-ratings/:coachId/reviews", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { coachId } = req.params;
      console.log("[GET /api/coach-ratings/:coachId/reviews] Fetching reviews for coach ID:", coachId);

      const { data, error } = await (client
        .from("coach_ratings")
        .select("id, rating, review, created_at")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/coach-ratings/:coachId/reviews] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[GET /api/coach-ratings/:coachId/reviews] Found", data?.length || 0, "reviews for coach ID:", coachId);
      // Reviews returned without email for privacy
      return res.json({ reviews: data || [] });
    } catch (error: any) {
      console.error("[GET /api/coach-ratings/:coachId/reviews] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoint: Get reviews for a specific coach WITH emails (for admin dashboard)
  app.get("/api/admin/coach-ratings/:coachId/reviews", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { coachId } = req.params;
      console.log("[GET /api/admin/coach-ratings/:coachId/reviews] Admin fetching reviews for coach ID:", coachId);

      const { data, error } = await (client
        .from("coach_ratings")
        .select("id, rating, review, rater_email, created_at")
        .eq("coach_id", coachId)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[GET /api/admin/coach-ratings/:coachId/reviews] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[GET /api/admin/coach-ratings/:coachId/reviews] Found", data?.length || 0, "reviews for coach ID:", coachId);
      // Admin endpoint includes rater_email
      return res.json({ reviews: data || [] });
    } catch (error: any) {
      console.error("[GET /api/admin/coach-ratings/:coachId/reviews] Error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all investors
  app.get("/api/investors", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await (client
        .from("investor_applications")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get investor profile by email
  app.get("/api/investors/profile/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      
      const { data, error } = await (client
        .from("investor_applications")
        .select("*")
        .eq("email", decodedEmail)
        .eq("status", "approved")
        .single() as any);

      if (error || !data) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update investor profile by ID
  app.put("/api/investors/profile/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { fullName, bio, fundName, investmentFocus, investmentPreference, investmentAmount, linkedin, profileImage } = req.body;

      // Get existing data to preserve notes
      const { data: existingData } = await (client
        .from("investor_applications")
        .select("data")
        .eq("id", id)
        .single() as any);

      const updateData: any = {
        fund_name: fundName,
        investment_focus: investmentFocus,
        investment_preference: investmentPreference,
        investment_amount: investmentAmount,
        linkedin: linkedin || null
      };

      // Update full_name if provided
      if (fullName) {
        updateData.full_name = fullName;
      }

      // Store bio and profileImage in data JSONB field
      if (profileImage !== undefined || bio !== undefined) {
        updateData.data = {
          ...(existingData?.data || {}),
          ...(profileImage !== undefined && { profileImage }),
          ...(bio !== undefined && { bio })
        };
      }

      const { data, error } = await (client
        .from("investor_applications")
        .update(updateData as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, investor: data?.[0] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== INVESTOR NOTES ENDPOINTS =====

  // Respond to an investor note
  app.post("/api/investor-notes/:investorId/respond", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { investorId } = req.params;
      const { noteId, text, attachmentUrl, attachmentName, attachmentSize, attachmentType, fromAdmin } = req.body;

      // Get existing data including email for notification
      const { data: existingData, error: fetchError } = await (client
        .from("investor_applications")
        .select("data, email, full_name")
        .eq("id", investorId)
        .single() as any);

      if (fetchError) {
        return res.status(404).json({ error: "Investor not found" });
      }

      const notes = existingData?.data?.notes || [];
      const noteIndex = notes.findIndex((n: any) => n.id === noteId);
      
      if (noteIndex === -1) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Add response to note
      const newResponse = {
        id: `resp_${Date.now()}`,
        text,
        timestamp: new Date().toISOString(),
        attachmentUrl,
        attachmentName,
        attachmentSize,
        attachmentType,
        fromAdmin: fromAdmin || false
      };

      notes[noteIndex].responses = notes[noteIndex].responses || [];
      notes[noteIndex].responses.push(newResponse);

      const { data, error } = await (client
        .from("investor_applications")
        .update({
          data: {
            ...existingData.data,
            notes
          }
        } as any)
        .eq("id", investorId)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Send email notification based on who responded
      console.log("[INVESTOR NOTE RESPOND] fromAdmin:", fromAdmin, "investor email:", existingData.email);
      const resendData = await getResendClient();
      console.log("[INVESTOR NOTE RESPOND] resendData available:", !!resendData);
      if (resendData) {
        try {
          if (fromAdmin && existingData.email) {
            // Admin responded - notify investor
            await resendData.client.emails.send({
              from: resendData.fromEmail,
              to: existingData.email,
              subject: "Admin Response to Your Note - TouchConnectPro",
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .note-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Admin Response</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${existingData.full_name || "there"},</p>
                      <p>The admin has responded to a note on your investor dashboard:</p>
                      <div class="note-box">
                        <p>${text || "Please check your dashboard for the response."}</p>
                        ${attachmentName ? `<p><strong>Attachment:</strong> ${attachmentName}</p>` : ''}
                      </div>
                      <p>Please log in to your investor dashboard to continue the conversation.</p>
                      <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            console.log("[INVESTOR NOTE] Admin response email sent to investor:", existingData.email);
          } else {
            // Investor responded - notify admin
            await resendData.client.emails.send({
              from: resendData.fromEmail,
              to: ADMIN_EMAIL,
              subject: `Investor Response: ${existingData.full_name || existingData.email}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .note-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>New Investor Response</h1>
                    </div>
                    <div class="content">
                      <p>Investor <strong>${existingData.full_name || "Unknown"}</strong> (${existingData.email}) has responded to a note:</p>
                      <div class="note-box">
                        <p>${text || "Please check the admin dashboard for the response."}</p>
                        ${attachmentName ? `<p><strong>Attachment:</strong> ${attachmentName}</p>` : ''}
                      </div>
                      <p>Please log in to the admin dashboard to view and respond.</p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            console.log("[INVESTOR NOTE] Investor response email sent to admin:", ADMIN_EMAIL);
          }
        } catch (emailErr: any) {
          console.error("[INVESTOR NOTE] Email error:", emailErr.message, emailErr.stack);
        }
      } else {
        console.log("[INVESTOR NOTE RESPOND] No resend client available - email not sent");
      }

      return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Add a note to investor (admin use)
  app.post("/api/investor-notes/:investorId", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { investorId } = req.params;
      const { text, attachmentUrl, attachmentName, attachmentSize, attachmentType } = req.body;

      if (!text?.trim() && !attachmentUrl) {
        return res.status(400).json({ error: "Note text or attachment is required" });
      }

      // Get existing data including email for notification
      const { data: existingData, error: fetchError } = await (client
        .from("investor_applications")
        .select("data, email, full_name")
        .eq("id", investorId)
        .single() as any);

      if (fetchError) {
        return res.status(404).json({ error: "Investor not found" });
      }

      const notes = existingData?.data?.notes || [];
      const newNote: any = {
        id: `note_${Date.now()}`,
        text: text?.trim() || "",
        timestamp: new Date().toISOString(),
        completed: false,
        responses: []
      };

      if (attachmentUrl) {
        newNote.attachmentUrl = attachmentUrl;
        newNote.attachmentName = attachmentName;
        newNote.attachmentSize = attachmentSize;
        newNote.attachmentType = attachmentType;
      }

      notes.push(newNote);

      const { data, error } = await (client
        .from("investor_applications")
        .update({
          data: {
            ...existingData.data,
            notes
          }
        } as any)
        .eq("id", investorId)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Send email notification to investor
      const resendData = await getResendClient();
      if (resendData && existingData.email) {
        try {
          await resendData.client.emails.send({
            from: resendData.fromEmail,
            to: existingData.email,
            subject: "New Note from TouchConnectPro Admin",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .note-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>New Note from Admin</h1>
                  </div>
                  <div class="content">
                    <p>Hi ${existingData.full_name || "there"},</p>
                    <p>You have received a new note from the TouchConnectPro admin team:</p>
                    <div class="note-box">
                      <p>${text?.trim() || "Please check your dashboard for an attached file."}</p>
                      ${attachmentName ? `<p><strong>Attachment:</strong> ${attachmentName}</p>` : ''}
                    </div>
                    <p>Please log in to your investor dashboard to view and respond to this note.</p>
                    <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log("[INVESTOR NOTE] Email sent to investor:", existingData.email);
        } catch (emailErr: any) {
          console.error("[INVESTOR NOTE] Email error:", emailErr.message);
        }
      }

      return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Toggle investor note completion
  app.patch("/api/investor-notes/:investorId/:noteId/toggle", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { investorId, noteId } = req.params;
      const { completed } = req.body;

      // Get existing data
      const { data: existingData, error: fetchError } = await (client
        .from("investor_applications")
        .select("data")
        .eq("id", investorId)
        .single() as any);

      if (fetchError) {
        return res.status(404).json({ error: "Investor not found" });
      }

      const notes = existingData?.data?.notes || [];
      const noteIndex = notes.findIndex((n: any) => n.id === noteId);
      
      if (noteIndex === -1) {
        return res.status(404).json({ error: "Note not found" });
      }

      notes[noteIndex].completed = completed;

      const { data, error } = await (client
        .from("investor_applications")
        .update({
          data: {
            ...existingData.data,
            notes
          }
        } as any)
        .eq("id", investorId)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Mark investor notes as read (admin viewed them)
  app.post("/api/investor-notes/:investorId/mark-read", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { investorId } = req.params;

      // Get existing data
      const { data: existingData, error: fetchError } = await (client
        .from("investor_applications")
        .select("data")
        .eq("id", investorId)
        .single() as any);

      if (fetchError) {
        return res.status(404).json({ error: "Investor not found" });
      }

      // Update lastAdminViewedNotesAt timestamp
      const { data, error } = await (client
        .from("investor_applications")
        .update({
          data: {
            ...existingData.data,
            lastAdminViewedNotesAt: new Date().toISOString()
          }
        } as any)
        .eq("id", investorId)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      console.log("[INVESTOR NOTES] Marked as read for investor:", investorId);
      return res.json({ success: true, lastAdminViewedNotesAt: data?.[0]?.data?.lastAdminViewedNotesAt });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Upload investor attachment
  app.post("/api/upload-investor-attachment", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fileName, fileData, fileType, investorId } = req.body;

      if (!fileName || !fileData || !investorId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Extract base64 data
      const base64Data = fileData.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique file name
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `investor-attachments/${investorId}/${timestamp}_${sanitizedFileName}`;

      const { data, error } = await (client.storage
        .from("note-attachments")
        .upload(storagePath, buffer, {
          contentType: fileType,
          upsert: false
        }) as any);

      if (error) {
        console.error("[UPLOAD] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from("note-attachments")
        .getPublicUrl(storagePath);

      return res.json({ success: true, url: urlData.publicUrl });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get investor meetings
  app.get("/api/investor-meetings/:investorId", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { investorId } = req.params;

      // For now, return empty array - meetings will be stored in data.meetings
      const { data, error } = await (client
        .from("investor_applications")
        .select("data")
        .eq("id", investorId)
        .single() as any);

      if (error) {
        return res.status(404).json({ error: "Investor not found" });
      }

      return res.json({ meetings: data?.data?.meetings || [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Validate password token
  app.get("/api/password-token/:token", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { token } = req.params;

      const { data, error } = await (client
        .from("password_tokens")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single() as any);

      if (error || !data) {
        return res.status(404).json({ error: "Invalid or expired token" });
      }

      if (new Date(data.expires_at) < new Date()) {
        return res.status(400).json({ error: "Token has expired" });
      }

      return res.json({
        valid: true,
        email: data.email,
        userType: data.user_type
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Set password with token (creates Supabase auth user)
  app.post("/api/set-password", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token and password required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const { data: tokenData, error: tokenError } = await (client
        .from("password_tokens")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single() as any);

      if (tokenError || !tokenData) {
        return res.status(404).json({ error: "Invalid or expired token" });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return res.status(400).json({ error: "Token has expired" });
      }

      let userId = null;
      const { data: authData, error: authError } = await (client.auth.admin.createUser({
        email: tokenData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          user_type: tokenData.user_type,
          application_id: tokenData.application_id
        }
      }) as any);

      if (authError) {
        if (authError.message.includes("already been registered")) {
          console.log("[AUTH] User already exists, fetching existing user ID");
          const { data: { users }, error: listError } = await (client.auth.admin.listUsers() as any);
          const existingUser = users?.find((u: any) => u.email === tokenData.email);
          if (existingUser) {
            userId = existingUser.id;
            console.log("[AUTH] Found existing user:", userId);
            const { error: updateError } = await (client.auth.admin.updateUserById(
              userId,
              { password: password }
            ) as any);
            if (updateError) {
              console.error("[AUTH UPDATE ERROR]:", updateError);
            }
          }
        } else {
          console.error("[AUTH ERROR]:", authError);
          return res.status(400).json({ error: authError.message });
        }
      } else if (authData?.user?.id) {
        userId = authData.user.id;
      }

      if (userId) {
        console.log("[PROFILE] Creating/updating profile for user:", userId, "with role:", tokenData.user_type);
        
        const { data: existingProfile } = await (client
          .from("users")
          .select("id")
          .eq("id", userId)
          .single() as any);
        
        if (existingProfile) {
          const { error: updateError } = await (client
            .from("users")
            .update({ role: tokenData.user_type })
            .eq("id", userId) as any);
          
          if (updateError) {
            console.error("[PROFILE UPDATE ERROR]:", updateError);
          } else {
            console.log("[PROFILE] Updated existing profile with role:", tokenData.user_type);
          }
        } else {
          const { error: insertError } = await (client
            .from("users")
            .insert({
              id: userId,
              email: tokenData.email,
              role: tokenData.user_type,
              full_name: tokenData.email
            }) as any);
          
          if (insertError) {
            console.error("[PROFILE INSERT ERROR]:", insertError);
          } else {
            console.log("[PROFILE] Created new profile with role:", tokenData.user_type);
          }
        }
      } else {
        console.error("[PROFILE] No user ID available to create profile");
      }

      await (client
        .from("password_tokens")
        .update({ status: "used", used_at: new Date().toISOString() })
        .eq("token", token) as any);

      return res.json({ success: true, message: "Password set successfully" });
    } catch (error: any) {
      console.error("[SET PASSWORD ERROR]:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Early Access Signup - sends notification to hello@touchconnectpro.com
  app.post("/api/early-access", async (req, res) => {
    console.log("[POST /api/early-access] Called");
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      console.log("[EARLY ACCESS] New signup request from:", email);

      // Store in Supabase (create early_access_signups table if needed)
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error: dbError } = await (client
            .from("early_access_signups")
            .insert({ email, created_at: new Date().toISOString() } as any) as any);
          if (dbError) {
            console.log("[EARLY ACCESS] Database save skipped:", dbError.message);
          } else {
            console.log("[EARLY ACCESS] Saved to database");
          }
        } catch (dbError: any) {
          console.log("[EARLY ACCESS] Database save error:", dbError.message);
        }
      }

      // Send confirmation email to the user who signed up
      const resendData = await getResendClient();
      
      if (resendData) {
        const { client: resend, fromEmail } = resendData;
        
        try {
          // Send confirmation to the person who signed up
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: "You're on the TouchConnectPro Early Access List!",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .highlight-box { background: linear-gradient(135deg, #06b6d4/10, #3b82f6/10); padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>You're In!</h1>
                  </div>
                  <div class="content">
                    <p>Thank you for joining the TouchConnectPro early access list!</p>
                    
                    <div class="highlight-box">
                      <p style="margin: 0;"><strong>What happens next?</strong></p>
                      <p style="margin: 10px 0 0 0;">We're putting the finishing touches on our AI-powered platform that connects entrepreneurs with mentors, coaches, and investors. You'll be among the first to know when we launch!</p>
                    </div>
                    
                    <p>In the meantime, here's what TouchConnectPro will help you do:</p>
                    <ul>
                      <li>Refine your business idea with AI guidance</li>
                      <li>Generate a draft business plan</li>
                      <li>Connect with experienced mentors</li>
                      <li>Get investor-ready</li>
                    </ul>
                    
                    <p>We're excited to have you on this journey!</p>
                    
                    <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.<br><span style="font-size: 12px;">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span></p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log("[EARLY ACCESS] Confirmation email sent to:", email);

          // Also send internal notification to admin
          await resend.emails.send({
            from: fromEmail,
            to: "hello@touchconnectpro.com",
            subject: "New Early Access Signup - TouchConnectPro",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .email-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #06b6d4; margin: 20px 0; text-align: center; }
                  .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>New Early Access Request!</h1>
                  </div>
                  <div class="content">
                    <p>Someone just signed up for early access to TouchConnectPro.</p>
                    
                    <div class="email-box">
                      <strong>Email Address:</strong><br>
                      <span style="font-size: 18px; color: #06b6d4;">${email}</span>
                    </div>
                    
                    <p>They're interested in being notified when the AI tools are ready.</p>
                    
                    <p style="color: #64748b; font-size: 14px;">
                      Received: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST
                    </p>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} TouchConnectPro</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log("[EARLY ACCESS] Admin notification sent to hello@touchconnectpro.com");
        } catch (emailError: any) {
          console.error("[EARLY ACCESS] Email send failed:", emailError.message);
        }
      } else {
        console.log("[EARLY ACCESS] Resend not configured, skipping emails");
      }

      return res.json({ success: true, message: "Early access signup received" });
    } catch (error: any) {
      console.error("[EARLY ACCESS] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Mentor Waitlist Signup
  app.post("/api/mentor-waitlist", async (req, res) => {
    console.log("[POST /api/mentor-waitlist] Called");
    try {
      const { email, fullName } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({ error: "Email and full name are required" });
      }

      console.log("[MENTOR WAITLIST] New signup:", fullName, email);

      // Store in Supabase
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error: dbError } = await (client
            .from("mentor_waitlist")
            .insert({ email, full_name: fullName, created_at: new Date().toISOString() } as any) as any);
          if (dbError) {
            console.log("[MENTOR WAITLIST] Database save skipped:", dbError.message);
          } else {
            console.log("[MENTOR WAITLIST] Saved to database");
          }
        } catch (dbError: any) {
          console.log("[MENTOR WAITLIST] Database save error:", dbError.message);
        }
      }

      // Send confirmation email
      const resendData = await getResendClient();
      
      if (resendData) {
        const { client: resend, fromEmail } = resendData;
        
        try {
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: "You're on the TouchConnectPro Mentor Waiting List",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .highlight-box { background: linear-gradient(135deg, #6366f1/10, #8b5cf6/10); padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Thank You, ${fullName}!</h1>
                  </div>
                  <div class="content">
                    <p>We're honored by your interest in becoming a mentor at TouchConnectPro.</p>
                    
                    <div class="highlight-box">
                      <p style="margin: 0;"><strong>What happens next?</strong></p>
                      <p style="margin: 10px 0 0 0;">We currently have all the mentors we need to support our entrepreneurs, but as we grow, we'll need more experienced guides like you. We'll reach out as soon as a spot opens up.</p>
                    </div>
                    
                    <p>In the meantime, thank you for wanting to make a difference in the lives of aspiring entrepreneurs.</p>
                    
                    <p style="color: #64748b; font-size: 14px;">
                      Best regards,<br>
                      The TouchConnectPro Team
                    </p>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} TouchConnectPro</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log("[MENTOR WAITLIST] Confirmation email sent to:", email);

          // Also notify admin
          await resend.emails.send({
            from: fromEmail,
            to: "hello@touchconnectpro.com",
            subject: "New Mentor Waitlist Signup",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .info-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 15px 0; }
                  .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>New Mentor Waitlist Signup</h2>
                  </div>
                  <div class="content">
                    <p>A potential mentor has joined the waiting list.</p>
                    
                    <div class="info-box">
                      <strong>Name:</strong> ${fullName}<br>
                      <strong>Email:</strong> ${email}<br>
                      <strong>Date:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST
                    </div>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} TouchConnectPro</p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          console.log("[MENTOR WAITLIST] Admin notification sent");
        } catch (emailError: any) {
          console.error("[MENTOR WAITLIST] Email send failed:", emailError.message);
        }
      }

      return res.json({ success: true, message: "Added to mentor waiting list" });
    } catch (error: any) {
      console.error("[MENTOR WAITLIST] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===== ZOOM MEETING INTEGRATION =====

  // Helper function to get Zoom access token
  async function getZoomAccessToken(): Promise<string> {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!clientId || !clientSecret || !accountId) {
      throw new Error("Zoom credentials not configured");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[ZOOM] Token error:", error);
      throw new Error("Failed to get Zoom access token");
    }

    const data = await response.json();
    return data.access_token;
  }

  // Create Zoom meeting
  app.post("/api/zoom/create-meeting", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { topic, duration, startTime, mentorId, portfolioNumber } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Meeting topic is required" });
      }

      console.log("[ZOOM] Creating meeting:", { topic, duration, startTime });

      const accessToken = await getZoomAccessToken();

      const meetingPayload = {
        topic: topic || "Mentor Meeting",
        type: startTime ? 2 : 1,
        start_time: startTime || undefined,
        duration: duration || 60,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true
        }
      };

      const meetingResponse = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(meetingPayload)
      });

      if (!meetingResponse.ok) {
        const error = await meetingResponse.text();
        console.error("[ZOOM] Create meeting error:", error);
        return res.status(500).json({ error: "Failed to create Zoom meeting" });
      }

      const meeting = await meetingResponse.json();
      console.log("[ZOOM] Meeting created:", meeting.id);

      const { data: savedMeeting, error: dbError } = await (client
        .from("meetings")
        .insert({
          zoom_meeting_id: meeting.id.toString(),
          mentor_id: mentorId,
          portfolio_number: portfolioNumber,
          topic: meeting.topic,
          join_url: meeting.join_url,
          start_url: meeting.start_url,
          password: meeting.password,
          start_time: meeting.start_time,
          duration: meeting.duration,
          status: "scheduled"
        } as any)
        .select() as any);

      if (dbError) {
        console.error("[ZOOM] DB save error:", dbError);
      }

      return res.json({
        success: true,
        meeting: {
          id: savedMeeting?.[0]?.id || meeting.id,
          zoom_id: meeting.id,
          topic: meeting.topic,
          join_url: meeting.join_url,
          start_url: meeting.start_url,
          password: meeting.password,
          start_time: meeting.start_time,
          duration: meeting.duration
        }
      });
    } catch (error: any) {
      console.error("[ZOOM] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Send meeting invitations to entrepreneurs
  app.post("/api/zoom/send-invitations", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { meetingId, entrepreneurIds, mentorName, mentorEmail } = req.body;

      if (!meetingId || !entrepreneurIds || entrepreneurIds.length === 0) {
        return res.status(400).json({ error: "Meeting ID and entrepreneur IDs required" });
      }

      console.log("[ZOOM INVITE] Sending invitations for meeting:", meetingId, "to:", entrepreneurIds);

      const { data: meeting, error: meetingError } = await (client
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single() as any);

      if (meetingError || !meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      const { data: entrepreneurs, error: entError } = await (client
        .from("ideas")
        .select("id, entrepreneur_email, entrepreneur_name")
        .in("id", entrepreneurIds) as any);

      if (entError) {
        return res.status(400).json({ error: entError.message });
      }

      const resendData = await getResendClient();
      let emailsSent = 0;

      for (const entrepreneur of entrepreneurs) {
        if (resendData) {
          try {
            await resendData.client.emails.send({
              from: resendData.fromEmail,
              to: entrepreneur.entrepreneur_email,
              subject: `Meeting Invitation: ${meeting.topic}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .meeting-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #06b6d4; margin: 20px 0; }
                    .join-button { display: inline-block; background: #06b6d4; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>You're Invited to a Meeting!</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${entrepreneur.entrepreneur_name || "there"},</p>
                      <p>Your mentor ${mentorName || ""} has scheduled a meeting with you.</p>
                      
                      <div class="meeting-box">
                        <h3 style="margin-top: 0;">${meeting.topic}</h3>
                        ${meeting.start_time ? `<p><strong>Date & Time:</strong> ${new Date(meeting.start_time).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST</p>` : ''}
                        <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
                        ${meeting.password ? `<p><strong>Password:</strong> ${meeting.password}</p>` : ''}
                        <a href="${meeting.join_url}" class="join-button">Join Meeting</a>
                      </div>
                      
                      <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            emailsSent++;
          } catch (emailErr: any) {
            console.error("[ZOOM INVITE] Email error for", entrepreneur.entrepreneur_email, emailErr.message);
          }
        }

        await (client.from("messages").insert({
          from_name: mentorName || "Your Mentor",
          from_email: mentorEmail || "system@touchconnectpro.com",
          to_name: entrepreneur.entrepreneur_name,
          to_email: entrepreneur.entrepreneur_email,
          message: `You have been invited to a Zoom meeting: "${meeting.topic}". Join here: ${meeting.join_url}${meeting.password ? ` (Password: ${meeting.password})` : ''}`,
          is_read: false
        } as any) as any);
      }

      const { error: updateError } = await (client
        .from("meetings")
        .update({ participants: entrepreneurIds } as any)
        .eq("id", meetingId) as any);

      if (updateError) {
        console.error("[ZOOM INVITE] Error updating meeting participants:", updateError);
        return res.status(500).json({ error: "Failed to save invitations to meeting" });
      }

      console.log("[ZOOM INVITE] Sent", emailsSent, "emails and", entrepreneurs.length, "in-app messages");
      console.log("[ZOOM INVITE] Updated meeting", meetingId, "with participants:", entrepreneurIds);

      return res.json({ 
        success: true, 
        emailsSent,
        messagesCreated: entrepreneurs.length
      });
    } catch (error: any) {
      console.error("[ZOOM INVITE] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get meetings for a mentor
  app.get("/api/zoom/meetings/:mentorId", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { mentorId } = req.params;

      const { data: meetings, error } = await (client
        .from("meetings")
        .select("*")
        .eq("mentor_id", mentorId)
        .order("created_at", { ascending: false }) as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ meetings: meetings || [] });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get meetings for an entrepreneur
  app.get("/api/entrepreneur/meetings/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email } = req.params;

      // First get the entrepreneur's idea ID
      const { data: ideas, error: ideasError } = await (client
        .from("ideas")
        .select("id")
        .eq("entrepreneur_email", email)
        .limit(1) as any);

      if (ideasError || !ideas || ideas.length === 0) {
        return res.json({ meetings: [] });
      }

      const entrepreneurId = ideas[0].id;
      console.log("[ENTREPRENEUR MEETINGS] Finding meetings for entrepreneur", email, "with idea ID:", entrepreneurId);

      // Get all meetings and filter client-side (Supabase array containment is tricky)
      const { data: allMeetings, error } = await (client
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[ENTREPRENEUR MEETINGS] Query error:", error);
        return res.json({ meetings: [] });
      }

      console.log("[ENTREPRENEUR MEETINGS] ALL meetings in database:", allMeetings?.length || 0);
      if (allMeetings && allMeetings.length > 0) {
        console.log("[ENTREPRENEUR MEETINGS] Meeting participants overview:", allMeetings.map((m: any) => ({
          id: m.id,
          topic: m.topic?.substring(0, 30),
          participants: m.participants,
          participantsType: typeof m.participants
        })));
      }

      // Filter meetings where entrepreneurId is in participants array
      const meetings = (allMeetings || []).filter((meeting: any) => {
        const isIncluded = meeting.participants && Array.isArray(meeting.participants) && meeting.participants.includes(entrepreneurId);
        console.log("[ENTREPRENEUR MEETINGS] Checking meeting", meeting.id, "participants:", meeting.participants, "looking for:", entrepreneurId, "found:", isIncluded);
        return isIncluded;
      });

      console.log("[ENTREPRENEUR MEETINGS] Found", meetings.length, "meetings for", email, "with idea ID:", entrepreneurId);
      if (meetings && meetings.length > 0) {
        console.log("[ENTREPRENEUR MEETINGS] Meeting details:", meetings.map((m: any) => ({ id: m.id, topic: m.topic, participants: m.participants })));
      }

      return res.json({ meetings: meetings || [] });
    } catch (error: any) {
      console.error("[ENTREPRENEUR MEETINGS] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get all meetings (for admin)
  app.get("/api/admin/meetings", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data: meetings, error } = await (client
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[ADMIN MEETINGS] Query error:", error);
        return res.json({ meetings: [] });
      }

      return res.json({ meetings: meetings || [] });
    } catch (error: any) {
      console.error("[ADMIN MEETINGS] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Update meeting with invitee names
  app.patch("/api/admin/meetings/:meetingId/invitees", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { meetingId } = req.params;
      const { invitees, inviteeType } = req.body;

      console.log("[ADMIN MEETINGS] Updating invitees for meeting:", meetingId, "invitees:", invitees);

      const { data, error } = await (client
        .from("meetings")
        .update({ 
          invitees: invitees || [],
          invitee_type: inviteeType || null
        })
        .eq("id", meetingId)
        .select() as any);

      if (error) {
        console.error("[ADMIN MEETINGS] Update error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, meeting: data?.[0] });
    } catch (error: any) {
      console.error("[ADMIN MEETINGS] Error updating invitees:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Admin: Send meeting invitations to any user type (mentor, investor, entrepreneur)
  app.post("/api/admin/send-meeting-invite", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { 
        recipientEmail, 
        recipientName, 
        recipientType, 
        topic, 
        startTime, 
        duration, 
        joinUrl, 
        password,
        hostName 
      } = req.body;

      if (!recipientEmail || !topic || !joinUrl) {
        return res.status(400).json({ error: "Recipient email, topic, and join URL are required" });
      }

      console.log("[ADMIN INVITE] Sending meeting invite to:", recipientEmail, "type:", recipientType);

      const resendData = await getResendClient();
      let emailSent = false;

      if (resendData) {
        try {
          await resendData.client.emails.send({
            from: resendData.fromEmail,
            to: recipientEmail,
            subject: `Meeting Invitation: ${topic}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                  .meeting-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #06b6d4; margin: 20px 0; }
                  .join-button { display: inline-block; background: #06b6d4; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>You're Invited to a Meeting!</h1>
                  </div>
                  <div class="content">
                    <p>Hi ${recipientName || "there"},</p>
                    <p>${hostName || "TouchConnectPro Admin"} has scheduled a meeting with you.</p>
                    
                    <div class="meeting-box">
                      <h3 style="margin-top: 0;">${topic}</h3>
                      ${startTime ? `<p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST</p>` : ''}
                      ${duration ? `<p><strong>Duration:</strong> ${duration} minutes</p>` : ''}
                      ${password ? `<p><strong>Password:</strong> ${password}</p>` : ''}
                      <a href="${joinUrl}" class="join-button">Join Meeting</a>
                    </div>
                    
                    <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          emailSent = true;
          console.log("[ADMIN INVITE] Email sent to:", recipientEmail);
        } catch (emailErr: any) {
          console.error("[ADMIN INVITE] Email error:", emailErr.message);
        }
      }

      // Also send in-app message
      await (client.from("messages").insert({
        from_name: hostName || "TouchConnectPro Admin",
        from_email: "admin@touchconnectpro.com",
        to_name: recipientName || recipientEmail,
        to_email: recipientEmail,
        message: `You have been invited to a meeting: "${topic}". Join here: ${joinUrl}${password ? ` (Password: ${password})` : ''}`,
        is_read: false
      } as any) as any);

      // If recipient is an investor, add meeting to their data.meetings array
      if (recipientType === "investor") {
        try {
          // Find investor by email
          const { data: investor } = await (client
            .from("investor_applications")
            .select("id, data")
            .eq("email", recipientEmail)
            .single() as any);
          
          if (investor) {
            const currentData = investor.data || {};
            const existingMeetings = currentData.meetings || [];
            const newMeeting = {
              id: `meeting_${Date.now()}`,
              topic,
              startTime,
              duration,
              joinUrl,
              password,
              hostName: hostName || "TouchConnectPro Admin",
              createdAt: new Date().toISOString(),
              status: "scheduled"
            };
            
            const { error: updateError } = await (client
              .from("investor_applications")
              .update({
                data: {
                  ...currentData,
                  meetings: [...existingMeetings, newMeeting]
                }
              })
              .eq("id", investor.id) as any);
            
            if (updateError) {
              console.error("[ADMIN INVITE] Failed to update investor meetings:", updateError);
            }
            
            console.log("[ADMIN INVITE] Meeting added to investor's dashboard:", investor.id);
          }
        } catch (investorErr: any) {
          console.error("[ADMIN INVITE] Error adding meeting to investor:", investorErr.message);
        }
      }

      console.log("[ADMIN INVITE] Invitation sent successfully to:", recipientEmail);

      return res.json({ 
        success: true, 
        emailSent,
        messageCreated: true
      });
    } catch (error: any) {
      console.error("[ADMIN INVITE] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Admin: Create meeting and send invitations to multiple recipients
  app.post("/api/admin/create-meeting-with-invites", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { 
        topic, 
        startTime, 
        duration, 
        joinUrl, 
        password,
        hostName,
        recipients // Array of { email, name, type }
      } = req.body;

      if (!topic || !joinUrl || !recipients || recipients.length === 0) {
        return res.status(400).json({ error: "Topic, join URL, and at least one recipient required" });
      }

      console.log("[ADMIN CREATE MEETING] Creating meeting:", topic, "for", recipients.length, "recipients");

      // Save meeting to database
      const { data: savedMeeting, error: dbError } = await (client
        .from("meetings")
        .insert({
          topic,
          start_time: startTime,
          duration: duration || 60,
          join_url: joinUrl,
          password,
          host_name: hostName || "TouchConnectPro Admin",
          participants: recipients.map((r: any) => r.email),
          created_at: new Date().toISOString()
        } as any)
        .select() as any);

      if (dbError) {
        console.error("[ADMIN CREATE MEETING] DB error:", dbError);
      }

      const resendData = await getResendClient();
      let emailsSent = 0;
      let messagesSent = 0;

      for (const recipient of recipients) {
        // Send email
        if (resendData) {
          try {
            await resendData.client.emails.send({
              from: resendData.fromEmail,
              to: recipient.email,
              subject: `Meeting Invitation: ${topic}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .meeting-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #06b6d4; margin: 20px 0; }
                    .join-button { display: inline-block; background: #06b6d4; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>You're Invited to a Meeting!</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${recipient.name || "there"},</p>
                      <p>${hostName || "TouchConnectPro Admin"} has scheduled a meeting with you.</p>
                      
                      <div class="meeting-box">
                        <h3 style="margin-top: 0;">${topic}</h3>
                        ${startTime ? `<p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST</p>` : ''}
                        ${duration ? `<p><strong>Duration:</strong> ${duration} minutes</p>` : ''}
                        ${password ? `<p><strong>Password:</strong> ${password}</p>` : ''}
                        <a href="${joinUrl}" class="join-button">Join Meeting</a>
                      </div>
                      
                      <p>Best regards,<br><strong>The TouchConnectPro Team</strong></p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            emailsSent++;
          } catch (emailErr: any) {
            console.error("[ADMIN CREATE MEETING] Email error for", recipient.email, emailErr.message);
          }
        }

        // Send in-app message
        await (client.from("messages").insert({
          from_name: hostName || "TouchConnectPro Admin",
          from_email: "admin@touchconnectpro.com",
          to_name: recipient.name || recipient.email,
          to_email: recipient.email,
          message: `You have been invited to a meeting: "${topic}". Join here: ${joinUrl}${password ? ` (Password: ${password})` : ''}`,
          is_read: false
        } as any) as any);
        messagesSent++;
      }

      console.log("[ADMIN CREATE MEETING] Sent", emailsSent, "emails and", messagesSent, "in-app messages");

      return res.json({ 
        success: true, 
        meetingId: savedMeeting?.[0]?.id,
        emailsSent,
        messagesCreated: messagesSent
      });
    } catch (error: any) {
      console.error("[ADMIN CREATE MEETING] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Stripe: Create checkout session for entrepreneur subscription
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { email, entrepreneurEmail, entrepreneurId, entrepreneurName, successUrl, cancelUrl } = req.body;
      const userEmail = email || entrepreneurEmail;
      
      if (!userEmail) {
        return res.status(400).json({ error: "Entrepreneur email required" });
      }

      console.log("[STRIPE] Creating checkout session for:", userEmail);

      const { stripeService } = await import('./stripeService');
      
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = process.env.FRONTEND_URL || 
        (replitDomain ? `https://${replitDomain}` : "http://localhost:5000");
      
      const finalSuccessUrl = successUrl || `${baseUrl}/login?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const finalCancelUrl = cancelUrl || `${baseUrl}/login?payment=cancelled`;
      
      const { url, customerId } = await stripeService.createCheckoutSession(
        userEmail,
        entrepreneurName || "Entrepreneur",
        finalSuccessUrl,
        finalCancelUrl
      );

      console.log("[STRIPE] Checkout session created, customer:", customerId);
      
      return res.json({ url, customerId, sessionId: url });
    } catch (error: any) {
      console.error("[STRIPE] Checkout error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get entrepreneur payment status
  app.get("/api/entrepreneur/payment-status/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const client = getSupabaseClient();
      
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data, error } = await (client
        .from("ideas")
        .select("payment_status, stripe_customer_id, payment_date, status")
        .ilike("entrepreneur_email", email)
        .limit(1) as any);

      if (error) {
        console.error("[PAYMENT STATUS] Error:", error);
        return res.status(500).json({ error: error.message });
      }

      const idea = data?.[0];
      return res.json({
        paymentStatus: idea?.payment_status || null,
        stripeCustomerId: idea?.stripe_customer_id || null,
        paymentDate: idea?.payment_date || null,
        applicationStatus: idea?.status || null
      });
    } catch (error: any) {
      console.error("[PAYMENT STATUS] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Confirm payment after successful Stripe checkout
  app.post("/api/stripe/confirm-payment", async (req, res) => {
    try {
      const { entrepreneurEmail } = req.body;
      
      if (!entrepreneurEmail) {
        return res.status(400).json({ error: "Email required" });
      }

      console.log("[STRIPE CONFIRM] Confirming payment for:", entrepreneurEmail);
      
      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();
      
      const customers = await stripe.customers.list({
        email: entrepreneurEmail,
        limit: 1
      });

      if (customers.data.length === 0) {
        console.log("[STRIPE CONFIRM] No customer found for:", entrepreneurEmail);
        return res.json({ success: false, reason: "No customer found" });
      }

      const customer = customers.data[0];
      console.log("[STRIPE CONFIRM] Found customer:", customer.id);
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        console.log("[STRIPE CONFIRM] No active subscription for:", entrepreneurEmail);
        return res.json({ success: false, reason: "No active subscription" });
      }

      const subscription = subscriptions.data[0];
      console.log("[STRIPE CONFIRM] Found active subscription:", subscription.id);

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Only update payment_status - admin will manually approve after assigning mentor
      const { data, error } = await (client
        .from("ideas")
        .update({
          payment_status: "paid",
          stripe_customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          payment_date: new Date().toISOString()
        })
        .ilike("entrepreneur_email", entrepreneurEmail)
        .select() as any);

      if (error) {
        console.error("[STRIPE CONFIRM] Error updating idea:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("[STRIPE CONFIRM] Updated payment status for:", entrepreneurEmail, data);

      // Get entrepreneur name from the updated record
      const entrepreneurName = data?.[0]?.entrepreneur_name || "Entrepreneur";

      // Send welcome email
      const emailResult = await sendPaymentWelcomeEmail(entrepreneurEmail, entrepreneurName);
      console.log("[STRIPE CONFIRM] Welcome email result:", emailResult);

      // Create internal message to user about mentor assignment
      try {
        await (client
          .from("messages")
          .insert({
            from_name: "TouchConnectPro",
            from_email: "admin@touchconnectpro.com",
            to_name: entrepreneurName,
            to_email: entrepreneurEmail,
            message: "Welcome! Your payment has been confirmed and your membership is now active. A mentor will be assigned to you shortly. You'll receive a notification once your mentor is ready to connect with you.",
            is_read: false
          } as any));
        console.log("[STRIPE CONFIRM] Internal message sent to user:", entrepreneurEmail);
      } catch (msgError: any) {
        console.error("[STRIPE CONFIRM] Failed to send internal message to user:", msgError.message);
      }

      // Create internal message to admin about payment
      try {
        await (client
          .from("messages")
          .insert({
            from_name: "System",
            from_email: "system@touchconnectpro.com",
            to_name: "Admin",
            to_email: "admin@touchconnectpro.com",
            message: `${entrepreneurName} (${entrepreneurEmail}) has completed their subscription payment and is now a paid member. Please assign a mentor.`,
            is_read: false
          } as any));
        console.log("[STRIPE CONFIRM] Admin notification sent about payment from:", entrepreneurEmail);
      } catch (msgError: any) {
        console.error("[STRIPE CONFIRM] Failed to send admin notification:", msgError.message);
      }

      return res.json({ success: true, paymentStatus: "paid", applicationStatus: "pre-approved", emailSent: emailResult.success });
    } catch (error: any) {
      console.error("[STRIPE CONFIRM] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Stripe: Cancel entrepreneur subscription
  app.post("/api/stripe/cancel-subscription", async (req, res) => {
    console.log("[STRIPE CANCEL] Cancel subscription request");
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();
      
      // Find customer by email
      const customers = await stripe.customers.list({
        email: email.toLowerCase(),
        limit: 1
      });

      if (customers.data.length === 0) {
        return res.status(404).json({ error: "No subscription found for this email" });
      }

      const customer = customers.data[0];
      
      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length === 0) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      const subscription = subscriptions.data[0];
      
      // Cancel at period end (access remains until billing cycle ends)
      const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });

      console.log("[STRIPE CANCEL] Subscription marked for cancellation:", cancelledSubscription.id);
      console.log("[STRIPE CANCEL] Cancels at:", new Date(cancelledSubscription.current_period_end * 1000).toISOString());

      return res.json({ 
        success: true, 
        message: "Subscription will be cancelled at the end of the billing period",
        cancelAt: new Date(cancelledSubscription.current_period_end * 1000).toISOString()
      });
    } catch (error: any) {
      console.error("[STRIPE CANCEL] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Cancellation request email (for coaches, mentors, investors)
  app.post("/api/cancellation-request", async (req, res) => {
    console.log("[CANCELLATION] Request received");
    
    const { userType, userName, userEmail, reason } = req.body;
    
    if (!userType || !userEmail || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Store cancellation request in database
      const client = getSupabaseClient();
      if (client) {
        const { error: dbError } = await (client
          .from("cancellation_requests")
          .insert({
            user_type: userType,
            user_name: userName || 'Unknown',
            user_email: userEmail.toLowerCase(),
            reason: reason,
            status: 'pending'
          }) as any);
        
        if (dbError) {
          console.error("[CANCELLATION] Database error:", dbError);
        } else {
          console.log("[CANCELLATION] Stored in database");
        }
      }

      const resendData = await getResendClient();
      
      if (!resendData) {
        console.log("[CANCELLATION] Resend not configured");
        return res.status(500).json({ error: "Email service not configured" });
      }

      const { client: resend, fromEmail } = resendData;
      const PST_NOW = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
      
      const subject = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Cancellation Request - ${userName}`;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fff; border: 1px solid #e2e8f0; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .value { color: #1e293b; font-size: 16px; margin-top: 4px; }
            .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${userType.charAt(0).toUpperCase() + userType.slice(1)} Cancellation Request</h1>
            </div>
            <div class="content">
              <p>A ${userType} has submitted a cancellation request.</p>
              
              <div class="info-box">
                <div class="label">Name</div>
                <div class="value">${userName}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              <div class="info-box">
                <div class="label">User Type</div>
                <div class="value">${userType.charAt(0).toUpperCase() + userType.slice(1)}</div>
              </div>
              
              <div class="info-box">
                <div class="label">Submitted At</div>
                <div class="value">${PST_NOW} PST</div>
              </div>
              
              <div class="reason-box">
                <div class="label">Reason for Cancellation</div>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${reason}</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                Please review this request and take appropriate action.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send admin notification
      console.log("[CANCELLATION] Sending admin email from:", fromEmail, "to: hello@touchconnectpro.com");
      const adminResult = await resend.emails.send({
        from: fromEmail,
        to: "hello@touchconnectpro.com",
        subject,
        html: htmlContent,
        replyTo: userEmail
      });
      if ((adminResult as any)?.error) {
        console.error("[CANCELLATION] Admin email error:", (adminResult as any).error);
      } else {
        console.log("[CANCELLATION] Admin email sent:", (adminResult as any)?.data?.id || (adminResult as any)?.id || JSON.stringify(adminResult));
      }

      // Send confirmation email to user
      const userSubject = "Your Cancellation Request Has Been Received - TouchConnectPro";
      const userHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fff; border: 1px solid #e2e8f0; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Cancellation Request Received</h1>
            </div>
            <div class="content">
              <p>Dear ${userName || 'User'},</p>
              <p>We have received your request to cancel your ${userType} account with TouchConnectPro.</p>
              
              <div class="info-box">
                <p><strong>Request submitted:</strong> ${PST_NOW} PST</p>
                <p><strong>Account type:</strong> ${userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
              </div>
              
              <p>Our team will review your request and process it within 2-3 business days. If you have any questions or would like to reconsider, please don't hesitate to reach out to us at <a href="mailto:hello@touchconnectpro.com">hello@touchconnectpro.com</a>.</p>
              
              <p>We're sorry to see you go and wish you all the best in your future endeavors.</p>
              
              <p>Best regards,<br/>The TouchConnectPro Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Touch Equity Partners LLC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log("[CANCELLATION] Sending user email from:", fromEmail, "to:", userEmail);
      const userResult = await resend.emails.send({
        from: fromEmail,
        to: userEmail,
        subject: userSubject,
        html: userHtmlContent
      });
      if ((userResult as any)?.error) {
        console.error("[CANCELLATION] User email error:", (userResult as any).error);
      } else {
        console.log("[CANCELLATION] User confirmation email sent:", (userResult as any)?.data?.id || (userResult as any)?.id || JSON.stringify(userResult));
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("[CANCELLATION] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/admin/cancellation-requests - Get all cancellation requests (admin only)
  app.get("/api/admin/cancellation-requests", async (req, res) => {
    console.log("[ADMIN] Fetching cancellation requests");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data, error } = await (client
        .from("cancellation_requests")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        console.error("[ADMIN] Error fetching cancellation requests:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[ADMIN] Found", data?.length || 0, "cancellation requests");
      return res.json(data || []);
    } catch (error: any) {
      console.error("[ADMIN] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/cancellation-requests/:id/process - Mark a cancellation as processed
  app.post("/api/admin/cancellation-requests/:id/process", async (req, res) => {
    const { id } = req.params;
    const { processedBy, notes } = req.body;
    console.log("[ADMIN] Processing cancellation request:", id);
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data, error } = await (client
        .from("cancellation_requests")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
          processed_by: processedBy || "admin",
          notes: notes || null
        })
        .eq("id", id)
        .select() as any);

      if (error) {
        console.error("[ADMIN] Error processing cancellation:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[ADMIN] Cancellation processed successfully");
      return res.json({ success: true, data: data?.[0] });
    } catch (error: any) {
      console.error("[ADMIN] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/cancellation-status/:email - Check if a user has a pending cancellation
  app.get("/api/cancellation-status/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.json({ hasPendingCancellation: false });
      }

      const email = req.params.email.toLowerCase();
      
      // Check for any cancellation (pending or processed)
      const { data, error } = await (client
        .from("cancellation_requests")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (error) {
        console.error("[CANCELLATION STATUS] Error:", error);
        return res.json({ hasPendingCancellation: false, hasProcessedCancellation: false });
      }

      const latestRequest = data?.[0];
      return res.json({ 
        hasPendingCancellation: latestRequest?.status === "pending",
        hasProcessedCancellation: latestRequest?.status === "processed",
        cancellationStatus: latestRequest?.status || null,
        cancellationDate: latestRequest?.created_at || null,
        processedDate: latestRequest?.processed_at || null
      });
    } catch (error: any) {
      console.error("[CANCELLATION STATUS] Error:", error.message);
      return res.json({ hasPendingCancellation: false });
    }
  });

  // POST /api/contract-acceptances - Save contract acceptance
  app.post("/api/contract-acceptances", async (req, res) => {
    console.log("[POST /api/contract-acceptances] Saving contract acceptance");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email, role, contractVersion, contractText, userAgent } = req.body;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

      if (!email || !role || !contractVersion || !contractText) {
        return res.status(400).json({ error: "Missing required fields: email, role, contractVersion, contractText" });
      }

      const validRoles = ['coach', 'mentor', 'investor', 'entrepreneur'];
      if (!validRoles.includes(role.toLowerCase())) {
        return res.status(400).json({ error: "Invalid role. Must be coach, mentor, investor, or entrepreneur" });
      }

      const { data: existing } = await (client
        .from("contract_acceptances")
        .select("id")
        .eq("email", email.toLowerCase())
        .eq("role", role.toLowerCase())
        .eq("contract_version", contractVersion)
        .limit(1) as any);

      if (existing && existing.length > 0) {
        return res.status(200).json({ success: true, id: existing[0].id, alreadyAccepted: true });
      }

      const { data, error } = await (client
        .from("contract_acceptances")
        .insert({
          email: email.toLowerCase(),
          role: role.toLowerCase(),
          contract_version: contractVersion,
          contract_text: contractText,
          ip_address: ipAddress,
          user_agent: userAgent || null,
          accepted_at: new Date().toISOString()
        })
        .select() as any);

      if (error) {
        console.error("[CONTRACT] Insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[CONTRACT] Saved for", email, role);
      return res.status(201).json({ success: true, id: data?.[0]?.id });
    } catch (error: any) {
      console.error("[CONTRACT] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/contract-acceptances - Get all contract acceptances (admin)
  app.get("/api/contract-acceptances", async (req, res) => {
    console.log("[GET /api/contract-acceptances] Fetching all contracts");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { role } = req.query;
      let query = client
        .from("contract_acceptances")
        .select("*")
        .order("accepted_at", { ascending: false });

      if (role && role !== 'all') {
        query = query.eq("role", (role as string).toLowerCase());
      }

      const { data, error } = await (query as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Check if coach has accepted latest agreement
  app.get("/api/contract-acceptances/check-coach-agreement/:email", async (req, res) => {
    console.log("[CHECK COACH AGREEMENT] Checking for:", req.params.email);
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email } = req.params;
      const CURRENT_COACH_AGREEMENT_VERSION = "2026-02-01 v2";

      const { data, error } = await (client
        .from("contract_acceptances")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("role", "coach")
        .eq("contract_version", CURRENT_COACH_AGREEMENT_VERSION)
        .order("accepted_at", { ascending: false })
        .limit(1) as any);

      if (error) {
        console.error("[CHECK COACH AGREEMENT] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      const hasAccepted = data && data.length > 0;
      console.log("[CHECK COACH AGREEMENT] Has accepted:", hasAccepted);
      return res.json({ hasAccepted });
    } catch (error: any) {
      console.error("[CHECK COACH AGREEMENT] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Accept coach agreement
  app.post("/api/contract-acceptances/accept-coach-agreement", async (req, res) => {
    console.log("[ACCEPT COACH AGREEMENT] Request received");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email, fullName } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const CURRENT_COACH_AGREEMENT_VERSION = "coach_agreement_v2";
      const contractText = `TouchConnectPro Coach Agreement (${CURRENT_COACH_AGREEMENT_VERSION})

By accepting this agreement, the coach acknowledges and agrees to:
- Provide professional coaching services to entrepreneurs on the TouchConnectPro platform
- Maintain confidentiality of all client information
- Accept that TouchConnectPro retains a 20% platform fee on all coaching transactions
- Conduct themselves professionally and ethically in all interactions
- May terminate the partnership at any time by submitting a cancellation request
- TouchConnectPro reserves the right to terminate partnerships for violations of these terms

Full terms available at: https://touchconnectpro.com/coach-agreement`;

      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || null;

      const { data, error } = await (client
        .from("contract_acceptances")
        .insert({
          email: email.toLowerCase(),
          role: 'coach',
          contract_version: CURRENT_COACH_AGREEMENT_VERSION,
          contract_text: contractText,
          ip_address: typeof ipAddress === 'string' ? ipAddress : (ipAddress as string[])[0],
          user_agent: userAgent,
          accepted_at: new Date().toISOString()
        })
        .select()
        .single() as any);

      if (error) {
        console.error("[ACCEPT COACH AGREEMENT] Error:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[ACCEPT COACH AGREEMENT] Saved successfully for:", email);
      return res.json({ success: true, acceptance: data });
    } catch (error: any) {
      console.error("[ACCEPT COACH AGREEMENT] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook for coach purchases (development testing endpoint)
  // Note: Production on Render uses backend/index.js which has its own webhook handler
  app.post("/api/stripe/webhook", async (req, res) => {
    console.log("[STRIPE WEBHOOK DEV] ========== WEBHOOK RECEIVED ==========");
    
    const { getUncachableStripeClient } = await import('./stripeClient');
    const stripe = await getUncachableStripeClient();
    
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log("[STRIPE WEBHOOK DEV] Webhook secret configured:", !!webhookSecret);
    console.log("[STRIPE WEBHOOK DEV] Signature present:", !!sig);
    console.log("[STRIPE WEBHOOK DEV] Has rawBody:", !!(req as any).rawBody);

    if (!webhookSecret) {
      console.log("[STRIPE WEBHOOK DEV] ERROR: No webhook secret configured");
      return res.status(200).json({ received: true, error: "no webhook secret" });
    }

    if (!sig) {
      console.log("[STRIPE WEBHOOK DEV] ERROR: No signature in headers");
      return res.status(400).json({ error: "No stripe-signature header" });
    }

    try {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        console.error("[STRIPE WEBHOOK DEV] No rawBody available");
        return res.status(400).json({ error: "No raw body available" });
      }

      console.log("[STRIPE WEBHOOK DEV] Attempting to construct event...");
      const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      console.log("[STRIPE WEBHOOK DEV] Event constructed successfully!");
      console.log("[STRIPE WEBHOOK DEV] Event type:", event.type);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const coachId = session.metadata?.coach_id;
        
        // Handle membership subscription (entrepreneurEmail or email in metadata, no coachId)
        const membershipEmail = session.metadata?.entrepreneurEmail || session.metadata?.email;
        if (!coachId && membershipEmail && session.payment_status === "paid") {
          console.log("[STRIPE WEBHOOK DEV] ========== MEMBERSHIP PAYMENT ==========");
          console.log("[STRIPE WEBHOOK DEV] Entrepreneur email:", membershipEmail);
          console.log("[STRIPE WEBHOOK DEV] Customer ID:", session.customer);
          console.log("[STRIPE WEBHOOK DEV] Subscription:", session.subscription);
          
          const client = getSupabaseClient();
          if (client) {
            try {
              // Update payment_status only - admin will manually approve after assigning mentor
              const { data: updateData, error: updateError } = await (client
                .from("ideas")
                .update({
                  payment_status: "paid",
                  stripe_customer_id: session.customer || '',
                  stripe_subscription_id: session.subscription || '',
                  payment_date: new Date().toISOString()
                })
                .ilike("entrepreneur_email", membershipEmail)
                .select() as any);
              
              if (updateError) {
                console.error("[STRIPE WEBHOOK DEV] Error updating payment status:", updateError);
              } else {
                console.log("[STRIPE WEBHOOK DEV] Payment status updated for:", membershipEmail, "Status remains pre-approved for admin review");
                
                // Send notification emails
                const entrepreneurName = updateData?.[0]?.entrepreneur_name || "Entrepreneur";
                const resendData = await getResendClient();
                if (resendData) {
                  const { client: resendClient, fromEmail } = resendData;
                  
                  // Email to entrepreneur
                  try {
                    await resendClient.emails.send({
                      from: fromEmail,
                      to: membershipEmail,
                      subject: "Payment Received - TouchConnectPro Membership",
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2>Payment Confirmed!</h2>
                          <p>Hi ${entrepreneurName},</p>
                          <p>Your membership payment has been received. A mentor will be assigned to you shortly.</p>
                          <p>You'll receive a notification once your mentor is ready to connect with you.</p>
                          <p>Best regards,<br>The TouchConnectPro Team</p>
                        </div>
                      `
                    });
                    console.log("[STRIPE WEBHOOK DEV] Payment confirmation email sent to:", membershipEmail);
                  } catch (e: any) {
                    console.error("[STRIPE WEBHOOK DEV] Error sending entrepreneur email:", e.message);
                  }
                  
                  // Email to admin
                  try {
                    await resendClient.emails.send({
                      from: fromEmail,
                      to: ADMIN_EMAIL,
                      subject: `New Paid Member: ${entrepreneurName}`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2>New Membership Payment</h2>
                          <p><strong>Entrepreneur:</strong> ${entrepreneurName}</p>
                          <p><strong>Email:</strong> ${membershipEmail}</p>
                          <p><strong>Status:</strong> Payment received, awaiting mentor assignment</p>
                          <p>Please assign a mentor to this entrepreneur in the admin dashboard.</p>
                        </div>
                      `
                    });
                    console.log("[STRIPE WEBHOOK DEV] Admin notification sent for payment from:", membershipEmail);
                  } catch (e: any) {
                    console.error("[STRIPE WEBHOOK DEV] Error sending admin email:", e.message);
                  }
                }
              }
            } catch (dbError: any) {
              console.error("[STRIPE WEBHOOK DEV] Database error:", dbError.message);
            }
          }
        }
        
        // Handle coach service purchase
        if (coachId && session.payment_status === "paid") {
          console.log("[STRIPE WEBHOOK DEV] ========== COACH PURCHASE ==========");
          console.log("[STRIPE WEBHOOK DEV] Coach ID:", coachId);
          console.log("[STRIPE WEBHOOK DEV] Session metadata:", JSON.stringify(session.metadata));
          
          const client = getSupabaseClient();
          if (!client) {
            console.error("[STRIPE WEBHOOK DEV] No Supabase client");
            return res.status(500).json({ error: "Database not configured" });
          }
          
          // Idempotency guard: check if this session was already processed
          const { data: existingPurchase } = await (client
            .from("coach_purchases")
            .select("id")
            .eq("stripe_session_id", session.id)
            .single() as any);
          
          if (existingPurchase) {
            console.log("[STRIPE WEBHOOK DEV] Duplicate event - session already processed:", session.id);
            return res.status(200).json({ received: true, duplicate: true });
          }
          
          const serviceType = session.metadata?.service_type || 'session';
          const entrepreneurEmail = session.metadata?.entrepreneur_email || session.customer_email;
          const entrepreneurName = session.metadata?.entrepreneur_name || 'Entrepreneur';
          const coachName = session.metadata?.coach_name || 'Coach';
          const amountTotal = session.amount_total || 0;
          const platformFee = Math.round(amountTotal * 0.20);
          const coachEarnings = amountTotal - platformFee;
          
          // Get service name based on type
          let serviceName = 'Coaching Session';
          if (serviceType === 'intro') serviceName = '15 Minutes Introductory Call';
          else if (serviceType === 'monthly') serviceName = 'Monthly Coaching / Full Course';
          
          // Save purchase to coach_purchases table
          try {
            const { error: insertError } = await (client
              .from("coach_purchases")
              .insert({
                coach_id: coachId,
                coach_name: coachName,
                entrepreneur_email: entrepreneurEmail,
                entrepreneur_name: entrepreneurName,
                service_type: serviceType,
                service_name: serviceName,
                amount: amountTotal,
                platform_fee: platformFee,
                coach_earnings: coachEarnings,
                stripe_session_id: session.id,
                status: 'completed'
              } as any) as any);
            
            if (insertError) {
              console.error("[STRIPE WEBHOOK DEV] Error saving purchase:", insertError);
            } else {
              console.log("[STRIPE WEBHOOK DEV] Purchase saved successfully");
            }
          } catch (dbError: any) {
            console.error("[STRIPE WEBHOOK DEV] Database error:", dbError.message);
          }
          
          // Get coach email for notification
          try {
            const { data: coach } = await (client
              .from("coach_applications")
              .select("email")
              .eq("id", coachId)
              .single() as any);
            
            const coachEmail = coach?.email;
            
            // Get Resend client for sending emails
            const resendData = await getResendClient();
            if (resendData) {
              const { client: resendClient, fromEmail } = resendData;
              
              // Send email to entrepreneur
              if (entrepreneurEmail) {
                try {
                  await resendClient.emails.send({
                    from: fromEmail,
                    to: entrepreneurEmail,
                    subject: `Your ${serviceName} with ${coachName} is Confirmed!`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>🎉 Your Coaching Purchase is Confirmed!</h2>
                        <p>Hi ${entrepreneurName},</p>
                        <p>Thank you for purchasing <strong>${serviceName}</strong> with <strong>${coachName}</strong>.</p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                          <p><strong>Service:</strong> ${serviceName}</p>
                          <p><strong>Coach:</strong> ${coachName}</p>
                          <p><strong>Amount Paid:</strong> $${(amountTotal / 100).toFixed(2)}</p>
                        </div>
                        <p>Your coach will be in touch shortly to schedule your session. You can also reach out to them directly.</p>
                        <p>Best,<br>The TouchConnectPro Team</p>
                      </div>
                    `
                  });
                  console.log("[STRIPE WEBHOOK DEV] Email sent to entrepreneur:", entrepreneurEmail);
                } catch (emailError: any) {
                  console.error("[STRIPE WEBHOOK DEV] Error sending entrepreneur email:", emailError.message);
                }
              }
              
              // Send email to coach
              if (coachEmail) {
                try {
                  await resendClient.emails.send({
                    from: fromEmail,
                    to: coachEmail,
                    subject: `New Client! ${entrepreneurName} purchased ${serviceName}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>🎉 You Have a New Client!</h2>
                        <p>Hi ${coachName},</p>
                        <p>Great news! <strong>${entrepreneurName}</strong> has just purchased your <strong>${serviceName}</strong>.</p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                          <p><strong>Client Name:</strong> ${entrepreneurName}</p>
                          <p><strong>Client Email:</strong> ${entrepreneurEmail}</p>
                          <p><strong>Service:</strong> ${serviceName}</p>
                          <p><strong>Total Paid:</strong> $${(amountTotal / 100).toFixed(2)}</p>
                          <p><strong>Your Earnings (80%):</strong> $${(coachEarnings / 100).toFixed(2)}</p>
                        </div>
                        <p>Please reach out to your new client to schedule the session.</p>
                        <p>Best,<br>The TouchConnectPro Team</p>
                      </div>
                    `
                  });
                  console.log("[STRIPE WEBHOOK DEV] Email sent to coach:", coachEmail);
                } catch (emailError: any) {
                  console.error("[STRIPE WEBHOOK DEV] Error sending coach email:", emailError.message);
                }
              }
              
              // Send email to admin
              console.log("[STRIPE WEBHOOK DEV] Attempting to send admin email to:", ADMIN_EMAIL);
              try {
                const adminEmailResult = await resendClient.emails.send({
                  from: fromEmail,
                  to: ADMIN_EMAIL,
                  subject: `New Coach Purchase: ${entrepreneurName} → ${coachName}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2>💰 New Coach Marketplace Sale</h2>
                      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Coach:</strong> ${coachName}</p>
                        <p><strong>Client:</strong> ${entrepreneurName} (${entrepreneurEmail})</p>
                        <p><strong>Service:</strong> ${serviceName}</p>
                        <p><strong>Total Paid:</strong> $${(amountTotal / 100).toFixed(2)}</p>
                        <p><strong>Platform Fee (20%):</strong> $${(platformFee / 100).toFixed(2)}</p>
                        <p><strong>Coach Earnings (80%):</strong> $${(coachEarnings / 100).toFixed(2)}</p>
                      </div>
                      <p>This transaction has been recorded in the coach_purchases table.</p>
                    </div>
                  `
                });
                console.log("[STRIPE WEBHOOK DEV] Email sent to admin:", ADMIN_EMAIL, "Result:", JSON.stringify(adminEmailResult));
              } catch (emailError: any) {
                console.error("[STRIPE WEBHOOK DEV] Error sending admin email:", emailError.message);
              }
            } else {
              console.log("[STRIPE WEBHOOK DEV] Resend not configured, skipping emails");
            }
          } catch (lookupError: any) {
            console.error("[STRIPE WEBHOOK DEV] Error looking up coach:", lookupError.message);
          }
        }
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("[STRIPE WEBHOOK DEV] Error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // STRIPE CONNECT - COACH MARKETPLACE
  // ============================================

  // Create Stripe Connect account for coach (called when coach is approved)
  app.post("/api/stripe/connect/create-account", async (req, res) => {
    try {
      const { coachId, email, fullName } = req.body;
      
      if (!coachId || !email) {
        return res.status(400).json({ error: "coachId and email required" });
      }

      console.log("[STRIPE CONNECT] Creating account for coach:", coachId, email);

      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();

      // Create a Standard connected account
      const account = await stripe.accounts.create({
        type: 'standard',
        email: email,
        metadata: {
          coach_id: coachId,
          platform: 'TouchConnectPro'
        }
      });

      console.log("[STRIPE CONNECT] Created account:", account.id);

      // Save stripe_account_id to coach_applications table
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { error: updateError } = await (client
        .from("coach_applications")
        .update({ stripe_account_id: account.id } as any)
        .eq("id", coachId) as any);

      if (updateError) {
        console.error("[STRIPE CONNECT] Failed to save account ID:", updateError);
        return res.status(500).json({ error: "Failed to save Stripe account ID" });
      }

      return res.json({ 
        success: true, 
        accountId: account.id,
        message: "Stripe Connect account created. Coach needs to complete onboarding."
      });
    } catch (error: any) {
      console.error("[STRIPE CONNECT] Create account error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Get Stripe Connect onboarding link for coach
  app.get("/api/stripe/connect/account-link/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      
      console.log("[STRIPE CONNECT] Getting account link for coach:", coachId);

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Get coach's stripe_account_id - select all fields to handle missing column
      const { data: coach, error: fetchError } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .single() as any);

      if (fetchError) {
        console.error("[STRIPE CONNECT] Database error:", fetchError);
        return res.status(500).json({ error: "Database error", details: fetchError.message });
      }
      
      if (!coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();

      // If no account exists, create one
      let accountId = coach.stripe_account_id;
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'standard',
          email: coach.email,
          metadata: {
            coach_id: coachId,
            platform: 'TouchConnectPro'
          }
        });
        accountId = account.id;

        // Save to database
        await (client
          .from("coach_applications")
          .update({ stripe_account_id: accountId } as any)
          .eq("id", coachId) as any);

        console.log("[STRIPE CONNECT] Created new account:", accountId);
      }

      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = process.env.FRONTEND_URL || 
        (replitDomain ? `https://${replitDomain}` : "http://localhost:5000");

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/dashboard-coach?stripe=refresh`,
        return_url: `${baseUrl}/dashboard-coach?stripe=success`,
        type: 'account_onboarding',
      });

      console.log("[STRIPE CONNECT] Account link created for:", accountId);

      return res.json({ 
        url: accountLink.url,
        accountId: accountId
      });
    } catch (error: any) {
      console.error("[STRIPE CONNECT] Account link error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Check Stripe Connect account status
  app.get("/api/stripe/connect/account-status/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Select all fields to handle missing stripe_account_id column gracefully
      const { data: coach, error: fetchError } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .single() as any);

      if (fetchError) {
        console.error("[STRIPE CONNECT] Database error:", fetchError);
        return res.status(500).json({ error: "Database error", details: fetchError.message });
      }
      
      if (!coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      if (!coach.stripe_account_id) {
        return res.json({ 
          hasAccount: false,
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false
        });
      }

      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();

      const account = await stripe.accounts.retrieve(coach.stripe_account_id);

      return res.json({
        hasAccount: true,
        accountId: account.id,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        email: account.email
      });
    } catch (error: any) {
      console.error("[STRIPE CONNECT] Account status error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Reset Stripe Connect account (allows coach to connect a different account)
  app.post("/api/stripe/connect/reset/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      
      console.log("[STRIPE CONNECT] Resetting account for coach:", coachId);

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Get current coach data
      const { data: coach, error: fetchError } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .single() as any);

      if (fetchError || !coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      // Clear the stripe_account_id from the database
      const { error: updateError } = await (client
        .from("coach_applications")
        .update({ stripe_account_id: null })
        .eq("id", coachId) as any);

      if (updateError) {
        console.error("[STRIPE CONNECT] Failed to reset account:", updateError);
        return res.status(500).json({ error: "Failed to reset Stripe account" });
      }

      console.log("[STRIPE CONNECT] Successfully reset account for coach:", coachId);
      
      return res.json({ 
        success: true,
        message: "Stripe account disconnected. You can now connect a new account."
      });
    } catch (error: any) {
      console.error("[STRIPE CONNECT] Reset account error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Create checkout session for coach service purchase (destination charges)
  app.post("/api/stripe/connect/checkout", async (req, res) => {
    try {
      const { coachId, serviceType, entrepreneurEmail, entrepreneurName } = req.body;
      
      if (!coachId || !serviceType || !entrepreneurEmail) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["coachId", "serviceType", "entrepreneurEmail"]
        });
      }

      console.log("[STRIPE CONNECT CHECKOUT] Creating session for:", { coachId, serviceType, entrepreneurEmail });

      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      // Get coach data including stripe_account_id and rates - use * for flexibility
      const { data: coach, error: fetchError } = await (client
        .from("coach_applications")
        .select("*")
        .eq("id", coachId)
        .single() as any);

      if (fetchError) {
        console.error("[STRIPE CONNECT CHECKOUT] Database error:", fetchError);
        return res.status(500).json({ error: "Database error", details: fetchError.message });
      }
      
      if (!coach) {
        return res.status(404).json({ error: "Coach not found" });
      }

      if (!coach.stripe_account_id) {
        return res.status(400).json({ 
          error: "Coach has not completed Stripe onboarding",
          message: "This coach cannot receive payments yet."
        });
      }

      // Parse rates from JSON
      let rates: { introCallRate?: string; sessionRate?: string; monthlyRate?: string };
      try {
        rates = JSON.parse(coach.hourly_rate);
      } catch {
        rates = { introCallRate: coach.hourly_rate, sessionRate: coach.hourly_rate, monthlyRate: coach.hourly_rate };
      }

      // Determine price based on service type
      let priceInCents: number;
      let serviceName: string;
      
      switch (serviceType) {
        case 'intro':
          priceInCents = Math.round(parseFloat(rates.introCallRate || '25') * 100);
          serviceName = '15 Minutes Introductory Call';
          break;
        case 'session':
          priceInCents = Math.round(parseFloat(rates.sessionRate || '150') * 100);
          serviceName = 'Coaching Session';
          break;
        case 'monthly':
          priceInCents = Math.round(parseFloat(rates.monthlyRate || '500') * 100);
          serviceName = 'Monthly Coaching / Full Course';
          break;
        default:
          return res.status(400).json({ error: "Invalid serviceType. Use 'intro', 'session', or 'monthly'" });
      }

      // Calculate 20% platform fee
      const applicationFee = Math.round(priceInCents * 0.20);

      console.log("[STRIPE CONNECT CHECKOUT] Price:", priceInCents, "Fee:", applicationFee);

      const { getUncachableStripeClient } = await import('./stripeClient');
      const stripe = await getUncachableStripeClient();

      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      const baseUrl = process.env.FRONTEND_URL || 
        (replitDomain ? `https://${replitDomain}` : "http://localhost:5000");

      // All coach purchases are one-time payments (including monthly/course)
      // This simplifies Stripe Connect destination charges
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${coach.full_name} - ${serviceName}`,
                description: `Coaching service with ${coach.full_name}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFee,
          transfer_data: {
            destination: coach.stripe_account_id,
          },
        },
        customer_email: entrepreneurEmail,
        metadata: {
          coach_id: coachId,
          coach_name: coach.full_name,
          service_type: serviceType,
          entrepreneur_email: entrepreneurEmail,
          entrepreneur_name: entrepreneurName || '',
          platform: 'TouchConnectPro'
        },
        success_url: `${baseUrl}/dashboard-entrepreneur?coach_payment=success&coach=${encodeURIComponent(coach.full_name)}`,
        cancel_url: `${baseUrl}/dashboard-entrepreneur?coach_payment=cancelled`,
      });

      console.log("[STRIPE CONNECT CHECKOUT] Session created:", session.id);

      return res.json({ 
        url: session.url,
        sessionId: session.id,
        coachName: coach.full_name,
        serviceName,
        price: priceInCents / 100,
        platformFee: applicationFee / 100,
        coachReceives: (priceInCents - applicationFee) / 100
      });
    } catch (error: any) {
      console.error("[STRIPE CONNECT CHECKOUT] Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PUBLIC PARTNER API ENDPOINTS
  // ============================================
  
  // API Key validation helper
  const validatePartnerApiKey = (apiKey: string | undefined): boolean => {
    if (!apiKey) return false;
    const validKeys = (process.env.PARTNER_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    return validKeys.includes(apiKey);
  };

  // Partner API middleware
  const partnerApiAuth = (req: any, res: any, next: any) => {
    const apiKey = req.headers["x-api-key"];
    if (!validatePartnerApiKey(apiKey)) {
      console.log("[PUBLIC API] Invalid or missing API key");
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Valid API key required. Include 'x-api-key' header with your partner API key." 
      });
    }
    console.log("[PUBLIC API] Valid API key received");
    next();
  };

  // POST /api/public/applications/entrepreneurs
  app.post("/api/public/applications/entrepreneurs", partnerApiAuth, async (req, res) => {
    console.log("[PUBLIC API] POST /api/public/applications/entrepreneurs");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { fullName, email, ideaName, linkedinWebsite, fullBio, country, state, formData, businessPlan } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({ error: "fullName and email are required" });
      }

      if (!ideaName) {
        return res.status(400).json({ error: "ideaName is required" });
      }

      // Check for existing application
      const { data: existing } = await (client
        .from("ideas")
        .select("id, status")
        .eq("entrepreneur_email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (existing && existing.length > 0) {
        const app = existing[0];
        if (app.status === "approved" || app.status === "pre-approved") {
          return res.status(409).json({ error: "Application already approved for this email" });
        }
        if (app.status === "pending" || app.status === "submitted") {
          return res.status(409).json({ error: "Pending application exists for this email" });
        }
      }

      // Build data object to match internal submission format
      const dataPayload = formData ? {
        ...formData,
        fullBio: fullBio || formData.fullBio,
        ideaName: ideaName || formData.ideaName,
        country: country || formData.country,
        state: state || formData.state
      } : {
        fullBio,
        ideaName,
        country,
        state
      };

      const { data, error } = await (client
        .from("ideas")
        .insert({
          status: "submitted",
          entrepreneur_email: email,
          entrepreneur_name: fullName,
          data: dataPayload,
          business_plan: businessPlan || {},
          linkedin_profile: linkedinWebsite || "",
          user_id: null
        } as any)
        .select() as any);

      if (error) {
        console.error("[PUBLIC API] Entrepreneur insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        success: true, 
        applicationId: data?.[0]?.id,
        status: "submitted",
        message: "Entrepreneur application submitted successfully"
      });
    } catch (error: any) {
      console.error("[PUBLIC API] Entrepreneur error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/public/applications/mentors
  app.post("/api/public/applications/mentors", partnerApiAuth, async (req, res) => {
    console.log("[PUBLIC API] POST /api/public/applications/mentors");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { fullName, email, linkedin, bio, expertise, experience, country, state } = req.body;

      if (!email || !fullName || !bio || !expertise || !experience || !country) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["fullName", "email", "bio", "expertise", "experience", "country"]
        });
      }

      // Check for existing application
      const { data: existing } = await (client
        .from("mentor_applications")
        .select("id, status")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (existing && existing.length > 0) {
        const app = existing[0];
        if (app.status === "approved") {
          return res.status(409).json({ error: "Application already approved for this email" });
        }
        if (app.status === "pending" || app.status === "submitted") {
          return res.status(409).json({ error: "Pending application exists for this email" });
        }
      }

      const { data, error } = await (client
        .from("mentor_applications")
        .insert({
          full_name: fullName,
          email,
          linkedin: linkedin || null,
          bio,
          expertise,
          experience,
          country,
          state: state || null,
          status: "submitted"
        } as any)
        .select() as any);

      if (error) {
        console.error("[PUBLIC API] Mentor insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        success: true, 
        applicationId: data?.[0]?.id,
        status: "submitted",
        message: "Mentor application submitted successfully"
      });
    } catch (error: any) {
      console.error("[PUBLIC API] Mentor error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/public/applications/coaches
  app.post("/api/public/applications/coaches", partnerApiAuth, async (req, res) => {
    console.log("[PUBLIC API] POST /api/public/applications/coaches");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { fullName, email, linkedin, bio, expertise, focusAreas, introCallRate, sessionRate, monthlyRate, monthlyRetainerDescription, hourlyRate, country, state, specializations } = req.body;

      const ratesProvided = introCallRate && sessionRate && monthlyRate;
      const legacyRateProvided = hourlyRate;
      
      if (!email || !fullName || !expertise || !focusAreas || (!ratesProvided && !legacyRateProvided) || !country || !bio) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["fullName", "email", "bio", "expertise", "focusAreas", "introCallRate", "sessionRate", "monthlyRate", "country"]
        });
      }
      
      const rateValue = ratesProvided 
        ? JSON.stringify({ introCallRate, sessionRate, monthlyRate, monthlyRetainerDescription: monthlyRetainerDescription || "" })
        : hourlyRate;

      // Check for existing application
      const { data: existing } = await (client
        .from("coach_applications")
        .select("id, status")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (existing && existing.length > 0) {
        const app = existing[0];
        if (app.status === "approved") {
          return res.status(409).json({ error: "Application already approved for this email" });
        }
        if (app.status === "pending" || app.status === "submitted") {
          return res.status(409).json({ error: "Pending application exists for this email" });
        }
      }

      const { data, error } = await (client
        .from("coach_applications")
        .insert({
          full_name: fullName,
          email,
          linkedin: linkedin || null,
          bio: bio || null,
          expertise,
          focus_areas: focusAreas,
          hourly_rate: rateValue,
          country,
          state: state || null,
          specializations: specializations || [],
          status: "submitted"
        } as any)
        .select() as any);

      if (error) {
        console.error("[PUBLIC API] Coach insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        success: true, 
        applicationId: data?.[0]?.id,
        status: "submitted",
        message: "Coach application submitted successfully"
      });
    } catch (error: any) {
      console.error("[PUBLIC API] Coach error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/public/applications/investors
  app.post("/api/public/applications/investors", partnerApiAuth, async (req, res) => {
    console.log("[PUBLIC API] POST /api/public/applications/investors");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { fullName, email, linkedin, bio, fundName, investmentFocus, investmentPreference, investmentAmount, country, state } = req.body;

      if (!email || !fullName || !fundName || !investmentFocus || !investmentPreference || !investmentAmount || !country) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["fullName", "email", "fundName", "investmentFocus", "investmentPreference", "investmentAmount", "country"]
        });
      }

      // Check for existing application
      const { data: existing } = await (client
        .from("investor_applications")
        .select("id, status")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (existing && existing.length > 0) {
        const app = existing[0];
        if (app.status === "approved") {
          return res.status(409).json({ error: "Application already approved for this email" });
        }
        if (app.status === "pending" || app.status === "submitted") {
          return res.status(409).json({ error: "Pending application exists for this email" });
        }
      }

      const { data, error } = await (client
        .from("investor_applications")
        .insert({
          full_name: fullName,
          email,
          linkedin: linkedin || null,
          fund_name: fundName,
          investment_focus: investmentFocus,
          investment_preference: investmentPreference,
          investment_amount: investmentAmount,
          country,
          state: state || null,
          status: "submitted",
          data: bio ? { bio } : {}
        } as any)
        .select() as any);

      if (error) {
        console.error("[PUBLIC API] Investor insert error:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ 
        success: true, 
        applicationId: data?.[0]?.id,
        status: "submitted",
        message: "Investor application submitted successfully"
      });
    } catch (error: any) {
      console.error("[PUBLIC API] Investor error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoint to add data column to mentor_applications (run once)
  app.post("/api/admin/add-mentor-data-column", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Try to add the column if it doesn't exist
      // First, check if column exists by trying an update with it
      const testResult = await (client
        .from("mentor_applications")
        .select("data")
        .limit(1) as any);

      if (testResult.error && testResult.error.message.includes("data")) {
        // Column doesn't exist - we need to add it via SQL
        // Since Supabase JS client doesn't support DDL, we return instructions
        return res.json({
          success: false,
          message: "Column 'data' does not exist. Please add it manually in Supabase SQL Editor.",
          sql: "ALTER TABLE mentor_applications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;"
        });
      }

      return res.json({
        success: true,
        message: "Column 'data' already exists in mentor_applications table"
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/admin/create-cancellation-table - Create the cancellation_requests table
  app.post("/api/admin/create-cancellation-table", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      // Check if table exists
      const { error: checkError } = await (client
        .from("cancellation_requests")
        .select("id")
        .limit(1) as any);

      if (!checkError || !checkError.message?.includes("does not exist") && !checkError.message?.includes("schema cache")) {
        return res.json({
          success: true,
          message: "Table 'cancellation_requests' already exists"
        });
      }

      // Table doesn't exist - provide SQL to create it
      const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cancellation_requests_email ON public.cancellation_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON public.cancellation_requests(status);

ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON public.cancellation_requests
  FOR ALL USING (true) WITH CHECK (true);
`;

      return res.json({
        success: false,
        message: "Table 'cancellation_requests' does not exist. Please run the following SQL in Supabase SQL Editor:",
        sql: createTableSQL
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/public/applications/:id - Check application status
  app.get("/api/public/applications/:id", partnerApiAuth, async (req, res) => {
    console.log("[PUBLIC API] GET /api/public/applications/:id");
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { id } = req.params;
      const { type } = req.query;

      const tableMap: Record<string, string> = {
        entrepreneur: "ideas",
        mentor: "mentor_applications",
        coach: "coach_applications",
        investor: "investor_applications"
      };

      const table = tableMap[type as string] || "ideas";

      const { data, error } = await (client
        .from(table)
        .select("id, status, created_at")
        .eq("id", id)
        .single() as any);

      if (error || !data) {
        return res.status(404).json({ error: "Application not found" });
      }

      return res.json({
        applicationId: data.id,
        status: data.status,
        createdAt: data.created_at
      });
    } catch (error: any) {
      console.error("[PUBLIC API] Get application error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // =============================================
  // COMMUNITY FREE SIGNUP & TRIAL ROUTES
  // =============================================

  // POST /api/community/signup - Create Community-Free account from Founder Focus Score
  app.post("/api/community/signup", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email, name, password, quizResult } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already has an entrepreneur application
      const { data: existingApp } = await (client
        .from("ideas")
        .select("id, status")
        .eq("entrepreneur_email", normalizedEmail)
        .limit(1) as any);

      if (existingApp && existingApp.length > 0) {
        return res.status(409).json({ 
          error: "An account already exists for this email. Please log in instead."
        });
      }

      // Create Supabase auth user with provided password
      const { data: authData, error: authError } = await (client.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          user_type: "entrepreneur",
          full_name: name
        }
      }) as any);

      if (authError) {
        if (authError.message.includes("already been registered")) {
          return res.status(409).json({ error: "An account already exists for this email. Please log in instead." });
        }
        console.error("[COMMUNITY SIGNUP] Auth error:", authError);
        return res.status(400).json({ error: authError.message });
      }

      // Insert into ideas table with pre-approved status
      const { data: ideaData, error: ideaError } = await (client
        .from("ideas")
        .insert({
          status: "pre-approved",
          entrepreneur_email: normalizedEmail,
          entrepreneur_name: name,
          data: quizResult ? { focusScore: quizResult } : {},
          business_plan: {},
          linkedin_profile: "",
          user_id: authData?.user?.id || null,
        } as any)
        .select() as any);

      if (ideaError) {
        console.error("[COMMUNITY SIGNUP] Ideas insert error:", ideaError);
        return res.status(400).json({ error: ideaError.message });
      }

      // Also insert into users table for messaging/profile features
      try {
        await (client
          .from("users")
          .upsert({
            email: normalizedEmail,
            name: name,
            user_type: "entrepreneur",
            status: "pre-approved",
            created_at: new Date().toISOString()
          }, { onConflict: "email" }) as any);
      } catch (e) {
        console.error("[COMMUNITY SIGNUP] Users upsert warning:", e);
      }

      console.log("[COMMUNITY SIGNUP] Account created for:", normalizedEmail);

      // Send welcome email
      try {
        const resendData = await getResendClient();
        if (resendData) {
          const { client: resendClient, fromEmail } = resendData;
          await resendClient.emails.send({
            from: fromEmail,
            to: normalizedEmail,
            subject: "Welcome to TouchConnectPro Community!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0ea5e9;">Welcome to TouchConnectPro, ${name}!</h2>
                <p>Your free Community account is ready. You can now log in to access your entrepreneur dashboard.</p>
                ${quizResult ? `<p>Your Focus Score results have been saved to your profile.</p>` : ""}
                <p>As a Community member, you have access to:</p>
                <ul>
                  <li>AI-powered business planning tools</li>
                  <li>Coach marketplace browsing</li>
                  <li>Focus Score diagnostics</li>
                </ul>
                <p>Ready to upgrade? Our Founders Circle ($9.99/month) and Capital Circle ($49/month) tiers unlock mentor access and investor connections.</p>
                <p><a href="https://touchconnectpro.com/login" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Log In to Your Dashboard</a></p>
                <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
              </div>
            `
          });
          console.log("[COMMUNITY SIGNUP] Welcome email sent to:", normalizedEmail);

          // Notify admin of new free registration
          try {
            await resendClient.emails.send({
              from: fromEmail,
              to: ADMIN_EMAIL,
              subject: `New Community-Free Signup: ${name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #0ea5e9;">New Community-Free Registration</h2>
                  <p>A new entrepreneur has registered for a free Community account.</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Email</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${normalizedEmail}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Focus Score</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${quizResult ? (quizResult.totalScore || 'Completed') : 'Not taken'}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Membership</td><td style="padding: 8px;">Community-Free</td></tr>
                  </table>
                  <p><a href="https://touchconnectpro.com/admin-dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">View in Admin Dashboard</a></p>
                  <p style="color: #94a3b8; font-size: 12px;">Touch Equity Partners LLC</p>
                </div>
              `
            });
            console.log("[COMMUNITY SIGNUP] Admin notification sent to:", ADMIN_EMAIL);
          } catch (adminEmailErr) {
            console.error("[COMMUNITY SIGNUP] Admin email error (non-blocking):", adminEmailErr);
          }
        }
      } catch (emailErr) {
        console.error("[COMMUNITY SIGNUP] Email send error (non-blocking):", emailErr);
      }

      return res.json({ 
        success: true, 
        id: ideaData?.[0]?.id,
        message: "Community account created successfully"
      });
    } catch (error: any) {
      console.error("[COMMUNITY SIGNUP] Error:", error);
      return res.status(500).json({ error: error.message || "Server error" });
    }
  });

  // POST /api/trial/create - Create trial account from Founder Focus Score (legacy)
  app.post("/api/trial/create", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email, name, quizResult } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if trial already exists
      const { data: existing } = await (client
        .from("trial_users")
        .select("id, status, trial_end")
        .eq("email", normalizedEmail)
        .limit(1) as any);

      if (existing && existing.length > 0) {
        return res.status(409).json({ 
          error: "A trial account already exists for this email",
          status: existing[0].status
        });
      }

      // Check if user already has an entrepreneur application
      const { data: existingApp } = await (client
        .from("ideas")
        .select("id")
        .eq("entrepreneur_email", normalizedEmail)
        .limit(1) as any);

      if (existingApp && existingApp.length > 0) {
        return res.status(409).json({ 
          error: "An entrepreneur account already exists for this email. Please log in instead."
        });
      }

      const now = new Date();
      const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create Supabase auth user with temporary password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const { data: authData, error: authError } = await (client.auth.admin.createUser({
        email: normalizedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          user_type: "trial_entrepreneur",
          full_name: name
        }
      }) as any);

      if (authError && !authError.message.includes("already been registered")) {
        console.error("[TRIAL] Auth error:", authError);
        return res.status(400).json({ error: authError.message });
      }

      // Store trial user data
      const { data: trialData, error: trialError } = await (client
        .from("trial_users")
        .insert({
          email: normalizedEmail,
          name: name,
          status: "trial_active",
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
          quiz_result: quizResult || null,
          primary_blocker: quizResult?.primaryBlocker || null,
          created_at: now.toISOString()
        })
        .select() as any);

      if (trialError) {
        console.error("[TRIAL] Insert error:", trialError);
        return res.status(400).json({ error: trialError.message });
      }

      // Create password setup token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const trialTokenUuid = crypto.randomUUID();

      const { error: tokenInsertError } = await (client
        .from("password_tokens")
        .insert({
          token,
          email: normalizedEmail,
          user_type: "trial_entrepreneur",
          application_id: trialTokenUuid,
          expires_at: tokenExpiry.toISOString(),
          status: "pending"
        }) as any);

      if (tokenInsertError) {
        console.error("[TRIAL] Token insert error:", tokenInsertError);
      }

      // Send welcome email with password setup link
      const resend = await getResendClient();
      if (resend) {
        const baseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        const setupUrl = `${baseUrl}/set-password?token=${token}`;

        await resend.client.emails.send({
          from: resend.fromEmail,
          to: normalizedEmail,
          subject: "Welcome to TouchConnectPro - Your 7-Day Trial",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #0891b2;">Welcome to TouchConnectPro!</h1>
              <p>Hi ${name},</p>
              <p>Your 7-day trial has been activated! Here's what you can do:</p>
              <ul>
                <li><strong>Clarity & Focus tools</strong> - Review your Founder Focus Score and set priorities</li>
                <li><strong>Weekly focus exercises</strong> - Define and track your top priorities</li>
                <li><strong>Mentor messaging</strong> - Once an admin assigns a mentor, you can message them directly</li>
              </ul>
              <p><strong>Your trial ends on ${trialEnd.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.</strong></p>
              <p>Set up your password to log in:</p>
              <a href="${setupUrl}" style="display: inline-block; background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Set Up Your Password</a>
              <p style="color: #666; font-size: 12px;">This link expires in 7 days.</p>
            </div>
          `
        });
        console.log("[TRIAL] Welcome email sent to:", normalizedEmail);
      }

      // Notify admin
      if (resend) {
        await resend.client.emails.send({
          from: resend.fromEmail,
          to: ADMIN_EMAIL,
          subject: `New Trial User: ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>New Trial User Activated</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${normalizedEmail}</p>
              <p><strong>Primary Blocker:</strong> ${quizResult?.primaryBlocker || "N/A"}</p>
              <p><strong>Trial Ends:</strong> ${trialEnd.toLocaleDateString()}</p>
              <p>You can assign a mentor to this trial user from the Admin Dashboard.</p>
            </div>
          `
        });
      }

      console.log("[TRIAL] Created for:", normalizedEmail, "ends:", trialEnd.toISOString());
      return res.status(201).json({ 
        success: true, 
        id: trialData?.[0]?.id,
        trialEnd: trialEnd.toISOString()
      });
    } catch (error: any) {
      console.error("[TRIAL] Create error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/trial/status/:email - Get trial status
  app.get("/api/trial/status/:email", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const email = decodeURIComponent(req.params.email).toLowerCase().trim();

      const { data, error } = await (client
        .from("trial_users")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1) as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.json({ exists: false });
      }

      const trial = data[0];
      const now = new Date();
      const trialEnd = new Date(trial.trial_end);
      const isExpired = now > trialEnd;

      // Auto-update status if expired but still marked active
      if (isExpired && trial.status === "trial_active") {
        await (client
          .from("trial_users")
          .update({ status: "trial_expired" } as any)
          .eq("id", trial.id) as any);
        trial.status = "trial_expired";
      }

      const daysRemaining = isExpired ? 0 : Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return res.json({
        exists: true,
        id: trial.id,
        status: trial.status,
        trialStart: trial.trial_start,
        trialEnd: trial.trial_end,
        daysRemaining,
        isExpired,
        quizResult: trial.quiz_result,
        primaryBlocker: trial.primary_blocker,
        mentorId: trial.mentor_id || null
      });
    } catch (error: any) {
      console.error("[TRIAL] Status error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/trial/:id/assign-mentor - Admin assigns mentor to trial user
  app.post("/api/trial/:id/assign-mentor", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { id } = req.params;
      const { mentorId } = req.body;

      if (!mentorId) {
        return res.status(400).json({ error: "mentorId is required" });
      }

      const { data, error } = await (client
        .from("trial_users")
        .update({ mentor_id: mentorId } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      console.log("[TRIAL] Mentor assigned:", mentorId, "to trial:", id);
      return res.json({ success: true, data: data?.[0] });
    } catch (error: any) {
      console.error("[TRIAL] Assign mentor error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // GET /api/trial/all - Get all trial users (admin)
  app.get("/api/trial/all", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { data, error } = await (client
        .from("trial_users")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Auto-expire any active trials that have passed
      const now = new Date();
      const updatedData = (data || []).map((trial: any) => {
        if (trial.status === "trial_active" && new Date(trial.trial_end) < now) {
          trial.status = "trial_expired";
        }
        return trial;
      });

      return res.json(updatedData);
    } catch (error: any) {
      console.error("[TRIAL] List error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // POST /api/trial/save-priorities - Save weekly priorities for trial user
  app.post("/api/trial/save-priorities", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Database not configured" });
      }

      const { email, priorities } = req.body;
      if (!email || !priorities) {
        return res.status(400).json({ error: "Email and priorities are required" });
      }

      const { data, error } = await (client
        .from("trial_users")
        .update({ weekly_priorities: priorities, priorities_updated_at: new Date().toISOString() } as any)
        .eq("email", email.toLowerCase().trim())
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("[TRIAL] Save priorities error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  });

  // Regenerate trial token for a user
  app.post("/api/trial/regenerate-token", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) return res.status(500).json({ error: "Not configured" });
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email required" });
      const normalizedEmail = email.toLowerCase().trim();

      // Check trial exists
      const { data: trialData } = await (client
        .from("trial_users")
        .select("*")
        .eq("email", normalizedEmail)
        .order("created_at", { ascending: false })
        .limit(1) as any);
      if (!trialData || trialData.length === 0) {
        return res.status(404).json({ error: "No trial found for this email" });
      }

      // Expire old tokens
      await (client
        .from("password_tokens")
        .update({ status: "expired" })
        .eq("email", normalizedEmail)
        .eq("status", "pending") as any);

      // Create new token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const trialUuid = crypto.randomUUID();
      const { data: insertData, error: insertError } = await (client
        .from("password_tokens")
        .insert({
          token,
          email: normalizedEmail,
          user_type: "trial_entrepreneur",
          application_id: trialUuid,
          expires_at: tokenExpiry.toISOString(),
          status: "pending"
        })
        .select() as any);

      if (insertError) {
        console.error("[TRIAL TOKEN] Insert error:", insertError);
        return res.status(400).json({ error: "Failed to create token", details: insertError });
      }

      // Send new email
      const resend = await getResendClient();
      if (resend) {
        const baseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        const setupUrl = `${baseUrl}/set-password?token=${token}`;
        const name = trialData[0].name || "Founder";
        const trialEnd = new Date(trialData[0].trial_end);

        await resend.client.emails.send({
          from: resend.fromEmail,
          to: normalizedEmail,
          subject: "TouchConnectPro - Set Up Your Password (New Link)",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #0891b2;">Set Up Your Password</h1>
              <p>Hi ${name},</p>
              <p>Here is your new password setup link:</p>
              <a href="${setupUrl}" style="display: inline-block; background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Set Up Your Password</a>
              <p><strong>Your trial ends on ${trialEnd.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.</strong></p>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${setupUrl}</p>
            </div>
          `
        });
      }

      return res.json({ success: true, tokenCreated: !!insertData });
    } catch (e: any) {
      console.error("[TRIAL TOKEN] Regenerate error:", e.message);
      return res.status(500).json({ error: e.message });
    }
  });

  return httpServer;
}
