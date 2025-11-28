import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Lightbulb, Target, Users, MessageSquare, Settings, ChevronLeft, ChevronRight, Check, AlertCircle, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardEntrepreneur() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [aiEnhancedData, setAiEnhancedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "idea" | "plan" | "profile">("overview");
  const [businessPlanData, setBusinessPlanData] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    email: "entrepreneur@touchconnectpro.com",
    fullName: "John Entrepreneur",
    country: "United States",
    bio: "",
    linkedIn: "",
    profileImage: null as string | null
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    problem: "",
    targetUser: "",
    problemUrgency: "",
    alternatives: "",
    ideaName: "",
    solution: "",
    valueProposition: "",
    idealCustomer: "",
    marketIndustry: "",
    marketSize: "",
    marketingChannels: "",
    hasCustomers: "no",
    customerType: "",
    customerCount: "",
    hasRevenue: "no",
    revenueAmount: "",
    revenueType: "",
    monthlyActiveUsers: "",
    businessModel: "",
    pricePoint: "",
    mainCosts: "",
    success12Months: "",
    competitors: "",
    competitorStrengths: "",
    yourAdvantage: "",
    developmentStage: "",
    hasDemo: "",
    existingFeatures: "",
    neededFeatures: "",
    linkedIn: "",
    previousStartup: "no",
    cofounderStatus: "",
    founderSkills: "",
    missingSkills: "",
    hoursPerWeek: "",
    personalInvestment: "",
    externalFunding: "",
    fundingNeeded: "",
    fundingUse: "",
    investorType: "",
    nextSteps: "",
    biggestObstacle: "",
    mentorHelp: "",
    techHelp: "",
    investorHelp: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("submitted") === "true") {
      setSubmitted(true);
      setBusinessPlanData({
        executiveSummary: "Your company solves a critical problem in the market with an innovative, user-centric solution. With strong market validation and a clear path to profitability, you're positioned for rapid growth.",
        problemStatement: "Many entrepreneurs struggle with developing a comprehensive business plan. Our platform bridges this gap through AI-powered insights and expert guidance.",
        solution: "TouchConnectPro provides an intelligent platform that guides entrepreneurs through structured business planning, leveraging AI to enhance clarity and investor appeal.",
        targetMarket: "Early-stage entrepreneurs (founders, co-founders) across diverse industries seeking professional business planning and mentor guidance.",
        marketSize: "$50B+ TAM in the startup advisory and business planning space, with 25M+ entrepreneurs globally seeking structured guidance.",
        revenue: "Multi-tiered revenue model: Freemium ($0-49/month), Premium ($49-99/month), and Enterprise ($250+/month) for advisor partnerships.",
        competitiveAdvantage: "Unique combination of AI-powered business plan generation, expert mentor network, and investor connections creates a defensible moat.",
        roadmap: "Q1: MVP launch, Q2: Mentor marketplace expansion, Q3: Investor integration, Q4: Achieving 10K+ active users.",
        fundingNeeds: "Seeking $500K seed funding for product development, mentor acquisition, and marketing expansion.",
        risks: "Market adoption, maintaining mentor quality, competitive pressure from larger platforms.",
        success: "Success metrics: 10K active users, 500+ mentors, $100K+ ARR by end of Year 1."
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const steps = [
    {
      title: "1. Problem & Idea",
      description: "Let's start with the core of your business",
      icon: Lightbulb,
      fields: [
        { key: "problem", label: "What problem are you solving? *", placeholder: "Describe the problem in detail...", type: "textarea", rows: 3, required: true },
        { key: "targetUser", label: "Who experiences this problem? *", placeholder: "Describe your target user/customer...", type: "textarea", rows: 3, required: true },
        { key: "problemUrgency", label: "Why is this problem important to solve now?", placeholder: "What makes this urgent?", type: "textarea", rows: 2 },
        { key: "alternatives", label: "How are people solving it today?", placeholder: "What are the alternatives or competitors?", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "Your Solution",
      description: "Tell us about your idea",
      icon: Target,
      fields: [
        { key: "ideaName", label: "How do you want to call your idea / project / company name on TouchConnectPro? *", placeholder: "Your idea/project/company name...", type: "text", required: true },
        { key: "solution", label: "What is your idea or solution in simple words? *", placeholder: "Explain your solution...", type: "textarea", rows: 3, required: true },
        { key: "valueProposition", label: "What is the unique benefit/value proposition?", placeholder: "What makes your solution special?", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "2. Market & Customer Definition",
      description: "Help us understand your market",
      icon: Users,
      fields: [
        { key: "idealCustomer", label: "Who is your ideal customer (persona profile)? *", placeholder: "Age, industry, pain points, budget...", type: "textarea", rows: 3, required: true },
        { key: "marketIndustry", label: "What market/industry does your solution target?", placeholder: "e.g., Healthcare, SaaS, E-commerce...", type: "text" },
        { key: "marketSize", label: "How large is your potential market?", placeholder: "TAM/SAM/SOM estimates if you have them", type: "textarea", rows: 2 },
        { key: "marketingChannels", label: "Where or how will you reach your customers? *", placeholder: "Social media, content marketing, partnerships...", type: "textarea", rows: 2, required: true }
      ]
    },
    {
      title: "3. Traction & Validation (Part 1)",
      description: "Do you have early traction?",
      icon: Target,
      fields: [
        { key: "hasCustomers", label: "Do you already have customers/users? *", placeholder: "Select...", type: "select", options: ["No", "Yes - Family & friends", "Yes - Friends of friends", "Yes - Strangers (cold customers)", "I'm not sure yet"], required: true },
        { key: "customerCount", label: "How many customers/users do you currently have?", placeholder: "Leave blank if N/A", type: "text" },
        { key: "hasRevenue", label: "Do you already generate revenue from this idea? *", placeholder: "Select...", type: "select", options: ["No", "Yes", "I'm not sure yet"], required: true }
      ]
    },
    {
      title: "3. Traction & Validation (Part 2)",
      description: "Tell us about your validation",
      icon: Target,
      fields: [
        { key: "revenueAmount", label: "How much revenue so far?", placeholder: "Leave blank if no revenue", type: "text" },
        { key: "revenueType", label: "Is revenue recurring or one-time? *", placeholder: "Select...", type: "select", options: ["N/A", "Recurring (subscription)", "One-time", "I'm not sure yet"], required: true },
        { key: "monthlyActiveUsers", label: "Do customers actively use the product? (MAU if applicable)", placeholder: "Monthly active users...", type: "text" }
      ]
    },
    {
      title: "4. Business Model & Monetization",
      description: "How will you make money?",
      icon: Target,
      fields: [
        { key: "businessModel", label: "How will you make money? *", placeholder: "Subscription, one-time purchase, ads, commission...", type: "textarea", rows: 2, required: true },
        { key: "pricePoint", label: "What do you plan to charge? *", placeholder: "Price point or pricing strategy", type: "text", required: true },
        { key: "mainCosts", label: "What are your main costs? *", placeholder: "Tech, marketing, fulfillment, hiring...", type: "textarea", rows: 2, required: true },
        { key: "success12Months", label: "What does success look like in 12 months?", placeholder: "Revenue targets, user numbers, metrics...", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "5. Competition & Positioning",
      description: "Tell us about your competitive advantage",
      icon: Target,
      fields: [
        { key: "competitors", label: "Who are your direct competitors? *", placeholder: "List or describe competitors", type: "textarea", rows: 2, required: true },
        { key: "competitorStrengths", label: "What do competitors do well?", placeholder: "What are their strengths?", type: "textarea", rows: 2 },
        { key: "yourAdvantage", label: "Where can you outperform them?", placeholder: "Your competitive advantage...", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "6. Product Development Stage",
      description: "What stage are you at?",
      icon: Target,
      fields: [
        { key: "developmentStage", label: "What stage are you currently in? *", placeholder: "Select...", type: "select", options: ["Idea only", "Prototype", "MVP built", "Publicly launched", "I'm not sure yet"], required: true },
        { key: "hasDemo", label: "Do you have a demo/prototype?", placeholder: "Link or description", type: "text" },
        { key: "existingFeatures", label: "Which key features already exist? *", placeholder: "List existing features...", type: "textarea", rows: 2, required: true },
        { key: "neededFeatures", label: "Which features still need to be built?", placeholder: "List features in development...", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "7. Founder Profile & Readiness",
      description: "Tell us about yourself",
      icon: Users,
      fields: [
        { key: "linkedIn", label: "Do you have a LinkedIn profile or website?", placeholder: "Link to your profile", type: "text" },
        { key: "previousStartup", label: "Have you founded or launched a startup before? *", placeholder: "Select...", type: "select", options: ["No", "Yes", "I'm not sure yet"], required: true },
        { key: "cofounderStatus", label: "Are you working solo or with co-founders? *", placeholder: "Solo, or # of co-founders...", type: "text", required: true },
        { key: "founderSkills", label: "What skills do you personally bring?", placeholder: "Tech, design, business, marketing, sales, other...", type: "textarea", rows: 2 }
      ]
    },
    {
      title: "7. Founder Profile (Continued)",
      description: "More about your team",
      icon: Users,
      fields: [
        { key: "missingSkills", label: "What skills are missing from your team? *", placeholder: "What do you need help with?", type: "textarea", rows: 2, required: true },
        { key: "hoursPerWeek", label: "How much time per week can you dedicate? *", placeholder: "Hours per week...", type: "text", required: true }
      ]
    },
    {
      title: "8. Investment & Funding Needs",
      description: "Tell us about funding",
      icon: Target,
      fields: [
        { key: "personalInvestment", label: "Have you invested personal money? How much? *", placeholder: "Amount invested or N/A", type: "text", required: true },
        { key: "externalFunding", label: "Have you received any external funding yet? *", placeholder: "Select...", type: "select", options: ["No", "Yes", "I'm not sure yet"], required: true },
        { key: "fundingNeeded", label: "How much funding do you think you need now? *", placeholder: "Amount or range...", type: "text", required: true },
        { key: "fundingUse", label: "What would funding be used for specifically? *", placeholder: "Product dev, marketing, hiring, operations...", type: "textarea", rows: 2, required: true },
        { key: "investorType", label: "What type of investors are you looking for?", placeholder: "Angels, VC, strategic investors...", type: "text" }
      ]
    },
    {
      title: "9. Short-Term Execution Plan",
      description: "What's next for you?",
      icon: Target,
      fields: [
        { key: "nextSteps", label: "What are the next 3 steps you plan to take? *", placeholder: "1. ...\n2. ...\n3. ...", type: "textarea", rows: 3, required: true },
        { key: "biggestObstacle", label: "What is your biggest current obstacle? *", placeholder: "What's blocking you the most?", type: "textarea", rows: 2, required: true },
        { key: "mentorHelp", label: "What help do you need from mentors?", placeholder: "Describe specific help needed...", type: "textarea", rows: 2 },
        { key: "techHelp", label: "What help do you need from technical experts?", placeholder: "Development, architecture, tools...", type: "textarea", rows: 2 },
        { key: "investorHelp", label: "What help do you need from investors?", placeholder: "Fundraising advice, connections, guidance...", type: "textarea", rows: 2 }
      ]
    }
  ];

  const CurrentStepIcon = steps[currentStep]?.icon || Lightbulb;
  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationError("");
  };

  const validateCurrentStep = () => {
    const requiredFields = step.fields.filter((f: any) => f.required);
    const missingFields = requiredFields.filter((f: any) => !formData[f.key as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      const missingLabels = missingFields.map((f: any) => f.label.replace(" *", "")).join(", ");
      setValidationError(`Please answer the following mandatory questions: ${missingLabels}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      setShowReview(true);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowReview(false);
  };

  const generateAIEnhancedAnswers = () => {
    const enhanced: any = {};
    steps.forEach((sec) => {
      sec.fields.forEach((field: any) => {
        const originalAnswer = formData[field.key as keyof typeof formData];
        if (originalAnswer) {
          enhanced[field.key] = {
            original: originalAnswer,
            aiEnhanced: enhanceAnswer(field.label, originalAnswer),
            isEdited: false
          };
        }
      });
    });
    setAiEnhancedData(enhanced);
    setShowAIReview(true);
    window.scrollTo(0, 0);
  };

  const enhanceAnswer = (question: string, answer: string): string => {
    const enhancements: { [key: string]: string } = {
      "problem": "Enhanced: This is a critical pain point affecting thousands of professionals daily. The urgency is clear due to market gaps in current solutions.",
      "solution": "Enhanced: Our innovative approach directly addresses the core issue with a streamlined, user-centric platform that significantly improves efficiency.",
      "ideaName": "Enhanced: Clear, memorable brand name that reflects the core value proposition and target market.",
      "ideal": "Enhanced: High-value customer segment with significant purchasing power and demonstrated willingness to adopt innovative solutions.",
      "market": "Enhanced: Substantial TAM in a high-growth sector with proven demand signals and expanding market opportunities.",
      "customers": "Enhanced: Already validated product-market fit with early adopters showing strong engagement and retention.",
      "revenue": "Enhanced: Demonstrated revenue traction validates business model viability and customer willingness to pay.",
      "monetization": "Enhanced: Diversified revenue streams with clear path to profitability and strong unit economics.",
      "competition": "Enhanced: Differentiated positioning with unique value drivers that create defensible competitive advantages.",
      "stage": "Enhanced: Clear development roadmap with achievable milestones and realistic go-to-market timeline.",
      "startup": "Enhanced: Relevant founder experience and proven track record in building and scaling ventures.",
      "team": "Enhanced: Balanced team composition with complementary skills and demonstrated execution ability.",
      "funding": "Enhanced: Well-defined capital efficiency strategy with clear allocation of resources toward growth initiatives.",
      "steps": "Enhanced: Concrete action plan with measurable milestones and realistic execution timeline.",
      "obstacle": "Enhanced: Identified potential challenges with clear mitigation strategies and contingency planning."
    };

    for (const key in enhancements) {
      if (question.toLowerCase().includes(key)) {
        return enhancements[key];
      }
    }
    
    return `Enhanced: ${answer} - This answer demonstrates clear thinking and market understanding.`;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleAcceptAIEnhancements = () => {
    const updatedFormData = { ...formData };
    Object.keys(aiEnhancedData).forEach((key) => {
      updatedFormData[key as keyof typeof formData] = aiEnhancedData[key].aiEnhanced;
    });
    setFormData(updatedFormData);
    setShowAIReview(false);
    setShowSuccessPage(true);
    window.scrollTo(0, 0);
  };

  const handleCreateBusinessPlan = () => {
    const ideaName = formData.ideaName || "My Idea";
    window.location.href = `/business-plan?ideaName=${encodeURIComponent(ideaName)}`;
  };

  const handleBusinessPlanSubmitted = (plan: any) => {
    setBusinessPlanData(plan);
    setActiveTab("plan");
  };

  const handleEditAIAnswer = (key: string, value: string) => {
    setAiEnhancedData((prev: any) => ({
      ...prev,
      [key]: {
        ...prev[key],
        aiEnhanced: value,
        isEdited: true
      }
    }));
  };

  if (showSuccessPage && !submitted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">Creating Business Plan</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Thank You!</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Your idea has been submitted and enhanced by our AI.</p>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Let's create your professional business plan that will impress mentors and investors.</p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mb-3" onClick={handleCreateBusinessPlan} data-testid="button-create-business-plan">Let's create your AI Draft Business Plan</Button>
            <Button variant="outline" className="w-full border-slate-300" onClick={() => setShowSuccessPage(false)} data-testid="button-back-from-success">Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-amber-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">On Waiting List</div>
              </div>
            </div>
            <nav className="space-y-1">
              <Button 
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium"
                onClick={() => setActiveTab("overview")}
                data-testid="button-overview-tab"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button 
                variant={activeTab === "idea" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("idea")}
                data-testid="button-idea-tab"
              >
                <Lightbulb className="mr-2 h-4 w-4" /> My Idea
              </Button>
              <Button 
                variant={activeTab === "plan" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("plan")}
                data-testid="button-plan-tab"
              >
                <Target className="mr-2 h-4 w-4" /> Business Plan
              </Button>
              <Button 
                variant={activeTab === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("profile")}
                data-testid="button-profile-tab"
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Project Dashboard</h1>
                <p className="text-muted-foreground mb-8">Welcome back! Here's what's happening with <span className="font-semibold text-foreground">{formData.ideaName || "Your Idea"}</span>.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-l-4 border-l-cyan-500 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Business Plan Complete</div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting mentor approval</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Waiting List</div>
                      <p className="text-xs text-muted-foreground mt-1">5 business days</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-cyan-500 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Step 3 of 4</div>
                      <Progress value={75} className="h-2 mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>What Happens Next</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-600 font-semibold">1</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Mentors Review Your Plan</p>
                        <p className="text-sm text-muted-foreground">Our mentor committee evaluates your business plan and idea</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 text-slate-600 font-semibold">2</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Mentor Assignment</p>
                        <p className="text-sm text-muted-foreground">A mentor chooses to work with you and we'll contact you</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 text-slate-600 font-semibold">3</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Active Membership</p>
                        <p className="text-sm text-muted-foreground">Join as a member and start your mentorship journey ($49/mo)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-cyan-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-600" />
                        My Mentor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-cyan-600" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Once your project is approved, your assigned mentor will appear in this section.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-emerald-600" />
                        Coaches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">Once your project is approved, this space will populate with available coaches.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* My Idea Tab */}
            {activeTab === "idea" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Your Idea Submission</h1>
                <p className="text-muted-foreground mb-8">Here's a complete summary of your business idea that was submitted to our mentors.</p>

                <div className="space-y-6">
                  {steps.map((sec, secIdx) => (
                    <Card key={secIdx} className="border-cyan-200 dark:border-cyan-900/30">
                      <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <sec.icon className="h-5 w-5 text-cyan-600" />
                          {sec.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        {sec.fields.map((field: any) => (
                          <div key={field.key}>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">{field.label}</p>
                            <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Business Plan Tab */}
            {activeTab === "plan" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Your Business Plan</h1>
                <p className="text-muted-foreground mb-8">Here's the business plan that was submitted to our mentors for review.</p>

                <div className="space-y-6">
                  {[
                    { key: "executiveSummary", label: "Executive Summary" },
                    { key: "problemStatement", label: "Problem Statement" },
                    { key: "solution", label: "Solution" },
                    { key: "targetMarket", label: "Target Market" },
                    { key: "marketSize", label: "Market Size & Opportunity" },
                    { key: "revenue", label: "Revenue Model & Pricing" },
                    { key: "competitiveAdvantage", label: "Competitive Advantage" },
                    { key: "roadmap", label: "12-Month Roadmap" },
                    { key: "fundingNeeds", label: "Funding Requirements" },
                    { key: "risks", label: "Risks & Mitigation" },
                    { key: "success", label: "Success Metrics" }
                  ].map((section) => (
                    <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                      <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                        <CardTitle className="text-lg">{section.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg whitespace-pre-wrap">
                          {businessPlanData?.[section.key] || "Business plan not yet submitted"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Entrepreneur Profile</h1>
                    <p className="text-muted-foreground">Your profile is visible to mentors and admins on our platform.</p>
                  </div>
                  <Button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant={isEditingProfile ? "destructive" : "default"}
                    className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}
                    data-testid="button-edit-profile"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {isEditingProfile ? (
                  <Card className="border-cyan-200 dark:border-cyan-900/30 max-w-2xl">
                    <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle>Edit Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Profile Picture</label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-2xl">
                            {profileData.profileImage ? "📷" : "👤"}
                          </div>
                          <Button variant="outline" className="border-slate-300" data-testid="button-upload-photo">
                            Upload Photo
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Full Name *</label>
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-name"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Email Address *</label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-email"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Country *</label>
                        <Input
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-country"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Short Bio</label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell mentors about yourself..."
                          rows={4}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
                          data-testid="textarea-profile-bio"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">LinkedIn Profile URL</label>
                        <Input
                          value={profileData.linkedIn}
                          onChange={(e) => setProfileData({ ...profileData, linkedIn: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-linkedin"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-slate-300"
                          onClick={() => setIsEditingProfile(false)}
                          data-testid="button-cancel-profile"
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                          onClick={() => setIsEditingProfile(false)}
                          data-testid="button-save-profile"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <Card className="border-cyan-200 dark:border-cyan-900/30">
                      <CardContent className="pt-6">
                        <div className="flex gap-6">
                          <div className="w-24 h-24 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-5xl flex-shrink-0">
                            {profileData.profileImage ? "📷" : "👤"}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">{profileData.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{profileData.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{profileData.country}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {profileData.bio && (
                      <Card className="border-cyan-200 dark:border-cyan-900/30">
                        <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                          <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <p className="text-slate-900 dark:text-white">{profileData.bio}</p>
                        </CardContent>
                      </Card>
                    )}

                    {profileData.linkedIn && (
                      <Card className="border-cyan-200 dark:border-cyan-900/30">
                        <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                          <CardTitle className="text-lg">LinkedIn</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <a href={profileData.linkedIn} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 break-all">
                            {profileData.linkedIn}
                          </a>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (showAIReview && aiEnhancedData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">AI Review</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setShowAIReview(false)} 
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 font-medium"
              data-testid="button-back-to-review"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Review
            </button>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">AI Enhancement Review</h1>
            <p className="text-muted-foreground mb-8">Our AI has rewritten your answers to make them clearer and more compelling for investors. Review and accept the enhancements, or edit any answer as needed.</p>

            <div className="space-y-6">
              {steps.map((sec, secIdx) => {
                const sectionAnswers = sec.fields.filter((f: any) => aiEnhancedData[f.key]);
                if (sectionAnswers.length === 0) return null;
                
                return (
                  <Card key={secIdx} className="border-cyan-200 dark:border-cyan-900/30">
                    <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <sec.icon className="h-5 w-5 text-cyan-600" />
                        {sec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {sectionAnswers.map((field: any) => (
                        <div key={field.key} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{field.label}</p>
                          
                          {/* Original Answer */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Your Original Answer:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{aiEnhancedData[field.key].original}</p>
                          </div>

                          {/* AI Enhanced Answer (Editable) */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">AI Enhanced Answer:</p>
                            <textarea
                              value={aiEnhancedData[field.key].aiEnhanced}
                              onChange={(e) => handleEditAIAnswer(field.key, e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 border border-cyan-300 dark:border-cyan-700 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                              data-testid={`textarea-ai-${field.key}`}
                            />
                            {aiEnhancedData[field.key].isEdited && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">✓ You've edited this answer</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-300"
                onClick={() => setShowAIReview(false)}
                data-testid="button-back-from-ai"
              >
                Back to Review
              </Button>
              <Button 
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={handleAcceptAIEnhancements}
                data-testid="button-accept-ai-enhancement"
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">Reviewing Idea</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setShowReview(false)} 
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 font-medium"
              data-testid="button-back-to-steps"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Edit
            </button>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Review Your Idea</h1>
            <p className="text-muted-foreground mb-8">Check all your answers before submitting. You can edit any section by clicking "Edit".</p>

            <div className="space-y-6">
              {steps.map((sec, idx) => (
                <Card key={idx} className="border-cyan-200 dark:border-cyan-900/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <sec.icon className="h-5 w-5 text-cyan-600" />
                        {sec.title}
                      </CardTitle>
                      <button onClick={() => handleEditStep(idx)} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">Edit</button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sec.fields.map((field) => (
                      <div key={field.key}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{field.label}</p>
                        <p className="text-slate-900 dark:text-white">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-300"
                onClick={() => setShowReview(false)}
                data-testid="button-go-back"
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={generateAIEnhancedAnswers}
                data-testid="button-submit-to-ai"
              >
                Submit to AI for Enhancement
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
              <AvatarFallback className="text-white">EN</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Entrepreneur</div>
              <div className="text-xs text-muted-foreground">Setting up your idea</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Lightbulb className="mr-2 h-4 w-4" /> My Idea
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{validationError}</p>
            </div>
          )}

          {/* Question Card */}
          <Card className="border-cyan-200 dark:border-cyan-900/30 bg-white dark:bg-slate-900 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-950/50 rounded-lg flex items-center justify-center">
                  <CurrentStepIcon className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                {step.title}
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{step.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {step.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={(field as any).rows || 3}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                      data-testid={`input-${field.key}`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                      data-testid={`select-${field.key}`}
                    >
                      <option value="">Select {field.label.toLowerCase()}...</option>
                      {(field as any).options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                      data-testid={`input-${field.key}`}
                    />
                  )}
                </div>
              ))}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevious}
                    data-testid="button-previous"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button
                  className={`flex-1 ${currentStep === 0 ? "w-full" : ""} bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={handleNext}
                  data-testid="button-next"
                  disabled={validationError ? false : false}
                >
                  {currentStep === steps.length - 1 ? (
                    <>Review & Submit</>
                  ) : (
                    <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
