import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

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

      // Get mentor notes
      const { data: notesData } = await supabase
        .from("mentor_notes")
        .select("*")
        .eq("entrepreneur_id", ideaData.id)
        .order("created_at", { ascending: true });
      mentorNotes = notesData || [];
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

    // Fetch mentor profile
    const { data: mentor, error: mentorError } = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("id", assignment.mentor_id)
      .single();

    if (mentorError) {
      return res.json({ 
        assignment,
        mentor: null 
      });
    }

    return res.json({ 
      assignment,
      mentor: {
        id: mentor.id,
        full_name: mentor.full_name || mentor.fullName,
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
      return {
        assignment_id: assignment.id,
        portfolio_number: assignment.portfolio_number,
        meeting_link: assignment.meeting_link,
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

// Update mentor assignment (e.g., meeting link)
app.patch("/api/mentor-assignments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { meetingLink, status } = req.body;

    const updates = {};
    if (meetingLink !== undefined) updates.meeting_link = meetingLink;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase
      .from("mentor_assignments")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, assignment: data?.[0] });
  } catch (error) {
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

    // Send notification email to admin
    const resendData = await getResendClient();
    
    if (resendData) {
      const { client: resend, fromEmail } = resendData;
      
      try {
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
        console.log("[EARLY ACCESS] Notification email sent to hello@touchconnectpro.com");
      } catch (emailError) {
        console.error("[EARLY ACCESS] Email send failed:", emailError.message);
      }
    } else {
      console.log("[EARLY ACCESS] Resend not configured, skipping notification email");
    }

    return res.json({ success: true, message: "Early access signup received" });
  } catch (error) {
    console.error("[EARLY ACCESS] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  return res.json({ 
    message: "TouchConnectPro Backend API",
    endpoints: ["/api/submit", "/api/ideas", "/api/mentors", "/api/coaches", "/api/investors", "/api/test", "/api/password-token/:token", "/api/set-password", "/api/coaches/approved", "/api/entrepreneur/:email", "/api/mentor-notes", "/api/messages", "/api/mentor-assignments", "/api/early-access"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING");
});
