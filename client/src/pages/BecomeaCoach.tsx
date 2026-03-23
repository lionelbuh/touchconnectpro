import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, CheckCircle, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/config";
import { COACH_CONTRACT, CONTRACT_VERSION } from "@/lib/contracts";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "India", "Japan", "Brazil", "Mexico", "Singapore", "Netherlands", "Switzerland",
  "Sweden", "Ireland", "Israel", "South Korea", "New Zealand", "Spain", "Italy",
  "Portugal", "China", "Argentina", "Colombia", "Chile", "Peru", "Thailand", "Philippines",
  "Vietnam", "Indonesia", "Malaysia", "Hong Kong", "Pakistan", "Bangladesh"
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia"
];

const EXPERTISE_OPTIONS = [
  "Business Planning",
  "Pitch Preparation",
  "Market Research",
  "Product Development",
  "Marketing Strategy",
  "Sales & Go-to-Market",
  "Fundraising & Investor Relations",
  "Financial Planning",
  "Operations & Scaling",
  "Tech & Engineering",
  "Legal & Compliance",
  "HR & Team Building",
  "Customer Discovery",
  "Brand Strategy",
  "Digital Marketing",
  "Content Marketing",
  "Social Media Strategy",
  "Customer Support",
  "Growth Hacking",
  "Data Analysis"
];

const FOCUS_AREAS_OPTIONS = [
  "Business Strategy",
  "Pitching & Fundraising",
  "Product & Technology",
  "Product Marketing",
  "Marketing & Brand",
  "Sales & Growth",
  "Finance & Analytics",
  "People & Operations",
  "Legal & Compliance",
  "Customer Experience"
];

export default function BecomeaCoach() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    linkedin: string;
    bio: string;
    expertise: string[];
    focusAreas: string;
    introCallRate: string;
    sessionRate: string;
    monthlyRate: string;
    monthlyRetainerDescription: string;
    country: string;
    state: string;
    externalPlatform: string;
    externalRating: string;
    externalReviewCount: string;
    externalProfileUrl: string;
  }>({
    fullName: "",
    email: "",
    linkedin: "",
    bio: "",
    expertise: [] as string[],
    focusAreas: "",
    introCallRate: "",
    sessionRate: "",
    monthlyRate: "",
    monthlyRetainerDescription: "",
    country: "",
    state: "",
    externalPlatform: "",
    externalRating: "",
    externalReviewCount: "",
    externalProfileUrl: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [contractAgreed, setContractAgreed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpertiseChange = (selectedOptions: HTMLCollection) => {
    const selected = Array.from(selectedOptions).map((option: any) => option.value);
    setFormData(prev => ({ ...prev, expertise: selected as string[] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Coach form submitted, validating...", formData);
    
    if (!formData.fullName || !formData.email || !formData.bio || !Array.isArray(formData.expertise) || formData.expertise.length === 0 || !formData.focusAreas || !formData.introCallRate || !formData.sessionRate || !formData.monthlyRate || !formData.country) {
      alert("Please fill in all required fields including your bio, all rate types, and select at least one area of expertise");
      console.log("Validation failed", { fullName: formData.fullName, email: formData.email, bio: formData.bio, expertise: formData.expertise, focusAreas: formData.focusAreas, introCallRate: formData.introCallRate, sessionRate: formData.sessionRate, monthlyRate: formData.monthlyRate, country: formData.country });
      return;
    }
    // External reputation is optional, but if any field is filled, all must be filled
    const hasAnyExternalField = formData.externalPlatform || formData.externalRating || formData.externalReviewCount || formData.externalProfileUrl;
    const hasAllExternalFields = formData.externalPlatform && formData.externalRating && formData.externalReviewCount && formData.externalProfileUrl;
    if (hasAnyExternalField && !hasAllExternalFields) {
      alert("If you provide any External Reputation information, all fields are required (Platform, Rating, Review Count, and Profile URL).");
      return;
    }
    if (!contractAgreed) {
      alert("Please read and agree to the Coach Platform Agreement to submit your application");
      return;
    }
    if (formData.country === "United States" && !formData.state) {
      alert("Please provide your state");
      return;
    }
    
    try {
      const submitData: any = {
        ...formData,
        expertise: formData.expertise.join(", "),
      };
      
      // Only include externalReputation if all fields are provided
      if (hasAllExternalFields) {
        submitData.externalReputation = {
          platform_name: formData.externalPlatform,
          average_rating: parseFloat(formData.externalRating) || 0,
          review_count: parseInt(formData.externalReviewCount) || 0,
          profile_url: formData.externalProfileUrl,
          verified: false
        };
      }
      console.log("Submitting to:", `${API_BASE_URL}/api/coaches`);
      console.log("Submit data:", submitData);
      
      const response = await fetch(`${API_BASE_URL}/api/coaches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: "coach",
          contractVersion: CONTRACT_VERSION,
          contractText: COACH_CONTRACT,
          userAgent: navigator.userAgent
        }),
      });

      console.log("Submit successful!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Coach submission error:", error);
      alert("Error submitting application: " + error.message);
    }
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setFormData({ fullName: "", email: "", linkedin: "", bio: "", expertise: [], focusAreas: "", introCallRate: "", sessionRate: "", monthlyRate: "", monthlyRetainerDescription: "", country: "", state: "", externalPlatform: "", externalRating: "", externalReviewCount: "", externalProfileUrl: "" });
    setContractAgreed(false);
  };

  const inputStyle = {
    background: "#FAF9F6",
    border: "1px solid rgba(26,24,20,0.15)",
    borderRadius: 8,
    color: "#1A1814",
    padding: "10px 12px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#4A4740",
    marginBottom: 6,
  };

  return (
    <div style={{ background: "#FAF8F3", minHeight: "100vh" }}>
      {/* Thank You Modal */}
      <Dialog open={submitted} onOpenChange={handleCloseModal}>
        <DialogContent style={{ background: "white", border: "1px solid rgba(26,24,20,0.12)" }}>
          <DialogHeader>
            <DialogTitle style={{ textAlign: "center", fontFamily: "Georgia, serif", fontWeight: 300, fontSize: 22, color: "#1A1814", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <CheckCircle style={{ color: "#1D6A5A", width: 28, height: 28 }} />
              Application Received
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ textAlign: "center", fontSize: 15, color: "#4A4740" }}>
              Your specialist application has been received.
            </p>
            <p style={{ textAlign: "center", fontSize: 14, color: "#8C8880" }}>
              Our team will review your application and get back to you within <strong style={{ color: "#1A1814" }}>24–48 hours</strong>. We look forward to having you join the TouchConnectPro specialist network.
            </p>
          </div>
          <Button
            onClick={handleCloseModal}
            style={{ background: "#1D6A5A", color: "white", border: "none" }}
            data-testid="button-thank-you-ok-coach"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <section style={{ padding: "72px 24px 64px", borderBottom: "1px solid rgba(26,24,20,0.08)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#E4F0ED", color: "#1D6A5A", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
            <Star style={{ width: 13, height: 13 }} /> Join Our Specialist Network
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 44, fontWeight: 300, color: "#1A1814", lineHeight: 1.15, marginBottom: 18 }}>
            Become a Specialist on<br />
            <em style={{ fontStyle: "italic", color: "#C49A3C" }}>TouchConnectPro</em>
          </h1>
          <p style={{ fontSize: 18, color: "#4A4740", lineHeight: 1.6 }}>
            Share your expertise. Advise founders. Earn by helping businesses grow.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Introduction */}
          <div style={{ background: "#E4F0ED", border: "1px solid rgba(29,106,90,0.15)", borderRadius: 12, padding: "36px 40px", marginBottom: 56 }}>
            <p style={{ fontSize: 17, color: "#1A1814", lineHeight: 1.7, marginBottom: 12 }}>
              TouchConnectPro is building a network of specialist advisors — accountants, legal professionals, marketers, product experts, and pitch coaches — matched to founders based on their diagnostic results.
            </p>
            <p style={{ fontSize: 17, color: "#4A4740", lineHeight: 1.7 }}>
              As a specialist, you bring targeted expertise to founders who already know what gap they need to fill. No cold pitching. No guesswork. Just focused, valuable work.
            </p>
          </div>

          {/* Who We're Looking For */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 8 }}>Who We're Looking For</h2>
            <p style={{ fontSize: 15, color: "#8C8880", marginBottom: 28 }}>We invite specialists with strong backgrounds in fields such as:</p>
            <div className="grid md:grid-cols-2" style={{ gap: 12 }}>
              {[
                "Startup experience, product development, or growth strategy",
                "Corporate expertise, scaling, operations, or management",
                "Finance, legal, marketing, or go-to-market skills",
                "UX, branding, storytelling, design, or development",
                "Any skill that helps entrepreneurs overcome real business challenges"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "white", border: "1px solid rgba(26,24,20,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                  <Check style={{ width: 18, height: 18, color: "#1D6A5A", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: "#4A4740", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#FAF3E0", border: "1px solid rgba(196,154,60,0.2)", borderRadius: 10, padding: "20px 24px", marginTop: 20 }}>
              <p style={{ fontSize: 15, color: "#1A1814" }}>
                <strong>If you've built, launched, failed, learned, or succeeded</strong> — you have something valuable to teach.
              </p>
            </div>
          </div>

          {/* What You'll Do */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 8 }}>What You'll Do as a Specialist</h2>
            <p style={{ fontSize: 15, color: "#8C8880", marginBottom: 24 }}>As a TouchConnectPro Specialist, you will:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "💼", title: "Offer paid advisory sessions, workshops, or structured engagements" },
                { icon: "📈", title: "Set your own pricing and availability" },
                { icon: "📝", title: "Receive a public specialist profile so founders can reach you directly" },
                { icon: "🤝", title: "Receive matched introductions based on founder diagnostic results" },
                { icon: "📅", title: "Decide how many engagements you take on — total flexibility" }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "white", border: "1px solid rgba(26,24,20,0.08)", borderRadius: 10, padding: "14px 18px" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: 14, color: "#4A4740", lineHeight: 1.5 }}>{item.title}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "white", border: "1px solid rgba(26,24,20,0.08)", borderRadius: 10, padding: "20px 24px", marginTop: 16 }}>
              <p style={{ fontSize: 15, color: "#4A4740", lineHeight: 1.6, marginBottom: 8 }}>
                Founders browse specialist profiles, compare expertise, and reach out based on their diagnostic gap — pre-qualified before they ever contact you.
              </p>
              <p style={{ fontSize: 15, color: "#1A1814", fontWeight: 500 }}>
                You advise — we bring you the right founders.
              </p>
            </div>
          </div>

          {/* Earnings */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 24 }}>Earnings & Revenue Structure</h2>
            <div style={{ background: "#E4F0ED", border: "1px solid rgba(29,106,90,0.15)", borderRadius: 12, padding: "36px 40px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 16, color: "#1A1814", lineHeight: 1.6 }}>
                  <strong>You choose your price.</strong> Entrepreneurs pay your full session rate.
                </p>
                <p style={{ fontSize: 16, color: "#1A1814", lineHeight: 1.6 }}>
                  <strong>TouchConnectPro retains 20% commission to operate the platform —</strong> you keep 80%.
                </p>
                <div style={{ borderTop: "1px solid rgba(29,106,90,0.15)", paddingTop: 20 }}>
                  <p style={{ fontSize: 16, color: "#4A4740", lineHeight: 1.6 }}>
                    <strong>No subscription. No pay-to-be-listed.</strong> We only earn when you do.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Partner */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 28 }}>Why Partner With TouchConnectPro?</h2>
            <div className="grid md:grid-cols-2" style={{ gap: 12 }}>
              {[
                "Earn revenue from your expertise with no upfront cost",
                "No cold outreach — founders are matched to you by gap",
                "Build your reputation as a trusted specialist",
                "Work with pre-qualified founders who know what they need",
                "Flexible engagements — take on as much or as little as you want"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "white", border: "1px solid rgba(26,24,20,0.08)", borderRadius: 10, padding: "14px 16px" }}>
                  <Check style={{ width: 18, height: 18, color: "#1D6A5A", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: "#4A4740", lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#FAF3E0", border: "1px solid rgba(196,154,60,0.2)", borderRadius: 10, padding: "20px 24px", marginTop: 16 }}>
              <p style={{ fontSize: 15, color: "#1A1814", lineHeight: 1.6 }}>
                For many specialists, <strong>revenue is great — but the real reward is watching founders level up through your knowledge.</strong>
              </p>
            </div>
          </div>

          {/* Quality Standards */}
          <div style={{ marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 20 }}>Our Quality Standards</h2>
            <div style={{ background: "#FAF3E0", border: "1px solid rgba(196,154,60,0.2)", borderRadius: 12, padding: "28px 36px" }}>
              <p style={{ fontSize: 15, color: "#4A4740", lineHeight: 1.7 }}>
                TouchConnectPro values a positive and reliable coaching experience for all users. If a specialist's rating drops below 3 stars out of 5, we may pause or deactivate the account until quality standards are met again.
              </p>
            </div>
          </div>

          {/* CTA / Form */}
          {!showForm ? (
            <div style={{ background: "#1A1814", borderRadius: 16, padding: "56px 48px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, fontWeight: 300, color: "#FAF8F3", marginBottom: 16 }}>
                Ready to Become a Specialist?
              </h2>
              <p style={{ fontSize: 16, color: "rgba(250,248,243,0.65)", marginBottom: 12, maxWidth: 520, margin: "0 auto 12px" }}>
                If you have deep expertise in any area founders need — accounting, legal, marketing, product, pitch — we'd love to learn more about you.
              </p>
              <p style={{ fontSize: 13, color: "rgba(250,248,243,0.35)", marginBottom: 32 }}>
                We review every application. You'll hear back within a week.
              </p>
              <button
                onClick={() => setShowForm(true)}
                data-testid="button-apply-coach"
                style={{ background: "#C49A3C", color: "#1A1814", border: "none", borderRadius: 100, padding: "14px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", transition: "opacity 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                Apply to Join as a Specialist <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          ) : (
            <div style={{ background: "white", border: "1px solid rgba(26,24,20,0.10)", borderRadius: 16, padding: "48px 44px" }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 300, color: "#1A1814", marginBottom: 6 }}>Complete Your Specialist Profile</h2>
              <p style={{ fontSize: 14, color: "#8C8880", marginBottom: 36 }}>Tell us about your expertise. Our team will review and contact you within 48 hours.</p>

              {submitted ? (
                <div style={{ background: "#E4F0ED", border: "1px solid rgba(29,106,90,0.2)", borderRadius: 10, padding: 24, textAlign: "center" }}>
                  <p style={{ color: "#1D6A5A", fontWeight: 500, marginBottom: 6 }}>Application Submitted!</p>
                  <p style={{ fontSize: 14, color: "#4A4740" }}>We'll review your profile and get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Your full name" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-fullname" />
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-email" />
                  </div>

                  <div>
                    <label style={labelStyle}>LinkedIn Profile <span style={{ color: "#8C8880", fontWeight: 400 }}>(optional)</span></label>
                    <Input name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/xxx" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-linkedin" />
                  </div>

                  <div>
                    <label style={labelStyle}>Bio — Introduce Yourself *</label>
                    <Textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell entrepreneurs about yourself, your background, and what makes you a great specialist. This will be displayed on your public profile." className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)] min-h-[120px]" data-testid="input-coach-bio" />
                    <p style={{ fontSize: 12, color: "#8C8880", marginTop: 6 }}>This bio will be visible to entrepreneurs browsing specialists</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Areas of Expertise * <span style={{ color: "#8C8880", fontWeight: 400 }}>(select one or more)</span></label>
                    <select
                      multiple
                      value={formData.expertise}
                      onChange={(e) => handleExpertiseChange(e.target.selectedOptions)}
                      style={{ ...inputStyle, minHeight: 120 }}
                      data-testid="select-coach-expertise"
                    >
                      {EXPERTISE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: 12, color: "#8C8880", marginTop: 6 }}>Hold Ctrl/Cmd to select multiple options</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Focus Areas / Specialization *</label>
                    <select name="focusAreas" value={formData.focusAreas} onChange={handleInputChange} style={inputStyle} data-testid="select-coach-focusareas">
                      <option value="">Select your focus area</option>
                      {FOCUS_AREAS_OPTIONS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Your Rates *</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>15-Minute Introductory Call *</label>
                        <Input name="introCallRate" type="number" value={formData.introCallRate} onChange={handleInputChange} placeholder="e.g., 25" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-introcallrate" />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Per Session *</label>
                        <Input name="sessionRate" type="number" value={formData.sessionRate} onChange={handleInputChange} placeholder="e.g., 150" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-sessionrate" />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Monthly Coaching Retainer *</label>
                        <Input name="monthlyRate" type="number" value={formData.monthlyRate} onChange={handleInputChange} placeholder="e.g., 500" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-monthlyrate" />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Monthly Retainer Description <span style={{ fontWeight: 400, color: "#8C8880" }}>(optional)</span></label>
                        <Textarea name="monthlyRetainerDescription" value={formData.monthlyRetainerDescription} onChange={handleInputChange} placeholder="Describe what's included (e.g., number of sessions, email support, resources...)" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)] min-h-[80px]" data-testid="input-coach-monthly-retainer-description" />
                      </div>
                      <p style={{ fontSize: 12, color: "#8C8880" }}>TouchConnectPro retains 20% commission — you keep 80% of your earnings</p>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={(e) => {
                        handleInputChange(e as any);
                        if (e.target.value !== "United States") setFormData(prev => ({ ...prev, state: "" }));
                      }}
                      style={inputStyle}
                      data-testid="select-coach-country"
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {formData.country === "United States" && (
                    <div>
                      <label style={labelStyle}>State *</label>
                      <select name="state" value={formData.state} onChange={handleInputChange} style={inputStyle} data-testid="select-coach-state">
                        <option value="">Select your state</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {/* External Reputation */}
                  <div style={{ paddingTop: 20, borderTop: "1px solid rgba(26,24,20,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Star style={{ width: 16, height: 16, color: "#C49A3C" }} />
                      <label style={{ ...labelStyle, marginBottom: 0 }}>External Reputation / Ratings <span style={{ fontWeight: 400, color: "#8C8880" }}>(optional)</span></label>
                    </div>
                    <p style={{ fontSize: 13, color: "#8C8880", marginBottom: 16, lineHeight: 1.5 }}>
                      If you have ratings on another platform (e.g., MentorCruise), share them here for verification. If you fill any field, all fields become required. These links will never be shown publicly.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Platform Name</label>
                        <Input name="externalPlatform" value={formData.externalPlatform} onChange={handleInputChange} placeholder="e.g., MentorCruise, Clarity.fm, GrowthMentor" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-external-platform" />
                      </div>
                      <div className="grid grid-cols-2" style={{ gap: 12 }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Average Rating</label>
                          <Input name="externalRating" type="number" step="0.1" min="1" max="5" value={formData.externalRating} onChange={handleInputChange} placeholder="e.g., 4.9" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-external-rating" />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>Number of Reviews</label>
                          <Input name="externalReviewCount" type="number" min="1" value={formData.externalReviewCount} onChange={handleInputChange} placeholder="e.g., 37" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-external-review-count" />
                        </div>
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 12, color: "#8C8880" }}>External Profile URL <span style={{ fontWeight: 400 }}>(for verification only)</span></label>
                        <Input name="externalProfileUrl" type="url" value={formData.externalProfileUrl} onChange={handleInputChange} placeholder="https://mentorcruise.com/mentor/yourname" className="bg-[#FAF9F6] border-[rgba(26,24,20,0.15)]" data-testid="input-coach-external-url" />
                        <p style={{ fontSize: 12, color: "#C49A3C", marginTop: 4 }}>This link will never be shown to entrepreneurs — it's only for our team to verify your ratings.</p>
                      </div>
                    </div>
                  </div>

                  {/* Contract */}
                  <div style={{ paddingTop: 20, borderTop: "1px solid rgba(26,24,20,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <FileText style={{ width: 16, height: 16, color: "#1D6A5A" }} />
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Specialist Platform Agreement *</label>
                    </div>
                    <ScrollArea className="h-64 rounded-lg border p-4" style={{ background: "#FAF9F6", borderColor: "rgba(26,24,20,0.12)" }}>
                      <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed" style={{ color: "#4A4740" }}>
                        {COACH_CONTRACT}
                      </pre>
                    </ScrollArea>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14 }}>
                      <Checkbox
                        id="contract-agreement"
                        checked={contractAgreed}
                        onCheckedChange={(checked) => setContractAgreed(checked === true)}
                        data-testid="checkbox-coach-contract"
                      />
                      <label htmlFor="contract-agreement" style={{ fontSize: 13, color: "#4A4740", cursor: "pointer", lineHeight: 1.5 }}>
                        I have read and agree to the <span style={{ fontWeight: 500, color: "#1D6A5A" }}>Specialist Platform Agreement</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                    <Button variant="outline" style={{ flex: 1, borderColor: "rgba(26,24,20,0.15)", color: "#4A4740" }} onClick={() => setShowForm(false)} data-testid="button-cancel-coach-form">Cancel</Button>
                    <Button type="submit" style={{ flex: 1, background: "#1D6A5A", color: "white", border: "none", opacity: contractAgreed ? 1 : 0.5 }} disabled={!contractAgreed} data-testid="button-submit-coach-form">Submit Application</Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
