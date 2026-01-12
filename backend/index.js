import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";
import Stripe from "stripe";
import OpenAI from "openai";
import bcrypt from "bcryptjs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"]
}));
// JSON parsing - SKIP for Stripe webhook (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});

// Config endpoint for frontend to get Supabase credentials
app.get("/api/config", (req, res) => {
  console.log("[GET /api/config] Serving Supabase config");
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// ============================================
// SEO ENDPOINTS
// ============================================

// Dynamic sitemap.xml
app.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://www.touchconnectpro.com";
    const today = new Date().toISOString().split('T')[0];
    
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
    ];

    let urls = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('');

    // Dynamic mentor/coach pages from database
    if (supabase) {
      const { data: mentors } = await supabase
        .from("mentor_applications")
        .select("id, full_name")
        .eq("status", "approved");
      
      if (mentors) {
        mentors.forEach((mentor) => {
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

      const { data: coaches } = await supabase
        .from("coach_applications")
        .select("id, full_name")
        .eq("status", "approved");
      
      if (coaches) {
        coaches.forEach((coach) => {
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
  } catch (error) {
    console.error("[SITEMAP] Error:", error.message);
    return res.status(500).send("Error generating sitemap");
  }
});

// JSON-LD structured data for mentor profile
app.get("/api/seo/mentor-schema/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: mentor, error } = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("id", mentorId)
      .single();

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
  } catch (error) {
    console.error("[SEO MENTOR SCHEMA] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// JSON-LD structured data for coach profile
app.get("/api/seo/coach-schema/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: coach, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("id", coachId)
      .single();

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
  } catch (error) {
    console.error("[SEO COACH SCHEMA] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Organization schema for homepage
app.get("/api/seo/organization-schema", (req, res) => {
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

// ============ END SEO ENDPOINTS ============

// OpenAI client for AI features (lazy initialization)
let openaiClient = null;
function getOpenAI() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// AI: Rephrase entrepreneur answers
app.post("/api/ai/rephrase", async (req, res) => {
  console.log("[AI REPHRASE] Processing request...");
  try {
    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ error: "AI service not configured. Please add OPENAI_API_KEY." });
    }
    
    const { answers } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid answers format" });
    }

    const answerEntries = Object.entries(answers).filter(([_, value]) => value && String(value).trim());
    const batchPrompt = answerEntries.map(([key, value], index) => 
      `Question ${index + 1} (${key}):\nOriginal: "${value}"`
    ).join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert business writing assistant. Improve each answer by correcting spelling/grammar, rephrasing for clarity and professional tone, while keeping the original meaning. Keep similar length." },
        { role: "user", content: `Improve these startup pitch answers. Return JSON where each key matches the original key with the enhanced answer.\n\n${batchPrompt}\n\nReturn ONLY valid JSON: {"key1": "enhanced answer 1", ...}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const enhanced = JSON.parse(content);
    const result = { answers: {} };
    for (const [key, original] of answerEntries) {
      result.answers[key] = { original: original, aiEnhanced: enhanced[key] || original };
    }
    console.log("[AI REPHRASE] Success - processed", Object.keys(result.answers).length, "answers");
    return res.json(result);
  } catch (error) {
    console.error("[AI REPHRASE ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to process answers with AI" });
  }
});

// AI: Generate business plan from answers
app.post("/api/ai/generate-plan", async (req, res) => {
  console.log("[AI GENERATE PLAN] Processing request...");
  try {
    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ error: "AI service not configured. Please add OPENAI_API_KEY." });
    }
    
    const { answers } = req.body;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid answers format" });
    }

    const answersText = Object.entries(answers)
      .filter(([_, value]) => value && String(value).trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert business strategist. Generate a comprehensive, investor-ready business plan based on entrepreneur's answers. Each section should be 2-4 paragraphs with specific details." },
        { role: "user", content: `Generate business plan from these answers:\n\n${answersText}\n\nReturn JSON with these keys:\n{"executiveSummary":"...","problemStatement":"...","solution":"...","targetMarket":"...","marketSize":"...","revenueModel":"...","competitiveAdvantage":"...","roadmap12Month":"...","fundingRequirements":"...","risksAndMitigation":"...","successMetrics":"..."}\n\nEach field: 2-4 paragraphs. Return ONLY valid JSON.` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    console.log("[AI GENERATE PLAN] Success - generated business plan");
    return res.json(JSON.parse(content));
  } catch (error) {
    console.error("[AI GENERATE PLAN ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to generate business plan with AI" });
  }
});

// AI: Generate meeting questions from business plan
app.post("/api/ai/generate-questions", async (req, res) => {
  console.log("[AI GENERATE QUESTIONS] Processing request...");
  try {
    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ error: "AI service not configured. Please add OPENAI_API_KEY." });
    }
    
    const { entrepreneurId } = req.body;
    if (!entrepreneurId) {
      return res.status(400).json({ error: "entrepreneurId is required" });
    }

    // Fetch entrepreneur data
    const { data: entrepreneur, error: fetchError } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", entrepreneurId)
      .single();

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

    const businessPlanText = Object.entries(businessPlan)
      .map(([key, value]) => `**${key}**:\n${value}`)
      .join("\n\n");

    const bioContext = fullBio ? `\nEntrepreneur Bio: ${fullBio}` : "";
    const ideaContext = ideaName ? `\nIdea Name: ${ideaName}` : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are an experienced mentor and investor advisor helping prepare for a meeting with an entrepreneur.

Review the business plan draft provided and generate insightful questions that a mentor should ask the entrepreneur during their meeting. 

DO NOT rephrase or improve the business plan - instead, identify gaps, unclear areas, assumptions that need validation, and areas where more detail is needed.

For EACH of the 11 business plan sections, provide 2-4 specific, probing questions that will:
1. Clarify vague or missing information
2. Challenge assumptions
3. Dig deeper into the entrepreneur's thinking
4. Help the mentor understand the entrepreneur's preparedness

Make questions specific to the content provided, not generic. Reference specific claims or numbers from the plan.` },
        { role: "user", content: `Review this business plan and generate meeting questions for the mentor to ask:
${ideaContext}${bioContext}

BUSINESS PLAN:
${businessPlanText}

Return as JSON with these exact keys, each containing an array of 2-4 question strings:
{
  "executiveSummary": ["question 1", "question 2", ...],
  "problemStatement": ["question 1", "question 2", ...],
  "solution": ["question 1", "question 2", ...],
  "targetMarket": ["question 1", "question 2", ...],
  "marketSize": ["question 1", "question 2", ...],
  "revenueModel": ["question 1", "question 2", ...],
  "competitiveAdvantage": ["question 1", "question 2", ...],
  "roadmap12Month": ["question 1", "question 2", ...],
  "fundingRequirements": ["question 1", "question 2", ...],
  "risksAndMitigation": ["question 1", "question 2", ...],
  "successMetrics": ["question 1", "question 2", ...]
}

Return ONLY valid JSON.` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const questions = JSON.parse(content);
    console.log("[AI GENERATE QUESTIONS] Generated questions for:", entrepreneurId);

    // Save questions to the database
    const updatedData = {
      ...entrepreneur.data,
      meetingQuestions: questions,
      meetingQuestionsGeneratedAt: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from("ideas")
      .update({ data: updatedData })
      .eq("id", entrepreneurId);

    if (updateError) {
      console.error("[AI GENERATE QUESTIONS] Failed to save:", updateError);
      return res.status(500).json({ error: "Failed to save generated questions" });
    }

    console.log("[AI GENERATE QUESTIONS] Saved questions for:", entrepreneurId);
    return res.json({ success: true, questions });
  } catch (error) {
    console.error("[AI GENERATE QUESTIONS ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to generate questions with AI" });
  }
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

async function sendStatusEmail(email, fullName, userType, status, applicationId, wasPreApproved = false) {
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
              <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
              <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";

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
            <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>From:</strong> ${senderName}</p>
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

// Send email notification when coach receives a new review
async function sendCoachReviewNotificationEmail(coachEmail, coachName, rating, reviewText) {
  console.log("[EMAIL] Sending review notification to coach:", coachEmail);
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping review notification");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  
  const starsDisplay = "★".repeat(rating) + "☆".repeat(5 - rating);
  const reviewPreview = reviewText ? (reviewText.length > 200 ? reviewText.substring(0, 200) + "..." : reviewText) : null;
  
  const subject = `New ${rating}-Star Review on TouchConnectPro`;
  const htmlContent = `
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
          <p>Hi ${coachName || "Coach"},</p>
          
          <p>Great news! An entrepreneur has left you a review on TouchConnectPro.</p>
          
          <div class="stars">${starsDisplay}</div>
          <p style="text-align: center; font-size: 18px; font-weight: 600;">${rating} out of 5 stars</p>
          
          ${reviewPreview ? `
          <div class="review-box">
            <p style="margin: 0;">"${reviewPreview}"</p>
          </div>
          ` : '<p style="text-align: center; color: #64748b;">No written review was provided.</p>'}
          
          <p>This review is now visible on your public profile page. Keep up the great work!</p>
          
          <p style="text-align: center;">
            <a href="${FRONTEND_URL}/login" class="button">View Your Dashboard</a>
          </p>
          
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
      to: coachEmail,
      subject,
      html: htmlContent
    });
    console.log("[EMAIL] Review notification sent to coach:", coachEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending review notification:", error.message);
    return { success: false, error: error.message };
  }
}

// Send email notification when mentor is assigned to entrepreneur
async function sendMentorAssignmentEmail(recipientEmail, recipientName, recipientRole, otherPartyName, portfolioNumber) {
  console.log("[EMAIL] Sending mentor assignment email to:", recipientEmail, "role:", recipientRole);
  
  const resendData = await getResendClient();
  if (!resendData) {
    console.log("[EMAIL] Resend not configured, skipping mentor assignment email");
    return { success: false, reason: "Email not configured" };
  }

  const { client, fromEmail } = resendData;
  
  let subject, htmlContent;
  
  if (recipientRole === "entrepreneur") {
    subject = `You've Been Assigned a Mentor - TouchConnectPro`;
    htmlContent = `
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
            <h1>Great News, ${recipientName}!</h1>
          </div>
          <div class="content">
            <p>You have been assigned to a mentor on TouchConnectPro!</p>
            
            <div class="highlight-box">
              <p style="margin: 0;"><strong>Your Mentor:</strong> ${otherPartyName}</p>
              <p style="margin: 10px 0 0 0;"><strong>Portfolio:</strong> ${portfolioNumber}</p>
            </div>
            
            <p>Your mentor will guide you through refining your business idea and preparing for investor meetings. Log in to your dashboard to view their profile and start connecting.</p>
            
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/login" class="button">Go to Dashboard</a>
            </p>
            
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
    // mentor
    subject = `New Entrepreneur Added to Your Portfolio - TouchConnectPro`;
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight-box { background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Entrepreneur Assigned</h1>
          </div>
          <div class="content">
            <p>Hello ${recipientName},</p>
            
            <p>A new entrepreneur has been added to your portfolio on TouchConnectPro!</p>
            
            <div class="highlight-box">
              <p style="margin: 0;"><strong>Entrepreneur:</strong> ${otherPartyName}</p>
              <p style="margin: 10px 0 0 0;"><strong>Portfolio:</strong> ${portfolioNumber}</p>
            </div>
            
            <p>Log in to your dashboard to view their profile, business idea, and business plan. You can start guiding them through the mentorship process.</p>
            
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/login" class="button">View Portfolio</a>
            </p>
            
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
    const result = await client.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: htmlContent
    });
    console.log("[EMAIL] Mentor assignment email sent to:", recipientEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("[EMAIL] Error sending mentor assignment email:", error.message);
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

    if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get existing data including previous status to know if upgrading from pre-approved
    const { data: existingData, error: fetchError } = await supabase
      .from("ideas")
      .select("entrepreneur_email, entrepreneur_name, status")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    const previousStatus = existingData.status;

    const { data, error } = await supabase
      .from("ideas")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Pass wasPreApproved flag so email knows not to ask for password setup again
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

// Update entrepreneur profile by email
app.put("/api/entrepreneurs/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    const { fullName, country, bio, linkedIn, website, profileImage } = req.body;

    console.log("[PUT /api/entrepreneurs/profile/:email] Updating profile for:", decodedEmail);

    // First fetch the current data to merge with updates
    const { data: currentData, error: fetchError } = await supabase
      .from("ideas")
      .select("data")
      .eq("entrepreneur_email", decodedEmail)
      .single();

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

    // Update the ideas table with merged data (profileImage stored in data JSONB, not as column)
    const { data, error } = await supabase
      .from("ideas")
      .update({
        entrepreneur_name: fullName,
        linkedin_profile: linkedIn || "",
        data: updatedData
      })
      .eq("entrepreneur_email", decodedEmail)
      .select();

    if (error) {
      console.error("[PUT /api/entrepreneurs/profile/:email] Update error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, entrepreneur: data?.[0] });
  } catch (error) {
    console.error("[PUT /api/entrepreneurs/profile/:email] Exception:", error);
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
    const { fullName, bio, expertise, experience, linkedin, profileImage } = req.body;

    console.log("[PUT /api/mentors/profile/:id] Updating profile:", id);

    // Build update object - store profileImage in data JSONB field
    const updateData = {
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
      const { data: existingData } = await supabase
        .from("mentor_applications")
        .select("data")
        .eq("id", id)
        .single();
      
      updateData.data = {
        ...(existingData?.data || {}),
        profileImage: profileImage
      };
    }

    const { data, error } = await supabase
      .from("mentor_applications")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[PUT /api/mentors/profile/:id] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, mentor: data?.[0] });
  } catch (error) {
    console.error("[PUT /api/mentors/profile/:id] Exception:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
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
    const { fullName, email, linkedin, bio, expertise, focusAreas, introCallRate, sessionRate, monthlyRate, hourlyRate, country, state, specializations, externalReputation } = req.body;

    const ratesProvided = introCallRate && sessionRate && monthlyRate;
    const legacyRateProvided = hourlyRate;
    
    if (!email || !fullName || !expertise || !focusAreas || (!ratesProvided && !legacyRateProvided) || !country || !bio) {
      return res.status(400).json({ error: "Missing required fields (including bio and all rate types)" });
    }
    
    const rateValue = ratesProvided 
      ? JSON.stringify({ introCallRate, sessionRate, monthlyRate })
      : hourlyRate;

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
            bio: bio || null,
            expertise,
            focus_areas: focusAreas,
            hourly_rate: rateValue,
            country,
            state: state || null,
            specializations: specializations || [],
            external_reputation: externalReputation || null,
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
        bio: bio || null,
        expertise,
        focus_areas: focusAreas,
        hourly_rate: rateValue,
        country,
        state: state || null,
        specializations: specializations || [],
        external_reputation: externalReputation || null,
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
    const rateDisplay = ratesProvided ? `Intro: $${introCallRate}, Session: $${sessionRate}, Monthly: $${monthlyRate}` : `Rate: $${hourlyRate}/hr`;
    sendAdminNewApplicationEmail(email, fullName, "coach", data?.[0]?.id, `Expertise: ${expertise}, ${rateDisplay}`).catch(err => console.error("[EMAIL] Admin notify failed:", err));
    
    return res.json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

// =====================
// Coach Ratings API
// =====================

// Submit a rating for a coach
app.post("/api/coach-ratings", async (req, res) => {
  console.log("[POST /api/coach-ratings] Called");
  try {
    const { coachId, raterEmail, rating, review } = req.body;

    if (!coachId || !raterEmail || !rating) {
      return res.status(400).json({ error: "Missing required fields: coachId, raterEmail, rating" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if this rater already rated this coach
    const { data: existingRating } = await supabase
      .from("coach_ratings")
      .select("id")
      .eq("coach_id", coachId)
      .eq("rater_email", raterEmail)
      .single();

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from("coach_ratings")
        .update({ rating, review: review || null, updated_at: new Date().toISOString() })
        .eq("id", existingRating.id)
        .select();

      if (error) {
        console.error("[DB ERROR]:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("[SUCCESS] Coach rating updated");
      // Return rating without email for privacy
      const { rater_email: _, ...safeRating } = data?.[0] || {};
      return res.json({ success: true, rating: safeRating, updated: true });
    }

    // Insert new rating
    const { data, error } = await supabase
      .from("coach_ratings")
      .insert({
        coach_id: coachId,
        rater_email: raterEmail,
        rating,
        review: review || null
      })
      .select();

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[SUCCESS] Coach rating saved");
    
    // Send email notification to the coach
    try {
      const { data: coachData } = await supabase
        .from("coach_applications")
        .select("email, full_name")
        .eq("id", coachId)
        .single();
      
      if (coachData?.email) {
        sendCoachReviewNotificationEmail(coachData.email, coachData.full_name, rating, review)
          .catch(err => console.error("[EMAIL] Failed to send review notification:", err));
      }
    } catch (emailErr) {
      console.error("[EMAIL] Error fetching coach for notification:", emailErr);
    }
    
    // Return rating without email for privacy
    const { rater_email: _, ...safeRating } = data?.[0] || {};
    return res.json({ success: true, rating: safeRating });
  } catch (error) {
    console.error("[EXCEPTION]:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
});

// Get average rating for a coach (emails hidden for privacy)
app.get("/api/coach-ratings/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;

    const { data, error } = await supabase
      .from("coach_ratings")
      .select("rating, review, created_at")
      .eq("coach_id", coachId);

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    const ratings = data || [];
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    return res.json({
      coachId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratings
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get reviews for a specific coach (emails hidden for privacy - public endpoint)
app.get("/api/coach-ratings/:coachId/reviews", async (req, res) => {
  try {
    const { coachId } = req.params;
    console.log("[GET /api/coach-ratings/:coachId/reviews] Fetching reviews for coach ID:", coachId);

    const { data, error } = await supabase
      .from("coach_ratings")
      .select("id, rating, review, created_at")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/coach-ratings/:coachId/reviews] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[GET /api/coach-ratings/:coachId/reviews] Found", data?.length || 0, "reviews for coach ID:", coachId);
    // Reviews returned without email for privacy
    return res.json({ reviews: data || [] });
  } catch (error) {
    console.error("[GET /api/coach-ratings/:coachId/reviews] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin endpoint: Get reviews for a specific coach WITH emails (for admin dashboard)
app.get("/api/admin/coach-ratings/:coachId/reviews", async (req, res) => {
  try {
    const { coachId } = req.params;
    console.log("[GET /api/admin/coach-ratings/:coachId/reviews] Admin fetching reviews for coach ID:", coachId);

    const { data, error } = await supabase
      .from("coach_ratings")
      .select("id, rating, review, rater_email, created_at")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/coach-ratings/:coachId/reviews] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[GET /api/admin/coach-ratings/:coachId/reviews] Found", data?.length || 0, "reviews for coach ID:", coachId);
    // Admin endpoint includes rater_email
    return res.json({ reviews: data || [] });
  } catch (error) {
    console.error("[GET /api/admin/coach-ratings/:coachId/reviews] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all ratings for all coaches (for displaying on coach cards)
app.get("/api/coach-ratings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coach_ratings")
      .select("coach_id, rating");

    if (error) {
      console.error("[DB ERROR]:", error);
      return res.status(400).json({ error: error.message });
    }

    // Group ratings by coach_id and calculate averages
    const ratingsByCoach = {};
    (data || []).forEach(r => {
      if (!ratingsByCoach[r.coach_id]) {
        ratingsByCoach[r.coach_id] = { total: 0, count: 0 };
      }
      ratingsByCoach[r.coach_id].total += r.rating;
      ratingsByCoach[r.coach_id].count += 1;
    });

    const result = {};
    Object.keys(ratingsByCoach).forEach(coachId => {
      const { total, count } = ratingsByCoach[coachId];
      result[coachId] = {
        averageRating: Math.round((total / count) * 10) / 10,
        totalRatings: count
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Send rating link to entrepreneur
app.post("/api/send-rating-link", async (req, res) => {
  try {
    const { coachId, coachName, entrepreneurEmail } = req.body;
    if (!coachId || !entrepreneurEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create a unique rating link
    const token = crypto.randomBytes(16).toString('hex');
    const ratingLink = `${FRONTEND_URL}/rate-coach?coachId=${coachId}&token=${token}&email=${encodeURIComponent(entrepreneurEmail)}`;
    
    // Send email with rating link
    const resendData = await getResendClient();
    if (resendData) {
      const { client, fromEmail } = resendData;
      await client.emails.send({
        from: fromEmail,
        to: entrepreneurEmail,
        subject: `Rate ${coachName} on TouchConnectPro`,
        html: `<p>You're invited to rate your coach <strong>${coachName}</strong>.</p><p><a href="${ratingLink}" style="background-color: #06b6d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Click here to rate</a></p><p>This link will help us improve our coaching services.</p>`
      });
    }
    
    return res.json({ success: true, message: "Rating link sent successfully" });
  } catch (error) {
    console.error("[POST /api/send-rating-link] Error:", error);
    return res.status(500).json({ error: error.message });
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

    // Strip profile_url from external_reputation for privacy (admin-only field)
    const safeData = (data || []).map(coach => {
      if (coach.external_reputation) {
        const { profile_url, ...safeReputation } = coach.external_reputation;
        return { ...coach, external_reputation: safeReputation };
      }
      return coach;
    });

    return res.json(safeData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin-only: Get all coaches with full data including profile_url
app.get("/api/admin/coaches", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Admin token required" });
    }

    // Verify admin token
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Invalid or expired admin token" });
    }

    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Return full data including profile_url for admin
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
    const { expertise, focusAreas, introCallRate, sessionRate, monthlyRate, hourlyRate, linkedin, bio, profileImage } = req.body;
    
    const ratesProvided = introCallRate && sessionRate && monthlyRate;
    const rateValue = ratesProvided 
      ? JSON.stringify({ introCallRate, sessionRate, monthlyRate })
      : hourlyRate;

    const updateData = {
      expertise,
      focus_areas: focusAreas,
      hourly_rate: rateValue,
      linkedin: linkedin || null
    };
    
    // Add bio and profile_image if provided
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profile_image = profileImage;

    const { data, error } = await supabase
      .from("coach_applications")
      .update(updateData)
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

// Update coach external reputation (resets verification)
app.put("/api/coaches/:id/external-reputation", async (req, res) => {
  try {
    const { id } = req.params;
    const { platform_name, average_rating, review_count, profile_url } = req.body;
    
    if (!platform_name || !average_rating || !review_count || !profile_url) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const externalReputation = {
      platform_name,
      average_rating: parseFloat(average_rating),
      review_count: parseInt(review_count),
      profile_url,
      verified: false,
      verified_by_admin_id: null,
      verified_at: null
    };

    const { data, error } = await supabase
      .from("coach_applications")
      .update({ external_reputation: externalReputation })
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

// Admin: Verify or unverify coach external reputation
app.put("/api/admin/coaches/:id/verify-reputation", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Admin token required" });
    }

    // Verify admin token
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Invalid or expired admin token" });
    }

    const { id } = req.params;
    const { verified, adminEmail, notes } = req.body;
    
    // Get current external reputation
    const { data: coach, error: fetchError } = await supabase
      .from("coach_applications")
      .select("external_reputation")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ error: "Coach not found" });
    }
    
    const currentReputation = coach.external_reputation || {};
    const updatedReputation = {
      ...currentReputation,
      verified: verified === true,
      verified_by_admin_id: verified ? adminEmail : null,
      verified_at: verified ? new Date().toISOString() : null,
      verification_notes: notes || null
    };

    const { data, error } = await supabase
      .from("coach_applications")
      .update({ external_reputation: updatedReputation })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log(`[ADMIN] External reputation ${verified ? 'verified' : 'unverified'} for coach ${id} by ${adminEmail}`);
    return res.json({ success: true, coach: data?.[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get coach clients (entrepreneurs who have purchased coaching services)
app.get("/api/coaches/:coachId/clients", async (req, res) => {
  try {
    const { coachId } = req.params;
    console.log("[GET /api/coaches/:coachId/clients] Fetching clients for coach:", coachId);
    
    // Query coach_purchases table for unique clients
    const { data: purchases, error } = await supabase
      .from("coach_purchases")
      .select("entrepreneur_email, entrepreneur_name, service_name, created_at")
      .eq("coach_id", coachId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });
    
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
  } catch (error) {
    console.error("[GET /api/coaches/:coachId/clients] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get coach transactions/earnings history
app.get("/api/coaches/:coachId/transactions", async (req, res) => {
  try {
    const { coachId } = req.params;
    console.log("[GET /api/coaches/:coachId/transactions] Fetching transactions for coach:", coachId);
    
    // Query coach_purchases table for transactions
    const { data: purchases, error } = await supabase
      .from("coach_purchases")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[GET /api/coaches/:coachId/transactions] Database error:", error);
      return res.json({ transactions: [] });
    }
    
    // Transform to transaction format (amounts are in cents)
    const transactions = (purchases || []).map(p => ({
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
  } catch (error) {
    console.error("[GET /api/coaches/:coachId/transactions] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get entrepreneur's coach purchases history
app.get("/api/entrepreneurs/:email/coach-purchases", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("[GET /api/entrepreneurs/:email/coach-purchases] Fetching purchases for:", email);
    
    const { data: purchases, error } = await supabase
      .from("coach_purchases")
      .select("*")
      .eq("entrepreneur_email", decodeURIComponent(email))
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[GET /api/entrepreneurs/:email/coach-purchases] Database error:", error);
      return res.json({ purchases: [] });
    }
    
    // Transform for frontend
    const formattedPurchases = (purchases || []).map(p => ({
      id: p.id,
      coachName: p.coach_name,
      serviceName: p.service_name,
      serviceType: p.service_type,
      amount: (p.amount || 0) / 100,
      date: p.created_at,
      status: p.status
    }));
    
    return res.json({ purchases: formattedPurchases });
  } catch (error) {
    console.error("[GET /api/entrepreneurs/:email/coach-purchases] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN EARNINGS ENDPOINT =====

// Get all coach purchases for admin earnings dashboard
app.get("/api/admin/earnings", async (req, res) => {
  try {
    console.log("[GET /api/admin/earnings] Fetching all coach purchases");
    
    const { data: purchases, error } = await supabase
      .from("coach_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[GET /api/admin/earnings] Database error:", error);
      return res.json({ purchases: [], totals: { totalRevenue: 0, platformFees: 0, coachEarnings: 0 } });
    }
    
    // Calculate totals (amounts are in cents)
    const totals = (purchases || []).reduce((acc, p) => {
      acc.totalRevenue += (p.amount || 0);
      acc.platformFees += (p.platform_fee || 0);
      acc.coachEarnings += (p.coach_earnings || 0);
      return acc;
    }, { totalRevenue: 0, platformFees: 0, coachEarnings: 0 });
    
    // Transform for frontend (convert cents to dollars)
    const formattedPurchases = (purchases || []).map(p => ({
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
  } catch (error) {
    console.error("[GET /api/admin/earnings] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get subscription revenue for admin earnings dashboard
app.get("/api/admin/subscription-revenue", async (req, res) => {
  try {
    console.log("[GET /api/admin/subscription-revenue] Fetching subscription payments");
    
    // Fetch all paid entrepreneurs from ideas table
    const { data: paidEntrepreneurs, error } = await supabase
      .from("ideas")
      .select("id, entrepreneur_name, entrepreneur_email, payment_date, payment_status, stripe_customer_id")
      .eq("payment_status", "paid")
      .order("payment_date", { ascending: false });
    
    if (error) {
      console.error("[GET /api/admin/subscription-revenue] Database error:", error);
      return res.json({ subscriptions: [], totals: { totalRevenue: 0, count: 0 } });
    }
    
    const subscriptionAmount = 49; // $49/month per subscription
    const subscriptions = (paidEntrepreneurs || []).map(e => ({
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
  } catch (error) {
    console.error("[GET /api/admin/subscription-revenue] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ===== COACH CONTACT REQUESTS (One-Time Messaging) =====

// Send a one-time contact request from entrepreneur to coach
app.post("/api/coach-contact-requests", async (req, res) => {
  try {
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
    const { data: existingRequest } = await supabase
      .from("coach_contact_requests")
      .select("id, status")
      .eq("coach_id", coachId)
      .eq("entrepreneur_email", entrepreneurEmail)
      .single();

    if (existingRequest) {
      return res.status(400).json({ 
        error: "You have already sent a message to this coach. Only one initial message is allowed per coach." 
      });
    }

    // Create the contact request
    const { data, error } = await supabase
      .from("coach_contact_requests")
      .insert({
        coach_id: coachId,
        coach_name: coachName || 'Coach',
        coach_email: coachEmail,
        entrepreneur_email: entrepreneurEmail,
        entrepreneur_name: entrepreneurName || 'Entrepreneur',
        message: message,
        status: 'pending'
      })
      .select();

    if (error) {
      console.error("[POST /api/coach-contact-requests] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Send email notification to coach (names only, no emails shown)
    try {
      const resendConfig = await getResendClient();
      if (resendConfig && coachEmail) {
        await resendConfig.client.emails.send({
          from: resendConfig.fromEmail,
          to: coachEmail,
          subject: `New Contact Request from ${entrepreneurName || 'An Entrepreneur'}`,
          html: `<h2>New Contact Request</h2>
          <p><strong>${entrepreneurName || 'An entrepreneur'}</strong> would like to connect with you on TouchConnectPro.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p><em>This is a one-time contact request. You may send one reply to continue the conversation.</em></p>
          <p>Log in to your dashboard to respond.</p>`
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
          html: `<h2>New Coach Contact Request</h2>
          <p><strong>From:</strong> ${entrepreneurName}</p>
          <p><strong>To Coach:</strong> ${coachName}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>`
        });
        console.log("[POST /api/coach-contact-requests] Email sent to admin");
      }
    } catch (emailError) {
      console.error("[POST /api/coach-contact-requests] Admin email error:", emailError);
    }

    console.log("[POST /api/coach-contact-requests] Request created:", data?.[0]?.id);
    return res.json({ success: true, request: data?.[0] });
  } catch (error) {
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

    // Get the request
    const { data: request, error: fetchError } = await supabase
      .from("coach_contact_requests")
      .select("*")
      .eq("id", id)
      .single();

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
    const { data, error } = await supabase
      .from("coach_contact_requests")
      .update({
        reply: reply,
        replied_at: new Date().toISOString(),
        status: 'closed'
      })
      .eq("id", id)
      .select();

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
          html: `<h2>Reply from ${request.coach_name || 'Your Coach'}</h2>
          <p><strong>${request.coach_name}</strong> has replied to your contact request.</p>
          <div style="background: #e8f4e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your original message:</strong></p>
            <p style="white-space: pre-wrap;">${request.message}</p>
          </div>
          <div style="background: #e8f0f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Coach's reply:</strong></p>
            <p style="white-space: pre-wrap;">${reply}</p>
          </div>
          <p><em>This was a one-time contact. To continue working with this coach, consider booking their services through the platform.</em></p>`
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
          html: `<h2>Coach Replied to Contact Request</h2>
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
          <p><em>Conversation is now closed.</em></p>`
        });
        console.log("[POST /api/coach-contact-requests/:id/reply] Email sent to admin");
      }
    } catch (emailError) {
      console.error("[POST /api/coach-contact-requests/:id/reply] Admin email error:", emailError);
    }

    console.log("[POST /api/coach-contact-requests/:id/reply] Reply sent for request:", id);
    return res.json({ success: true, request: data?.[0] });
  } catch (error) {
    console.error("[POST /api/coach-contact-requests/:id/reply] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get contact requests for a coach
app.get("/api/coaches/:coachId/contact-requests", async (req, res) => {
  try {
    const { coachId } = req.params;

    const { data: requests, error } = await supabase
      .from("coach_contact_requests")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/coaches/:coachId/contact-requests] Error:", error);
      return res.json({ requests: [] });
    }

    return res.json({ requests: requests || [] });
  } catch (error) {
    console.error("[GET /api/coaches/:coachId/contact-requests] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all approved coaches - MUST be BEFORE /api/coaches/:coachId to avoid route conflict
app.get("/api/coaches/approved", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("status", "approved")
      .or("is_disabled.is.null,is_disabled.eq.false")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/coaches/approved] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[GET /api/coaches/approved] Returning", data?.length || 0, "coaches");
    // Strip profile_url from external_reputation for privacy (admin-only field)
    const safeData = (data || []).map(coach => {
      if (coach.external_reputation) {
        const { profile_url, ...safeReputation } = coach.external_reputation;
        return { ...coach, external_reputation: safeReputation };
      }
      return coach;
    });
    return res.json(safeData);
  } catch (error) {
    console.error("[GET /api/coaches/approved] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get single coach by ID (public profile) - MUST BE AFTER all other /api/coaches/* routes
app.get("/api/coaches/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;
    
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("id", coachId)
      .eq("status", "approved")
      .or("is_disabled.is.null,is_disabled.eq.false")
      .single();

    if (error) {
      console.error("[GET /api/coaches/:coachId] Error:", error);
      return res.status(404).json({ error: "Coach not found" });
    }

    // Strip profile_url from external_reputation for privacy (admin-only field)
    if (data.external_reputation) {
      const { profile_url, ...safeReputation } = data.external_reputation;
      data.external_reputation = safeReputation;
    }

    return res.json(data);
  } catch (error) {
    console.error("[GET /api/coaches/:coachId] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get contact requests sent by an entrepreneur
app.get("/api/entrepreneurs/:email/contact-requests", async (req, res) => {
  try {
    const { email } = req.params;

    const { data: requests, error } = await supabase
      .from("coach_contact_requests")
      .select("*")
      .eq("entrepreneur_email", decodeURIComponent(email))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/entrepreneurs/:email/contact-requests] Error:", error);
      return res.json({ requests: [] });
    }

    return res.json({ requests: requests || [] });
  } catch (error) {
    console.error("[GET /api/entrepreneurs/:email/contact-requests] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all contact requests for admin
app.get("/api/admin/contact-requests", async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from("coach_contact_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/contact-requests] Error:", error);
      return res.json({ requests: [] });
    }

    return res.json({ requests: requests || [] });
  } catch (error) {
    console.error("[GET /api/admin/contact-requests] Error:", error);
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

    const { data: existingRequest, error } = await supabase
      .from("coach_contact_requests")
      .select("id, status")
      .eq("coach_id", coachId)
      .eq("entrepreneur_email", entrepreneurEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("[GET /api/coach-contact-requests/check] Error:", error);
    }

    return res.json({ 
      hasContacted: !!existingRequest, 
      status: existingRequest?.status || null 
    });
  } catch (error) {
    console.error("[GET /api/coach-contact-requests/check] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/coaches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
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
    const { fullName, email, linkedin, bio, fundName, investmentFocus, investmentPreference, investmentAmount, country, state } = req.body;

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
            is_resubmitted: true,
            data: bio ? { bio } : {}
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
        status: "submitted",
        data: bio ? { bio } : {}
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
    const { fullName, bio, fundName, investmentFocus, investmentPreference, investmentAmount, linkedin, profileImage } = req.body;

    // Get existing data to preserve notes
    const { data: existingData } = await supabase
      .from("investor_applications")
      .select("data")
      .eq("id", id)
      .single();

    const updateData = {
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

    const { data, error } = await supabase
      .from("investor_applications")
      .update(updateData)
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

// ===== INVESTOR NOTES ENDPOINTS =====

// Respond to an investor note
app.post("/api/investor-notes/:investorId/respond", async (req, res) => {
  try {
    const { investorId } = req.params;
    const { noteId, text, attachmentUrl, attachmentName, attachmentSize, attachmentType, fromAdmin } = req.body;

    // Get existing data including email for notification
    const { data: existingData, error: fetchError } = await supabase
      .from("investor_applications")
      .select("data, email, full_name")
      .eq("id", investorId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const notes = existingData?.data?.notes || [];
    const noteIndex = notes.findIndex((n) => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found" });
    }

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

    const { data, error } = await supabase
      .from("investor_applications")
      .update({
        data: {
          ...existingData.data,
          notes
        }
      })
      .eq("id", investorId)
      .select();

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
      } catch (emailErr) {
        console.error("[INVESTOR NOTE] Email error:", emailErr.message, emailErr.stack);
      }
    } else {
      console.log("[INVESTOR NOTE RESPOND] No resend client available - email not sent");
    }

    return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add a note to investor (admin use)
app.post("/api/investor-notes/:investorId", async (req, res) => {
  try {
    const { investorId } = req.params;
    const { text, attachmentUrl, attachmentName, attachmentSize, attachmentType } = req.body;

    if (!text?.trim() && !attachmentUrl) {
      return res.status(400).json({ error: "Note text or attachment is required" });
    }

    // Get existing data including email for notification
    const { data: existingData, error: fetchError } = await supabase
      .from("investor_applications")
      .select("data, email, full_name")
      .eq("id", investorId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const notes = existingData?.data?.notes || [];
    const newNote = {
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

    const { data, error } = await supabase
      .from("investor_applications")
      .update({
        data: {
          ...existingData.data,
          notes
        }
      })
      .eq("id", investorId)
      .select();

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
      } catch (emailErr) {
        console.error("[INVESTOR NOTE] Email error:", emailErr.message);
      }
    }

    return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Toggle investor note completion
app.patch("/api/investor-notes/:investorId/:noteId/toggle", async (req, res) => {
  try {
    const { investorId, noteId } = req.params;
    const { completed } = req.body;

    const { data: existingData, error: fetchError } = await supabase
      .from("investor_applications")
      .select("data")
      .eq("id", investorId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const notes = existingData?.data?.notes || [];
    const noteIndex = notes.findIndex((n) => n.id === noteId);
    
    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found" });
    }

    notes[noteIndex].completed = completed;

    const { data, error } = await supabase
      .from("investor_applications")
      .update({
        data: {
          ...existingData.data,
          notes
        }
      })
      .eq("id", investorId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, notes: data?.[0]?.data?.notes || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Mark investor notes as read (admin viewed them)
app.post("/api/investor-notes/:investorId/mark-read", async (req, res) => {
  try {
    const { investorId } = req.params;

    const { data: existingData, error: fetchError } = await supabase
      .from("investor_applications")
      .select("data")
      .eq("id", investorId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Investor not found" });
    }

    const { data, error } = await supabase
      .from("investor_applications")
      .update({
        data: {
          ...existingData.data,
          lastAdminViewedNotesAt: new Date().toISOString()
        }
      })
      .eq("id", investorId)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log("[INVESTOR NOTES] Marked as read for investor:", investorId);
    return res.json({ success: true, lastAdminViewedNotesAt: data?.[0]?.data?.lastAdminViewedNotesAt });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Upload investor attachment
app.post("/api/upload-investor-attachment", async (req, res) => {
  try {
    const { fileName, fileData, fileType, investorId } = req.body;

    if (!fileName || !fileData || !investorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const base64Data = fileData.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `investor-attachments/${investorId}/${timestamp}_${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from("note-attachments")
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: false
      });

    if (error) {
      console.error("[UPLOAD] Error:", error);
      return res.status(400).json({ error: error.message });
    }

    const { data: urlData } = supabase.storage
      .from("note-attachments")
      .getPublicUrl(storagePath);

    return res.json({ success: true, url: urlData.publicUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get investor meetings
app.get("/api/investor-meetings/:investorId", async (req, res) => {
  try {
    const { investorId } = req.params;

    const { data, error } = await supabase
      .from("investor_applications")
      .select("data")
      .eq("id", investorId)
      .single();

    if (error) {
      return res.status(404).json({ error: "Investor not found" });
    }

    return res.json({ meetings: data?.data?.meetings || [] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/investors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pre-approved", "terminated"].includes(status)) {
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
          photo_url: mentorData.photo_url || mentorData.photoUrl || mentorData.data?.profileImage || ""
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
      .from("ideas")
      .select("entrepreneur_email, entrepreneur_name")
      .eq("id", entrepreneurId)
      .single();
    
    const { data: mentor } = await supabase
      .from("mentor_applications")
      .select("email, full_name")
      .eq("id", mentorId)
      .single();

    if (entrepreneur && mentor) {
      const entrepreneurEmail = entrepreneur.entrepreneur_email;
      const entrepreneurName = entrepreneur.entrepreneur_name || "Entrepreneur";
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
      
      // Send email notifications to both parties
      sendMentorAssignmentEmail(entrepreneurEmail, entrepreneurName, "entrepreneur", mentorName, portfolioNumber).catch(err => console.error("[EMAIL] Entrepreneur assignment email failed:", err));
      sendMentorAssignmentEmail(mentorEmail, mentorName, "mentor", entrepreneurName, portfolioNumber).catch(err => console.error("[EMAIL] Mentor assignment email failed:", err));
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
        photo_url: mentor.photo_url || mentor.photoUrl || mentor.data?.profileImage || ""
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
      
      // Parse mentor_notes from JSON if needed, ensuring each note has an ID
      let parsedNotes = [];
      if (assignment.mentor_notes) {
        try {
          let rawNotes = typeof assignment.mentor_notes === 'string'
            ? JSON.parse(assignment.mentor_notes)
            : (Array.isArray(assignment.mentor_notes) ? assignment.mentor_notes : [assignment.mentor_notes]);
          // Normalize notes to ensure each has an ID and responses array
          parsedNotes = rawNotes.map((note, idx) => {
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
      // Preserve all existing fields (including id, responses) when toggling completion
      notes[noteIdxNum] = {
        ...(typeof note === 'object' ? note : {}),
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

    // Send email notification to entrepreneur when mentor marks note as completed
    if (completed && noteIdxNum >= 0 && noteIdxNum < notes.length) {
      try {
        const noteText = notes[noteIdxNum]?.text || "a task";
        
        const { data: mentor } = await supabase
          .from("mentor_applications")
          .select("full_name, email")
          .eq("id", assignment.mentor_id)
          .single();

        const { data: entrepreneur } = await supabase
          .from("ideas")
          .select("entrepreneur_name, entrepreneur_email")
          .eq("id", assignment.entrepreneur_id)
          .single();

        if (entrepreneur?.entrepreneur_email && mentor) {
          const resendData = await getResendClient();
          if (resendData) {
            const { client: resendClient, fromEmail } = resendData;
            const FRONTEND_URL = process.env.FRONTEND_URL || "https://touchconnectpro.com";
            
            await resendClient.emails.send({
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
                    <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
                  </div>
                </div>
              </body>
              </html>
            `
            });
            console.log("[TOGGLE-NOTE] Email sent to entrepreneur:", entrepreneur.entrepreneur_email);
          }
        }
      } catch (emailError) {
        console.error("[TOGGLE-NOTE] Email notification failed:", emailError.message);
      }
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
      
      // Get current assignment to check existing notes and get entrepreneur/mentor IDs
      const { data: currentAssignment, error: fetchError } = await supabase
        .from("mentor_assignments")
        .select("mentor_notes, entrepreneur_id, mentor_id")
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
      
      // Send email notification to entrepreneur about new note
      if (currentAssignment?.entrepreneur_id && currentAssignment?.mentor_id) {
        const { data: entrepreneur } = await supabase
          .from("ideas")
          .select("entrepreneur_email, entrepreneur_name")
          .eq("id", currentAssignment.entrepreneur_id)
          .single();
        
        const { data: mentor } = await supabase
          .from("mentor_applications")
          .select("full_name")
          .eq("id", currentAssignment.mentor_id)
          .single();
        
        if (entrepreneur?.entrepreneur_email) {
          const mentorName = mentor?.full_name || "Your Mentor";
          const entrepreneurName = entrepreneur.entrepreneur_name || "Entrepreneur";
          const notePreview = mentorNotes.length > 100 ? mentorNotes.substring(0, 100) + "..." : mentorNotes;
          
          sendMessageNotificationEmail(
            entrepreneur.entrepreneur_email,
            entrepreneurName,
            mentorName,
            "mentor@touchconnectpro.com",
            `New note from your mentor: "${notePreview}"`
          ).catch(err => console.error("[EMAIL] Mentor note email failed:", err));
          
          console.log("[PATCH /api/mentor-assignments/:id] Email notification sent to entrepreneur:", entrepreneur.entrepreneur_email);
        }
      }
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

// Submit response to a mentor note (entrepreneur)
app.post("/api/mentor-assignments/:assignmentId/notes/:noteId/respond", async (req, res) => {
  console.log("[POST /api/note-respond] Request received");
  try {
    const { assignmentId, noteId } = req.params;
    const { responseText, attachmentUrl, attachmentName, attachmentSize, attachmentType } = req.body;

    if (!responseText && !attachmentUrl) {
      return res.status(400).json({ error: "Response text or attachment is required" });
    }

    // Get current assignment
    const { data: assignment, error: fetchError } = await supabase
      .from("mentor_assignments")
      .select("mentor_notes")
      .eq("id", assignmentId)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Parse existing notes
    let notes = [];
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
    notes = notes.map((note, idx) => {
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
    const { error: updateError } = await supabase
      .from("mentor_assignments")
      .update({ mentor_notes: JSON.stringify(notes) })
      .eq("id", assignmentId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    console.log("[POST /api/note-respond] Response added successfully");

    // Send email notification to mentor about entrepreneur's response
    try {
      const { data: fullAssignment } = await supabase
        .from("mentor_assignments")
        .select("mentor_id, entrepreneur_id")
        .eq("id", assignmentId)
        .single();

      if (fullAssignment) {
        const { data: mentor } = await supabase
          .from("mentor_applications")
          .select("email, full_name")
          .eq("id", fullAssignment.mentor_id)
          .single();

        const { data: entrepreneur } = await supabase
          .from("ideas")
          .select("entrepreneur_name, entrepreneur_email")
          .eq("id", fullAssignment.entrepreneur_id)
          .single();

        if (mentor?.email && entrepreneur) {
          const resendData = await getResendClient();
          if (resendData) {
            const { client: resendClient, fromEmail } = resendData;
            const FRONTEND_URL = process.env.FRONTEND_URL || "https://touchconnectpro.com";
            const notePreview = notes.find((n) => n.id === noteId)?.text || "your note";
            const responsePreview = responseText ? (responseText.length > 100 ? responseText.substring(0, 100) + "..." : responseText) : "";
            
            await resendClient.emails.send({
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
                    <p>&copy; ${new Date().getFullYear()} TouchConnectPro. All rights reserved.</p>
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
    } catch (emailError) {
      console.error("[POST /api/note-respond] Email notification failed:", emailError.message);
    }

    return res.json({ success: true, notes });
  } catch (error) {
    console.error("[POST /api/note-respond] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Upload file for note response (Supabase Storage)
app.post("/api/upload-note-attachment", async (req, res) => {
  console.log("[POST /api/upload-note-attachment] Request received");
  try {
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
    const { data, error } = await supabase.storage
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
    const { data: urlData } = supabase.storage
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
  } catch (error) {
    console.error("[UPLOAD] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Unassign entrepreneur from mentor
app.delete("/api/mentor-assignments/:id", async (req, res) => {
  console.log("[DELETE /api/mentor-assignments/:id] Request received for ID:", req.params.id);
  
  try {
    const { id } = req.params;

    // First fetch the assignment details for notifications
    const { data: assignment, error: fetchError } = await supabase
      .from("mentor_assignments")
      .select("entrepreneur_id, mentor_id, portfolio_number")
      .eq("id", id)
      .single();

    if (fetchError || !assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Delete the assignment (or set status to inactive)
    const { error: deleteError } = await supabase
      .from("mentor_assignments")
      .update({ status: "inactive" })
      .eq("id", id);

    if (deleteError) {
      console.error("[DELETE /api/mentor-assignments/:id] Error:", deleteError);
      return res.status(500).json({ error: deleteError.message });
    }

    console.log("[DELETE /api/mentor-assignments/:id] Assignment deactivated successfully");

    // Fetch entrepreneur and mentor details for notifications
    const { data: entrepreneur } = await supabase
      .from("ideas")
      .select("entrepreneur_email, entrepreneur_name")
      .eq("id", assignment.entrepreneur_id)
      .single();
    
    const { data: mentor } = await supabase
      .from("mentor_applications")
      .select("email, full_name")
      .eq("id", assignment.mentor_id)
      .single();

    if (entrepreneur && mentor) {
      const entrepreneurEmail = entrepreneur.entrepreneur_email;
      const entrepreneurName = entrepreneur.entrepreneur_name || "Entrepreneur";
      const mentorEmail = mentor.email;
      const mentorName = mentor.full_name || "Mentor";

      // Send system message to entrepreneur
      await supabase.from("messages").insert({
        from_name: "System",
        from_email: "admin@touchconnectpro.com",
        to_name: entrepreneurName,
        to_email: entrepreneurEmail,
        message: `Your mentor assignment has been updated. You have been unassigned from ${mentorName}'s portfolio. An admin will assign you to a new mentor soon.`,
        is_read: false
      });

      // Send system message to mentor
      await supabase.from("messages").insert({
        from_name: "System",
        from_email: "admin@touchconnectpro.com",
        to_name: mentorName,
        to_email: mentorEmail,
        message: `${entrepreneurName} has been removed from your Portfolio ${assignment.portfolio_number}.`,
        is_read: false
      });

      // Send email notifications
      sendMessageNotificationEmail(entrepreneurEmail, entrepreneurName, "TouchConnectPro", "admin@touchconnectpro.com", 
        `Your mentor assignment has been updated. You have been unassigned from ${mentorName}'s portfolio. An admin will assign you to a new mentor soon.`
      ).catch(err => console.error("[EMAIL] Entrepreneur unassign email failed:", err));
      
      sendMessageNotificationEmail(mentorEmail, mentorName, "TouchConnectPro", "admin@touchconnectpro.com",
        `${entrepreneurName} has been removed from your Portfolio ${assignment.portfolio_number}.`
      ).catch(err => console.error("[EMAIL] Mentor unassign email failed:", err));
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/mentor-assignments/:id] Exception:", error);
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

    // Redirect admin aliases to actual admin email
    const adminAliases = ["admin@touchconnectpro.com", "admin"];
    const actualToEmail = adminAliases.includes(toEmail) ? ADMIN_EMAIL : toEmail;
    const actualToName = adminAliases.includes(toEmail) ? "Admin" : (toName || "Unknown");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        from_name: fromName || "Unknown",
        from_email: fromEmail,
        to_name: actualToName,
        to_email: actualToEmail,
        message: message,
        is_read: false
      })
      .select();

    if (error) {
      console.error("[POST /api/messages] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[POST /api/messages] Message sent from ${fromEmail} to ${actualToEmail}`);
    
    // Skip email notifications only for system-generated messages
    const isSystemMessage = fromEmail === "system@touchconnectpro.com";
    
    if (!isSystemMessage && actualToEmail) {
      // Send email notification to recipient
      sendMessageNotificationEmail(actualToEmail, actualToName, fromName, fromEmail, message).catch(err => console.error("[EMAIL] Message notify failed:", err));
      
      // Also notify admin of messages between other users (not if admin is sender or recipient)
      const isMessageToAdmin = actualToEmail === ADMIN_EMAIL;
      const isAdminSender = adminAliases.includes(fromEmail) || fromEmail === ADMIN_EMAIL;
      if (!isMessageToAdmin && !isAdminSender) {
        sendAdminMessageNotificationEmail(fromName, fromEmail, actualToName, actualToEmail, message).catch(err => console.error("[EMAIL] Admin message notify failed:", err));
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

// =============================================
// MESSAGE THREADS (Threaded Conversations)
// =============================================

// Get all message threads for a user (by email)
app.get("/api/message-threads/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email).toLowerCase();

    const { data, error } = await supabase
      .from("message_threads")
      .select("*")
      .or(`entrepreneur_email.ilike.${decodedEmail},mentor_email.ilike.${decodedEmail}`)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[GET /api/message-threads/:email] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ threads: data || [] });
  } catch (error) {
    console.error("[GET /api/message-threads/:email] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Create a new message thread
app.post("/api/message-threads", async (req, res) => {
  try {
    const { entrepreneurEmail, mentorEmail, subject, message, senderRole, senderName, attachments } = req.body;

    if (!entrepreneurEmail || !mentorEmail || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const entry = {
      id: crypto.randomUUID(),
      senderRole: senderRole || "entrepreneur",
      senderName: senderName || "Entrepreneur",
      message,
      attachments: attachments || [],
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("message_threads")
      .insert({
        entrepreneur_email: entrepreneurEmail.toLowerCase(),
        mentor_email: mentorEmail.toLowerCase(),
        subject: subject || "New Conversation",
        status: "open",
        entries: [entry],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/message-threads] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Send email notification to the recipient
    const recipientEmail = senderRole === "entrepreneur" ? mentorEmail : entrepreneurEmail;
    const recipientName = senderRole === "entrepreneur" ? "Mentor" : "Entrepreneur";
    sendMessageNotificationEmail(recipientEmail, recipientName, senderName, senderRole === "entrepreneur" ? entrepreneurEmail : mentorEmail, message)
      .catch(err => console.error("[EMAIL] Thread notification failed:", err));

    return res.json({ thread: data });
  } catch (error) {
    console.error("[POST /api/message-threads] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Add reply to a message thread
app.post("/api/message-threads/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, senderRole, senderName, attachments } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get current thread
    const { data: thread, error: fetchError } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    const newEntry = {
      id: crypto.randomUUID(),
      senderRole: senderRole || "entrepreneur",
      senderName: senderName || "User",
      message,
      attachments: attachments || [],
      createdAt: new Date().toISOString()
    };

    const updatedEntries = [...(thread.entries || []), newEntry];

    const { data, error } = await supabase
      .from("message_threads")
      .update({
        entries: updatedEntries,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[POST /api/message-threads/:id/reply] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Send email notification to the other party
    const recipientEmail = senderRole === "mentor" ? thread.entrepreneur_email : thread.mentor_email;
    const recipientName = senderRole === "mentor" ? "Entrepreneur" : "Mentor";
    sendMessageNotificationEmail(recipientEmail, recipientName, senderName, senderRole === "mentor" ? thread.mentor_email : thread.entrepreneur_email, message)
      .catch(err => console.error("[EMAIL] Reply notification failed:", err));

    return res.json({ thread: data });
  } catch (error) {
    console.error("[POST /api/message-threads/:id/reply] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Update thread status (open/closed)
app.patch("/api/message-threads/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'open' or 'closed'" });
    }

    const { data, error } = await supabase
      .from("message_threads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[PATCH /api/message-threads/:id/status] Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ thread: data });
  } catch (error) {
    console.error("[PATCH /api/message-threads/:id/status] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Upload attachment for message threads (using Supabase Storage)
// NOTE: This route MUST come BEFORE /thread/:id to avoid "upload" matching as :id
app.post("/api/message-threads/upload", async (req, res) => {
  try {
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

    const { data, error } = await supabase.storage
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
    const { data: urlData } = supabase.storage
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
  } catch (error) {
    console.error("[POST /api/message-threads/upload] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get a single thread by ID
app.get("/api/message-threads/thread/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[GET /api/message-threads/thread/:id] Error:", error);
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.json({ thread: data });
  } catch (error) {
    console.error("[GET /api/message-threads/thread/:id] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Generate AI draft response for mentor
app.post("/api/message-threads/:id/ai-draft", async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorName, mentorEmail } = req.body;

    // Get the thread
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .select("*")
      .eq("id", id)
      .single();

    if (threadError || !thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // Get the latest entrepreneur message from thread entries
    const entries = thread.entries || [];
    const entrepreneurMessages = entries.filter(e => 
      e.senderRole === "entrepreneur" || e.sender_role === "entrepreneur"
    );
    const latestMessage = entrepreneurMessages.length > 0 
      ? entrepreneurMessages[entrepreneurMessages.length - 1].message 
      : entries[entries.length - 1]?.message || "";

    // Find entrepreneur by email from thread
    const entrepreneurEmail = thread.entrepreneur_email;
    console.log("[AI-DRAFT] Looking up entrepreneur:", entrepreneurEmail);
    
    // Look up entrepreneur in ideas table to get idea proposal and business plan
    const { data: entrepreneur, error: entError } = await supabase
      .from("ideas")
      .select("*")
      .eq("entrepreneur_email", entrepreneurEmail)
      .single();

    let ideaProposal = {};
    let businessPlan = {};
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
        console.log("[AI-DRAFT] Could not parse idea proposal:", e.message);
      }

      // Get business plan from 'business_plan' column
      try {
        businessPlan = typeof entrepreneur.business_plan === 'string'
          ? JSON.parse(entrepreneur.business_plan)
          : entrepreneur.business_plan || {};
        console.log("[AI-DRAFT] Business plan keys:", Object.keys(businessPlan).length);
      } catch (e) {
        console.log("[AI-DRAFT] Could not parse business plan:", e.message);
      }
    } else {
      console.log("[AI-DRAFT] Entrepreneur not found in ideas table, error:", entError?.message);
    }

    // Generate AI draft using OpenAI
    const openai = getOpenAI();
    if (!openai) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    // Helper: Recursively flatten nested objects/arrays into readable key-value lines
    function flattenToLines(obj, prefix = "") {
      const lines = [];
      if (!obj || typeof obj !== 'object') {
        return lines;
      }
      
      for (const [key, val] of Object.entries(obj)) {
        const label = prefix ? `${prefix} > ${key}` : key;
        
        if (val === null || val === undefined) {
          continue;
        } else if (typeof val === 'string' && val.trim()) {
          lines.push(`- ${label}: ${val}`);
        } else if (typeof val === 'number' || typeof val === 'boolean') {
          lines.push(`- ${label}: ${val}`);
        } else if (Array.isArray(val)) {
          // Handle arrays - could be array of objects or primitives
          val.forEach((item, idx) => {
            if (typeof item === 'object' && item !== null) {
              // Check for question/answer format
              if (item.question && item.answer) {
                lines.push(`- ${item.question}: ${item.answer}`);
              } else {
                lines.push(...flattenToLines(item, `${label}[${idx}]`));
              }
            } else if (item && String(item).trim()) {
              lines.push(`- ${label}[${idx}]: ${item}`);
            }
          });
        } else if (typeof val === 'object') {
          // Recurse into nested objects
          lines.push(...flattenToLines(val, label));
        }
      }
      return lines;
    }

    // Build context from available data - send FULL data to AI for accuracy
    let contextParts = [];
    contextParts.push(`Entrepreneur: ${entrepreneurName}`);
    if (thread.subject) {
      contextParts.push(`Conversation Subject: ${thread.subject}`);
    }
    
    // Include FULL idea proposal (all 42 questions) - recursively flattened
    if (ideaProposal && Object.keys(ideaProposal).length > 0) {
      const proposalLines = flattenToLines(ideaProposal);
      if (proposalLines.length > 0) {
        contextParts.push(`\n**Entrepreneur's Full Idea Proposal:**\n${proposalLines.join("\n")}`);
      }
      console.log("[AI-DRAFT] Idea proposal lines extracted:", proposalLines.length);
    }
    
    // Include FULL business plan (all 11 sections) - recursively flattened
    if (businessPlan && Object.keys(businessPlan).length > 0) {
      const planLines = flattenToLines(businessPlan);
      if (planLines.length > 0) {
        contextParts.push(`\n**Entrepreneur's Full Business Plan:**\n${planLines.join("\n")}`);
      }
      console.log("[AI-DRAFT] Business plan lines extracted:", planLines.length);
    }
    
    contextParts.push(`\n**Entrepreneur's Latest Message:**\n"${latestMessage}"`);

    const systemPrompt = `You are an experienced business mentor helping prepare a thoughtful response to an entrepreneur's message. Your role is to provide guidance, ask clarifying questions when needed, and offer actionable advice.

Guidelines for your response:
1. Be warm, encouraging, and professional
2. Reference SPECIFIC details from their business plan or idea proposal - use exact numbers, figures, funding amounts, dates, and company names they mentioned
3. When asked about specific data (funding, revenue targets, market size, etc.), quote the exact figures from their documents
4. Provide actionable next steps or thoughtful questions
5. Keep the response concise but substantive (2-4 paragraphs)
6. If their question relates to a specific aspect of their business, tie your answer back to their stated goals using their own words and data
7. Encourage them while also being honest about challenges they may face

IMPORTANT: When the entrepreneur asks about specific information (like funding amounts, revenue projections, dates), find and quote the exact data from their idea proposal and business plan. Do not generalize or paraphrase numbers.

Remember: This is a draft for the mentor to review and personalize before sending.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Based on the following context, draft a helpful mentor response:

${contextParts.join("\n")}

Write a draft response that the mentor (${mentorName || 'Mentor'}) can review and personalize before sending. The response should be helpful, specific to their situation, and actionable.

Return ONLY the draft response text, no additional formatting or explanations.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const draft = response.choices[0]?.message?.content;
    if (!draft) {
      return res.status(500).json({ error: "No response from AI" });
    }

    return res.json({ draft });
  } catch (error) {
    console.error("[POST /api/message-threads/:id/ai-draft] Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI draft" });
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
    try {
      await supabase
        .from("mentor_waitlist")
        .insert({ email, full_name: fullName, created_at: new Date().toISOString() });
      console.log("[MENTOR WAITLIST] Saved to database");
    } catch (dbError) {
      console.log("[MENTOR WAITLIST] Database save skipped:", dbError.message);
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
                    <strong>Date:</strong> ${new Date().toLocaleString()}
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
      } catch (emailError) {
        console.error("[MENTOR WAITLIST] Email send failed:", emailError.message);
      }
    }

    return res.json({ success: true, message: "Added to mentor waiting list" });
  } catch (error) {
    console.error("[MENTOR WAITLIST] Error:", error.message);
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

// Update meeting with invitee names
app.patch("/api/admin/meetings/:meetingId/invitees", async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { invitees, inviteeType } = req.body;

    console.log("[ADMIN MEETINGS] Updating invitees for meeting:", meetingId, "invitees:", invitees);

    const { data, error } = await supabase
      .from("meetings")
      .update({ 
        invitees: invitees || [],
        invitee_type: inviteeType || null
      })
      .eq("id", meetingId)
      .select();

    if (error) {
      console.error("[ADMIN MEETINGS] Update error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, meeting: data?.[0] });
  } catch (error) {
    console.error("[ADMIN MEETINGS] Error updating invitees:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Send meeting invitations to any user type (mentor, investor, entrepreneur)
app.post("/api/admin/send-meeting-invite", async (req, res) => {
  try {
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
                    ${startTime ? `<p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString()}</p>` : ''}
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
      } catch (emailErr) {
        console.error("[ADMIN INVITE] Email error:", emailErr.message);
      }
    }

    // Also send in-app message
    await supabase.from("messages").insert({
      from_name: hostName || "TouchConnectPro Admin",
      from_email: "admin@touchconnectpro.com",
      to_name: recipientName || recipientEmail,
      to_email: recipientEmail,
      message: `You have been invited to a meeting: "${topic}". Join here: ${joinUrl}${password ? ` (Password: ${password})` : ''}`,
      is_read: false
    });

    // If recipient is an investor, add meeting to their data.meetings array
    if (recipientType === "investor") {
      try {
        // Find investor by email
        const { data: investor } = await supabase
          .from("investor_applications")
          .select("id, data")
          .eq("email", recipientEmail)
          .single();
        
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
          
          const { error: updateError } = await supabase
            .from("investor_applications")
            .update({
              data: {
                ...currentData,
                meetings: [...existingMeetings, newMeeting]
              }
            })
            .eq("id", investor.id);
          
          if (updateError) {
            console.error("[ADMIN INVITE] Failed to update investor meetings:", updateError);
          }
          
          console.log("[ADMIN INVITE] Meeting added to investor's dashboard:", investor.id);
        }
      } catch (investorErr) {
        console.error("[ADMIN INVITE] Error adding meeting to investor:", investorErr.message);
      }
    }

    console.log("[ADMIN INVITE] Invitation sent successfully to:", recipientEmail);

    return res.json({ 
      success: true, 
      emailSent,
      messageCreated: true
    });
  } catch (error) {
    console.error("[ADMIN INVITE] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Admin: Create meeting and send invitations to multiple recipients
app.post("/api/admin/create-meeting-with-invites", async (req, res) => {
  try {
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
    const { data: savedMeeting, error: dbError } = await supabase
      .from("meetings")
      .insert({
        topic,
        start_time: startTime,
        duration: duration || 60,
        join_url: joinUrl,
        password,
        host_name: hostName || "TouchConnectPro Admin",
        participants: recipients.map(r => r.email),
        created_at: new Date().toISOString()
      })
      .select();

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
                      ${startTime ? `<p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString()}</p>` : ''}
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
        } catch (emailErr) {
          console.error("[ADMIN CREATE MEETING] Email error for", recipient.email, emailErr.message);
        }
      }

      // Send in-app message
      await supabase.from("messages").insert({
        from_name: hostName || "TouchConnectPro Admin",
        from_email: "admin@touchconnectpro.com",
        to_name: recipient.name || recipient.email,
        to_email: recipient.email,
        message: `You have been invited to a meeting: "${topic}". Join here: ${joinUrl}${password ? ` (Password: ${password})` : ''}`,
        is_read: false
      });
      messagesSent++;
    }

    console.log("[ADMIN CREATE MEETING] Sent", emailsSent, "emails and", messagesSent, "in-app messages");

    return res.json({ 
      success: true, 
      meetingId: savedMeeting?.[0]?.id,
      emailsSent,
      messagesCreated: messagesSent
    });
  } catch (error) {
    console.error("[ADMIN CREATE MEETING] Error:", error.message);
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
  // Debug: Log key prefix to verify test vs live mode
  const keyPrefix = stripeSecretKey.substring(0, 12);
  console.log("[STRIPE] Using key prefix:", keyPrefix);
  // Use stable API version (2023-10-16) to avoid Accounts V2 test mode restrictions
  return new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
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
    // Use REPLIT_DEV_DOMAIN for development, otherwise FRONTEND_URL or production domain
    const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
    const baseUrl = replitDevDomain 
      ? `https://${replitDevDomain}` 
      : (process.env.FRONTEND_URL || "https://touchconnectpro.com");
    console.log("[STRIPE] Using baseUrl for redirects:", baseUrl);
    const finalSuccessUrl = successUrl || `${baseUrl}/login?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/login?payment=cancelled`;

    console.log("[STRIPE] Creating session for:", email, "entrepreneur:", entrepreneurId);

    // Create or retrieve customer first (required for Accounts V2 in test mode)
    let customer;
    const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log("[STRIPE] Found existing customer:", customer.id);
    } else {
      customer = await stripe.customers.create({ email: email });
      console.log("[STRIPE] Created new customer:", customer.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.id,
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

// Get entrepreneur payment status
app.get("/api/entrepreneur/payment-status/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    
    const { data, error } = await supabase
      .from("ideas")
      .select("payment_status, stripe_customer_id, payment_date, status")
      .ilike("entrepreneur_email", email)
      .limit(1);

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
  } catch (error) {
    console.error("[PAYMENT STATUS] Error:", error.message);
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
      // Update payment_status only - admin will manually approve after assigning mentor
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ 
          payment_status: "paid",
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          payment_date: new Date().toISOString()
        })
        .eq("id", entrepreneurId);

      if (updateError) {
        console.error("[STRIPE] Error updating payment status:", updateError);
      } else {
        console.log("[STRIPE] Entrepreneur", entrepreneurId, "payment_status updated to paid (status remains pre-approved)");
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
  console.log("[STRIPE WEBHOOK] ========== WEBHOOK RECEIVED ==========");
  console.log("[STRIPE WEBHOOK] Body type:", typeof req.body);
  console.log("[STRIPE WEBHOOK] Body is Buffer:", Buffer.isBuffer(req.body));
  console.log("[STRIPE WEBHOOK] Body length:", req.body?.length || 0);
  console.log("[STRIPE WEBHOOK] Headers:", JSON.stringify({
    'content-type': req.headers['content-type'],
    'stripe-signature': req.headers['stripe-signature'] ? 'present' : 'missing'
  }));
  
  const stripe = getStripeClient();
  if (!stripe) {
    console.log("[STRIPE WEBHOOK] ERROR: Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("[STRIPE WEBHOOK] Webhook secret configured:", !!webhookSecret);
  console.log("[STRIPE WEBHOOK] Signature present:", !!sig);

  if (!webhookSecret) {
    console.log("[STRIPE WEBHOOK] ERROR: No webhook secret configured, skipping");
    return res.status(200).json({ received: true, error: "no webhook secret" });
  }

  if (!sig) {
    console.log("[STRIPE WEBHOOK] ERROR: No signature in headers");
    return res.status(400).json({ error: "No stripe-signature header" });
  }

  try {
    console.log("[STRIPE WEBHOOK] Attempting to construct event...");
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("[STRIPE WEBHOOK] Event constructed successfully!");
    console.log("[STRIPE WEBHOOK] Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      // Get email from metadata (where we store it during checkout) or customer_email as fallback
      const entrepreneurEmail = session.metadata?.entrepreneurEmail || session.metadata?.email || session.customer_email;
      const coachId = session.metadata?.coach_id;
      
      // Handle entrepreneur membership payment - only set payment_status, admin manually approves
      if (entrepreneurEmail && !coachId && session.payment_status === "paid") {
        console.log("[STRIPE WEBHOOK] ========== MEMBERSHIP PAYMENT ==========");
        console.log("[STRIPE WEBHOOK] Updating payment_status for entrepreneur:", entrepreneurEmail);
        console.log("[STRIPE WEBHOOK] Metadata:", JSON.stringify(session.metadata));
        const { data: updateData, error: updateError } = await supabase
          .from("ideas")
          .update({ 
            payment_status: "paid",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            payment_date: new Date().toISOString()
          })
          .ilike("entrepreneur_email", entrepreneurEmail)
          .select();
        
        if (updateError) {
          console.error("[STRIPE WEBHOOK] Error updating payment status:", updateError);
        } else {
          console.log("[STRIPE WEBHOOK] Payment status updated to 'paid' for:", entrepreneurEmail);
          console.log("[STRIPE WEBHOOK] Status remains pre-approved - admin will manually approve after mentor assignment");
          
          // Send notification emails
          const entrepreneurName = updateData?.[0]?.entrepreneur_name || "Entrepreneur";
          const resendData = await getResendClient();
          if (resendData) {
            const { client: resendClient, fromEmail } = resendData;
            
            // Email to entrepreneur
            try {
              await resendClient.emails.send({
                from: fromEmail,
                to: entrepreneurEmail,
                subject: "Payment Received - TouchConnectPro Membership",
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Payment Confirmed!</h2>
                    <p>Hi ${entrepreneurName},</p>
                    <p>Your $49/month membership payment has been received. A mentor will be assigned to you shortly.</p>
                    <p>You'll receive a notification once your mentor is ready to connect with you.</p>
                    <p>Best regards,<br>The TouchConnectPro Team</p>
                  </div>
                `
              });
              console.log("[STRIPE WEBHOOK] Payment confirmation email sent to:", entrepreneurEmail);
            } catch (emailError) {
              console.error("[STRIPE WEBHOOK] Error sending entrepreneur email:", emailError.message);
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
                    <p><strong>Email:</strong> ${entrepreneurEmail}</p>
                    <p><strong>Status:</strong> Payment received, awaiting mentor assignment</p>
                    <p>Please assign a mentor to this entrepreneur in the admin dashboard.</p>
                  </div>
                `
              });
              console.log("[STRIPE WEBHOOK] Admin notification sent for payment from:", entrepreneurEmail);
            } catch (emailError) {
              console.error("[STRIPE WEBHOOK] Error sending admin email:", emailError.message);
            }
          }
        }
      }
      
      // Handle coach service purchase
      if (coachId && session.payment_status === "paid") {
        console.log("[STRIPE WEBHOOK] ========== COACH PURCHASE ==========");
        console.log("[STRIPE WEBHOOK] Coach ID:", coachId);
        console.log("[STRIPE WEBHOOK] Session metadata:", JSON.stringify(session.metadata));
        
        // Idempotency guard: check if this session was already processed
        const { data: existingPurchase } = await supabase
          .from("coach_purchases")
          .select("id")
          .eq("stripe_session_id", session.id)
          .single();
        
        if (existingPurchase) {
          console.log("[STRIPE WEBHOOK] Duplicate event - session already processed:", session.id);
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
          const { error: insertError } = await supabase
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
            });
          
          if (insertError) {
            console.error("[STRIPE WEBHOOK] Error saving purchase:", insertError);
          } else {
            console.log("[STRIPE WEBHOOK] Purchase saved successfully");
          }
        } catch (dbError) {
          console.error("[STRIPE WEBHOOK] Database error:", dbError.message);
        }
        
        // Get coach email for notification
        try {
          const { data: coach } = await supabase
            .from("coach_applications")
            .select("email")
            .eq("id", coachId)
            .single();
          
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
                console.log("[STRIPE WEBHOOK] Email sent to entrepreneur:", entrepreneurEmail);
              } catch (emailError) {
                console.error("[STRIPE WEBHOOK] Error sending entrepreneur email:", emailError.message);
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
                console.log("[STRIPE WEBHOOK] Email sent to coach:", coachEmail);
              } catch (emailError) {
                console.error("[STRIPE WEBHOOK] Error sending coach email:", emailError.message);
              }
            }
            
            // Send email to admin
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "buhler.lionel+admin@gmail.com";
            console.log("[STRIPE WEBHOOK] Attempting to send admin email to:", ADMIN_EMAIL);
            console.log("[STRIPE WEBHOOK] From email:", fromEmail);
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
              console.log("[STRIPE WEBHOOK] Email sent to admin:", ADMIN_EMAIL, "Result:", JSON.stringify(adminEmailResult));
            } catch (emailError) {
              console.error("[STRIPE WEBHOOK] Error sending admin email:", emailError.message);
              console.error("[STRIPE WEBHOOK] Full admin email error:", JSON.stringify(emailError));
            }
          } else {
            console.log("[STRIPE WEBHOOK] Resend not configured, skipping emails");
            console.log("[STRIPE WEBHOOK] RESEND_API_KEY present?", !!process.env.RESEND_API_KEY);
          }
        } catch (lookupError) {
          console.error("[STRIPE WEBHOOK] Error looking up coach:", lookupError.message);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[STRIPE WEBHOOK] Error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

// ============ END STRIPE ROUTES ============

// ============================================
// STRIPE CONNECT - COACH MARKETPLACE
// ============================================

// Create Stripe Connect account for coach
app.post("/api/stripe/connect/create-account", async (req, res) => {
  try {
    const { coachId, email, fullName } = req.body;
    
    if (!coachId || !email) {
      return res.status(400).json({ error: "coachId and email required" });
    }

    console.log("[STRIPE CONNECT] Creating account for coach:", coachId, email);

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const account = await stripe.accounts.create({
      type: 'standard',
      email: email,
      metadata: {
        coach_id: coachId,
        platform: 'TouchConnectPro'
      }
    });

    console.log("[STRIPE CONNECT] Created account:", account.id);

    const { error: updateError } = await supabase
      .from("coach_applications")
      .update({ stripe_account_id: account.id })
      .eq("id", coachId);

    if (updateError) {
      console.error("[STRIPE CONNECT] Failed to save account ID:", updateError);
      return res.status(500).json({ error: "Failed to save Stripe account ID" });
    }

    return res.json({ 
      success: true, 
      accountId: account.id,
      message: "Stripe Connect account created. Coach needs to complete onboarding."
    });
  } catch (error) {
    console.error("[STRIPE CONNECT] Create account error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Get Stripe Connect onboarding link for coach
app.get("/api/stripe/connect/account-link/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;
    
    console.log("[STRIPE CONNECT] Getting account link for coach:", coachId);

    // Get coach's stripe_account_id - select all fields to handle missing column
    const { data: coach, error: fetchError } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("id", coachId)
      .single();

    if (fetchError) {
      console.error("[STRIPE CONNECT] Database error:", fetchError);
      return res.status(500).json({ error: "Database error", details: fetchError.message });
    }
    
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

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

      await supabase
        .from("coach_applications")
        .update({ stripe_account_id: accountId })
        .eq("id", coachId);

      console.log("[STRIPE CONNECT] Created new account:", accountId);
    }

    const baseUrl = process.env.FRONTEND_URL || "https://www.touchconnectpro.com";

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
  } catch (error) {
    console.error("[STRIPE CONNECT] Account link error:", error.message, error.type || '', error.code || '');
    return res.status(500).json({ 
      error: error.message,
      type: error.type || 'unknown',
      code: error.code || 'unknown'
    });
  }
});

// Check Stripe Connect account status
app.get("/api/stripe/connect/account-status/:coachId", async (req, res) => {
  try {
    const { coachId } = req.params;

    // Select all fields to handle missing stripe_account_id column gracefully
    const { data: coach, error: fetchError } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("id", coachId)
      .single();

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

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const account = await stripe.accounts.retrieve(coach.stripe_account_id);

    return res.json({
      hasAccount: true,
      accountId: account.id,
      onboardingComplete: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      email: account.email
    });
  } catch (error) {
    console.error("[STRIPE CONNECT] Account status error:", error.message);
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

    // Get coach data including stripe_account_id and rates - use * for flexibility
    const { data: coach, error: fetchError } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("id", coachId)
      .single();

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

    let rates;
    try {
      rates = JSON.parse(coach.hourly_rate);
    } catch {
      rates = { introCallRate: coach.hourly_rate, sessionRate: coach.hourly_rate, monthlyRate: coach.hourly_rate };
    }

    let priceInCents;
    let serviceName;
    
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

    const applicationFee = Math.round(priceInCents * 0.20);

    console.log("[STRIPE CONNECT CHECKOUT] Price:", priceInCents, "Fee:", applicationFee);

    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const baseUrl = process.env.FRONTEND_URL || "https://www.touchconnectpro.com";

    // Create or retrieve customer first (required for Accounts V2 in test mode)
    let customer;
    const existingCustomers = await stripe.customers.list({ email: entrepreneurEmail, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log("[STRIPE CONNECT CHECKOUT] Found existing customer:", customer.id);
    } else {
      customer = await stripe.customers.create({ email: entrepreneurEmail });
      console.log("[STRIPE CONNECT CHECKOUT] Created new customer:", customer.id);
    }

    // All coach purchases are one-time payments (including monthly/course)
    // This simplifies Stripe Connect destination charges
    const sessionConfig = {
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
      customer: customer.id,
      metadata: {
        coach_id: coachId,
        coach_name: coach.full_name,
        service_type: serviceType,
        entrepreneur_email: entrepreneurEmail,
        entrepreneur_name: entrepreneurName || '',
        platform: 'TouchConnectPro'
      },
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: coach.stripe_account_id,
        },
      },
      success_url: `${baseUrl}/dashboard-entrepreneur?coach_payment=success&coach=${encodeURIComponent(coach.full_name)}`,
      cancel_url: `${baseUrl}/dashboard-entrepreneur?coach_payment=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

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
  } catch (error) {
    console.error("[STRIPE CONNECT CHECKOUT] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ============ END STRIPE CONNECT ============

// ============================================
// PUBLIC PARTNER API ENDPOINTS
// ============================================

// API Key validation helper
const validatePartnerApiKey = (apiKey) => {
  if (!apiKey) return false;
  const validKeys = (process.env.PARTNER_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
  return validKeys.includes(apiKey);
};

// Partner API middleware
const partnerApiAuth = (req, res, next) => {
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
    const { fullName, email, ideaName, linkedinWebsite, fullBio, country, state, formData, businessPlan } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: "fullName and email are required" });
    }

    if (!ideaName) {
      return res.status(400).json({ error: "ideaName is required" });
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from("ideas")
      .select("id, status")
      .eq("entrepreneur_email", email)
      .order("created_at", { ascending: false })
      .limit(1);

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

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        status: "submitted",
        entrepreneur_email: email,
        entrepreneur_name: fullName,
        data: dataPayload,
        business_plan: businessPlan || {},
        linkedin_profile: linkedinWebsite || "",
        user_id: null
      })
      .select();

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
  } catch (error) {
    console.error("[PUBLIC API] Entrepreneur error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/public/applications/mentors
app.post("/api/public/applications/mentors", partnerApiAuth, async (req, res) => {
  console.log("[PUBLIC API] POST /api/public/applications/mentors");
  try {
    const { fullName, email, linkedin, bio, expertise, experience, country, state } = req.body;

    if (!email || !fullName || !bio || !expertise || !experience || !country) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["fullName", "email", "bio", "expertise", "experience", "country"]
      });
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from("mentor_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const app = existing[0];
      if (app.status === "approved") {
        return res.status(409).json({ error: "Application already approved for this email" });
      }
      if (app.status === "pending" || app.status === "submitted") {
        return res.status(409).json({ error: "Pending application exists for this email" });
      }
    }

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
      console.error("[PUBLIC API] Mentor insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ 
      success: true, 
      applicationId: data?.[0]?.id,
      status: "submitted",
      message: "Mentor application submitted successfully"
    });
  } catch (error) {
    console.error("[PUBLIC API] Mentor error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/public/applications/coaches
app.post("/api/public/applications/coaches", partnerApiAuth, async (req, res) => {
  console.log("[PUBLIC API] POST /api/public/applications/coaches");
  try {
    const { fullName, email, linkedin, bio, expertise, focusAreas, introCallRate, sessionRate, monthlyRate, hourlyRate, country, state, specializations } = req.body;

    const ratesProvided = introCallRate && sessionRate && monthlyRate;
    const legacyRateProvided = hourlyRate;
    
    if (!email || !fullName || !expertise || !focusAreas || (!ratesProvided && !legacyRateProvided) || !country || !bio) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["fullName", "email", "bio", "expertise", "focusAreas", "introCallRate", "sessionRate", "monthlyRate", "country"]
      });
    }
    
    const rateValue = ratesProvided 
      ? JSON.stringify({ introCallRate, sessionRate, monthlyRate })
      : hourlyRate;

    // Check for existing application
    const { data: existing } = await supabase
      .from("coach_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const app = existing[0];
      if (app.status === "approved") {
        return res.status(409).json({ error: "Application already approved for this email" });
      }
      if (app.status === "pending" || app.status === "submitted") {
        return res.status(409).json({ error: "Pending application exists for this email" });
      }
    }

    const { data, error } = await supabase
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
      })
      .select();

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
  } catch (error) {
    console.error("[PUBLIC API] Coach error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/public/applications/investors
app.post("/api/public/applications/investors", partnerApiAuth, async (req, res) => {
  console.log("[PUBLIC API] POST /api/public/applications/investors");
  try {
    const { fullName, email, linkedin, fundName, investmentFocus, investmentPreference, investmentAmount, country, state } = req.body;

    if (!email || !fullName || !fundName || !investmentFocus || !investmentPreference || !investmentAmount || !country) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["fullName", "email", "fundName", "investmentFocus", "investmentPreference", "investmentAmount", "country"]
      });
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from("investor_applications")
      .select("id, status")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const app = existing[0];
      if (app.status === "approved") {
        return res.status(409).json({ error: "Application already approved for this email" });
      }
      if (app.status === "pending" || app.status === "submitted") {
        return res.status(409).json({ error: "Pending application exists for this email" });
      }
    }

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
      console.error("[PUBLIC API] Investor insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ 
      success: true, 
      applicationId: data?.[0]?.id,
      status: "submitted",
      message: "Investor application submitted successfully"
    });
  } catch (error) {
    console.error("[PUBLIC API] Investor error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to add data column to mentor_applications (run once)
app.post("/api/admin/add-mentor-data-column", async (req, res) => {
  try {
    // Try to add the column if it doesn't exist
    // First, check if column exists by trying an update with it
    const testResult = await supabase
      .from("mentor_applications")
      .select("data")
      .limit(1);

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
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/public/applications/:id - Check application status
app.get("/api/public/applications/:id", partnerApiAuth, async (req, res) => {
  console.log("[PUBLIC API] GET /api/public/applications/:id");
  try {
    const { id } = req.params;
    const { type } = req.query;

    const tableMap = {
      entrepreneur: "ideas",
      mentor: "mentor_applications",
      coach: "coach_applications",
      investor: "investor_applications"
    };

    const table = tableMap[type] || "ideas";

    const { data, error } = await supabase
      .from(table)
      .select("id, status, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Application not found" });
    }

    return res.json({
      applicationId: data.id,
      status: data.status,
      createdAt: data.created_at
    });
  } catch (error) {
    console.error("[PUBLIC API] Get application error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ============ END PUBLIC PARTNER API ============

// ============================================
// CONTRACT ACCEPTANCES
// ============================================

// POST /api/contract-acceptances - Save contract acceptance
app.post("/api/contract-acceptances", async (req, res) => {
  console.log("[POST /api/contract-acceptances] Saving contract acceptance");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { email, role, contractVersion, contractText, userAgent } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!email || !role || !contractVersion || !contractText) {
      return res.status(400).json({ error: "Missing required fields: email, role, contractVersion, contractText" });
    }

    const validRoles = ['coach', 'mentor', 'investor'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role. Must be coach, mentor, or investor" });
    }

    const { data, error } = await supabase
      .from("contract_acceptances")
      .insert({
        email,
        role: role.toLowerCase(),
        contract_version: contractVersion,
        contract_text: contractText,
        ip_address: ipAddress,
        user_agent: userAgent || null,
        accepted_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("[CONTRACT] Insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("[CONTRACT] Saved for", email, role);
    return res.status(201).json({ success: true, id: data?.[0]?.id });
  } catch (error) {
    console.error("[CONTRACT] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/contract-acceptances - Get all contract acceptances (admin)
app.get("/api/contract-acceptances", async (req, res) => {
  console.log("[GET /api/contract-acceptances] Fetching all contracts");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { role } = req.query;

    let query = supabase
      .from("contract_acceptances")
      .select("*")
      .order("accepted_at", { ascending: false });

    if (role && role !== 'all') {
      query = query.eq("role", role.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[CONTRACT] Fetch error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    console.error("[CONTRACT] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/contract-acceptances/user/:email - Get user's contract acceptances
app.get("/api/contract-acceptances/user/:email", async (req, res) => {
  console.log("[GET /api/contract-acceptances/user] Fetching user contracts");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { email } = req.params;

    const { data, error } = await supabase
      .from("contract_acceptances")
      .select("*")
      .eq("email", email)
      .order("accepted_at", { ascending: false });

    if (error) {
      console.error("[CONTRACT] Fetch error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    console.error("[CONTRACT] Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN AUTHENTICATION ENDPOINTS
// ============================================

// POST /api/admin/login - Admin login
app.post("/api/admin/login", async (req, res) => {
  console.log("[POST /api/admin/login] Admin login attempt");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !admin) {
      console.log("[ADMIN] Login failed - user not found:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      console.log("[ADMIN] Login failed - wrong password:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        admin_id: admin.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error("[ADMIN] Session creation error:", sessionError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    console.log("[ADMIN] Login successful:", email);
    return res.json({
      success: true,
      token: sessionToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error("[ADMIN] Login error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/verify - Verify admin session
app.post("/api/admin/verify", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session) {
      return res.json({ valid: false });
    }

    return res.json({
      valid: true,
      admin: {
        id: session.admin_users.id,
        email: session.admin_users.email,
        name: session.admin_users.name
      }
    });
  } catch (error) {
    console.error("[ADMIN] Verify error:", error.message);
    return res.status(500).json({ valid: false });
  }
});

// POST /api/admin/logout - Admin logout
app.post("/api/admin/logout", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { token } = req.body;

    if (token) {
      await supabase
        .from("admin_sessions")
        .delete()
        .eq("token", token);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[ADMIN] Logout error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/create - Create new admin (requires existing admin token)
app.post("/api/admin/create", async (req, res) => {
  console.log("[POST /api/admin/create] Creating new admin");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { token, email, password, name } = req.body;

    // Verify requesting user is an admin
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    // Hash password and create admin
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newAdmin, error: createError } = await supabase
      .from("admin_users")
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: name || email.split("@")[0]
      })
      .select()
      .single();

    if (createError) {
      console.error("[ADMIN] Create error:", createError);
      return res.status(500).json({ error: "Failed to create admin" });
    }

    console.log("[ADMIN] New admin created:", email);
    return res.json({
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name
      }
    });
  } catch (error) {
    console.error("[ADMIN] Create error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/list - List all admins (requires admin token)
app.get("/api/admin/list", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    // Verify requesting user is an admin
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: admins, error } = await supabase
      .from("admin_users")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(admins || []);
  } catch (error) {
    console.error("[ADMIN] List error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/update-user-email - Update user email (requires admin token)
app.patch("/api/admin/update-user-email", async (req, res) => {
  console.log("[PATCH /api/admin/update-user-email] Updating user email");
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userType, userId, newEmail } = req.body;

    // Verify requesting user is an admin
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single();

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
    const tableConfig = {
      entrepreneur: { table: "ideas", emailColumn: "entrepreneur_email" },
      mentor: { table: "mentor_applications", emailColumn: "email" },
      coach: { table: "coach_applications", emailColumn: "email" },
      investor: { table: "investor_applications", emailColumn: "email" }
    };

    const config = tableConfig[userType];
    if (!config) {
      return res.status(400).json({ error: "Invalid userType. Must be entrepreneur, mentor, coach, or investor" });
    }

    // Check if new email already exists in this table
    const { data: existingUser, error: checkError } = await supabase
      .from(config.table)
      .select("id")
      .eq(config.emailColumn, newEmail.toLowerCase())
      .neq("id", userId)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: `A ${userType} with this email already exists` });
    }

    // Update the email
    const updateData = {};
    updateData[config.emailColumn] = newEmail.toLowerCase();

    const { data, error } = await supabase
      .from(config.table)
      .update(updateData)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("[ADMIN] Update email error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[ADMIN] Updated ${userType} email for ID ${userId} to ${newEmail}`);
    return res.json({ success: true, user: data[0] });
  } catch (error) {
    console.error("[ADMIN] Update email error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING");
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Set" : "MISSING");
  console.log("Stripe routes: /api/stripe/create-checkout-session, /api/stripe/confirm-payment, /api/stripe/webhook");
});
