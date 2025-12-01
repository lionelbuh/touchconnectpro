import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lightbulb, Mail, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: "",
    email: "",
    linkedin: "",
    country: "United States",
    state: "",
    
    // Step 2: Idea Details
    ideaName: "",
    problem: "",
    solution: "",
    valueProposition: "",
    targetCustomer: "",
    marketSize: "",
    hasCustomers: "",
    hasRevenue: "",
    competitorInfo: "",
    developmentStage: "",
    
    // Step 3: Business Plan Draft
    businessModelDraft: "",
    fundingNeeded: "",
    nextSteps: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!formData.fullName || !formData.email || !formData.country) {
          alert("Please fill in Full Name, Email, and Country");
          return false;
        }
        if (formData.country === "United States" && !formData.state) {
          alert("Please select your state");
          return false;
        }
        return true;
      case 1: // Idea Details
        if (!formData.ideaName || !formData.problem || !formData.solution || !formData.targetCustomer || !formData.hasCustomers || !formData.hasRevenue || !formData.developmentStage) {
          alert("Please fill in all required fields marked with *");
          return false;
        }
        return true;
      case 2: // Business Plan Draft
        if (!formData.businessModelDraft || !formData.fundingNeeded || !formData.nextSteps) {
          alert("Please fill in all required fields marked with *");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    // Save to localStorage with pending status
    const entrepreneurData = { 
      ...formData, 
      status: "pending", 
      submittedAt: new Date().toISOString() 
    };
    const existingApplications = JSON.parse(localStorage.getItem("tcp_entrepreneurApplications") || "[]");
    existingApplications.push(entrepreneurData);
    localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(existingApplications));
    
    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setCurrentStep(0);
    setFormData({
      fullName: "",
      email: "",
      linkedin: "",
      country: "United States",
      state: "",
      ideaName: "",
      problem: "",
      solution: "",
      valueProposition: "",
      targetCustomer: "",
      marketSize: "",
      hasCustomers: "",
      hasRevenue: "",
      competitorInfo: "",
      developmentStage: "",
      businessModelDraft: "",
      fundingNeeded: "",
      nextSteps: "",
    });
  };

  const progressPercent = ((currentStep + 1) / 3) * 100;

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
              Your application has been submitted successfully.
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-400">
              Our team will review your idea and business plan within <strong>24-48 hours</strong>. Once approved and you've completed your subscription, you can log in to your full dashboard and connect with mentors and coaches!
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
              <Lightbulb className="inline-block mr-2 h-4 w-4" /> Bring Your Idea to Life
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Submit Your Startup Idea
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Share your vision and get matched with mentors, coaches, and investors who can help you succeed.
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
                TouchConnectPro connects ambitious entrepreneurs with experienced mentors, coaches, and investors. Submit your idea, develop your business plan with AI guidance, and get approved to join our growing community of innovators.
              </p>
            </CardContent>
          </Card>

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
                    <p className="text-slate-700 dark:text-slate-300">Fill out a comprehensive form about your startup idea, including problem, solution, market size, traction, and competitors.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build Your Plan</h3>
                    <p className="text-slate-700 dark:text-slate-300">Create a draft business plan covering your business model, funding needs, and next steps. AI helps enhance your responses.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Get Approved & Subscribe</h3>
                    <p className="text-slate-700 dark:text-slate-300">Our team reviews your complete submission within 24-48 hours. Once approved, complete your paid subscription to access full features.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">4</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect & Grow</h3>
                    <p className="text-slate-700 dark:text-slate-300">Join your mentor's portfolio, get coaching, access investor connections, and accelerate your startup journey.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          {!showForm ? (
            <div className="text-center mb-16">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold h-12 px-8 text-lg"
                data-testid="button-start-application"
              >
                Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Card className="border-slate-200 dark:border-slate-700 mb-16">
              <CardContent className="p-10">
                <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">
                  {currentStep === 0 && "Step 1: Your Information"}
                  {currentStep === 1 && "Step 2: Your Idea Details"}
                  {currentStep === 2 && "Step 3: Business Plan Draft"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {currentStep === 0 && "Let's start with your basic information"}
                  {currentStep === 1 && "Tell us about your startup idea and vision"}
                  {currentStep === 2 && "Outline your business plan and next steps"}
                </p>
                <Progress value={progressPercent} className="h-2 mb-8" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Basic Info */}
                  {currentStep === 0 && (
                    <>
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
                        />
                      </div>

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
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">LinkedIn Profile (Optional)</label>
                        <Input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full"
                          data-testid="input-entrepreneur-linkedin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Country *</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          data-testid="select-entrepreneur-country"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {formData.country === "United States" && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">State *</label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            data-testid="select-entrepreneur-state"
                          >
                            <option value="">Select your state</option>
                            {US_STATES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 2: Idea Details */}
                  {currentStep === 1 && (
                    <>
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
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What problem are you solving? *</label>
                        <textarea
                          name="problem"
                          value={formData.problem}
                          onChange={handleInputChange}
                          placeholder="Describe the problem..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-problem"
                        />
                      </div>

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
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Unique Value Proposition</label>
                        <textarea
                          name="valueProposition"
                          value={formData.valueProposition}
                          onChange={handleInputChange}
                          placeholder="What makes your solution unique?"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-value"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Target Customer Profile *</label>
                        <textarea
                          name="targetCustomer"
                          value={formData.targetCustomer}
                          onChange={handleInputChange}
                          placeholder="Who is your ideal customer?"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-customer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Market Size</label>
                        <Input
                          type="text"
                          name="marketSize"
                          value={formData.marketSize}
                          onChange={handleInputChange}
                          placeholder="TAM/SAM/SOM estimates"
                          className="w-full"
                          data-testid="input-entrepreneur-market"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do you have customers/users? *</label>
                        <select
                          name="hasCustomers"
                          value={formData.hasCustomers}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          data-testid="select-entrepreneur-customers"
                        >
                          <option value="">Select...</option>
                          <option value="No">No</option>
                          <option value="Yes - Family & friends">Yes - Family & friends</option>
                          <option value="Yes - Friends of friends">Yes - Friends of friends</option>
                          <option value="Yes - Strangers">Yes - Strangers (cold customers)</option>
                          <option value="Not sure">Not sure yet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do you generate revenue? *</label>
                        <select
                          name="hasRevenue"
                          value={formData.hasRevenue}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          data-testid="select-entrepreneur-revenue"
                        >
                          <option value="">Select...</option>
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                          <option value="Not sure">Not sure yet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Competitor Information</label>
                        <textarea
                          name="competitorInfo"
                          value={formData.competitorInfo}
                          onChange={handleInputChange}
                          placeholder="Who are your competitors and how do you differ?"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-competitors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Development Stage *</label>
                        <select
                          name="developmentStage"
                          value={formData.developmentStage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          data-testid="select-entrepreneur-stage"
                        >
                          <option value="">Select...</option>
                          <option value="Idea only">Idea only</option>
                          <option value="Prototype">Prototype</option>
                          <option value="MVP built">MVP built</option>
                          <option value="Publicly launched">Publicly launched</option>
                          <option value="Not sure">Not sure yet</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Step 3: Business Plan Draft */}
                  {currentStep === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Business Model Draft *</label>
                        <textarea
                          name="businessModelDraft"
                          value={formData.businessModelDraft}
                          onChange={handleInputChange}
                          placeholder="Describe your revenue model, pricing strategy, and monetization plan..."
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-businessmodel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Funding Needed *</label>
                        <textarea
                          name="fundingNeeded"
                          value={formData.fundingNeeded}
                          onChange={handleInputChange}
                          placeholder="How much funding do you need and what would it be used for?"
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-funding"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Next 3 Steps *</label>
                        <textarea
                          name="nextSteps"
                          value={formData.nextSteps}
                          onChange={handleInputChange}
                          placeholder="What are your next 3 concrete steps to move the business forward?"
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                          data-testid="textarea-entrepreneur-nextsteps"
                        />
                      </div>
                    </>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="flex-1"
                        data-testid="button-entrepreneur-previous"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                    )}
                    
                    {currentStep < 2 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                        data-testid="button-entrepreneur-next"
                      >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                        data-testid="button-entrepreneur-submit"
                      >
                        Submit Application
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setCurrentStep(0);
                      }}
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
      </section>
    </div>
  );
}
