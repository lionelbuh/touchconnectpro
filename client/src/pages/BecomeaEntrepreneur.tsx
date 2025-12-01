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

// Mock AI responses - All 43 Questions
const generateAIReview = (formData: any) => {
  return {
    problem: formData.problem || "Problem not provided",
    whoExperiences: formData.whoExperiences || "Target audience not specified",
    problemImportance: formData.problemImportance || "Urgency to be determined",
    currentSolutions: formData.currentSolutions || "Current solution landscape not detailed",
    ideaName: formData.ideaName || "Project name pending",
    ideaDescription: formData.ideaDescription || "Solution description pending",
    valueProposition: formData.valueProposition || "Unique value to be articulated",
    idealCustomer: formData.idealCustomer || "Customer profile to be refined",
    targetMarket: formData.targetMarket || "Market segment to be defined",
    marketSize: formData.marketSize || "Market sizing analysis needed",
    customerReach: formData.customerReach || "Customer acquisition strategy pending",
    hasCustomers: formData.hasCustomers || "Customer validation status unknown",
    customerCount: formData.customerCount || "No customer metrics provided",
    hasRevenue: formData.hasRevenue || "Revenue status not confirmed",
    revenueAmount: formData.revenueAmount || "Revenue figures not disclosed",
    revenueRecurring: formData.revenueRecurring || "Revenue model pattern not specified",
    productUsage: formData.productUsage || "Usage metrics to be tracked",
    monetization: formData.monetization || "Monetization strategy pending",
    pricing: formData.pricing || "Pricing model to be finalized",
    mainCosts: formData.mainCosts || "Cost structure analysis needed",
    successIn12Months: formData.successIn12Months || "12-month targets to be set",
    directCompetitors: formData.directCompetitors || "Competitive landscape analysis pending",
    competitorStrengths: formData.competitorStrengths || "Competitor strengths to be analyzed",
    competitorWeakness: formData.competitorWeakness || "Your competitive advantage to be defined",
    currentStage: formData.currentStage || "Development stage unclear",
    hasDemo: formData.hasDemo || "Demo status not specified",
    existingFeatures: formData.existingFeatures || "Feature roadmap pending",
    featuresToBuild: formData.featuresToBuild || "Build priority list pending",
    linkedinWebsite: formData.linkedinWebsite || "Professional profile not provided",
    foundedBefore: formData.foundedBefore || "Entrepreneurial experience level unclear",
    soloOrCoFounders: formData.soloOrCoFounders || "Team composition not specified",
    personalSkills: formData.personalSkills || "Founder skills profile pending",
    missingSkills: formData.missingSkills || "Skill gaps to be addressed",
    timePerWeek: formData.timePerWeek || "Time commitment level not specified",
    personalInvestment: formData.personalInvestment || "Personal financial commitment unclear",
    externalFunding: formData.externalFunding || "Funding history not provided",
    fundingNeeded: formData.fundingNeeded || "Funding requirements pending",
    fundingUseCase: formData.fundingUseCase || "Use of funds to be detailed",
    investorType: formData.investorType || "Investor preference not specified",
    nextSteps: formData.nextSteps || "Action plan pending",
    currentObstacle: formData.currentObstacle || "Key challenges to be addressed",
    mentorHelp: formData.mentorHelp || "Mentorship needs not specified",
    technicalExpertHelp: formData.technicalExpertHelp || "Technical support needs pending"
  };
};

const generateBusinessPlan = (formData: any) => {
  return {
    executiveSummary: `${formData.ideaName || "Your solution"} addresses the critical problem of "${formData.problem || "market inefficiency"}" for ${formData.idealCustomer || "our target market"}}. With a market opportunity of ${formData.marketSize || "$500M+"}}, we project significant growth. Our competitive advantage lies in ${formData.valueProposition || "superior technology and user experience"}}. We plan to reach profitability within 24 months by targeting ${formData.customerReach || "customers through strategic channels"}}. Initial funding requirement: ${formData.fundingNeeded || "$500K"}}. Our team is ${formData.soloOrCoFounders || "committed to execution"}} with expertise in ${formData.personalSkills || "key business areas"}}. This plan outlines our path to market leadership.`,
    problemStatement: `Problem: ${formData.problem || "Market gap identified"}}. Affected Users: ${formData.whoExperiences || "target audience"}}. Impact: ${formData.problemImportance || "significant pain points across the market"}}. Current Solutions: ${formData.currentSolutions || "existing approaches are fragmented and inefficient"}}. Why It Matters Now: Market conditions have shifted dramatically. First-mover advantage is critical. Estimated TAM: ${formData.marketSize || "$500M+"}}.`,
    solution: `Solution: ${formData.ideaDescription || "Innovative approach"}}. Key Value: ${formData.valueProposition || "superior solution"}}. What We've Built: ${formData.existingFeatures || "core functionality"}}. What's Coming: ${formData.featuresToBuild || "advanced features in development"}}. How We Differentiate: While competitors focus on ${formData.competitorStrengths || "legacy approaches"}}, we outperform by ${formData.competitorWeakness || "innovating where they fail"}}. Current Status: ${formData.currentStage || "MVP stage"}}. Demo Available: ${formData.hasDemo || "custom demo available"}}.`,
    targetMarket: `Ideal Customer: ${formData.idealCustomer || "early adopters and innovators"}}. Industry: ${formData.targetMarket || "target market segment"}}. Market Size: TAM of ${formData.marketSize || "$500M+"}} growing at 25-35% annually. How We Reach Them: ${formData.customerReach || "multi-channel strategy including direct sales and partnerships"}}. Existing Traction: ${formData.hasCustomers === "Yes" ? `We have ${formData.customerCount || "active"}} customers` : "Validated through customer discovery"}}. Usage: ${formData.productUsage || "strong engagement metrics"}}. Revenue Status: ${formData.hasRevenue === "Yes" ? `Already generating $${formData.revenueAmount || "revenue"}` : "Pre-revenue, launching monetization Q1"}}.`,
    marketSize: `Total Addressable Market (TAM): ${formData.marketSize || "$500M+"}}, growing at 25-35% annually. Serviceable Addressable Market (SAM): $100M-$200M in Year 1-2. Serviceable Obtainable Market (SOM): $10M-$50M in Year 3 with focused execution. Current Customers: ${formData.customerCount || "Targeting customers through"}} ${formData.customerReach || "strategic channels"}}. Revenue Type: ${formData.revenueRecurring || "recurring subscription"}} model. Expansion Potential: Adjacent markets worth additional $200M+ opportunity.`,
    revenueModel: `Monetization Strategy: ${formData.monetization || "Subscription-based SaaS model"}}. Pricing Structure: ${formData.pricing || "$99-$999/month tiered"}}. Additional Revenue Streams: Professional services (15-20% margin), premium features (20% adoption). Current Revenue: ${formData.hasRevenue === "Yes" ? `$${formData.revenueAmount || "revenue generating"}` : "Pre-revenue"}}. Year 1 Target: 100+ customers, $120K MRR. Year 2: 1000 customers, $1.2M MRR, breakeven. Year 3: 5000+ customers, $6M+ MRR with 40% net margins. Cost Structure: ${formData.mainCosts || "Engineering, Sales & Marketing, Operations"}}.`,
    competitiveAdvantage: `Direct Competitors: ${formData.directCompetitors || "legacy solutions and emerging startups"}}. Their Strengths: ${formData.competitorStrengths || "market presence and brand"}}. Where We Win: ${formData.competitorWeakness || "superior technology, better UX, 40% lower cost"}}. Our Defensibility: Proprietary technology (${formData.valueProposition || "innovation focus"}}), customer-centric approach, experienced team (${formData.personalSkills || "core competencies"}}). Time to Build: ${formData.existingFeatures || "Core features complete"}}, roadmap: ${formData.featuresToBuild || "advanced features in development"}}.`,
    roadmap12Month: `Month 1-3: ${formData.existingFeatures || "Complete MVP"}}. Conduct 50+ customer interviews. Establish partnerships. Month 4-6: Launch to ${formData.hasCustomers === "Yes" ? "expand current customer base" : "first 100 beta customers"}}. Optimize based on feedback. Hire key team members. Month 7-9: Scale to ${formData.successIn12Months || "significant customer base"}}. Expand enterprise offerings. Month 10-12: Reach 1000+ customers. Expand team to 8-10 people. Close ${formData.fundingNeeded || "$500K-$1M"}} seed round. Immediate Actions: ${formData.nextSteps || "Product development and customer outreach"}}.`,
    fundingRequirements: `Total Funding Needed: ${formData.fundingNeeded || "$500K seed round"}}. Use of Funds: Engineering/Product ($250K), Sales & Marketing ($150K), Operations ($100K). Current Stage: ${formData.currentStage || "MVP stage"}}. Previous Investment: ${formData.personalInvestment || "founder investment already deployed"}}. Prior Funding: ${formData.externalFunding || "no external funding to date"}}. Investor Profile: ${formData.investorType || "seed-stage venture capital and angels"}}. Timeline: Seeking capital immediately. Team: ${formData.soloOrCoFounders || "experienced founders"}} with ${formData.personalSkills || "complementary expertise"}}.`,
    risksAndMitigation: `Risk 1: Market adoption slower than projected. Mitigation: ${formData.hasCustomers === "Yes" ? "Already validated with paying customers" : "Extensive customer discovery planned"}}. Flexible pricing. Risk 2: Competitive response. Mitigation: Focus on ${formData.valueProposition || "differentiation"}}. Speed to market. Risk 3: Key person dependency. Mitigation: Hire experienced team. Build strong culture. Risk 4: Technical challenges. Mitigation: Use proven architecture. Hire strong engineers. Risk 5: Funding constraints. Mitigation: Conservative burn (${formData.mainCosts || "cost-efficient model"}}). Focus on unit economics. Risk 6: Execution delays. Mitigation: ${formData.currentObstacle || "clear action plan"}}.`,
    successMetrics: `Primary KPIs: (1) MRR - Target $120K by Month 12, (2) CAC - Target $500 with 12-month payback, (3) Active Users - Target 1000+ by Month 12, (4) NRR - Target 110%+, (5) Churn - Target <5% monthly. Secondary: NPS Target 50+, Feature Adoption 70%+, Support Response <2 hours. Success Criteria: Achieve {{currentStage === "Revenue" ? "10x revenue growth" : formData.successIn12Months || "500+ customers by end of Year 1"}}. Customer Satisfaction: >80% NPS and retention. Team Goals: Expand to {{soloOrCoFounders === "Solo" ? "3-4 person team" : "8-10 person team"}} by Month 12.`
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
          return { valid: false, missingField: null };
        }
        if (formData.country === "United States" && !formData.state) {
          alert("Please select your state");
          return { valid: false, missingField: null };
        }
        return { valid: true, missingField: null };
      case 1: // Idea Questions - Only required fields (marked with *)
        const missingFieldsMap = [];
        if (!formData.problem) missingFieldsMap.push({ name: "Problem", id: "problem" });
        if (!formData.whoExperiences) missingFieldsMap.push({ name: "Who Experiences This", id: "whoExperiences" });
        if (!formData.ideaName) missingFieldsMap.push({ name: "Idea Name", id: "ideaName" });
        if (!formData.ideaDescription) missingFieldsMap.push({ name: "Idea Description", id: "ideaDescription" });
        if (!formData.idealCustomer) missingFieldsMap.push({ name: "Ideal Customer", id: "idealCustomer" });
        if (!formData.customerReach) missingFieldsMap.push({ name: "Customer Reach", id: "customerReach" });
        if (!formData.hasCustomers) missingFieldsMap.push({ name: "Do you have customers?", id: "hasCustomers" });
        if (!formData.hasRevenue) missingFieldsMap.push({ name: "Do you have revenue?", id: "hasRevenue" });
        if (!formData.revenueRecurring) missingFieldsMap.push({ name: "Revenue Type", id: "revenueRecurring" });
        if (!formData.monetization) missingFieldsMap.push({ name: "Monetization", id: "monetization" });
        if (!formData.pricing) missingFieldsMap.push({ name: "Pricing", id: "pricing" });
        if (!formData.mainCosts) missingFieldsMap.push({ name: "Main Costs", id: "mainCosts" });
        if (!formData.successIn12Months) missingFieldsMap.push({ name: "12-Month Success", id: "successIn12Months" });
        if (!formData.directCompetitors) missingFieldsMap.push({ name: "Direct Competitors", id: "directCompetitors" });
        if (!formData.competitorWeakness) missingFieldsMap.push({ name: "Competitive Advantage", id: "competitorWeakness" });
        if (!formData.currentStage) missingFieldsMap.push({ name: "Current Stage", id: "currentStage" });
        if (!formData.existingFeatures) missingFieldsMap.push({ name: "Existing Features", id: "existingFeatures" });
        if (!formData.foundedBefore) missingFieldsMap.push({ name: "Founded Before", id: "foundedBefore" });
        if (!formData.soloOrCoFounders) missingFieldsMap.push({ name: "Team Composition", id: "soloOrCoFounders" });
        if (!formData.personalSkills) missingFieldsMap.push({ name: "Your Skills", id: "personalSkills" });
        if (!formData.missingSkills) missingFieldsMap.push({ name: "Missing Skills", id: "missingSkills" });
        if (!formData.timePerWeek) missingFieldsMap.push({ name: "Time Commitment", id: "timePerWeek" });
        if (!formData.personalInvestment) missingFieldsMap.push({ name: "Personal Investment", id: "personalInvestment" });
        if (!formData.externalFunding) missingFieldsMap.push({ name: "External Funding", id: "externalFunding" });
        if (!formData.fundingNeeded) missingFieldsMap.push({ name: "Funding Needed", id: "fundingNeeded" });
        if (!formData.fundingUseCase) missingFieldsMap.push({ name: "Use of Funds", id: "fundingUseCase" });
        if (!formData.nextSteps) missingFieldsMap.push({ name: "Next Steps", id: "nextSteps" });
        if (!formData.currentObstacle) missingFieldsMap.push({ name: "Current Obstacle", id: "currentObstacle" });
        if (missingFieldsMap.length > 0) {
          return { valid: false, missingField: missingFieldsMap[0].id };
        }
        return { valid: true, missingField: null };
      default:
        return { valid: true, missingField: null };
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
    setTimeout(() => {
      window.scrollTo({ top: 1150, behavior: 'smooth' });
    }, 250);
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
    const validation = validateStep();
    if (!validation.valid) {
      if (validation.missingField) {
        setTimeout(() => {
          const elem = document.querySelector(`[data-field="${validation.missingField}"]`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (elem as any).focus();
          }
        }, 100);
      }
      return;
    }
    if (currentStep === 1) {
      handleGenerateAiReview();
      setTimeout(() => {
        window.scrollTo({ top: 1150, behavior: 'smooth' });
      }, 300);
      return;
    }
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        window.scrollTo({ top: 1150, behavior: 'smooth' });
      }, 250);
    }
  };

  const handlePrevious = () => {
    if (showingBusinessPlan) {
      setShowingBusinessPlan(false);
      setShowingAiReview(true);
      setTimeout(() => {
        window.scrollTo({ top: 1150, behavior: 'smooth' });
      }, 150);
      return;
    }
    if (showingAiReview) {
      setShowingAiReview(false);
      setTimeout(() => {
        window.scrollTo({ top: 1150, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimeout(() => {
        window.scrollTo({ top: 1150, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStep();
    if (!validation.valid) {
      if (validation.missingField) {
        setTimeout(() => {
          const elem = document.querySelector(`[data-field="${validation.missingField}"]`);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
      return;
    }

    // Save to localStorage with pending status
    const entrepreneurData = { 
      ...formData, 
      businessPlan: editedBusinessPlan,
      ideaReview: editedReview,
      status: "pending", 
      submittedAt: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    const existingApplications = JSON.parse(localStorage.getItem("tcp_entrepreneurApplications") || "[]");
    existingApplications.push(entrepreneurData);
    localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(existingApplications));
    
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = `/admin-dashboard`;
    }, 2000);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    setShowForm(false);
    setCurrentStep(0);
    setShowingAiReview(false);
    setShowingBusinessPlan(false);
    setFormData({
      fullName: "", email: "", linkedin: "", country: "United States", state: "",
      problem: "", whoExperiences: "", problemImportance: "", currentSolutions: "",
      ideaName: "", ideaDescription: "", valueProposition: "",
      idealCustomer: "", targetMarket: "", marketSize: "", customerReach: "",
      hasCustomers: "", customerCount: "", hasRevenue: "", revenueAmount: "", revenueRecurring: "", productUsage: "",
      monetization: "", pricing: "", mainCosts: "", successIn12Months: "",
      directCompetitors: "", competitorStrengths: "", competitorWeakness: "",
      currentStage: "", hasDemo: "", existingFeatures: "", featuresToBuild: "",
      linkedinWebsite: "", foundedBefore: "", soloOrCoFounders: "", personalSkills: "", missingSkills: "", timePerWeek: "",
      personalInvestment: "", externalFunding: "", fundingNeeded: "", fundingUseCase: "", investorType: "",
      nextSteps: "", currentObstacle: "", mentorHelp: "", technicalExpertHelp: ""
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
                  <div className="space-y-6" data-section="ai-review">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-6 w-6 text-cyan-600" />
                        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">AI Review of Your Idea - All 43 Questions</h2>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">Here's a review of all your answers. Edit any section if you'd like to refine it before building your business plan.</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: "problem", label: "1. What problem are you solving?" },
                        { key: "whoExperiences", label: "2. Who experiences this problem?" },
                        { key: "problemImportance", label: "3. Why is this problem important to solve now?" },
                        { key: "currentSolutions", label: "4. How are people solving it today?" },
                        { key: "ideaName", label: "5. Project/Company name?" },
                        { key: "ideaDescription", label: "6. What is your idea/solution in simple words?" },
                        { key: "valueProposition", label: "7. What is the unique benefit/value proposition?" },
                        { key: "idealCustomer", label: "8. Who is your ideal customer?" },
                        { key: "targetMarket", label: "9. What market/industry does your solution target?" },
                        { key: "marketSize", label: "10. How large is your potential market?" },
                        { key: "customerReach", label: "11. Where or how will you reach your customers?" },
                        { key: "hasCustomers", label: "12. Do you already have customers/users?" },
                        { key: "customerCount", label: "13. How many customers/users do you currently have?" },
                        { key: "hasRevenue", label: "14. Do you already generate revenue?" },
                        { key: "revenueAmount", label: "15. How much revenue so far?" },
                        { key: "revenueRecurring", label: "16. Is revenue recurring or one-time?" },
                        { key: "productUsage", label: "17. Do customers actively use the product?" },
                        { key: "monetization", label: "18. How will you make money?" },
                        { key: "pricing", label: "19. What do you plan to charge?" },
                        { key: "mainCosts", label: "20. What are your main costs?" },
                        { key: "successIn12Months", label: "21. What does success look like in 12 months?" },
                        { key: "directCompetitors", label: "22. Who are your direct competitors?" },
                        { key: "competitorStrengths", label: "23. What do competitors do well?" },
                        { key: "competitorWeakness", label: "24. Where can you outperform them?" },
                        { key: "currentStage", label: "25. What stage are you currently in?" },
                        { key: "hasDemo", label: "26. Do you have a demo/prototype?" },
                        { key: "existingFeatures", label: "27. Which key features already exist?" },
                        { key: "featuresToBuild", label: "28. Which features still need to be built?" },
                        { key: "linkedinWebsite", label: "29. LinkedIn profile or website?" },
                        { key: "foundedBefore", label: "30. Have you founded or launched a startup before?" },
                        { key: "soloOrCoFounders", label: "31. Solo or with co-founders?" },
                        { key: "personalSkills", label: "32. What skills do you personally bring?" },
                        { key: "missingSkills", label: "33. What skills are missing from your team?" },
                        { key: "timePerWeek", label: "34. How much time per week can you dedicate?" },
                        { key: "personalInvestment", label: "35. Have you invested personal money?" },
                        { key: "externalFunding", label: "36. Have you received any external funding?" },
                        { key: "fundingNeeded", label: "37. How much funding do you think you need now?" },
                        { key: "fundingUseCase", label: "38. What would funding be used for?" },
                        { key: "investorType", label: "39. What type of investors are you looking for?" },
                        { key: "nextSteps", label: "40. What are the next 3 steps you plan to take?" },
                        { key: "currentObstacle", label: "41. What is your biggest current obstacle?" },
                        { key: "mentorHelp", label: "42. What help do you need from mentors?" },
                        { key: "technicalExpertHelp", label: "43. What help do you need from technical experts?" }
                      ].map((section) => (
                        <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                          <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                            <CardTitle className="text-base">{section.label}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <textarea
                              value={editedReview[section.key as keyof typeof editedReview] || ""}
                              onChange={(e) => handleEditReviewField(section.key, e.target.value)}
                              className="w-full min-h-16 p-4 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  <div className="space-y-6" data-section="business-plan">
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
                              value={(editedBusinessPlan[section.key] || "").replace(/}/g, "")}
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
                  <div className="space-y-6" data-section="step-2">
                    <div>
                      <h2 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">Step 2: Tell Us About Your Idea</h2>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Help us understand your vision and business opportunity</p>
                      <Progress value={50} className="h-2" />
                    </div>

                    <form className="space-y-6">
                      {/* Problem & Market Definition */}
                      <div className="border-l-4 border-emerald-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Problem & Market</h3>
                        <div className="space-y-4">
                          <div data-field="problem">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What problem are you solving? *</label>
                            <textarea name="problem" value={formData.problem} onChange={handleInputChange} placeholder="Describe the problem..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-problem" />
                          </div>
                          <div data-field="whoExperiences">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Who experiences this problem? *</label>
                            <textarea name="whoExperiences" value={formData.whoExperiences} onChange={handleInputChange} placeholder="Describe who has this problem..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-who" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Why is this problem important to solve now?</label>
                            <textarea name="problemImportance" value={formData.problemImportance} onChange={handleInputChange} placeholder="Why now?" rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-importance" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How are people solving it today?</label>
                            <textarea name="currentSolutions" value={formData.currentSolutions} onChange={handleInputChange} placeholder="Current solutions..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-current" />
                          </div>
                        </div>
                      </div>

                      {/* Your Solution */}
                      <div className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Solution</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Project/Company name on TouchConnectPro? *</label>
                            <Input name="ideaName" value={formData.ideaName} onChange={handleInputChange} placeholder="Your project name..." className="w-full" data-testid="input-idea-name" data-field="ideaName" />
                          </div>
                          <div data-field="ideaDescription">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What is your idea/solution in simple words? *</label>
                            <textarea name="ideaDescription" value={formData.ideaDescription} onChange={handleInputChange} placeholder="Describe your solution..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-idea-desc" />
                          </div>
                          <div data-field="valueProposition">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What is the unique benefit/value proposition?</label>
                            <textarea name="valueProposition" value={formData.valueProposition} onChange={handleInputChange} placeholder="Your unique value..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-value" />
                          </div>
                        </div>
                      </div>

                      {/* Market & Customer */}
                      <div className="border-l-4 border-purple-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Market & Customer</h3>
                        <div className="space-y-4">
                          <div data-field="idealCustomer">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Who is your ideal customer? *</label>
                            <textarea name="idealCustomer" value={formData.idealCustomer} onChange={handleInputChange} placeholder="Customer profile..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-customer" />
                          </div>
                          <div data-field="targetMarket">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What market/industry does your solution target?</label>
                            <Input name="targetMarket" value={formData.targetMarket} onChange={handleInputChange} placeholder="Target market..." className="w-full" data-testid="input-target-market" data-field="targetMarket" />
                          </div>
                          <div data-field="marketSize">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How large is your potential market?</label>
                            <Input name="marketSize" value={formData.marketSize} onChange={handleInputChange} placeholder="Market size..." className="w-full" data-testid="input-market-size" data-field="marketSize" />
                          </div>
                          <div data-field="customerReach">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Where or how will you reach your customers? *</label>
                            <textarea name="customerReach" value={formData.customerReach} onChange={handleInputChange} placeholder="How you'll reach customers..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-reach" />
                          </div>
                        </div>
                      </div>

                      {/* Traction & Validation */}
                      <div className="border-l-4 border-cyan-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Traction & Validation</h3>
                        <div className="space-y-4">
                          <div data-field="hasCustomers">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do you already have customers/users? *</label>
                            <select name="hasCustomers" value={formData.hasCustomers} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-customers" data-field="hasCustomers">
                              <option value="">Select...</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="In beta">In beta</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How many customers/users do you currently have?</label>
                            <Input name="customerCount" value={formData.customerCount} onChange={handleInputChange} placeholder="Number of users..." className="w-full" data-testid="input-customer-count" />
                          </div>
                          <div data-field="hasRevenue">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do you already generate revenue? *</label>
                            <select name="hasRevenue" value={formData.hasRevenue} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-revenue" data-field="hasRevenue">
                              <option value="">Select...</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How much revenue so far?</label>
                            <Input name="revenueAmount" value={formData.revenueAmount} onChange={handleInputChange} placeholder="Revenue amount..." className="w-full" data-testid="input-revenue" />
                          </div>
                          <div data-field="revenueRecurring">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Is revenue recurring or one-time? *</label>
                            <select name="revenueRecurring" value={formData.revenueRecurring} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-recurring" data-field="revenueRecurring">
                              <option value="">Select...</option>
                              <option value="Recurring">Recurring</option>
                              <option value="One-time">One-time</option>
                              <option value="Mix">Mix</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do customers actively use the product?</label>
                            <Input name="productUsage" value={formData.productUsage} onChange={handleInputChange} placeholder="Usage metrics..." className="w-full" data-testid="input-usage" />
                          </div>
                        </div>
                      </div>

                      {/* Business Model */}
                      <div className="border-l-4 border-pink-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Business Model</h3>
                        <div className="space-y-4">
                          <div data-field="monetization">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How will you make money? *</label>
                            <textarea name="monetization" value={formData.monetization} onChange={handleInputChange} placeholder="Revenue model..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-monetization" />
                          </div>
                          <div data-field="pricing">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What do you plan to charge? *</label>
                            <Input name="pricing" value={formData.pricing} onChange={handleInputChange} placeholder="Your pricing..." className="w-full" data-testid="input-pricing" data-field="pricing" />
                          </div>
                          <div data-field="mainCosts">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What are your main costs? *</label>
                            <textarea name="mainCosts" value={formData.mainCosts} onChange={handleInputChange} placeholder="Your main costs..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-costs" />
                          </div>
                          <div data-field="successIn12Months">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What does success look like in 12 months? *</label>
                            <textarea name="successIn12Months" value={formData.successIn12Months} onChange={handleInputChange} placeholder="Success metrics..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-success-12m" />
                          </div>
                        </div>
                      </div>

                      {/* Competition */}
                      <div className="border-l-4 border-indigo-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Competition</h3>
                        <div className="space-y-4">
                          <div data-field="directCompetitors">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Who are your direct competitors? *</label>
                            <textarea name="directCompetitors" value={formData.directCompetitors} onChange={handleInputChange} placeholder="Your competitors..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-competitors" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What do competitors do well?</label>
                            <textarea name="competitorStrengths" value={formData.competitorStrengths} onChange={handleInputChange} placeholder="Their strengths..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-comp-strengths" />
                          </div>
                          <div data-field="competitorWeakness">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Where can you outperform them? *</label>
                            <textarea name="competitorWeakness" value={formData.competitorWeakness} onChange={handleInputChange} placeholder="Your advantage..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-comp-weakness" />
                          </div>
                        </div>
                      </div>

                      {/* Product Development */}
                      <div className="border-l-4 border-orange-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Product Development</h3>
                        <div className="space-y-4">
                          <div data-field="currentStage">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What stage are you currently in? *</label>
                            <select name="currentStage" value={formData.currentStage} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-stage" data-field="currentStage">
                              <option value="">Select...</option>
                              <option value="Idea only">Idea only</option>
                              <option value="Mockup">Mockup</option>
                              <option value="MVP">MVP</option>
                              <option value="Beta">Beta</option>
                              <option value="Live">Live</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Do you have a demo/prototype?</label>
                            <Input name="hasDemo" value={formData.hasDemo} onChange={handleInputChange} placeholder="Demo/prototype..." className="w-full" data-testid="input-demo" />
                          </div>
                          <div data-field="existingFeatures">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Which key features already exist? *</label>
                            <textarea name="existingFeatures" value={formData.existingFeatures} onChange={handleInputChange} placeholder="Existing features..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-features" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Which features still need to be built?</label>
                            <textarea name="featuresToBuild" value={formData.featuresToBuild} onChange={handleInputChange} placeholder="Features to build..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-build-features" />
                          </div>
                        </div>
                      </div>

                      {/* Founder Profile */}
                      <div className="border-l-4 border-red-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Founder Profile</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">LinkedIn profile or website?</label>
                            <Input name="linkedinWebsite" value={formData.linkedinWebsite} onChange={handleInputChange} placeholder="Your LinkedIn/website..." className="w-full" data-testid="input-linkedin-web" />
                          </div>
                          <div data-field="foundedBefore">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Have you founded or launched a startup before? *</label>
                            <select name="foundedBefore" value={formData.foundedBefore} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-founded" data-field="foundedBefore">
                              <option value="">Select...</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="In progress">In progress</option>
                            </select>
                          </div>
                          <div data-field="soloOrCoFounders">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Solo or with co-founders? *</label>
                            <select name="soloOrCoFounders" value={formData.soloOrCoFounders} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white" data-testid="select-founders" data-field="soloOrCoFounders">
                              <option value="">Select...</option>
                              <option value="Solo">Solo</option>
                              <option value="2 co-founders">2 co-founders</option>
                              <option value="3+ co-founders">3+ co-founders</option>
                            </select>
                          </div>
                          <div data-field="personalSkills">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What skills do you personally bring? *</label>
                            <textarea name="personalSkills" value={formData.personalSkills} onChange={handleInputChange} placeholder="Your skills..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-skills" />
                          </div>
                          <div data-field="missingSkills">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What skills are missing from your team? *</label>
                            <textarea name="missingSkills" value={formData.missingSkills} onChange={handleInputChange} placeholder="Missing skills..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-missing" />
                          </div>
                          <div data-field="timePerWeek">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How much time per week can you dedicate? *</label>
                            <Input name="timePerWeek" value={formData.timePerWeek} onChange={handleInputChange} placeholder="Hours per week..." className="w-full" data-testid="input-time-week" data-field="timePerWeek" />
                          </div>
                        </div>
                      </div>

                      {/* Funding */}
                      <div className="border-l-4 border-yellow-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Funding & Investment</h3>
                        <div className="space-y-4">
                          <div data-field="personalInvestment">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Have you invested personal money? *</label>
                            <Input name="personalInvestment" value={formData.personalInvestment} onChange={handleInputChange} placeholder="Amount invested..." className="w-full" data-testid="input-personal-invest" data-field="personalInvestment" />
                          </div>
                          <div data-field="externalFunding">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Have you received any external funding? *</label>
                            <Input name="externalFunding" value={formData.externalFunding} onChange={handleInputChange} placeholder="External funding..." className="w-full" data-testid="input-external-fund" data-field="externalFunding" />
                          </div>
                          <div data-field="fundingNeeded">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">How much funding do you think you need now? *</label>
                            <Input name="fundingNeeded" value={formData.fundingNeeded} onChange={handleInputChange} placeholder="Funding amount..." className="w-full" data-testid="input-funding-needed" data-field="fundingNeeded" />
                          </div>
                          <div data-field="fundingUseCase">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What would funding be used for? *</label>
                            <textarea name="fundingUseCase" value={formData.fundingUseCase} onChange={handleInputChange} placeholder="Use of funds..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-use-case" />
                          </div>
                          <div data-field="investorType">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What type of investors are you looking for?</label>
                            <Input name="investorType" value={formData.investorType} onChange={handleInputChange} placeholder="Investor types..." className="w-full" data-testid="input-investors" data-field="investorType" />
                          </div>
                        </div>
                      </div>

                      {/* Execution Plan */}
                      <div className="border-l-4 border-green-500 pl-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Execution Plan</h3>
                        <div className="space-y-4">
                          <div data-field="nextSteps">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What are the next 3 steps you plan to take? *</label>
                            <textarea name="nextSteps" value={formData.nextSteps} onChange={handleInputChange} placeholder="Next steps..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-next-steps" />
                          </div>
                          <div data-field="currentObstacle">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What is your biggest current obstacle? *</label>
                            <textarea name="currentObstacle" value={formData.currentObstacle} onChange={handleInputChange} placeholder="Biggest challenge..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-obstacle" />
                          </div>
                          <div data-field="mentorHelp">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What help do you need from mentors?</label>
                            <textarea name="mentorHelp" value={formData.mentorHelp} onChange={handleInputChange} placeholder="Mentor support..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-mentor-help" />
                          </div>
                          <div data-field="technicalExpertHelp">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">What help do you need from technical experts?</label>
                            <textarea name="technicalExpertHelp" value={formData.technicalExpertHelp} onChange={handleInputChange} placeholder="Technical support..." rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500" data-testid="textarea-tech-help" />
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

              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
