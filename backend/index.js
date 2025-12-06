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

const FRONTEND_URL = process.env.FRONTEND_URL || "https://touchconnectpro.com";

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

app.post("/api/ideas", async (req, res) => {
  console.log("[POST /api/ideas] Called");
  console.log("[Payload] fullName:", req.body?.fullName, "email:", req.body?.email);
  
  try {
    const { fullName, email, ideaName, businessPlan, formData, linkedinWebsite } = req.body;
    
    if (!fullName || !email) {
      console.log("[VALIDATION] Missing: fullName =", fullName, ", email =", email);
      return res.status(400).json({ error: "Name and email required" });
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

    if (!["approved", "rejected"].includes(status)) {
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

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("mentor_applications")
      .select("id, status")
      .ilike("email", email)
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
            status: "submitted",
            resubmitted_at: new Date().toISOString()
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

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("coach_applications")
      .select("id, status")
      .ilike("email", email)
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
            status: "submitted",
            resubmitted_at: new Date().toISOString()
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

    // Check if there's an existing application with this email
    const { data: existingApp } = await supabase
      .from("investor_applications")
      .select("id, status")
      .ilike("email", email)
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
            status: "submitted",
            resubmitted_at: new Date().toISOString()
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

app.get("/", (req, res) => {
  return res.json({ 
    message: "TouchConnectPro Backend API",
    endpoints: ["/api/submit", "/api/ideas", "/api/mentors", "/api/coaches", "/api/investors", "/api/test", "/api/password-token/:token", "/api/set-password"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING");
});
