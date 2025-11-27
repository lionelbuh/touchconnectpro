import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, Sparkles, Shield, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Free Entry & AI Refinement",
      subtitle: "Zero-Barrier Entry Point",
      desc: "Start refining your idea immediately. [BOLD]No credit card required.[/BOLD] Our AI tools help you articulate your value proposition and create a draft business plan.",
      icon: <Sparkles className="h-8 w-8 text-cyan-500" />,
      features: ["AI Idea Refinement", "Draft Business Plan Generation", "Viability Check"],
      color: "cyan"
    },
    {
      id: "02",
      title: "Mentor Match",
      subtitle: "Evaluation & Acceptance",
      desc: "Submit your refined plan for review. A dedicated mentor approves your idea into his or her portfolio, ensuring a meaningful partnership.",
      icon: <Shield className="h-8 w-8 text-cyan-500" />,
      features: ["Personalized Evaluation", "Portfolio Approval", "Goal Alignment"],
      color: "cyan"
    },
    {
      id: "03",
      title: "Active Development",
      subtitle: "Membership - $49/month",
      desc: "Unlock the full support system. Monthly coaching sessions, community learning, and access to specialized experts in Finance, Legal, and Marketing.",
      icon: <Users className="h-8 w-8 text-cyan-500" />,
      features: ["30-min Onboarding Session", "Monthly Group Coaching", "Specialized Marketplace Access"],
      color: "cyan"
    },
    {
      id: "04",
      title: "Investor Ready",
      subtitle: "Angel-Stage Support",
      desc: "When you're ready to raise, we intensify support. We help with pitch decks and fundraising strategy. We have established relationships with Angel Investors who will review all final projects to determine if they want to invest.",
      icon: <TrendingUp className="h-8 w-8 text-cyan-500" />,
      features: ["Investor-Grade Pitch Deck", "Fundraising Strategy", "Angel Network Access"],
      color: "cyan"
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="py-24 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">How It Works</h1>
          <p className="text-xl text-muted-foreground">
            A friction-free journey from raw idea to funded venture. We validate quickly and build deeply.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 hidden md:block -translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                
                {/* Text Content */}
                <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-20">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-${step.color}-500/10 mb-6 md:hidden`}>
                    {step.icon}
                  </div>
                  <div className={`text-${step.color}-600 font-bold tracking-wider text-sm uppercase mb-2`}>{step.subtitle}</div>
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white relative z-20">
                    <span className="text-slate-300 mr-3 text-2xl font-normal">.{step.id}</span>
                    {step.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg leading-relaxed">
                    {step.desc.includes('[BOLD]') ? (
                      <>
                        {step.desc.split('[BOLD]').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i}>{part.replace('[/BOLD]', '')}</strong>
                        )}
                      </>
                    ) : step.desc}
                  </p>
                  <ul className="space-y-2">
                    {step.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                         <div className={`h-2 w-2 rounded-full bg-${step.color}-500`}></div>
                         {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Center Marker (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-sm z-10">
                  {step.icon}
                </div>

                {/* Visual Card */}
                <div className="md:w-1/2 w-full">
                  <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900">
                     <div className={`h-2 w-full bg-${step.color}-500`}></div>
                     <CardContent className="p-8 h-80 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/20">
                       <div className="text-center">
                         <div className="text-9xl font-bold text-slate-300 dark:text-slate-600 mb-2 leading-none">{step.id}</div>
                         <div className="text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500">Phase</div>
                       </div>
                     </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start your journey?</h2>
          <Link href="/idea-submit">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full">Start Refining Your Idea Free</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
