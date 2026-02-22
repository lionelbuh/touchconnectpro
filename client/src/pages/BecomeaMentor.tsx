import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Heart, Mail, ArrowRight, CheckCircle, FileText } from "lucide-react";
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
import { MENTOR_CONTRACT, CONTRACT_VERSION } from "@/lib/contracts";

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

export default function BecomeaMentor() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    linkedin: "",
    bio: "",
    expertise: "",
    experience: "",
    country: "",
    state: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [contractAgreed, setContractAgreed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.bio || !formData.expertise || !formData.experience || !formData.country) {
      alert("Please fill in all required fields");
      return;
    }
    if (!contractAgreed) {
      alert("Please read and agree to the Mentor Platform Agreement to submit your application");
      return;
    }
    if (formData.country === "United States" && !formData.state) {
      alert("Please provide your state");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          role: "mentor",
          contractVersion: CONTRACT_VERSION,
          contractText: MENTOR_CONTRACT,
          userAgent: navigator.userAgent
        }),
      });

      setSubmitted(true);
    } catch (error: any) {
      alert("Error submitting application: " + error.message);
      console.error("Mentor submission error:", error);
    }
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setFormData({ fullName: "", email: "", linkedin: "", bio: "", expertise: "", experience: "", country: "", state: "" });
    setContractAgreed(false);
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
              Your mentor application has been received.
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-400">
              Our team will review your application and get back to you within <strong>24-48 hours</strong>. We appreciate your interest in joining the TouchConnectPro mentor network!
            </p>
          </div>
          <Button
            onClick={handleCloseModal}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-400 hover:to-indigo-300 text-white font-semibold"
            data-testid="button-thank-you-ok-mentor"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-indigo-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30">
              <Star className="inline-block mr-2 h-4 w-4" /> Join Our Mentor Network
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Become a Mentor at TouchConnectPro
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              We are building a network of mentors who believe in the power of entrepreneurship — and in the people behind it.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-0">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <Card className="mb-12 -mt-8 border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20">
            <CardContent className="p-10">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                TouchConnectPro is designed to guide founders from their first idea to market launch, supported not only by AI but by real humans who've been there, built things, solved problems, and pushed through the messy middle.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                We are currently seeking mentors who bring experience, wisdom, and a genuine desire to help new entrepreneurs succeed.
              </p>
            </CardContent>
          </Card>

          {/* Who We're Looking For */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">👥 Who We're Looking For</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              We welcome mentors with strong professional backgrounds, ideally including:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Experience in startups, innovation, or fast-growing companies",
                "Understanding of product development, market strategy, and business growth",
                "Knowledge of corporate structures, fundraising, or scaling operations",
                "Strength in guiding others, problem-solving, and strategic thinking",
                "Patience, empathy, and leadership — especially when entrepreneurs face difficult situations"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  <span className="font-semibold">You don't need to know everything.</span> You need to care, think critically, and share what you've learned along the way.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Role & Commitment */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">🔥 Mentor Role & Commitment</h2>
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-10 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Your Group</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Each mentor will guide and follow a group of <strong>10 entrepreneurs</strong>, helping them progress month after month.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Time Commitment</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Approx. <strong>15 minutes per entrepreneur per month</strong>, focused on asynchronous guidance, feedback, and next-step suggestions via the platform.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 mt-2">
                    For new entrepreneurs, allow an additional <strong>~15 minutes in the first month</strong> for onboarding and initial direction.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Scaling Your Impact</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Mentors who wish to commit more time may lead additional groups of 10, allowing them to support more founders while increasing their impact within TouchConnectPro.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Mentor */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">💛 Why Mentor With Us?</h2>
            <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-10">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  At TouchConnectPro, <strong>mentorship is a relationship — not just a transaction.</strong>
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Our goal is not only to help build companies, but to support the people behind them. Mentors will accompany entrepreneurs through decisions, strategy, setbacks and breakthroughs, and into market success.
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <Heart className="inline-block mr-2 h-5 w-5 text-red-500" />
                  Compensation is provided, but the real motivation is <strong>purpose, impact, and community.</strong> We are looking for mentors who value teaching, guiding and elevating others.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          {!showForm ? (
            <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 rounded-2xl p-12 text-center border border-indigo-500/30">
              <h2 className="text-3xl font-display font-bold mb-6 text-white">🔗 Ready to Join the Mentor Network?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                If you believe your experience could change the trajectory of someone's business, we'd love to hear from you.
              </p>
              <p className="text-slate-600 dark:text-slate-500 mb-8">
                Our team will review all mentor submissions and connect with those whose profile matches our mission and founders' needs.
              </p>
              <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold" onClick={() => setShowForm(true)} data-testid="button-apply-mentor">
                Apply to Become a Mentor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-white dark:bg-slate-900">
              <CardContent className="p-12">
                <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Complete Your Mentor Profile</h2>
                <p className="text-muted-foreground mb-8">Answer these questions to apply. Our team will review and contact you within 48 hours.</p>

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
                        data-testid="input-mentor-fullname"
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
                        data-testid="input-mentor-email-form"
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
                        data-testid="input-mentor-linkedin-form"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Professional Bio *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Serial entrepreneur with 10+ years of experience in SaaS and product strategy. Passionate about helping early-stage founders build successful companies."
                        className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        data-testid="textarea-mentor-bio-form"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Areas of Expertise *</label>
                      <Input
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleInputChange}
                        placeholder="SaaS, Product Strategy, Go-to-Market"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-expertise-form"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Years of Experience *</label>
                      <Input
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 10 years"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-experience-form"
                      />
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
                        data-testid="select-mentor-country"
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
                          data-testid="select-mentor-state"
                        >
                          <option value="">Select your state</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <label className="text-sm font-semibold text-slate-900 dark:text-white">Mentor Platform Agreement *</label>
                      </div>
                      <ScrollArea className="h-64 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                          {MENTOR_CONTRACT}
                        </pre>
                      </ScrollArea>
                      <div className="flex items-start gap-3 mt-4">
                        <Checkbox
                          id="contract-agreement-mentor"
                          checked={contractAgreed}
                          onCheckedChange={(checked) => setContractAgreed(checked === true)}
                          data-testid="checkbox-mentor-contract"
                        />
                        <label
                          htmlFor="contract-agreement-mentor"
                          className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer leading-relaxed"
                        >
                          I have read and agree to the <span className="font-semibold text-indigo-600 dark:text-indigo-400">Mentor Platform Agreement</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-700" disabled={!contractAgreed} data-testid="button-submit-mentor-form">Submit Application</Button>
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
