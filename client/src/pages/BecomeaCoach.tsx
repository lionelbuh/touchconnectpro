import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp, Mail, ArrowRight, CheckCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/config";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "India", "Japan", "Brazil", "Mexico", "Singapore", "Netherlands", "Switzerland",
  "Sweden", "Ireland", "Israel", "South Korea", "New Zealand", "Spain", "Italy",
  "China", "Argentina", "Colombia", "Chile", "Peru", "Thailand", "Philippines",
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
    country: string;
    state: string;
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
    country: "",
    state: ""
  });
  const [submitted, setSubmitted] = useState(false);

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
    if (formData.country === "United States" && !formData.state) {
      alert("Please provide your state");
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        expertise: formData.expertise.join(", ")
      };
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
    setFormData({ fullName: "", email: "", linkedin: "", bio: "", expertise: [], focusAreas: "", introCallRate: "", sessionRate: "", monthlyRate: "", country: "", state: "" });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Thank You Modal */}
      <Dialog open={submitted} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              Thank You!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <p className="text-center text-lg text-slate-700 dark:text-slate-300">
              Your coach application has been received.
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-400">
              Our team will review your application and get back to you within <strong>24-48 hours</strong>. We look forward to having you join the TouchConnectPro coaching team!
            </p>
          </div>
          <Button
            onClick={handleCloseModal}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold"
            data-testid="button-thank-you-ok-coach"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-cyan-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30">
              <Star className="inline-block mr-2 h-4 w-4" /> Join Our Coach Network
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Become a Coach on TouchConnectPro
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Share your expertise. Teach what you know. Earn by helping founders grow.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-0">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <Card className="mb-12 -mt-8 border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
            <CardContent className="p-10">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                TouchConnectPro is building a network of experienced professionals offering specialized courses to entrepreneurs who need practical, real-world guidance. Mentors support founders through their journey — and coaches provide the paid skills training they need to move faster and wiser.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                As a coach, you turn your experience into structured knowledge entrepreneurs can learn from today.
              </p>
            </CardContent>
          </Card>

          {/* Who We're Looking For */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Who We're Looking For</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              We invite coaches with strong backgrounds in fields such as:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Startup experience, product development, or growth strategy",
                "Corporate expertise, scaling, operations, or management",
                "Finance, legal, marketing, or go-to-market skills",
                "UX, branding, storytelling, design, or development",
                "Any skill that helps entrepreneurs overcome real business challenges"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-cyan-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  <span className="font-semibold">If you've built, launched, failed, learned, or succeeded</span> — you have something valuable to teach.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What You'll Do */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">What You'll Do as a Coach</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              As a TouchConnectPro Coach, you will:
            </p>
            <div className="space-y-4">
              {[
                { icon: "💼", title: "Offer paid lessons, workshops, or structured courses" },
                { icon: "📈", title: "Set your own pricing and availability" },
                { icon: "📝", title: "Receive a public coaching profile so entrepreneurs can book you" },
                { icon: "🤝", title: "Benefit from mentor referrals who guide founders internally" },
                { icon: "📅", title: "Decide how many sessions you want to run — total flexibility" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-slate-700 dark:text-slate-300 text-lg">{item.title}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  Entrepreneurs browse the coach catalog, compare expertise, and book you directly based on need and mentor recommendation.
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-lg font-semibold mt-3">
                  You teach — we bring you students.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Earnings & Revenue Structure</h2>
            <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-10 space-y-6">
                <div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>You choose your price.</strong> Entrepreneurs pay your full session rate.
                  </p>
                </div>
                <div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>TouchConnectPro retains 20% commission to operate the platform —</strong> you keep 80%.
                  </p>
                </div>
                <div className="border-t border-emerald-200 dark:border-emerald-900/50 pt-6">
                  <p className="text-slate-700 dark:text-slate-300 text-lg">
                    <strong>No subscription. No pay-to-be-listed.</strong> We only earn when you do.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Coach */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Why Coach With TouchConnectPro?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Earn money while sharing valuable skills",
                "No client chasing — founders come to you",
                "Build your reputation as a trusted expert",
                "Teach real entrepreneurs building real businesses",
                "Experience personal and professional growth through impact"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Check className="h-6 w-6 text-cyan-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  For many coaches, <strong>revenue is great — but the real reward is watching founders level up through your knowledge.</strong>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quality Standards */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Our Quality Standards</h2>
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-10">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  TouchConnectPro values a positive and reliable coaching experience for all users. If a coach's rating drops below 3 stars out of 5, we may pause or deactivate the account until quality standards are met again.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          {!showForm ? (
            <div className="bg-gradient-to-r from-cyan-900/50 to-slate-900/50 rounded-2xl p-12 text-center border border-cyan-500/30">
              <h2 className="text-3xl font-display font-bold mb-6 text-white">Ready to Become a Coach?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                If you want to teach what you know, support entrepreneurs, and get paid on your terms, we'd love to learn more about you.
              </p>
              <p className="text-slate-600 dark:text-slate-500 mb-8">
                We will review your profile and notify you when your expertise matches coaching needs within the platform.
              </p>
              <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold" onClick={() => setShowForm(true)} data-testid="button-apply-coach">
                Apply to Become a Coach <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-white dark:bg-slate-900">
              <CardContent className="p-12">
                <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Complete Your Coach Profile</h2>
                <p className="text-muted-foreground mb-8">Tell us about your expertise. Our team will review and contact you within 48 hours.</p>

                {submitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-6 text-center">
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold mb-2">Application Submitted!</p>
                    <p className="text-emerald-600 dark:text-emerald-400">We'll review your profile and get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Full Name *</label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-coach-fullname"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Email Address *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-coach-email"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">LinkedIn Profile</label>
                      <Input
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="linkedin.com/in/xxx (optional)"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-coach-linkedin"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Bio - Introduce Yourself *</label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell entrepreneurs about yourself, your background, and what makes you a great coach. This will be displayed on your public profile."
                        className="bg-slate-50 dark:bg-slate-800/50 min-h-[120px]"
                        data-testid="input-coach-bio"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This bio will be visible to entrepreneurs browsing coaches</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Areas of Expertise * (Select one or more)</label>
                      <select
                        multiple
                        value={formData.expertise}
                        onChange={(e) => handleExpertiseChange(e.target.selectedOptions)}
                        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        data-testid="select-coach-expertise"
                        style={{ minHeight: "120px" }}
                      >
                        {EXPERTISE_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Hold Ctrl/Cmd to select multiple options</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Focus Areas / Specialization *</label>
                      <select
                        name="focusAreas"
                        value={formData.focusAreas}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        data-testid="select-coach-focusareas"
                      >
                        <option value="">Select your focus area</option>
                        {FOCUS_AREAS_OPTIONS.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Your Rates for Your Services *</label>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">15 Minutes Introductory Call *</label>
                          <Input
                            name="introCallRate"
                            type="number"
                            value={formData.introCallRate}
                            onChange={handleInputChange}
                            placeholder="e.g., $25"
                            className="bg-slate-50 dark:bg-slate-800/50"
                            data-testid="input-coach-introcallrate"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Per Session *</label>
                          <Input
                            name="sessionRate"
                            type="number"
                            value={formData.sessionRate}
                            onChange={handleInputChange}
                            placeholder="e.g., $150"
                            className="bg-slate-50 dark:bg-slate-800/50"
                            data-testid="input-coach-sessionrate"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Per Month / Full Courses *</label>
                          <Input
                            name="monthlyRate"
                            type="number"
                            value={formData.monthlyRate}
                            onChange={handleInputChange}
                            placeholder="e.g., $500"
                            className="bg-slate-50 dark:bg-slate-800/50"
                            data-testid="input-coach-monthlyrate"
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">TouchConnectPro retains 20% commission — you keep 80% of your earnings</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={(e) => {
                          handleInputChange(e as any);
                          if (e.target.value !== "United States") {
                            setFormData(prev => ({ ...prev, state: "" }));
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        data-testid="select-coach-country"
                      >
                        <option value="">Select a country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {formData.country === "United States" && (
                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          data-testid="select-coach-state"
                        >
                          <option value="">Select your state</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-6">
                      <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)} data-testid="button-cancel-coach-form">Cancel</Button>
                      <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid="button-submit-coach-form">Submit Application</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
