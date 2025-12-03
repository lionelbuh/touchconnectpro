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
    res.json({ test: "bypass", timestamp: Date.now() });
  });

  // Save entrepreneur idea submission
  app.post("/api/ideas", async (req, res) => {
    console.log("POST /api/ideas called");
    console.log("Body:", JSON.stringify(req.body));
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.error("Supabase client not available");
        console.error("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fullName, email, ideaName, businessPlan, ideaReview, linkedinWebsite, formData } = req.body;

      if (!email || !fullName) {
        console.error("Missing required fields");
        return res.status(400).json({ error: "Name and email required" });
      }

      console.log("Inserting idea for:", email);
      const { data, error } = await client
        .from("ideas")
        .insert({
          status: "submitted",
          entrepreneur_email: email,
          entrepreneur_name: fullName,
          data: formData || {},
          business_plan: businessPlan || {},
          linkedin_profile: linkedinWebsite || "",
          user_id: null,
        })
        .select();

      if (error) {
        console.error("DB error:", error);
        console.error("Full error details:", JSON.stringify(error));
        return res.status(400).json({ error: error.message });
      }

      console.log("Success - idea saved, data:", JSON.stringify(data));
      console.log("Data array length:", Array.isArray(data) ? data.length : "not array");
      console.log("First item id:", data?.[0]?.id);
      const response = { success: true, id: data?.[0]?.id };
      console.log("Sending response:", JSON.stringify(response));
      console.log("About to call res.json...");
      res.json(response);
      console.log("res.json called, function exiting");
      return;
    } catch (error: any) {
      console.error("Exception:", error);
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

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      const { data, error } = await client
        .from("ideas")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, idea: data?.[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      // Test 2: Count users
      const { data: users, error: usersError } = await client
        .from("users")
        .select("id", { count: "exact" });

      if (usersError) {
        return res.status(400).json({ 
          error: "Failed to query users",
          details: usersError.message 
        });
      }

      return res.status(200).json({
        status: "✓ Connected to Supabase",
        ideas_count: ideas?.length || 0,
        users_count: users?.length || 0,
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
