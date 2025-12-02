import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Save entrepreneur idea submission
  app.post("/api/ideas", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { fullName, email, ideaName, businessPlan, ideaReview, linkedinWebsite, formData } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Insert into ideas table
      const { data, error } = await supabase
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
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, idea: data?.[0] });
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all ideas (for admin)
  app.get("/api/ideas", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { data, error } = await supabase
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
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data, error } = await supabase
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
