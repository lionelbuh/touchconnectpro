import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json({ limit: "10mb" }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

    const { data, error } = await supabase
      .from("ideas")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true, idea: data?.[0] });
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

// Save mentor application
app.post("/api/mentors", async (req, res) => {
  console.log("[POST /api/mentors] Called");
  try {
    const { fullName, email, linkedin, bio, expertise, experience, country, state } = req.body;

    if (!email || !fullName || !bio || !expertise || !experience || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("[INSERT] Saving mentor application for:", email);
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

// Get all mentor applications (for admin)
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

// Approve/reject mentor
app.patch("/api/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("mentor_applications")
      .update({ status })
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

// ============ COACH ENDPOINTS ============

// Save coach application
app.post("/api/coaches", async (req, res) => {
  console.log("[POST /api/coaches] Called");
  try {
    const { fullName, email, linkedin, expertise, focusAreas, hourlyRate, country, state } = req.body;

    if (!email || !fullName || !expertise || !focusAreas || !hourlyRate || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("[INSERT] Saving coach application for:", email);
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

// Get all coach applications (for admin)
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

// Approve/reject coach
app.patch("/api/coaches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("coach_applications")
      .update({ status })
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

// ============ INVESTOR ENDPOINTS ============

// Save investor application
app.post("/api/investors", async (req, res) => {
  console.log("[POST /api/investors] Called");
  try {
    const { fullName, email, linkedin, fundName, investmentFocus, investmentPreference, investmentAmount, country, state } = req.body;

    if (!email || !fullName || !fundName || !investmentFocus || !investmentPreference || !investmentAmount || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("[INSERT] Saving investor application for:", email);
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

// Get all investor applications (for admin)
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

// Approve/reject investor
app.patch("/api/investors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const { data, error } = await supabase
      .from("investor_applications")
      .update({ status })
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

app.get("/", (req, res) => {
  return res.json({ 
    message: "TouchConnectPro Backend API",
    endpoints: ["/api/submit", "/api/ideas", "/api/mentors", "/api/coaches", "/api/investors", "/api/test"]
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Loaded" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "MISSING");
});
