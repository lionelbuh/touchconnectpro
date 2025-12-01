import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Lightbulb, Mail, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

// Mock AI responses
const generateAIReview = (formData: any) => {
  return {
    coreIdea: formData.coreIdea || "Your innovative solution to market problem",
    problemSolution: `You're addressing a critical gap where ${formData.problem || "the target market faces a specific challenge"}. Your solution uniquely tackles this by focusing on ${formData.differentiation || "your unique value proposition"}}.`,
    whyNow: formData.whyNow || "Clear market need and timing advantage",
    marketOpportunity: `Your primary customers are ${formData.idealCustomers || "early adopters and innovators"}}, who currently rely on ${formData.alternatives || "fragmented solutions"}}. You differentiate by ${formData.differentiation || "offering better user experience and efficiency"}}.`,
    currentProgress: `You're at the ${formData.currentStage || "ideation"}} phase and have already ${formData.completed || "validated initial assumptions"}}. Your immediate next step is to ${formData.nextStep || "build and test with first users"}}.`,
    businessModel: `Revenue will be generated through ${formData.revenueModel || "a scalable subscription model"}}. You're targeting ${formData.successMetrics || "profitability within 12 months"}} through focused execution.`,
    commitment: `You're dedicating ${formData.hoursPerWeek || "significant hours"}} weekly and actively seeking mentorship in ${formData.mentorshipNeeds || "go-to-market strategy and product development"}}.`,
  };
};

const generateBusinessPlan = (formData: any) => {
  return {
    executiveSummary: `${formData.coreIdea || "Your core idea"} addresses a significant market need by providing a unique solution. The opportunity is substantial, with a clear path to revenue generation and sustainable growth.`,
    problem: formData.problem || "Market gap identified",
    targetUsers: formData.idealCustomers || "Early adopters and innovators",
    urgency: formData.whyNow || "Clear market need and timing advantage",
    marketSize: "Large addressable market with growing demand",
    competitors: formData.alternatives || "Current alternatives are fragmented and inefficient",
    yourEdge: formData.differentiation || "Superior UX, better pricing, or innovative approach",
    revenueModel: formData.revenueModel || "Subscription-based SaaS model with tiered pricing",
    year1Goal: formData.successMetrics || "Achieve product-market fit and 100 paying customers",
    currentStage: formData.currentStage || "Idea validation",
    resourcesNeeded: formData.mentorshipNeeds || "Technical expertise, go-to-market guidance, investor connections",
    nextSteps: [
      formData.nextStep || "Build and test MVP with first 5-10 users",
      "Gather feedback and iterate quickly",
      "Begin outreach to target customers and gather testimonials"
    ],
    metrics: [
      "User acquisition rate",
      "Product usage/engagement",
      "Customer feedback & NPS score",
      "Revenue per customer",
      "Burn rate (if applicable)"
    ]
  };
};

export default function BecomeaEntrepreneur() {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [aiReview, setAiReview] = useState<any>({});
  const [showingAiReview, setShowingAiReview] = useState(false);
  const [businessPlanDraft, setBusinessPlanDraft] = useState<any>({});
  const [showingBusinessPlan, setShowingBusinessPlan] = useState(false);

  const [formData, setFormData] = useState({
    // Step 0: Basic Info
    fullName: "",
    email: "",
    linkedin: "",
    country: "United States",
    state: "",

    // Step 1: Idea Questions
    // About the Idea
    coreIdea: "",
    problem: "",
    whyNow: "",
    
    // Market & Differentiation
    idealCustomers: "",
    alternatives: "",
    differentiation: "",
    
    // Progress & Feasibility
    currentStage: "",
    completed: "",
    nextStep: "",
    
    // Business Model
    revenueModel: "",
    successMetrics: "",
    
    // Commitment & Support
    mentorshipNeeds: "",
    hoursPerWeek: "",
    readyForFeedback: "",

    // Step 2: Business Plan (editable)
    businessPlanFinal: "",
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
      case 1: // Idea Questions
        if (!formData.coreIdea || !formData.problem || !formData.whyNow || 
            !formData.idealCustomers || !formData.alternatives || !formData.differentiation ||
            !formData.currentStage || !formData.completed || !formData.nextStep ||
            !formData.revenueModel || !formData.successMetrics ||
            !formData.mentorshipNeeds || !formData.hoursPerWeek || !formData.readyForFeedback) {
          alert("Please fill in all required fields");
          return false;
        }
        return true;
      case 2: // Business Plan
        if (!formData.businessPlanFinal) {
          alert("Please review and finalize your business plan");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleGenerateAiReview = () => {
    const review = generateAIReview(formData);
    setAiReview(review);
    setShowingAiReview(true);
  };

  const handleApproveIdeaAndContinue = () => {
    setShowingAiReview(false);
    // Generate business plan draft
    const plan = generateBusinessPlan(formData);
    setBusinessPlanDraft(plan);
    setShowingBusinessPlan(true);
  };

  const handleGenerateBusinessPlan = () => {
    const plan = generateBusinessPlan(formData);
    setBusinessPlanDraft(plan);
    setShowingBusinessPlan(true);
  };

  const handleEditBusinessPlan = () => {
    const planText = `# Business Plan: ${formData.coreIdea}

## Executive Summary
${businessPlanDraft.executiveSummary}

## Problem & Opportunity
**The Problem:**
${businessPlanDraft.problem}

**Target Users:**
${businessPlanDraft.targetUsers}

**Urgency:**
${businessPlanDraft.urgency}

## Market & Competition
**Market Size:** ${businessPlanDraft.marketSize}

**Competitors:** ${businessPlanDraft.competitors}

**Your Edge:** ${businessPlanDraft.yourEdge}

## Revenue Model
${businessPlanDraft.revenueModel}

## Financial Projections
**Year 1 Goal:** ${businessPlanDraft.year1Goal}

**Break-even:** Month 18-24 (typical for SaaS startups)

## Resources Needed
**Current Stage:** ${businessPlanDraft.currentStage}

**Resources Needed:** ${businessPlanDraft.resourcesNeeded}

## Next 90 Days
${businessPlanDraft.nextSteps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

## Key Metrics to Track
${businessPlanDraft.metrics.map((m: string) => `- ${m}`).join('\n')}

---
**Note:** This is an AI-generated draft. Please edit, customize, and add specific numbers, timeline, and details unique to your situation.`;
    
    setFormData(prev => ({ ...prev, businessPlanFinal: planText }));
    setShowingBusinessPlan(false);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep === 1) {
      // After step 1, show AI review before going to step 2
      handleGenerateAiReview();
      return;
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (showingAiReview) {
      setShowingAiReview(false);
      return;
    }
    if (showingBusinessPlan) {
      setShowingBusinessPlan(false);
      setCurrentStep(1);
      return;
    }
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
    setShowingAiReview(false);
    setShowingBusinessPlan(false);
    setFormData({
      fullName: "",
      email: "",
      linkedin: "",
      country: "United States",
      state: "",
      coreIdea: "",
      problem: "",
      whyNow: "",
      idealCustomers: "",
      alternatives: "",
      differentiation: "",
      currentStage: "",
      completed: "",
      nextStep: "",
      revenueModel: "",
      successMetrics: "",
      mentorshipNeeds: "",
      hoursPerWeek: "",
      readyForFeedback: "",
      businessPlanFinal: "",
    });
  };

  const progressPercent = showingAiReview ? 66 : showingBusinessPlan ? 80 : ((currentStep + 1) / 3) * 100;

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
                    <p className="text-slate-700 dark:text-slate-300">Answer comprehensive questions about your core idea, market, and vision with AI-enhanced review.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build Your Plan</h3>
                    <p className="text-slate-700 dark:text-slate-300">AI generates a business plan draft based on your idea. Review, edit, and refine it before submitting.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Get Approved & Subscribe</h3>
                    <p className="text-slate-700 dark:text-slate-300">Our team reviews your complete submission within 24-48 hours. Once approved, complete your paid subscription.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">4</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect & Grow</h3>
                    <p className="text-slate-700 dark:text-slate-300">Join your mentor's portfolio, get coaching, access investor connections, and accelerate your startup.</p>
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
                {/* AI Review Screen */}
                {showingAiReview && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AI Review of Your Idea</h2>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Here's how our AI has reviewed and enhanced your idea submission. Review each section for accuracy.</p>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                      {/* Core Idea */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200 mb-3">Core Idea</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.coreIdea}</p>
                      </div>

                      {/* Problem & Solution */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">Problem & Solution</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.problemSolution}</p>
                      </div>

                      {/* Why Now */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/30 dark:to-purple-950/10 border border-purple-200 dark:border-purple-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-3">Why Now?</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.whyNow}</p>
                      </div>

                      {/* Market Opportunity */}
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-50/50 dark:from-cyan-950/30 dark:to-cyan-950/10 border border-cyan-200 dark:border-cyan-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-200 mb-3">Market Opportunity</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.marketOpportunity}</p>
                      </div>

                      {/* Current Progress */}
                      <div className="bg-gradient-to-br from-pink-50 to-pink-50/50 dark:from-pink-950/30 dark:to-pink-950/10 border border-pink-200 dark:border-pink-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-pink-900 dark:text-pink-200 mb-3">Current Progress & Next Steps</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.currentProgress}</p>
                      </div>

                      {/* Business Model */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-50/50 dark:from-indigo-950/30 dark:to-indigo-950/10 border border-indigo-200 dark:border-indigo-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-3">Business Model</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.businessModel}</p>
                      </div>

                      {/* Commitment */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/30 dark:to-orange-950/10 border border-orange-200 dark:border-orange-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-3">Your Commitment</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReview.commitment}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Does this capture your idea accurately?</strong> If you'd like to make changes, go back to edit your answers.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                          data-testid="button-edit-idea-back"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Edit Answers
                        </Button>
                        <Button
                          type="button"
                          onClick={handleApproveIdeaAndContinue}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-approve-idea-continue"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Looks Good, Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Plan Screen */}
                {showingBusinessPlan && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">AI-Generated Business Plan</h2>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Based on your idea, our AI has created a draft. Review each section and you'll be able to customize it on the next screen.</p>
                    </div>

                    <div className="space-y-5 max-h-96 overflow-y-auto pr-4">
                      {/* Executive Summary */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Executive Summary</h3>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{businessPlanDraft.executiveSummary}</p>
                      </div>

                      {/* Problem & Opportunity */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-950/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
                          <h4 className="font-bold text-red-900 dark:text-red-200 mb-2">The Problem</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{businessPlanDraft.problem}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-950/10 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
                          <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">Target Users</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{businessPlanDraft.targetUsers}</p>
                        </div>
                      </div>

                      {/* Market & Competition */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4">Market & Competition</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Market Size:</p>
                            <p className="text-slate-700 dark:text-slate-400">{businessPlanDraft.marketSize}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Competitors:</p>
                            <p className="text-slate-700 dark:text-slate-400">{businessPlanDraft.competitors}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Edge:</p>
                            <p className="text-slate-700 dark:text-slate-400">{businessPlanDraft.yourEdge}</p>
                          </div>
                        </div>
                      </div>

                      {/* Revenue & Financials */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/30 dark:to-purple-950/10 border border-purple-200 dark:border-purple-900/30 rounded-lg p-4">
                          <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-2">Revenue Model</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{businessPlanDraft.revenueModel}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-950/30 dark:to-orange-950/10 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4">
                          <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-2">Year 1 Goal</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{businessPlanDraft.year1Goal}</p>
                        </div>
                      </div>

                      {/* Next 90 Days */}
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-50/50 dark:from-cyan-950/30 dark:to-cyan-950/10 border border-cyan-200 dark:border-cyan-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-200 mb-4">Next 90 Days</h3>
                        <ol className="space-y-2">
                          {businessPlanDraft.nextSteps.map((step: string, idx: number) => (
                            <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">{idx + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Key Metrics */}
                      <div className="bg-gradient-to-br from-pink-50 to-pink-50/50 dark:from-pink-950/30 dark:to-pink-950/10 border border-pink-200 dark:border-pink-900/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-pink-900 dark:text-pink-200 mb-4">Key Metrics to Track</h3>
                        <ul className="space-y-2">
                          {businessPlanDraft.metrics.map((metric: string, idx: number) => (
                            <li key={idx} className="flex gap-2 text-slate-700 dark:text-slate-300">
                              <span className="text-pink-600 dark:text-pink-400">•</span>
                              <span>{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Ready to move on?</strong> On the next screen, you'll be able to edit every section and add your specific details.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                          data-testid="button-plan-back"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleEditBusinessPlan}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-edit-plan"
                        >
                          Edit This Plan <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Info Step */}
                {!showingAiReview && !showingBusinessPlan && currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Step 1: Your Information</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Let's start with your basic information</p>
                      <Progress value={33} className="h-2" />
                    </div>

                    <form className="space-y-6">
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

                      <div className="flex gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
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
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-entrepreneur-next"
                        >
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Idea Questions Step */}
                {!showingAiReview && !showingBusinessPlan && currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Step 2: Your Idea</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Tell us everything about your idea</p>
                      <Progress value={66} className="h-2" />
                    </div>

                    <form className="space-y-8">
                      {/* About the Idea */}
                      <div className="border-l-4 border-emerald-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About the Idea</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What is the core idea in one sentence? *</label>
                            <textarea
                              name="coreIdea"
                              value={formData.coreIdea}
                              onChange={handleInputChange}
                              placeholder="Describe your core idea..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-coreidea"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What problem are you solving and for who? *</label>
                            <textarea
                              name="problem"
                              value={formData.problem}
                              onChange={handleInputChange}
                              placeholder="Describe the problem and target user..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-problem"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Why is this problem worth solving now? *</label>
                            <textarea
                              name="whyNow"
                              value={formData.whyNow}
                              onChange={handleInputChange}
                              placeholder="What makes this urgent and timely?"
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-whynow"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Market & Differentiation */}
                      <div className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Market & Differentiation</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Who are your ideal first users/customers? *</label>
                            <textarea
                              name="idealCustomers"
                              value={formData.idealCustomers}
                              onChange={handleInputChange}
                              placeholder="Describe your ideal customer profile..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-customers"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What alternative solutions exist today? *</label>
                            <textarea
                              name="alternatives"
                              value={formData.alternatives}
                              onChange={handleInputChange}
                              placeholder="Describe current solutions and competitors..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-alternatives"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How is your approach different or better? *</label>
                            <textarea
                              name="differentiation"
                              value={formData.differentiation}
                              onChange={handleInputChange}
                              placeholder="What's your unique advantage?"
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-differentiation"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Progress & Feasibility */}
                      <div className="border-l-4 border-purple-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Progress & Feasibility</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What stage are you currently at? *</label>
                            <select
                              name="currentStage"
                              value={formData.currentStage}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              data-testid="select-entrepreneur-stage"
                            >
                              <option value="">Select...</option>
                              <option value="Idea only">Idea only</option>
                              <option value="Mockup">Mockup</option>
                              <option value="MVP">MVP</option>
                              <option value="First users">First users</option>
                              <option value="Revenue">Revenue</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What have you already done so far? *</label>
                            <textarea
                              name="completed"
                              value={formData.completed}
                              onChange={handleInputChange}
                              placeholder="Describe your progress to date..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-completed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What is your next concrete step? *</label>
                            <textarea
                              name="nextStep"
                              value={formData.nextStep}
                              onChange={handleInputChange}
                              placeholder="What's your immediate next action?"
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-nextstep"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Model */}
                      <div className="border-l-4 border-cyan-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Business Model</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How will this idea generate revenue? *</label>
                            <textarea
                              name="revenueModel"
                              value={formData.revenueModel}
                              onChange={handleInputChange}
                              placeholder="Describe your revenue model and pricing..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-revenue"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What would success look like in the first 12 months? *</label>
                            <textarea
                              name="successMetrics"
                              value={formData.successMetrics}
                              onChange={handleInputChange}
                              placeholder="Define your success metrics and goals..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-success"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Commitment & Support */}
                      <div className="border-l-4 border-pink-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Commitment & Support Needed</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What help do you expect from your mentor? *</label>
                            <textarea
                              name="mentorshipNeeds"
                              value={formData.mentorshipNeeds}
                              onChange={handleInputChange}
                              placeholder="e.g., UX design, storytelling, development, go-to-market strategy..."
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              data-testid="textarea-entrepreneur-mentorship"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How many hours per week can you commit? *</label>
                            <Input
                              type="text"
                              name="hoursPerWeek"
                              value={formData.hoursPerWeek}
                              onChange={handleInputChange}
                              placeholder="e.g., 20 hours/week"
                              className="w-full"
                              data-testid="input-entrepreneur-hours"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Are you ready to accept feedback and adapt your idea if needed? *</label>
                            <select
                              name="readyForFeedback"
                              value={formData.readyForFeedback}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              data-testid="select-entrepreneur-feedback"
                            >
                              <option value="">Select...</option>
                              <option value="Yes, absolutely">Yes, absolutely</option>
                              <option value="Somewhat">Somewhat</option>
                              <option value="Need to think about it">Need to think about it</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                          data-testid="button-entrepreneur-previous"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-entrepreneur-review"
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> Next: AI Review
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Business Plan Editing Step */}
                {!showingAiReview && !showingBusinessPlan && currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Step 3: Your Business Plan</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Edit and customize your business plan before submitting</p>
                      <Progress value={100} className="h-2" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Business Plan *</label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Edit and customize every section with your specific details, numbers, and timeline.</p>
                        <textarea
                          name="businessPlanFinal"
                          value={formData.businessPlanFinal}
                          onChange={handleInputChange}
                          placeholder="Edit your business plan here..."
                          rows={18}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-mono text-sm leading-relaxed"
                          data-testid="textarea-entrepreneur-businessplan"
                        />
                      </div>

                      <div className="flex gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                          data-testid="button-plan-back-edit"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-entrepreneur-submit"
                        >
                          Submit Application
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
