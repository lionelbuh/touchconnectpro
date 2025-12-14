import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10mb" }));

// Config endpoint for frontend to get Supabase credentials
app.get("/api/config", (req, res) => {
  console.log("[GET /api/config] Serving Supabase config");
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://touchconnectpro.com");

async function getResendClient() {
  // First try direct RESEND_API_KEY (for Render and other deployments)
  if (process.env.RESEND_API_KEY) {
    console.log("[RESEND] Using RESEND_API_KEY environment variable");
    return {
      client: new Resend(process.env.RESEND_API_KEY),
      fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@touchconnectpro.com"
    };
  }

  // Fallback to Replit connector (for Replit environment)
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

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings?.api_key) {
      console.log("[RESEND] Replit connection not configured");
      return null;
    }

    return {
      client: new Resend(connectionSettings.settings.api_key),
      fromEmail: connectionSettings.settings.from_email || "noreply@touchconnectpro.com"
    };
  } catch (error) {
    console.error("[RESEND] Error getting client:", error);
    return null;
  }
}

async function createPasswordToken(email, userType, applicationId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("password_tokens")
    .insert({
      email,
      token,
      user_type: userType,
      application_id: applicationId,
      status: "pending",
      expires_at: expiresAt.toISOString()
    })
    .select();

  if (error) {
    console.error("[TOKEN ERROR]:", error);
    return null;
  }

  return token;
}

async function sendStatusEmail(email, fullName, userType, status, applicationId) {
  console.log("[EMAIL] Starting email send process for:", email, "userType:", userType, "status:", status);
  
  const resendData = await getResendClient();
  
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping email for:", email);
    console.log("[EMAIL] RESEND_API_KEY present?", !!process.env.RESEND_API_KEY);
    console.log("[EMAIL] REPLIT_CONNECTORS_HOSTNAME present?", !!process.env.REPLIT_CONNECTORS_HOSTNAME);
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  console.log("[EMAIL] Using fromEmail:", fromEmail);
  
  let subject, htmlContent;
  
  if (status === "approved") {
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
            <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
            <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
            <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
  } catch (error) {
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

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@touchconnectpro.com";

// Send email when application is submitted (confirmation to applicant)
async function sendApplicationSubmittedEmail(email, fullName, userType, ideaName = null) {
  console.log("[EMAIL] Sending application submitted email to:", email, "type:", userType);
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping submission confirmation");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  const userTypeCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
  
  const ideaText = ideaName ? ` for "${ideaName}"` : "";
  
  const subject = `Application Received - TouchConnectPro ${userTypeCapitalized}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Received!</h1>
        </div>
        <div class="content">
          <p>Dear ${fullName},</p>
          
          <p>Thank you for submitting your application to join TouchConnectPro as a <strong>${userType}</strong>${ideaText}.</p>
          
          <div class="highlight-box">
            <p style="margin: 0;"><strong>What happens next?</strong></p>
            <p style="margin: 10px 0 0 0;">Our team will review your application within 2-3 business days. You'll receive an email notification once a decision has been made.</p>
          </div>
          
          <p>In the meantime, feel free to explore our platform and learn more about how TouchConnectPro helps ${userType}s succeed.</p>
          
          <p>Best regards,<br>The TouchConnectPro Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
    console.log("[EMAIL] Application submitted email sent to:", email);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending submission email:", error.message);
    return { success: false, error: error.message };
  }
}

// Send email to admin when new application is received
async function sendAdminNewApplicationEmail(applicantEmail, applicantName, userType, applicationId, additionalInfo = "") {
  console.log("[EMAIL] Notifying admin of new application from:", applicantEmail, "type:", userType);
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping admin notification");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  const userTypeCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
  
  const subject = `New ${userTypeCapitalized} Application - ${applicantName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New ${userTypeCapitalized} Application</h1>
        </div>
        <div class="content">
          <p>A new ${userType} application has been submitted and requires your review.</p>
          
          <div class="info-box">
            <p><strong>Applicant Name:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> ${applicantEmail}</p>
            <p><strong>Application Type:</strong> ${userTypeCapitalized}</p>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            ${additionalInfo ? `<p><strong>Additional Info:</strong> ${additionalInfo}</p>` : ""}
          </div>
          
          <p style="text-align: center;">
            <a href="${FRONTEND_URL}/admin-dashboard" class="button">Review in Admin Dashboard</a>
          </p>
          
          <p>Please review this application at your earliest convenience.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TouchConnectPro Admin Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject,
      html: htmlContent
    });
    console.log("[EMAIL] Admin notification sent for new application");
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending admin notification:", error.message);
    return { success: false, error: error.message };
  }
}

// Send email notification when a message is received
async function sendMessageNotificationEmail(recipientEmail, recipientName, senderName, senderEmail, messagePreview, messageType = "direct") {
  console.log("[EMAIL] Sending message notification to:", recipientEmail, "from:", senderEmail);
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping message notification");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  
  // Truncate message preview
  const preview = messagePreview.length > 200 ? messagePreview.substring(0, 200) + "..." : messagePreview;
  
  const subject = `New Message from ${senderName} - TouchConnectPro`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Message</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName || "there"},</p>
          
          <p>You have received a new message from <strong>${senderName}</strong> on TouchConnectPro.</p>
          
          <div class="message-box">
            <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>From:</strong> ${senderName} (${senderEmail})</p>
            <p style="margin: 15px 0 0 0;">${preview}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${FRONTEND_URL}/login" class="button">View Full Message</a>
          </p>
          
          <p style="font-size: 14px; color: #64748b;">Log in to your dashboard to read the full message and reply.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: htmlContent
    });
    console.log("[EMAIL] Message notification sent to:", recipientEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending message notification:", error.message);
    return { success: false, error: error.message };
  }
}

// Send email to admin when a new internal message is sent
async function sendAdminMessageNotificationEmail(senderName, senderEmail, recipientName, recipientEmail, messagePreview) {
  console.log("[EMAIL] Notifying admin of new internal message");
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping admin message notification");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  
  const preview = messagePreview.length > 150 ? messagePreview.substring(0, 150) + "..." : messagePreview;
  
  const subject = `Internal Message: ${senderName} → ${recipientName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; }
        .info-row { display: flex; margin: 10px 0; }
        .message-preview { background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
        .footer { text-align: center; margin-top: 15px; color: #64748b; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">New Internal Message</h2>
        </div>
        <div class="content">
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>To:</strong> ${recipientName} (${recipientEmail})</p>
          
          <div class="message-preview">
            "${preview}"
          </div>
          
          <p style="font-size: 14px; color: #64748b;">This is an automated notification. View full details in the admin dashboard.</p>
        </div>
        <div class="footer">
          <p>TouchConnectPro Admin Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject,
      html: htmlContent
    });
    console.log("[EMAIL] Admin message notification sent");
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending admin message notification:", error.message);
    return { success: false, error: error.message };
  }
}

// Helper function to check if email exists in any other category
async function checkEmailInOtherCategories(email, currentCategory) {
  const categories = {
    entrepreneur: { table: "ideas", emailColumn: "entrepreneur_email" },
    mentor: { table: "mentor_applications", emailColumn: "email" },
    coach: { table: "coach_applications", emailColumn: "email" },
    investor: { table: "investor_applications", emailColumn: "email" }
  };

  const otherCategories = Object.entries(categories).filter(([key]) => key !== currentCategory);

  for (const [categoryName, config] of otherCategories) {
    const { data, error } = await supabase
      .from(config.table)
      .select("id, status")
      .eq(config.emailColumn, email)
      .limit(1);

    if (data && data.length > 0) {
      const status = data[0].status;
      // Only block if they have a non-rejected application in another category
      if (status !== "rejected") {
        return {
          exists: true,
          category: categoryName,
          status: status
        };
      }
    }
  }

  return { exists: false };
}

app.post("/api/ideas", async (req, res) => {
  console.log("[POST /api/ideas] Called");
  console.log("[Payload] fullName:", req.body?.fullName, "email:", req.body?.email);
  
  try {
    const { fullName, email, ideaName, businessPlan, formData, linkedinWebsite } = req.body;
    
    if (!fullName || !email) {
      console.log("[VALIDATION] Missing: fullName =", fullName, ", email =", email);
      return res.status(400).json({ error: "Name and email required" });
    }

    // Check if email exists in another category
    const crossCategoryCheck = await checkEmailInOtherCategories(email, "entrepreneur");
    if (crossCategoryCheck.exists) {
      console.log("[CROSS-CATEGORY] Email already used in:", crossCategoryCheck.category);
      return res.status(400).json({ 
        error: `This email is already registered as a ${crossCategoryCheck.category}. You cannot apply for multiple roles with the same email.` 
      });
    }

    // Check for existing application with same email
    const { data: existingApp, error: checkError } = await supabase
      .from("ideas")
      .select("*")
      .eq("entrepreneur_email", email)
      .single();

    if (existingApp) {
      // If rejected, allow resubmission by updating existing record
      if (existingApp.status === "rejected") {
        console.log("[RESUBMIT] Updating rejected application for:", email);
        const updatedFormData = { ...(formData || {}), isResubmission: true };
        const { data: updatedData, error: updateError } = await supabase
          .from("ideas")
          .update({
            status: "submitted",
            entrepreneur_name: fullName,
            data: updatedFormData,
            business_plan: businessPlan || {},
            linkedin_profile: linkedinWebsite || ""
          })
          .eq("id", existingApp.id)
          .select();

        if (updateError) {
          console.error("[DB ERROR]:", updateError);
          return res.status(400).json({ error: updateError.message });
        }

        console.log("[RESUBMIT SUCCESS] Application updated with id:", updatedData?.[0]?.id);
        return res.json({ success: true, id: updatedData?.[0]?.id, resubmitted: true });
      } else {
        // If already submitted/pending/approved, don't allow duplicate
        console.log("[DUPLICATE] Application already exists for:", email, "status:", existingApp.status);
        return res.status(400).json({ error: "An application with this email already exists" });
      }
    }

    console.log("[INSERT] Saving to ideas table for:", email);
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        status: "submitted",
        entrepreneur_name: fullName,
        entrepreneur_email: email,
        data: formData || {},
        business_plan: businessPlan || {},
        linkedin_profile: linkedinWebsite || "",
        user_id: null
      })
      .select();

    console.log("[INSERT RESPONSE]:", { data, error });

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[SUCCESS] Idea saved with id:", data?.[0]?.id);
    
    // Send confirmation email to applicant and notify admin
    const emailIdeaName = ideaName || formData?.ideaName || "their business idea";
    sendApplicationSubmittedEmail(email, fullName, "entrepreneur", emailIdeaName).catch(err => console.error("[EMAIL] Failed:", err));
    sendAdminNewApplicationEmail(email, fullName, "entrepreneur", data?.[0]?.id, `Idea: ${emailIdeaName}`).catch(err => console.error("[EMAIL] Admin notify failed:", err));
    
    return res.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

app.get("/api/ideas", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/ideas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pre-approved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: existingData, error: fetchError } = await supabase
      .from("ideas")
      .select("entrepreneur_email, entrepreneur_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const { data, error } = await supabase
      .from("ideas")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const emailResult = await sendStatusEmail(
      existingData.entrepreneur_email,
      existingData.entrepreneur_name,
      "entrepreneur",
      status,
      id
    );

    return res.json({ success: true, idea: data?.[0], emailSent: emailResult.success });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ideas")
      .select("id", { count: "exact" });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      status: "Connected to Supabase",
      ideas_count: data?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/mentors", async (req, res) => {
  console.log("[POST /api/mentors] Called");
  try {
    const { fullName, email, linkedin, bio, expertise, experience, country, state } = req.body;

    if (!email || !fullName || !bio || !expertise || !experience || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email exists in another category
    const crossCategoryCheck = await checkEmailInOtherCategories(email, "mentor");
    if (crossCategoryCheck.exists) {
      console.log("[CROSS-CATEGORY] Email already used in:", crossCategoryCheck.category);
      return res.status(400).json({ 
        error: `This email is already registered as a ${crossCategoryCheck.category}. You cannot apply for multiple roles with the same email.` 
      });
    }

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("mentor_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingApp && existingApp.length > 0) {
      const existing = existingApp[0];
      
      if (existing.status === "approved") {
        return res.status(400).json({ error: "You already have an approved application. Please login to access your dashboard." });
      }
      
      if (existing.status === "pending" || existing.status === "submitted") {
        return res.status(400).json({ error: "You already have a pending application. Please wait for admin review." });
      }
      
      // If rejected, update the existing record to allow resubmission
      if (existing.status === "rejected") {
        console.log("[UPDATE] Resubmitting rejected mentor application for:", email);
        const { data, error } = await supabase
          .from("mentor_applications")
          .update({
            full_name: fullName,
            linkedin: linkedin || null,
            bio,
            expertise,
            experience,
            country,
            state: state || null,
            status: "pending",
            is_resubmitted: true
          })
          .eq("id", existing.id)
          .select();

        if (error) {
          console.error("[DB ERROR]:", error);
          return res.status(400).json({ error: error.message });
        }

        console.log("[SUCCESS] Mentor application resubmitted");
        return res.json({ success: true, id: data?.[0]?.id, resubmission: true });
      }
    }

    console.log("[INSERT] Saving new mentor application for:", email);
    const { data, error } = await supabase
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
      })
      .select();

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[SUCCESS] Mentor application saved");
    
    // Send confirmation email to applicant and notify admin
    sendApplicationSubmittedEmail(email, fullName, "mentor").catch(err => console.error("[EMAIL] Failed:", err));
    sendAdminNewApplicationEmail(email, fullName, "mentor", data?.[0]?.id, `Expertise: ${expertise}`).catch(err => console.error("[EMAIL] Admin notify failed:", err));
    
    return res.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

app.get("/api/mentors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("mentor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get mentor profile by email
app.get("/api/mentors/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("email", decodeURIComponent(email))
      .eq("status", "approved")
      .single();

    if (error) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update mentor profile
app.put("/api/mentors/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, expertise, experience, linkedin } = req.body;

    const { data, error } = await supabase
      .from("mentor_applications")
      .update({
        bio,
        expertise,
        experience,
        linkedin: linkedin || null
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, mentor: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: existingData, error: fetchError } = await supabase
      .from("mentor_applications")
      .select("email, full_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const { data, error } = await supabase
      .from("mentor_applications")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const emailResult = await sendStatusEmail(
      existingData.email,
      existingData.full_name,
      "mentor",
      status,
      id
    );

    return res.json({ success: true, mentor: data?.[0], emailSent: emailResult.success });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/coaches", async (req, res) => {
  console.log("[POST /api/coaches] Called");
  try {
    const { fullName, email, linkedin, expertise, focusAreas, hourlyRate, country, state } = req.body;

    if (!email || !fullName || !expertise || !focusAreas || !hourlyRate || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email exists in another category
    const crossCategoryCheck = await checkEmailInOtherCategories(email, "coach");
    if (crossCategoryCheck.exists) {
      console.log("[CROSS-CATEGORY] Email already used in:", crossCategoryCheck.category);
      return res.status(400).json({ 
        error: `This email is already registered as a ${crossCategoryCheck.category}. You cannot apply for multiple roles with the same email.` 
      });
    }

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("coach_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingApp && existingApp.length > 0) {
      const existing = existingApp[0];
      
      if (existing.status === "approved") {
        return res.status(400).json({ error: "You already have an approved application. Please login to access your dashboard." });
      }
      
      if (existing.status === "pending" || existing.status === "submitted") {
        return res.status(400).json({ error: "You already have a pending application. Please wait for admin review." });
      }
      
      // If rejected, update the existing record to allow resubmission
      if (existing.status === "rejected") {
        console.log("[UPDATE] Resubmitting rejected coach application for:", email);
        const { data, error } = await supabase
          .from("coach_applications")
          .update({
            full_name: fullName,
            linkedin: linkedin || null,
            expertise,
            focus_areas: focusAreas,
            hourly_rate: hourlyRate,
            country,
            state: state || null,
            status: "pending",
            is_resubmitted: true
          })
          .eq("id", existing.id)
          .select();

        if (error) {
          console.error("[DB ERROR]:", error);
          return res.status(400).json({ error: error.message });
        }

        console.log("[SUCCESS] Coach application resubmitted");
        return res.json({ success: true, id: data?.[0]?.id, resubmission: true });
      }
    }

    console.log("[INSERT] Saving new coach application for:", email);
    const { data, error } = await supabase
      .from("coach_applications")
      .insert({
        full_name: fullName,
        email,
        linkedin: linkedin || null,
        expertise,
        focus_areas: focusAreas,
        hourly_rate: hourlyRate,
        country,
        state: state || null,
        status: "submitted"
      })
      .select();

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[SUCCESS] Coach application saved");
    
    // Send confirmation email to applicant and notify admin
    sendApplicationSubmittedEmail(email, fullName, "coach").catch(err => console.error("[EMAIL] Failed:", err));
    sendAdminNewApplicationEmail(email, fullName, "coach", data?.[0]?.id, `Expertise: ${expertise}, Rate: $${hourlyRate}/hr`).catch(err => console.error("[EMAIL] Admin notify failed:", err));
    
    return res.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

app.get("/api/coaches", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get coach profile by email
app.get("/api/coaches/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("email", decodeURIComponent(email))
      .eq("status", "approved")
      .single();

    if (error) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update coach profile
app.put("/api/coaches/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { expertise, focusAreas, hourlyRate, linkedin } = req.body;

    const { data, error } = await supabase
      .from("coach_applications")
      .update({
        expertise,
        focus_areas: focusAreas,
        hourly_rate: hourlyRate,
        linkedin: linkedin || null
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, coach: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/coaches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: existingData, error: fetchError } = await supabase
      .from("coach_applications")
      .select("email, full_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const { data, error } = await supabase
      .from("coach_applications")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const emailResult = await sendStatusEmail(
      existingData.email,
      existingData.full_name,
      "coach",
      status,
      id
    );

    return res.json({ success: true, coach: data?.[0], emailSent: emailResult.success });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/investors", async (req, res) => {
  console.log("[POST /api/investors] Called");
  try {
    const { fullName, email, linkedin, fundName, investmentFocus, investmentPreference, investmentAmount, country, state } = req.body;

    if (!email || !fullName || !fundName || !investmentFocus || !investmentPreference || !investmentAmount || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email exists in another category
    const crossCategoryCheck = await checkEmailInOtherCategories(email, "investor");
    if (crossCategoryCheck.exists) {
      console.log("[CROSS-CATEGORY] Email already used in:", crossCategoryCheck.category);
      return res.status(400).json({ 
        error: `This email is already registered as a ${crossCategoryCheck.category}. You cannot apply for multiple roles with the same email.` 
      });
    }

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("investor_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingApp && existingApp.length > 0) {
      const existing = existingApp[0];
      
      if (existing.status === "approved") {
        return res.status(400).json({ error: "You already have an approved application. Please login to access your dashboard." });
      }
      
      if (existing.status === "pending" || existing.status === "submitted") {
        return res.status(400).json({ error: "You already have a pending application. Please wait for admin review." });
      }
      
      // If rejected, update the existing record to allow resubmission
      if (existing.status === "rejected") {
        console.log("[UPDATE] Resubmitting rejected investor application for:", email);
        const { data, error } = await supabase
          .from("investor_applications")
          .update({
            full_name: fullName,
            linkedin: linkedin || null,
            fund_name: fundName,
            investment_focus: investmentFocus,
            investment_preference: investmentPreference,
            investment_amount: investmentAmount,
            country,
            state: state || null,
            status: "pending",
            is_resubmitted: true
          })
          .eq("id", existing.id)
          .select();

        if (error) {
          console.error("[DB ERROR]:", error);
          return res.status(400).json({ error: error.message });
        }

        console.log("[SUCCESS] Investor application resubmitted");
        return res.json({ success: true, id: data?.[0]?.id, resubmission: true });
      }
    }

    console.log("[INSERT] Saving new investor application for:", email);
    const { data, error } = await supabase
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
        status: "submitted"
      })
      .select();

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[SUCCESS] Investor application saved");
    
    // Send confirmation email to applicant and notify admin
    sendApplicationSubmittedEmail(email, fullName, "investor").catch(err => console.error("[EMAIL] Failed:", err));
    sendAdminNewApplicationEmail(email, fullName, "investor", data?.[0]?.id, `Fund: ${fundName}, Focus: ${investmentFocus}`).catch(err => console.error("[EMAIL] Admin notify failed:", err));
    
    return res.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

app.get("/api/investors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("investor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get investor profile by email
app.get("/api/investors/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from("investor_applications")
      .select("*")
      .eq("email", decodeURIComponent(email))
      .eq("status", "approved")
      .single();

    if (error) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update investor profile
app.put("/api/investors/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fundName, investmentFocus, investmentPreference, investmentAmount, linkedin } = req.body;

    const { data, error } = await supabase
      .from("investor_applications")
      .update({
        fund_name: fundName,
        investment_focus: investmentFocus,
        investment_preference: investmentPreference,
        investment_amount: investmentAmount,
        linkedin: linkedin || null
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, investor: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/investors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data: existingData, error: fetchError } = await supabase
      .from("investor_applications")
      .select("email, full_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const { data, error } = await supabase
      .from("investor_applications")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const emailResult = await sendStatusEmail(
      existingData.email,
      existingData.full_name,
      "investor",
      status,
      id
    );

    return res.json({ success: true, investor: data?.[0], emailSent: emailResult.success });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle entrepreneur disabled status
app.patch("/api/ideas/:id/toggle-disabled", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: current, error: getError } = await supabase
      .from("ideas")
      .select("is_disabled")
      .eq("id", id)
      .single();

    if (getError) {
      return res.status(400).json({ error: getError.message });
    }

    const newState = !current?.is_disabled;
    
    const { data, error } = await supabase
      .from("ideas")
      .update({ is_disabled: newState })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, is_disabled: newState, idea: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle mentor disabled status
app.patch("/api/mentors/:id/toggle-disabled", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: current, error: getError } = await supabase
      .from("mentor_applications")
      .select("is_disabled")
      .eq("id", id)
      .single();

    if (getError) {
      return res.status(400).json({ error: getError.message });
    }

    const newState = !current?.is_disabled;
    
    const { data, error } = await supabase
      .from("mentor_applications")
      .update({ is_disabled: newState })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, is_disabled: newState, mentor: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle coach disabled status
app.patch("/api/coaches/:id/toggle-disabled", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: current, error: getError } = await supabase
      .from("coach_applications")
      .select("is_disabled")
      .eq("id", id)
      .single();

    if (getError) {
      return res.status(400).json({ error: getError.message });
    }

    const newState = !current?.is_disabled;
    
    const { data, error } = await supabase
      .from("coach_applications")
      .update({ is_disabled: newState })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, is_disabled: newState, coach: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle investor disabled status
app.patch("/api/investors/:id/toggle-disabled", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: current, error: getError } = await supabase
      .from("investor_applications")
      .select("is_disabled")
      .eq("id", id)
      .single();

    if (getError) {
      return res.status(400).json({ error: getError.message });
    }

    const newState = !current?.is_disabled;
    
    const { data, error } = await supabase
      .from("investor_applications")
      .update({ is_disabled: newState })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, is_disabled: newState, investor: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/password-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from("password_tokens")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/set-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("password_tokens")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({ error: "Invalid or expired token" });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: "Token has expired" });
    }

    let userId = null;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: tokenData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        user_type: tokenData.user_type,
        application_id: tokenData.application_id
      }
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log("[AUTH] User already exists, fetching existing user ID");
        // User already exists, get their ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === tokenData.email);
        if (existingUser) {
          userId = existingUser.id;
          console.log("[AUTH] Found existing user:", userId);
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: password }
          );
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

    // Create or update user profile in users table with correct role
    if (userId) {
      console.log("[PROFILE] Creating/updating profile for user:", userId, "with role:", tokenData.user_type);
      
      // First try to update existing profile
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single();
      
      if (existingProfile) {
        // Update existing profile with correct role
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: tokenData.user_type })
          .eq("id", userId);
        
        if (updateError) {
          console.error("[PROFILE UPDATE ERROR]:", updateError);
        } else {
          console.log("[PROFILE] Updated existing profile with role:", tokenData.user_type);
        }
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: userId,
            email: tokenData.email,
            role: tokenData.user_type,
            full_name: tokenData.email
          });
        
        if (insertError) {
          console.error("[PROFILE INSERT ERROR]:", insertError);
        } else {
          console.log("[PROFILE] Created new profile with role:", tokenData.user_type);
        }
      }
    } else {
      console.error("[PROFILE] No user ID available to create profile");
    }

    await supabase
      .from("password_tokens")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("token", token);

    return res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error("[SET PASSWORD ERROR]:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all approved coaches
app.get("/api/coaches/approved", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get entrepreneur data by email (including mentor assignment)
app.get("/api/entrepreneur/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);

    // Get entrepreneur's idea/application
    const { data: ideaData, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("entrepreneur_email", decodedEmail)
      .single();

    if (ideaError || !ideaData) {
      return res.status(404).json({ error: "Entrepreneur not found" });
    }

    // Get mentor assignment if exists
    const { data: assignmentData } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("entrepreneur_id", ideaData.id)
      .eq("status", "active")
      .single();

    let mentorProfile = null;
    let mentorNotes = [];

    if (assignmentData) {
      // Fetch mentor profile from mentor_applications table
      const { data: mentorData } = await supabase
        .from("mentor_applications")
        .select("*")
        .eq("id", assignmentData.mentor_id)
        .single();

      if (mentorData) {
        mentorProfile = {
          id: mentorData.id,
          full_name: mentorData.full_name || mentorData.fullName || "",
          email: mentorData.email || "",
          expertise: mentorData.expertise || "",
          experience: mentorData.experience || "",
          linkedin: mentorData.linkedin || "",
          bio: mentorData.bio || "",
          photo_url: mentorData.photo_url || mentorData.photoUrl || ""
        };
      }

      // Get mentor notes from assignment (stored as JSON in mentor_notes column)
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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get mentor notes for an entrepreneur
app.get("/api/mentor-notes/:entrepreneurId", async (req, res) => {
  try {
    const { entrepreneurId } = req.params;

    const { data, error } = await supabase
      .from("mentor_notes")
      .select("*")
      .eq("entrepreneur_id", entrepreneurId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add mentor note
app.post("/api/mentor-notes", async (req, res) => {
  try {
    const { entrepreneurId, mentorId, stepNumber, title, content, type } = req.body;

    if (!entrepreneurId || !mentorId || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("mentor_notes")
      .insert({
        entrepreneur_id: entrepreneurId,
        mentor_id: mentorId,
        step_number: stepNumber || null,
        title,
        content,
        type: type || "recommendation"
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, note: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// Get all mentor assignments (for admin dashboard badges)
app.get("/api/mentor-assignments", async (req, res) => {
  try {
    console.log("[GET /api/mentor-assignments] Fetching all active assignments...");
    const { data: assignments, error: assignmentError } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("status", "active");

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
    const mentorIds = [...new Set(assignments.map(a => a.mentor_id))];
    console.log("[GET /api/mentor-assignments] Looking up mentor IDs:", mentorIds);
    
    const { data: mentors, error: mentorError } = await supabase
      .from("mentor_applications")
      .select("id, full_name")
      .in("id", mentorIds);

    console.log("[GET /api/mentor-assignments] Mentor lookup result:", { mentors, error: mentorError?.message });

    // Map mentor names to assignments
    const assignmentsWithMentorNames = assignments.map(a => {
      const mentor = mentors?.find(m => m.id === a.mentor_id);
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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Assign mentor to entrepreneur
app.post("/api/mentor-assignments", async (req, res) => {
  try {
    const { entrepreneurId, mentorId, portfolioNumber, meetingLink } = req.body;
    console.log("[POST /api/mentor-assignments] Request received:", { entrepreneurId, mentorId, portfolioNumber });

    if (!entrepreneurId || !mentorId || !portfolioNumber) {
      return res.status(400).json({ error: "Missing required fields (entrepreneurId, mentorId, portfolioNumber)" });
    }

    // Check if entrepreneur already has an assignment
    const { data: existing } = await supabase
      .from("mentor_assignments")
      .select("id")
      .eq("entrepreneur_id", entrepreneurId)
      .eq("status", "active")
      .single();

    if (existing) {
      // Update existing assignment
      const { data, error } = await supabase
        .from("mentor_assignments")
        .update({
          mentor_id: mentorId,
          portfolio_number: portfolioNumber,
          meeting_link: meetingLink || null
        })
        .eq("id", existing.id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.json({ success: true, assignment: data?.[0], updated: true });
    }

    // Create new assignment
    console.log("[POST /api/mentor-assignments] Creating assignment with mentor_id:", mentorId);
    const { data, error } = await supabase
      .from("mentor_assignments")
      .insert({
        entrepreneur_id: entrepreneurId,
        mentor_id: mentorId,
        portfolio_number: portfolioNumber,
        meeting_link: meetingLink || null,
        status: "active"
      })
      .select();

    console.log("[POST /api/mentor-assignments] Assignment created:", data?.[0]?.id, "Error:", error?.message);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Fetch entrepreneur and mentor details for system messages
    const { data: entrepreneur } = await supabase
      .from("entrepreneur_applications")
      .select("email, full_name")
      .eq("id", entrepreneurId)
      .single();
    
    const { data: mentor } = await supabase
      .from("mentor_applications")
      .select("email, full_name")
      .eq("id", mentorId)
      .single();

    if (entrepreneur && mentor) {
      const entrepreneurEmail = entrepreneur.email;
      const entrepreneurName = entrepreneur.full_name || "Entrepreneur";
      const mentorEmail = mentor.email;
      const mentorName = mentor.full_name || "Mentor";

      // Send system message to entrepreneur about mentor assignment
      await supabase.from("messages").insert({
        from_name: "System",
        from_email: "admin@touchconnectpro.com",
        to_name: entrepreneurName,
        to_email: entrepreneurEmail,
        message: `Great news! You have been assigned to ${mentorName}'s Portfolio ${portfolioNumber}. Visit your dashboard to see your mentor's profile and connect with them.`,
        is_read: false
      });

      // Send system message to mentor about new entrepreneur
      await supabase.from("messages").insert({
        from_name: "System",
        from_email: "admin@touchconnectpro.com",
        to_name: mentorName,
        to_email: mentorEmail,
        message: `${entrepreneurName} has been added to your Portfolio ${portfolioNumber}. Visit your dashboard to view their profile and business idea.`,
        is_read: false
      });
    }

    return res.json({ success: true, assignment: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get entrepreneur's assigned mentor with full mentor profile
app.get("/api/mentor-assignments/entrepreneur/:entrepreneurId", async (req, res) => {
  try {
    const { entrepreneurId } = req.params;

    const { data: assignment, error: assignmentError } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("entrepreneur_id", entrepreneurId)
      .eq("status", "active")
      .single();

    if (assignmentError || !assignment) {
      return res.json({ assignment: null });
    }

    // Parse mentor_notes from JSON if needed
    let parsedNotes = [];
    if (assignment.mentor_notes) {
      try {
        parsedNotes = typeof assignment.mentor_notes === 'string'
          ? JSON.parse(assignment.mentor_notes)
          : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
      } catch (e) {
        parsedNotes = [assignment.mentor_notes];
      }
    }

    // Fetch mentor profile
    const { data: mentor, error: mentorError } = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("id", assignment.mentor_id)
      .single();

    if (mentorError) {
      return res.json({ 
        assignment: { ...assignment, mentor_notes: parsedNotes },
        mentor: null 
      });
    }

    return res.json({ 
      assignment: { ...assignment, mentor_notes: parsedNotes },
      mentor: {
        id: mentor.id,
        full_name: mentor.full_name || mentor.fullName,
        email: mentor.email,
        expertise: mentor.expertise,
        experience: mentor.experience,
        photo_url: mentor.photo_url || mentor.photoUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DEBUG: Check what's in the database for a mentor
app.get("/api/debug/mentor-assignments/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    
    // Get mentor from mentor_applications
    const { data: mentor } = await supabase
      .from("mentor_applications")
      .select("id, email, full_name")
      .eq("email", decodedEmail)
      .single();
    
    // Get all assignments with that mentor_id
    const { data: assignments } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("mentor_id", mentor?.id);
    
    // Also show ALL assignments to see what mentor_ids exist
    const { data: allAssignments } = await supabase
      .from("mentor_assignments")
      .select("mentor_id")
      .limit(10);
    
    return res.json({
      mentorEmail: decodedEmail,
      mentorId: mentor?.id,
      mentorFromDb: mentor,
      assignmentsForThisMentor: assignments?.length || 0,
      assignmentDetails: assignments,
      allAssignmentMentorIds: allAssignments?.map(a => a.mentor_id)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get mentor's assigned entrepreneurs by email (portfolio)
app.get("/api/mentor-assignments/mentor-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    console.log("[GET /api/mentor-assignments/mentor-email/:email] Looking for mentor with email:", decodedEmail);

    // First, find the mentor by email
    const { data: mentorData, error: mentorError } = await supabase
      .from("mentor_applications")
      .select("id, email, full_name")
      .eq("email", decodedEmail)
      .single();

    console.log("[GET /api/mentor-assignments/mentor-email/:email] Mentor lookup result:", mentorData);

    if (mentorError || !mentorData) {
      console.error("[GET /api/mentor-assignments/mentor-email/:email] Mentor not found with email:", decodedEmail, "Error:", mentorError?.message);
      return res.json({ entrepreneurs: [] });
    }

    const mentorId = mentorData.id;
    console.log("[GET /api/mentor-assignments/mentor-email/:email] Found mentor ID:", mentorId, "Name:", mentorData.full_name);

    // Now fetch assignments for this mentor
    const { data: assignments, error: assignmentError } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("status", "active");

    console.log("[GET /api/mentor-assignments/mentor-email/:email] Assignments found:", assignments?.length || 0);

    if (assignmentError) {
      console.error("[GET /api/mentor-assignments/mentor-email/:email] Error:", assignmentError);
      return res.status(400).json({ error: assignmentError.message });
    }

    if (!assignments || assignments.length === 0) {
      console.log("[GET /api/mentor-assignments/mentor-email/:email] No assignments found");
      return res.json({ entrepreneurs: [] });
    }
  

    // Fetch entrepreneur profiles from ideas table (where assignments point to)
    const entrepreneurIds = assignments.map(a => a.entrepreneur_id);
    console.log("[GET /api/mentor-assignments/mentor-email/:email] Looking up entrepreneur IDs:", entrepreneurIds);
    
    const { data: entrepreneurs, error: entError } = await supabase
      .from("ideas")
      .select("*")
      .in("id", entrepreneurIds);

    console.log("[GET /api/mentor-assignments/mentor-email/:email] Entrepreneur lookup result:", { 
      count: entrepreneurs?.length, 
      error: entError?.message,
      entrepreneurs: entrepreneurs?.map(e => ({ id: e.id, name: e.entrepreneur_name, email: e.entrepreneur_email }))
    });

    if (entError) {
      console.error("[GET /api/mentor-assignments/mentor-email/:email] Error fetching entrepreneurs:", entError);
      return res.json({ entrepreneurs: [] });
    }

    // Combine data - ideas table has data in different structure
    const portfolioData = assignments.map(assignment => {
      const entrepreneur = entrepreneurs?.find(e => e.id === assignment.entrepreneur_id);
      const entData = entrepreneur?.data || {};
      
      // Parse mentor_notes from JSON if needed
      let parsedNotes = [];
      if (assignment.mentor_notes) {
        try {
          parsedNotes = typeof assignment.mentor_notes === 'string'
            ? JSON.parse(assignment.mentor_notes)
            : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
        } catch (e) {
          parsedNotes = [assignment.mentor_notes];
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
          linkedin: entData.linkedin || entData.linkedinWebsite || "",
          business_idea: entData.ideaDescription || entData.ideaName || "",
          idea_name: entData.ideaName || "",
          country: entData.country || "",
          state: entData.state || "",
          photo_url: "",
          ideaReview: entData.ideaReview || entData,
          businessPlan: entrepreneur.business_plan || {}
        } : null
      };
    });

    console.log("[GET /api/mentor-assignments/mentor-email/:email] Returning portfolio data:", portfolioData.length);
    return res.json({ entrepreneurs: portfolioData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle note completion status
app.patch("/api/mentor-assignments/:id/toggle-note/:noteIndex", async (req, res) => {
  try {
    const { id, noteIndex } = req.params;
    const { completed } = req.body;
    const noteIdxNum = parseInt(noteIndex);

    const { data: assignment, error: fetchError } = await supabase
      .from("mentor_assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    let notes = [];
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
      notes[noteIdxNum] = {
        text: typeof note === 'string' ? note : note.text,
        timestamp: typeof note === 'string' ? new Date().toISOString() : (note.timestamp || new Date().toISOString()),
        completed: completed || false
      };
    }

    const { error: updateError } = await supabase
      .from("mentor_assignments")
      .update({ mentor_notes: JSON.stringify(notes) })
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update mentor assignment (e.g., meeting link, notes)
app.patch("/api/mentor-assignments/:id", async (req, res) => {
  console.log("[PATCH /api/mentor-assignments/:id] Request received for ID:", req.params.id);
  console.log("[PATCH /api/mentor-assignments/:id] Body:", JSON.stringify(req.body));
  
  try {
    const { id } = req.params;
    const { meetingLink, status, mentorNotes } = req.body;

    const updates = {};
    if (meetingLink !== undefined) updates.meeting_link = meetingLink;
    if (status !== undefined) updates.status = status;

    // If mentorNotes is provided, append it to existing notes (keep history)
    if (mentorNotes !== undefined) {
      console.log("[PATCH /api/mentor-assignments/:id] Processing mentorNotes:", mentorNotes);
      
      // Get current assignment to check existing notes
      const { data: currentAssignment, error: fetchError } = await supabase
        .from("mentor_assignments")
        .select("mentor_notes")
        .eq("id", id)
        .single();

      console.log("[PATCH /api/mentor-assignments/:id] Current assignment:", currentAssignment, "Error:", fetchError?.message);

      let existingNotes = [];
      if (currentAssignment?.mentor_notes) {
        try {
          existingNotes = typeof currentAssignment.mentor_notes === 'string'
            ? JSON.parse(currentAssignment.mentor_notes)
            : (Array.isArray(currentAssignment.mentor_notes) ? currentAssignment.mentor_notes : []);
        } catch (e) {
          existingNotes = [currentAssignment.mentor_notes];
        }
      }

      // Append new note with timestamp
      const newNote = {
        text: mentorNotes,
        timestamp: new Date().toISOString()
      };
      
      const updatedNotes = [...existingNotes, newNote];
      updates.mentor_notes = JSON.stringify(updatedNotes);
      console.log("[PATCH /api/mentor-assignments/:id] Updated notes:", updates.mentor_notes);
    }

    console.log("[PATCH /api/mentor-assignments/:id] Sending update:", updates);

    const { data, error } = await supabase
      .from("mentor_assignments")
      .update(updates)
      .eq("id", id)
      .select();

    console.log("[PATCH /api/mentor-assignments/:id] Update result:", { data, error: error?.message });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, assignment: data?.[0] });
  } catch (error) {
    console.error("[PATCH /api/mentor-assignments/:id] Exception:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== MESSAGES API ENDPOINTS =====

// Send a new message
app.post("/api/messages", async (req, res) => {
  try {
    const { fromName, fromEmail, toName, toEmail, message } = req.body;

    if (!fromEmail || !toEmail || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        from_name: fromName || "Unknown",
        from_email: fromEmail,
        to_name: toName || "Unknown",
        to_email: toEmail,
        message: message,
        is_read: false
      })
      .select();

    if (error) {
      console.error("[POST /api/messages] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[POST /api/messages] Message sent from ${fromEmail} to ${toEmail}`);
    
    // Skip email notifications only for system-generated messages
    const isSystemMessage = fromEmail === "system@touchconnectpro.com";
    
    if (!isSystemMessage && toEmail) {
      // Send email notification to recipient (works for all: mentor→entrepreneur, admin→anyone, anyone→admin)
      sendMessageNotificationEmail(toEmail, toName, fromName, fromEmail, message).catch(err => console.error("[EMAIL] Message notify failed:", err));
      
      // Also notify admin of messages between other users (not if admin is sender or recipient)
      const adminEmails = [ADMIN_EMAIL, "admin@touchconnectpro.com"];
      const isAdminInvolved = adminEmails.includes(fromEmail) || adminEmails.includes(toEmail);
      if (!isAdminInvolved) {
        sendAdminMessageNotificationEmail(fromName, fromEmail, toName, toEmail, message).catch(err => console.error("[EMAIL] Admin message notify failed:", err));
      }
    }
    
    return res.json({ success: true, message: data?.[0] });
  } catch (error) {
    console.error("[POST /api/messages] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get messages for a user (by email)
app.get("/api/messages/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`from_email.eq.${email},to_email.eq.${email}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/messages/:email] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ messages: data || [] });
  } catch (error) {
    console.error("[GET /api/messages/:email] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all messages (for admin)
app.get("/api/messages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/messages] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ messages: data || [] });
  } catch (error) {
    console.error("[GET /api/messages] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Mark message as read
app.patch("/api/messages/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[PATCH /api/messages/:id/read] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, message: data?.[0] });
  } catch (error) {
    console.error("[PATCH /api/messages/:id/read] Error:", error);
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

    // Store in Supabase
    try {
      await supabase
        .from("early_access_signups")
        .insert({ email, created_at: new Date().toISOString() });
      console.log("[EARLY ACCESS] Saved to database");
    } catch (dbError) {
      console.log("[EARLY ACCESS] Database save skipped:", dbError.message);
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
                  <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
                    Received: ${new Date().toLocaleString()}
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
      } catch (emailError) {
        console.error("[EARLY ACCESS] Email send failed:", emailError.message);
      }
    } else {
      console.log("[EARLY ACCESS] Resend not configured, skipping emails");
    }

    return res.json({ success: true, message: "Early access signup received" });
  } catch (error) {
    console.error("[EARLY ACCESS] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ===== ZOOM MEETING INTEGRATION =====

// Helper function to get Zoom access token
async function getZoomAccessToken() {
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
    const { topic, duration, startTime, mentorId, portfolioNumber } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Meeting topic is required" });
    }

    console.log("[ZOOM] Creating meeting:", { topic, duration, startTime });

    const accessToken = await getZoomAccessToken();

    const meetingPayload = {
      topic: topic || "Mentor Meeting",
      type: startTime ? 2 : 1, // 2 = scheduled, 1 = instant
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

    // Store meeting in database
    const { data: savedMeeting, error: dbError } = await supabase
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
      })
      .select();

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
  } catch (error) {
    console.error("[ZOOM] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Send meeting invitations to entrepreneurs
app.post("/api/zoom/send-invitations", async (req, res) => {
  try {
    const { meetingId, entrepreneurIds, mentorName, mentorEmail } = req.body;

    if (!meetingId || !entrepreneurIds || entrepreneurIds.length === 0) {
      return res.status(400).json({ error: "Meeting ID and entrepreneur IDs required" });
    }

    console.log("[ZOOM INVITE] Sending invitations for meeting:", meetingId, "to:", entrepreneurIds);

    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .single();

    if (meetingError || !meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Get entrepreneur details
    const { data: entrepreneurs, error: entError } = await supabase
      .from("ideas")
      .select("id, entrepreneur_email, entrepreneur_name")
      .in("id", entrepreneurIds);

    if (entError) {
      return res.status(400).json({ error: entError.message });
    }

    const resendData = await getResendClient();
    let emailsSent = 0;

    for (const entrepreneur of entrepreneurs) {
      // Send email invitation
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
                      ${meeting.start_time ? `<p><strong>Date & Time:</strong> ${new Date(meeting.start_time).toLocaleString()}</p>` : ''}
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
        } catch (emailErr) {
          console.error("[ZOOM INVITE] Email error for", entrepreneur.entrepreneur_email, emailErr.message);
        }
      }

      // Also send in-app message
      await supabase.from("messages").insert({
        from_name: mentorName || "Your Mentor",
        from_email: mentorEmail || "system@touchconnectpro.com",
        to_name: entrepreneur.entrepreneur_name,
        to_email: entrepreneur.entrepreneur_email,
        message: `You have been invited to a Zoom meeting: "${meeting.topic}". Join here: ${meeting.join_url}${meeting.password ? ` (Password: ${meeting.password})` : ''}`,
        is_read: false
      });
    }

    // Update meeting with participants
    await supabase
      .from("meetings")
      .update({ participants: entrepreneurIds })
      .eq("id", meetingId);

    console.log("[ZOOM INVITE] Sent", emailsSent, "emails and", entrepreneurs.length, "in-app messages");

    return res.json({ 
      success: true, 
      emailsSent,
      messagesCreated: entrepreneurs.length
    });
  } catch (error) {
    console.error("[ZOOM INVITE] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Get meetings for a mentor
app.get("/api/zoom/meetings/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;

    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("mentor_id", mentorId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ meetings: meetings || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get meetings for an entrepreneur
app.get("/api/entrepreneur/meetings/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);

    // First get the entrepreneur's idea ID
    const { data: ideas, error: ideasError } = await supabase
      .from("ideas")
      .select("id")
      .eq("entrepreneur_email", decodedEmail)
      .limit(1);

    if (ideasError || !ideas || ideas.length === 0) {
      console.log("[ENTREPRENEUR MEETINGS] No idea found for email:", decodedEmail);
      return res.json({ meetings: [] });
    }

    const entrepreneurId = ideas[0].id;
    console.log("[ENTREPRENEUR MEETINGS] Finding meetings for entrepreneur", decodedEmail, "with idea ID:", entrepreneurId);

    // Get all meetings and filter client-side (Supabase array containment is tricky)
    const { data: allMeetings, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ENTREPRENEUR MEETINGS] Query error:", error);
      return res.json({ meetings: [] });
    }

    console.log("[ENTREPRENEUR MEETINGS] ALL meetings in database:", allMeetings?.length || 0);
    if (allMeetings && allMeetings.length > 0) {
      console.log("[ENTREPRENEUR MEETINGS] Meeting participants overview:", allMeetings.map(m => ({
        id: m.id,
        topic: m.topic?.substring(0, 30),
        participants: m.participants,
        participantsType: typeof m.participants
      })));
    }

    // Filter meetings where entrepreneurId is in participants array
    const meetings = (allMeetings || []).filter(meeting => {
      const isIncluded = meeting.participants && Array.isArray(meeting.participants) && meeting.participants.includes(entrepreneurId);
      console.log("[ENTREPRENEUR MEETINGS] Checking meeting", meeting.id, "participants:", meeting.participants, "looking for:", entrepreneurId, "found:", isIncluded);
      return isIncluded;
    });

    console.log("[ENTREPRENEUR MEETINGS] Found", meetings.length, "meetings for", decodedEmail, "with idea ID:", entrepreneurId);

    return res.json({ meetings: meetings || [] });
  } catch (error) {
    console.error("[ENTREPRENEUR MEETINGS] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Get all meetings (for admin)
app.get("/api/admin/meetings", async (req, res) => {
  try {
    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ADMIN MEETINGS] Query error:", error);
      return res.json({ meetings: [] });
    }

    return res.json({ meetings: meetings || [] });
  } catch (error) {
    console.error("[ADMIN MEETINGS] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  return res.json({ 
    message: "TouchConnectPro Backend API",
    endpoints: ["/api/submit", "/api/ideas", "/api/mentors", "/api/coaches", "/api/investors", "/api/test", "/api/password-token/:token", "/api/set-password", "/api/coaches/approved", "/api/entrepreneur/:email", "/api/mentor-notes", "/api/messages", "/api/mentor-assignments", "/api/early-access", "/api/zoom/create-meeting", "/api/zoom/send-invitations", "/api/stripe/create-checkout-session", "/api/stripe/confirm-payment"]
  });
});

// ============ STRIPE PAYMENT ROUTES ============

// Initialize Stripe
function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.log("[STRIPE] No STRIPE_SECRET_KEY found");
    return null;
  }
  return new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });
}

// Create Stripe Checkout Session
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  console.log("[STRIPE] create-checkout-session called");
  
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const { email, entrepreneurId, successUrl, cancelUrl } = req.body;
  
  if (!email || !entrepreneurId) {
    return res.status(400).json({ error: "Missing email or entrepreneurId" });
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || "https://touchconnectpro.com";
    const finalSuccessUrl = successUrl || `${baseUrl}/entrepreneur-dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/entrepreneur-dashboard?payment=cancelled`;

    console.log("[STRIPE] Creating session for:", email, "entrepreneur:", entrepreneurId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TouchConnectPro Membership",
              description: "Monthly membership with mentor access, AI business planning tools, and investor connections"
            },
            unit_amount: 4900,
            recurring: { interval: "month" }
          },
          quantity: 1
        }
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        entrepreneurId,
        email,
        source: "touchconnectpro"
      }
    });

    console.log("[STRIPE] Session created:", session.id);
    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[STRIPE] Error creating session:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Confirm payment and update entrepreneur status
app.post("/api/stripe/confirm-payment", async (req, res) => {
  console.log("[STRIPE] confirm-payment called");
  
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("[STRIPE] Session retrieved:", session.id, "status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed", status: session.payment_status });
    }

    const entrepreneurId = session.metadata?.entrepreneurId;
    const email = session.metadata?.email || session.customer_email;

    if (entrepreneurId) {
      // Update entrepreneur status to approved
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ status: "approved" })
        .eq("id", entrepreneurId);

      if (updateError) {
        console.error("[STRIPE] Error updating entrepreneur status:", updateError);
      } else {
        console.log("[STRIPE] Entrepreneur", entrepreneurId, "status updated to approved");
      }

      // Send welcome email
      try {
        const { data: entrepreneur } = await supabase
          .from("ideas")
          .select("entrepreneur_name, entrepreneur_email")
          .eq("id", entrepreneurId)
          .single();

        if (entrepreneur) {
          const resendData = await getResendClient();
          if (resendData) {
            const { client, fromEmail } = resendData;
            await client.emails.send({
              from: fromEmail,
              to: entrepreneur.entrepreneur_email,
              subject: "Welcome to TouchConnectPro - Payment Confirmed!",
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Welcome, ${entrepreneur.entrepreneur_name}!</h1>
                    </div>
                    <div class="content">
                      <p>Your payment has been confirmed and your TouchConnectPro membership is now active!</p>
                      <p>You now have full access to:</p>
                      <ul>
                        <li>Your personal dashboard</li>
                        <li>AI-powered business planning tools</li>
                        <li>Mentor connections (coming soon)</li>
                        <li>Investor network access</li>
                      </ul>
                      <p>A mentor will be assigned to you shortly. You'll receive a notification when this happens.</p>
                      <p>Best regards,<br>The TouchConnectPro Team</p>
                    </div>
                    <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
              `
            });
            console.log("[STRIPE] Welcome email sent to:", entrepreneur.entrepreneur_email);
          }
        }
      } catch (emailError) {
        console.error("[STRIPE] Error sending welcome email:", emailError.message);
      }

      // Send internal message to user
      try {
        await supabase.from("messages").insert({
          sender_type: "system",
          recipient_email: email,
          recipient_type: "entrepreneur",
          subject: "Payment Confirmed - Welcome to TouchConnectPro!",
          content: "Your payment has been received and your membership is now active. A mentor will be assigned to you soon. You now have full access to all dashboard features.",
          is_read: false
        });
        console.log("[STRIPE] Internal message sent to entrepreneur");
      } catch (msgError) {
        console.error("[STRIPE] Error sending internal message:", msgError.message);
      }

      // Notify admin
      try {
        await supabase.from("messages").insert({
          sender_type: "system",
          recipient_email: "admin@touchconnectpro.com",
          recipient_type: "admin",
          subject: `New Paid Member: ${email}`,
          content: `Entrepreneur ${email} (ID: ${entrepreneurId}) has completed payment and is now a full member. Please assign a mentor.`,
          is_read: false
        });
        console.log("[STRIPE] Admin notification sent");
      } catch (adminError) {
        console.error("[STRIPE] Error notifying admin:", adminError.message);
      }
    }

    return res.json({ 
      success: true, 
      status: session.payment_status,
      entrepreneurId,
      email
    });
  } catch (error) {
    console.error("[STRIPE] Error confirming payment:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Stripe webhook for automated payment events
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("[STRIPE WEBHOOK] Received");
  
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.log("[STRIPE WEBHOOK] No webhook secret configured, skipping signature verification");
    return res.status(200).json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("[STRIPE WEBHOOK] Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const entrepreneurId = session.metadata?.entrepreneurId;
      
      if (entrepreneurId && session.payment_status === "paid") {
        console.log("[STRIPE WEBHOOK] Updating entrepreneur", entrepreneurId, "to approved");
        await supabase
          .from("ideas")
          .update({ status: "approved" })
          .eq("id", entrepreneurId);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[STRIPE WEBHOOK] Error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

// ============ END STRIPE ROUTES ============

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING");
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Set" : "MISSING");
  console.log("Stripe routes: /api/stripe/create-checkout-session, /api/stripe/confirm-payment, /api/stripe/webhook");
});
