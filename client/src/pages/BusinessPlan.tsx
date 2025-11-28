import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Lightbulb, Target, Check, ChevronLeft, AlertCircle } from "lucide-react";

export default function BusinessPlan() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const ideaName = searchParams.get("ideaName") || "My Idea";
  
  const [businessPlan, setBusinessPlan] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePlanChange = (key: string, value: string) => {
    setBusinessPlan(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitForReview = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 800);
  };

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
              <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Business Plan Submitted!</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Your business plan has been sent to our mentor review committee.</p>
            <p className="text-slate-600 dark:text-slate-400 mb-8">You're now on the waiting list. Once our Mentors review your idea, the right Mentor may choose to take it on — and when that happens, we will contact you to join as a member. Check your dashboard for updates!</p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Go to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  const sections = [
    { key: "executiveSummary", label: "Executive Summary", description: "2-3 sentence overview of your business" },
    { key: "problemStatement", label: "Problem Statement", description: "What problem are you solving?" },
    { key: "solution", label: "Solution", description: "How does your solution address the problem?" },
    { key: "targetMarket", label: "Target Market", description: "Who are your ideal customers?" },
    { key: "marketSize", label: "Market Size & Opportunity", description: "TAM, SAM, SOM estimates" },
    { key: "revenue", label: "Revenue Model & Pricing", description: "How will you make money?" },
    { key: "competitiveAdvantage", label: "Competitive Advantage", description: "What makes you different?" },
    { key: "roadmap", label: "12-Month Roadmap", description: "Key milestones and timeline" },
    { key: "fundingNeeds", label: "Funding Requirements", description: "How much do you need and why?" },
    { key: "risks", label: "Risks & Mitigation", description: "Key challenges and solutions" },
    { key: "success", label: "Success Metrics", description: "How will you measure success?" }
  ];

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
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Lightbulb className="mr-2 h-4 w-4" /> My Idea
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-cyan-600">
              <Target className="mr-2 h-4 w-4" /> Business Plan
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 font-medium"
            data-testid="button-back-from-plan"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">AI Draft Business Plan</h1>
          <p className="text-muted-foreground mb-8">Review and edit the AI-generated business plan. When ready, submit it to our mentors for review.</p>

          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                  <CardTitle className="text-lg">{section.label}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">{section.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <textarea
                    value={businessPlan[section.key as keyof typeof businessPlan]}
                    onChange={(e) => handlePlanChange(section.key, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                    data-testid={`textarea-${section.key}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg flex gap-3 mb-8">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">When you submit this business plan, you'll be added to our mentor waiting list. A mentor will be assigned within 5 business days.</p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 border-slate-300"
              onClick={() => window.history.back()}
              data-testid="button-cancel-plan"
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              data-testid="button-submit-plan"
            >
              {isSubmitting ? "Submitting..." : "Submit for Mentor Review"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
