import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Lightbulb, Target, Users, MessageSquare, Settings, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardEntrepreneur() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
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
  };

  const handleNext = () => {
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

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
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
                <div className="text-xs text-muted-foreground">Onboarding Complete</div>
              </div>
            </div>
            <nav className="space-y-1">
              <Button variant="secondary" className="w-full justify-start font-medium">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
                <Lightbulb className="mr-2 h-4 w-4" /> My Idea
              </Button>
              <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
                <Target className="mr-2 h-4 w-4" /> Business Plan
              </Button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Great! Your Idea is Submitted</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Our AI will now analyze your responses and create a refined business plan for you. Check back soon!</p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setSubmitted(false)}>Back to Dashboard</Button>
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
                onClick={handleSubmit}
                data-testid="button-submit-idea"
              >
                Submit & Continue
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
                  className={`flex-1 ${currentStep === 0 ? "w-full" : ""} bg-cyan-600 hover:bg-cyan-700`}
                  onClick={handleNext}
                  data-testid="button-next"
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
