import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  try {
    if (supabase) return supabase;
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("Supabase URL present:", !!supabaseUrl);
    console.log("Supabase Key present:", !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials - URL:", supabaseUrl ? "set" : "missing", "KEY:", supabaseServiceKey ? "set" : "missing");
      return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized successfully");
    return supabase;
  } catch (err: any) {
    console.error("Failed to initialize Supabase client:", err.message);
    return null;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Save entrepreneur idea submission
  app.post("/api/ideas", async (req, res) => {
    try {
      console.log("POST /api/ideas called");
      const client = getSupabaseClient();
      if (!client) {
        console.error("Supabase client not available");
        return res.status(500).json({ error: "Supabase not configured. Check server logs." });
      }

      const { fullName, email, ideaName, businessPlan, ideaReview, linkedinWebsite, formData } = req.body;

      if (!email || !fullName) {
        console.error("Missing required fields:", { fullName, email });
        return res.status(400).json({ error: "Missing required fields: name and email" });
      }

      console.log("Inserting idea for:", email);
      // Insert into ideas table
      const { data, error } = await client
        .from("ideas")
        .insert({
          status: "pending",
          entrepreneur_email: email,
          entrepreneur_name: fullName,
          idea_data: formData || {},
          business_plan: businessPlan || {},
          linkedin_profile: linkedinWebsite || "",
          user_id: null,
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(400).json({ error: `Database error: ${error.message}` });
      }

      console.log("Idea inserted successfully");
      res.json({ success: true, idea: data?.[0] });
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: `Server error: ${error.message}` });
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

  return httpServer;
}
