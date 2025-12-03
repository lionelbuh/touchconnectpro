import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

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

      console.log("[INSERT] Saving to ideas table for:", email);
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

  // Approve/reject idea
  app.patch("/api/ideas/:id", async (req, res) => {
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

  return httpServer;
}
