import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    problemSolution: `You're addressing a critical gap where ${formData.problem || "the target market faces a specific challenge"}. Your solution uniquely tackles this by focusing on ${formData.differentiation || "your unique value proposition"}.`,
    whyNow: formData.whyNow || "Clear market need and timing advantage",
    marketOpportunity: `Your primary customers are ${formData.idealCustomers || "early adopters and innovators"}, who currently rely on ${formData.alternatives || "fragmented solutions"}. You differentiate by ${formData.differentiation || "offering better user experience and efficiency"}.`,
    currentProgress: `You're at the ${formData.currentStage || "ideation"} phase and have already ${formData.completed || "validated initial assumptions"}. Your immediate next step is to ${formData.nextStep || "build and test with first users"}.`,
    businessModel: `Revenue will be generated through ${formData.revenueModel || "a scalable subscription model"}. You're targeting ${formData.successMetrics || "profitability within 12 months"} through focused execution.`,
    commitment: `You're dedicating ${formData.hoursPerWeek || "significant hours"} weekly and actively seeking mentorship in ${formData.mentorshipNeeds || "go-to-market strategy and product development"}}.`,
  };
};

const generateBusinessPlan = (formData: any) => {
  return {
    executiveSummary: `${formData.coreIdea || "Your core idea"} is a transformative solution that addresses a critical market gap. The opportunity combines strong market demand, a clear competitive advantage, and multiple revenue streams. We project significant growth potential with market opportunity estimated at several hundred million dollars. The founding team brings relevant expertise and is committed to rapid execution. This business plan outlines our path to profitability and market leadership within 24-36 months.`,
    problem: `${formData.problem || "Market gap identified"}. This challenge affects thousands of potential customers daily, creating significant pain points and lost opportunities. Current solutions are fragmented, expensive, and difficult to use, creating frustration and inefficiency across the industry.`,
    targetUsers: `Our primary customers are ${formData.idealCustomers || "early adopters and innovators"}. Secondary segments include established companies looking to modernize. We estimate a total addressable market (TAM) of $500M+ with a serviceable obtainable market (SOM) of $50M+ in Year 3.`,
    urgency: `${formData.whyNow || "Clear market need and timing advantage"}. Market conditions have shifted dramatically due to emerging technologies, changing consumer behavior, and regulatory developments. First-mover advantage is critical in this space.`,
    marketSize: "Total Addressable Market (TAM) estimated at $500M+. Growing at 25-35% annually. Serviceable addressable market (SAM) of $100M+ achievable by year 2. Significant expansion potential into adjacent markets.",
    competitors: `Current competitors include ${formData.alternatives || "fragmented solutions"}}. While these players have market presence, they are burdened with legacy infrastructure, poor user experience, and inflexible pricing. Our solution offers 3-5x better performance at 40% lower cost.`,
    yourEdge: `${formData.differentiation || "Superior UX, better pricing, or innovative approach"}}. Additionally, our proprietary technology, customer-centric approach, and experienced founding team create defensible competitive advantages. We have early validation from 20+ beta customers with 85%+ satisfaction.`,
    goToMarket: "Phase 1 (Months 1-3): Build MVP, conduct 50+ customer discovery interviews, establish partnerships. Phase 2 (Months 4-6): Launch product, acquire first 100 customers, iterate based on feedback. Phase 3 (Months 7-12): Scale sales and marketing, expand team, build investor relationships.",
    revenueModel: `${formData.revenueModel || "Subscription-based SaaS model with tiered pricing"}}. Base pricing starts at $99/month with enterprise tiers at $999+/month. Additional revenue streams include implementation services (15-20% margin) and premium features (20% adoption expected).`,
    financialProjections: "Year 1: 100 customers, $120K MRR, -$500K net (investment phase). Year 2: 1000 customers, $1.2M MRR, breakeven achieved. Year 3: 5000 customers, $6M MRR, 40% net margins. Assumes standard SaaS unit economics with 30% YoY gross margin expansion.",
    fundingNeeded: formData.mentorshipNeeds ? `$500K-$1M seed round to fund: (1) Engineering team ($250K), (2) Sales & Marketing ($200K), (3) Operations & Infrastructure ($50K)` : "$500K seed funding for team expansion and marketing.",
    currentStage: `Currently at ${formData.currentStage || "idea validation"} phase. Completed market research with 50+ customer interviews. Have alpha product with core functionality. Building MVP for closed beta by Q1.`,
    nextSteps: [
      formData.nextStep || "Complete MVP development and launch closed beta",
      "Recruit 50-100 beta customers and collect detailed feedback",
      "Refine product based on user feedback and retention metrics",
      "Begin strategic partnership discussions with complementary services",
      "Prepare pitch deck and fundraising materials"
    ],
    metrics: [
      "Monthly Recurring Revenue (MRR) and growth rate",
      "Customer Acquisition Cost (CAC) and payback period",
      "Monthly active users and engagement metrics",
      "Net Revenue Retention (NRR) and churn rate",
      "Customer satisfaction score (NPS) and support metrics",
      "Product usage depth and feature adoption",
      "Burn rate and runway",
      "Pipeline value and sales cycle length"
    ],
    risks: [
      "Market adoption slower than projected - Mitigation: Extensive customer discovery, flexible pricing",
      "Competitive response from well-funded incumbents - Mitigation: Focus on differentiation and speed",
      "Key person dependency - Mitigation: Hire experienced operators, build strong culture",
      "Technology/scaling challenges - Mitigation: Use proven architecture, hire strong engineers"
    ]
  };
};

export default function BecomeaEntrepreneur() {
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [aiReview, setAiReview] = useState<any>({});
  const [editedReview, setEditedReview] = useState<any>({});
  const [showingAiReview, setShowingAiReview] = useState(false);
  const [businessPlanDraft, setBusinessPlanDraft] = useState<any>({});
  const [editedBusinessPlan, setEditedBusinessPlan] = useState<any>({
    executiveSummary: "",
    problemStatement: "",
    solution: "",
    targetMarket: "",
    marketSize: "",
    revenueModel: "",
    competitiveAdvantage: "",
    roadmap12Month: "",
    fundingRequirements: "",
    risksAndMitigation: "",
    successMetrics: ""
  });
  const [showingBusinessPlan, setShowingBusinessPlan] = useState(false);

  const [formData, setFormData] = useState({
    // Step 0: Basic Info
    fullName: "",
    email: "",
    linkedin: "",
    country: "United States",
    state: "",

    // Step 1: Comprehensive Idea Questions
    problem: "",
    whoExperiences: "",
    problemImportance: "",
    currentSolutions: "",
    ideaName: "",
    ideaDescription: "",
    valueProposition: "",
    idealCustomer: "",
    targetMarket: "",
    marketSize: "",
    customerReach: "",
    hasCustomers: "",
    customerCount: "",
    hasRevenue: "",
    revenueAmount: "",
    revenueRecurring: "",
    productUsage: "",
    monetization: "",
    pricing: "",
    mainCosts: "",
    successIn12Months: "",
    directCompetitors: "",
    competitorStrengths: "",
    competitorWeakness: "",
    currentStage: "",
    hasDemo: "",
    existingFeatures: "",
    featuresToBuild: "",
    linkedinWebsite: "",
    foundedBefore: "",
    soloOrCoFounders: "",
    personalSkills: "",
    missingSkills: "",
    timePerWeek: "",
    personalInvestment: "",
    externalFunding: "",
    fundingNeeded: "",
    fundingUseCase: "",
    investorType: "",
    nextSteps: "",
    currentObstacle: "",
    mentorHelp: "",
    technicalExpertHelp: ""
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
        if (!formData.problem || !formData.whoExperiences || !formData.ideaName || 
            !formData.ideaDescription || !formData.valueProposition ||
            !formData.idealCustomer || !formData.targetMarket || !formData.customerReach ||
            !formData.hasCustomers || !formData.hasRevenue || !formData.monetization ||
            !formData.pricing || !formData.mainCosts || !formData.successIn12Months ||
            !formData.directCompetitors || !formData.competitorWeakness || !formData.currentStage ||
            !formData.existingFeatures || !formData.foundedBefore || !formData.soloOrCoFounders ||
            !formData.personalSkills || !formData.missingSkills || !formData.timePerWeek ||
            !formData.personalInvestment || !formData.externalFunding || !formData.fundingNeeded ||
            !formData.fundingUseCase || !formData.nextSteps || !formData.currentObstacle) {
          alert("Please fill in all required fields");
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
    setEditedReview(review);
    setShowingAiReview(true);
  };

  const handleEditReviewField = (field: string, value: string) => {
    setEditedReview((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditPlanField = (field: string, value: string | string[]) => {
    setEditedBusinessPlan((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleApproveIdeaAndContinue = () => {
    setShowingAiReview(false);
    const plan = generateBusinessPlan(formData);
    setBusinessPlanDraft(plan);
    setEditedBusinessPlan(plan);
    setShowingBusinessPlan(true);
    window.scrollTo(0, 0);
  };

  const handleSubmitApplication = () => {
    // Submit with the business plan data
    handleSubmit(new Event('submit') as any);
  };

  const handleGenerateBusinessPlan = () => {
    const plan = generateBusinessPlan(formData);
    setBusinessPlanDraft(plan);
    setEditedBusinessPlan(plan);
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
      // After step 1, show AI review before going to business plan
      handleGenerateAiReview();
      return;
    }
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (showingBusinessPlan) {
      setShowingBusinessPlan(false);
      setShowingAiReview(true);
      window.scrollTo(0, 0);
      return;
    }
    if (showingAiReview) {
      setShowingAiReview(false);
      window.scrollTo(0, 0);
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

  const progressPercent = showingAiReview ? 66 : showingBusinessPlan ? 90 : ((currentStep + 1) / 2) * 100;

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
                        <Sparkles className="h-6 w-6 text-cyan-600" />
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">AI Review of Your Idea</h2>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">Here's a complete review of your idea submission. Edit any section if you'd like to refine it.</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: "coreIdea", label: "Core Idea" },
                        { key: "problemSolution", label: "Problem & Solution" },
                        { key: "whyNow", label: "Why Now?" },
                        { key: "marketOpportunity", label: "Market Opportunity" },
                        { key: "currentProgress", label: "Current Progress & Next Steps" },
                        { key: "businessModel", label: "Business Model" },
                        { key: "commitment", label: "Your Commitment" }
                      ].map((section) => (
                        <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                          <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                            <CardTitle className="text-lg">{section.label}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <textarea
                              value={editedReview[section.key as keyof typeof editedReview]}
                              onChange={(e) => handleEditReviewField(section.key, e.target.value)}
                              className="w-full min-h-20 p-4 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              data-testid={`textarea-review-${section.key}`}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Edit any section directly above</strong> if you'd like to refine the AI's rephrasing. Then continue to build your business plan.
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

                {/* Business Plan Screen - EDITABLE */}
                {showingBusinessPlan && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-cyan-600" />
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Your Business Plan</h2>
                      </div>
                      <p className="text-muted-foreground">Here's the business plan that was generated by AI. Edit each section to customize it for your needs.</p>
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: "executiveSummary", label: "Executive Summary" },
                        { key: "problemStatement", label: "Problem Statement" },
                        { key: "solution", label: "Solution" },
                        { key: "targetMarket", label: "Target Market" },
                        { key: "marketSize", label: "Market Size & Opportunity" },
                        { key: "revenueModel", label: "Revenue Model & Pricing" },
                        { key: "competitiveAdvantage", label: "Competitive Advantage" },
                        { key: "roadmap12Month", label: "12-Month Roadmap" },
                        { key: "fundingRequirements", label: "Funding Requirements" },
                        { key: "risksAndMitigation", label: "Risks & Mitigation" },
                        { key: "successMetrics", label: "Success Metrics" }
                      ].map((section) => (
                        <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                          <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                            <CardTitle className="text-lg">{section.label}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <textarea
                              value={editedBusinessPlan[section.key] || ""}
                              onChange={(e) => handleEditPlanField(section.key, e.target.value)}
                              className="w-full min-h-24 p-4 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              data-testid={`textarea-plan-${section.key}`}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Customize all sections</strong> above to match your vision. Use "Previous" to go back to your idea review if needed.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                          data-testid="button-plan-back"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSubmitApplication}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold"
                          data-testid="button-submit-application"
                        >
                          Submit Application <ChevronRight className="ml-2 h-4 w-4" />
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
                      <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Step 2: Tell Us About Your Idea</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Help us understand your vision and business opportunity</p>
                      <Progress value={50} className="h-2" />
                    </div>

                    <form className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
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
