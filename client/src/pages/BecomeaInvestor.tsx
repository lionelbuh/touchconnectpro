import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp, Target, ArrowRight, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BecomeaInvestor() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    linkedin: "",
    fundName: "",
    investmentFocus: "",
    investmentPreference: "",
    investmentAmount: "",
    country: "",
    state: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.fundName || !formData.investmentFocus || !formData.investmentPreference || !formData.investmentAmount || !formData.country) {
      alert("Please fill in all required fields");
      return;
    }
    if (formData.country.toLowerCase().includes("united states") && !formData.state) {
      alert("Please provide your state");
      return;
    }
    
    const investorData = { ...formData, status: "pending", submittedAt: new Date().toISOString() };
    const existingInvestors = JSON.parse(localStorage.getItem("tcp_investorApplications") || "[]");
    existingInvestors.push(investorData);
    localStorage.setItem("tcp_investorApplications", JSON.stringify(existingInvestors));
    
    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setFormData({ fullName: "", email: "", linkedin: "", fundName: "", investmentFocus: "", investmentPreference: "", investmentAmount: "", country: "", state: "" });
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
              Your investment inquiry has been received.
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-400">
              Our team will review your application and get back to you within <strong>24-48 hours</strong>. We're excited about the possibility of partnering with you!
            </p>
          </div>
          <Button
            onClick={handleCloseModal}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-semibold"
            data-testid="button-thank-you-ok-investor"
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-amber-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30">
              <Star className="inline-block mr-2 h-4 w-4" /> Investment Opportunities
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Invest in the Future of Entrepreneurship
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Support the platform that supports entrepreneurs — and multiply your impact.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-0 pt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Two Ways Header */}
          <div className="text-center mb-16 -mt-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">⭐ Two Ways to Invest</h2>
          </div>

          {/* Investment Option 1 */}
          <div className="mb-16">
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 mb-8">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Invest in TouchConnectPro as a Whole</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Support the platform that supports entrepreneurs.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              When you invest directly in TouchConnectPro, you fuel:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                "The growth of our mentor network",
                "Expansion of coach marketplace & expert resources",
                "Improved founder tools & learning pathways",
                "A scalable model that can help thousands globally"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <TrendingUp className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                  <strong>This option allows you to impact many startups at once — not just one.</strong> You invest in us, and through us, in the success of every entrepreneur we help.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Option 2 */}
          <div className="mb-16">
            <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20 mb-8">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Invest in Individual Projects Inside Our Ecosystem</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  For investors who want a closer relationship with specific founders, we also present high-potential startups emerging from our mentor programs.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              You can choose to invest in a selected startup once it becomes "funding-ready." This creates a more direct investment opportunity — but naturally reaches fewer entrepreneurs compared to investing in the platform.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { label: "Impact focus", value: "Narrow & deep" },
                { label: "Investment scope", value: "Single or selected few startups" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">{item.label}</p>
                  <p className="text-lg text-slate-900 dark:text-white font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Join */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Why Angel Investors Join Us</h2>
            <div className="space-y-4">
              {[
                "A growing marketplace of entrepreneurial success",
                "Access to a pipeline of validated, guided founders",
                "Mentors ensure founders progress with accountability",
                "Coaches accelerate execution with expert learning",
                "Opportunity to back the whole ecosystem or single ventures"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Check className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300 text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="mb-16">
            <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-10 space-y-6">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>TouchConnectPro aims to become the hub where ideas evolve into businesses — supported, coached, and funded.</strong>
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed border-t border-emerald-200 dark:border-emerald-900/50 pt-6">
                  <strong>You're not just investing in a company.</strong> You're investing in the next generation of founders.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          {!showForm ? (
            <div className="bg-gradient-to-r from-amber-900/50 to-slate-900/50 rounded-2xl p-12 text-center border border-amber-500/30">
              <h2 className="text-3xl font-display font-bold mb-6 text-white">Ready to Invest?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                If you'd like to discuss alignment, investment terms, SAFE notes, or upcoming rounds — we're ready to talk.
              </p>
              <p className="text-slate-600 dark:text-slate-500 mb-8">
                Let's build futures together.
              </p>
              <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold" onClick={() => setShowForm(true)} data-testid="button-get-in-touch-investor">
                Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Card className="border-amber-200 dark:border-amber-900/30 bg-white dark:bg-slate-900">
              <CardContent className="p-12">
                <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Investor Profile</h2>
                <p className="text-muted-foreground mb-8">Tell us about your investment focus. Our team will review and contact you within 48 hours.</p>

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
                        data-testid="input-investor-fullname"
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
                        data-testid="input-investor-email"
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
                        data-testid="input-investor-linkedin"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Fund Name / Organization *</label>
                      <Input
                        name="fundName"
                        value={formData.fundName}
                        onChange={handleInputChange}
                        placeholder="e.g., Your Fund Name or Company"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-investor-fundname"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Investment Focus / Thesis *</label>
                      <textarea
                        name="investmentFocus"
                        value={formData.investmentFocus}
                        onChange={handleInputChange}
                        placeholder="e.g., Early-stage SaaS, climate tech, biotech"
                        className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        data-testid="textarea-investor-focus"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">What would you prefer to invest in? *</label>
                      <select
                        name="investmentPreference"
                        value={formData.investmentPreference}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        data-testid="select-investor-preference"
                      >
                        <option value="">Select investment type</option>
                        <option value="platform">TouchConnectPro as a whole</option>
                        <option value="projects">Individual Projects</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">How much do you usually invest? *</label>
                      <select
                        name="investmentAmount"
                        value={formData.investmentAmount}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        data-testid="select-investor-amount"
                      >
                        <option value="">Select investment amount</option>
                        <option value="5000-10000">$5,000 - $10,000</option>
                        <option value="20000-50000">$20,000 - $50,000</option>
                        <option value="50000-100000">$50,000 - $100,000</option>
                        <option value="100000-500000">$100,000 - $500,000</option>
                        <option value="500000-1000000">$500,000 - $1,000,000</option>
                        <option value="1000000plus">$1,000,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Country *</label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-investor-country"
                      />
                    </div>

                    {formData.country.toLowerCase().includes("united states") && (
                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">State *</label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="California"
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-investor-state"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-6">
                      <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                      <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" data-testid="button-submit-investor-form">Submit Information</Button>
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
