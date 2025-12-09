import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

let supabase: ReturnType<typeof createClient> | null = null;
let resendClient: Resend | null = null;

async function getResendClient(): Promise<{ client: Resend; fromEmail: string } | null> {
  try {
    if (resendClient) {
      return {
        client: resendClient,
        fromEmail: process.env.RESEND_FROM_EMAIL || "hello@touchconnectpro.com"
      };
    }

    // First try direct RESEND_API_KEY (for production deployments like Render)
    if (process.env.RESEND_API_KEY) {
      console.log("[RESEND] Using RESEND_API_KEY environment variable");
      resendClient = new Resend(process.env.RESEND_API_KEY);
      return {
        client: resendClient,
        fromEmail: process.env.RESEND_FROM_EMAIL || "hello@touchconnectpro.com"
      };
    }

    // Fallback to Replit connectors (for development on Replit)
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
      console.log("[RESEND] Failed to fetch connection settings");
      return null;
    }

    const connections = await response.json();
    const connectionSettings = connections?.items?.[0];

    if (!connectionSettings?.settings?.api_key) {
      console.log("[RESEND] No API key found in connection settings");
      return null;
    }

    resendClient = new Resend(connectionSettings.settings.api_key);
    return {
      client: resendClient,
      fromEmail: connectionSettings.settings.from_email || "hello@touchconnectpro.com"
    };
  } catch (error) {
    console.error("[RESEND] Error getting client:", error);
    return null;
  }
}

function getSupabaseClient() {
  try {
    if (supabase) return supabase;
    
    const supabaseUrl = "https://mfkxbjtrxwajlyxnxzdn.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("[Supabase] URL:", supabaseUrl ? "✓" : "✗");
    console.log("[Supabase] Key present:", supabaseServiceKey ? "✓" : "✗");
    console.log("[Supabase] Key starts with:", supabaseServiceKey?.substring(0, 10));
    
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

  // BYPASS TEST - minimal test endpoint
  app.get("/api/bypass-test", (_req, res) => {
    console.log("[BYPASS TEST] Endpoint hit, sending response...");
    return res.json({ test: "bypass", timestamp: Date.now() });
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
        
        // If rejected, update the existing record to allow resubmission
        if (existing.status === "rejected") {
          console.log("[UPDATE] Resubmitting rejected entrepreneur application for:", email);
          const { data, error } = await (client
            .from("ideas")
            .update({
              entrepreneur_name: fullName,
              data: formData || {},
              business_plan: businessPlan || {},
              linkedin_profile: linkedinWebsite || "",
              status: "submitted",
              resubmitted_at: new Date().toISOString()
            } as any)
            .eq("id", existing.id)
            .select() as any);

          if (error) {
            console.error("[DB ERROR]:", error);
            return res.status(400).json({ error: error.message });
          }

          console.log("[SUCCESS] Entrepreneur application resubmitted");
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

      if (!["approved", "rejected", "pre-approved"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data, error } = await (client
        .from("ideas")
        .update({ status } as any)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, idea: data?.[0] });
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

      if (!["approved", "rejected"].includes(status)) {
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
      const { bio, expertise, experience, linkedin } = req.body;

      console.log("[PUT /api/mentors/profile/:id] Updating profile:", id);

      const { data, error } = await (client
        .from("mentor_applications")
        .update({
          bio,
          expertise,
          experience,
          linkedin: linkedin || null
        } as any)
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

      // Fetch mentor profile
      const { data: mentor, error: mentorError } = await (client
        .from("mentor_applications")
        .select("*")
        .eq("id", assignment.mentor_id)
        .single() as any);

      if (mentorError || !mentor) {
        return res.json({ mentor: null });
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
          photo_url: mentor.photo_url || mentor.photoUrl
        },
        portfolio_number: assignment.portfolio_number,
        meeting_link: assignment.meeting_link
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Update mentor assignment (e.g., meeting link)
  app.patch("/api/mentor-assignments/:id", async (req, res) => {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { meetingLink, status } = req.body;

      const updates: any = {};
      if (meetingLink !== undefined) updates.meeting_link = meetingLink;
      if (status !== undefined) updates.status = status;

      const { data, error } = await (client
        .from("mentor_assignments")
        .update(updates)
        .eq("id", id)
        .select() as any);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, assignment: data?.[0] });
    } catch (error: any) {
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

      // Get entrepreneur's idea/application
      const { data: ideaData, error: ideaError } = await (client
        .from("ideas")
        .select("*")
        .eq("entrepreneur_email", decodedEmail)
        .single() as any);

      if (ideaError || !ideaData) {
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
            photo_url: mentorData.photo_url || mentorData.photoUrl || ""
          };
        }

        // Get mentor notes
        const { data: notesData } = await (client
          .from("mentor_notes")
          .select("*")
          .eq("entrepreneur_id", ideaData.id)
          .order("created_at", { ascending: true }) as any);
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
      const { expertise, focusAreas, hourlyRate, linkedin } = req.body;

      const { data, error } = await (client
        .from("coach_applications")
        .update({
          expertise,
          focus_areas: focusAreas,
          hourly_rate: hourlyRate,
          linkedin: linkedin || null
        } as any)
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
      const { fundName, investmentFocus, investmentPreference, investmentAmount, linkedin } = req.body;

      const { data, error } = await (client
        .from("investor_applications")
        .update({
          fund_name: fundName,
          investment_focus: investmentFocus,
          investment_preference: investmentPreference,
          investment_amount: investmentAmount,
          linkedin: linkedin || null
        } as any)
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
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #06b6d4;">New Early Access Signup</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              </div>
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

  return httpServer;
}
