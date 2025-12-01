import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lightbulb, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function BecomeaEntrepreneur() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    ideaName: "",
    problem: "",
    solution: "",
    country: "United States",
    state: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.ideaName || !formData.problem || !formData.solution || !formData.country) {
      alert("Please fill in all required fields");
      return;
    }
    if (formData.country === "United States" && !formData.state) {
      alert("Please provide your state");
      return;
    }
    
    // Save to localStorage with pending status
    const entrepreneurData = { ...formData, status: "pending", submittedAt: new Date().toISOString() };
    const existingApplications = JSON.parse(localStorage.getItem("tcp_entrepreneurApplications") || "[]");
    existingApplications.push(entrepreneurData);
    localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(existingApplications));
    
    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setFormData({ fullName: "", email: "", ideaName: "", problem: "", solution: "", country: "United States", state: "" });
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
              Your entrepreneur application has been received.
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-400">
              Our team will review your idea and get back to you within <strong>24-48 hours</strong>. Once approved, you can log in and develop your business plan with guidance from mentors and coaches!
            </p>
          </div>
          <Button
            onClick={handleCloseModal}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
            data-testid="button-thank-you-ok-entrepreneur"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-emerald-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
              <Lightbulb className="inline-block mr-2 h-4 w-4" /> Submit Your Idea
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Bring Your Idea to Life
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Share your startup idea and get matched with mentors, coaches, and investors who can help you succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-0">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <Card className="mb-12 -mt-8 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
            <CardContent className="p-10">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                TouchConnectPro connects ambitious entrepreneurs with experienced mentors, coaches, and investors. Whether you have a rough idea or a validated MVP, we'll help you accelerate growth with personalized guidance.
              </p>
            </CardContent>
          </Card>

          {/* What We're Looking For */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">💡 What We're Looking For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Founders with a startup idea or early-stage company",
                "Teams working on innovative solutions to real problems",
                "Entrepreneurs at any stage from idea to product launch",
                "People who are committed to learning and building",
                "Anyone with passion for creating something meaningful"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">🚀 How It Works</h2>
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Submit Your Idea</h3>
                    <p className="text-slate-700 dark:text-slate-300">Fill out a simple form with your idea, problem statement, and proposed solution.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Get Approved</h3>
                    <p className="text-slate-700 dark:text-slate-300">Our team reviews your application and gets back to you within 24-48 hours.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build Your Plan</h3>
                    <p className="text-slate-700 dark:text-slate-300">Log in to your dashboard and create a comprehensive business plan with AI guidance.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">4</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect & Grow</h3>
                    <p className="text-slate-700 dark:text-slate-300">Get matched with mentors, coaches, and investors who want to help you succeed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mb-16">
            {!showForm ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold h-12 px-8 text-lg"
                  data-testid="button-start-application"
                >
                  Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-10">
                  <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Submit Your Idea</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Full Name *</label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full"
                        data-testid="input-entrepreneur-fullname"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full"
                        data-testid="input-entrepreneur-email"
                        required
                      />
                    </div>

                    {/* Idea Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Idea/Company Name *</label>
                      <Input
                        type="text"
                        name="ideaName"
                        value={formData.ideaName}
                        onChange={handleInputChange}
                        placeholder="What are you building?"
                        className="w-full"
                        data-testid="input-entrepreneur-ideaname"
                        required
                      />
                    </div>

                    {/* Problem */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Problem You're Solving *</label>
                      <textarea
                        name="problem"
                        value={formData.problem}
                        onChange={handleInputChange}
                        placeholder="Describe the problem your idea solves..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        data-testid="textarea-entrepreneur-problem"
                        required
                      />
                    </div>

                    {/* Solution */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Your Solution *</label>
                      <textarea
                        name="solution"
                        value={formData.solution}
                        onChange={handleInputChange}
                        placeholder="How does your idea solve this problem?"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        data-testid="textarea-entrepreneur-solution"
                        required
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        data-testid="select-entrepreneur-country"
                        required
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* State (if USA) */}
                    {formData.country === "United States" && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">State *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          data-testid="select-entrepreneur-state"
                          required
                        >
                          <option value="">Select your state</option>
                          {US_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                        data-testid="button-entrepreneur-submit"
                      >
                        Submit Application
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                        data-testid="button-entrepreneur-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
