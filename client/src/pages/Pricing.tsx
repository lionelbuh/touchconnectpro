import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, ShieldCheck, ChevronDown, Target, Sparkles, ArrowRight, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Pricing() {
  const [expandedPricingItem, setExpandedPricingItem] = useState<number | null>(null);
  
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Choose Your Path</h1>
          <p className="text-xl text-muted-foreground">
            From exploring your idea to raising capital, pick the tier that matches where you are in your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {/* Community – Free */}
          <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden" data-testid="card-community-free-pricing">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">Community – Free</h3>
              <div className="text-4xl font-display font-bold mb-4 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span> <span className="text-base text-slate-400 font-normal">– No credit card</span></div>
              <ul className="space-y-4 mb-8">
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-cyan-500"/> Founder Focus Score</span>
                  <span className="text-sm text-slate-400 ml-6">Discover your biggest startup blocker with our quick diagnostic.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-cyan-500"/> Personalized Insights</span>
                  <span className="text-sm text-slate-400 ml-6">Get actionable recommendations tailored to your situation.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Refine Your Idea</span>
                  <span className="text-sm text-slate-400 ml-6">Turn your raw concept into a clear, compelling vision.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Build a Draft Plan</span>
                  <span className="text-sm text-slate-400 ml-6">Quickly create a structured business plan to guide your next steps.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Get Mentor-Ready</span>
                  <span className="text-sm text-slate-400 ml-6">Prepare your materials so your mentor can give targeted, actionable feedback from day one.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Optional Specialist Coaches</span>
                  <span className="text-sm text-slate-400 ml-6">Access to specialist coaches in legal, finance, and growth (paid separately).</span>
                </li>
              </ul>
              <Link href="/founder-focus">
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white" data-testid="button-community-free-pricing">Start Free – No Credit Card</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Founders Circle */}
          <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden" data-testid="card-founders-circle-pricing">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">Founders Circle</h3>
              <div className="text-4xl font-display font-bold mb-4 text-white">$9.99<span className="text-lg text-indigo-300 font-normal">/month</span></div>
              <p className="text-indigo-200 mb-6">Upon Mentor Acceptance</p>
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/40 rounded-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-indigo-300 pt-1">📋</div>
                  <div>
                    <p className="font-bold text-indigo-200 mb-1">Waiting List</p>
                    <p className="text-xs text-indigo-300">Only after your idea is approved and added to a mentor's portfolio</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-indigo-200/70 mb-4 italic">All Community – Free features, plus:</p>
              <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-4">What's Included</h4>
              <ul className="space-y-3 mb-6">
                {[
                  { title: "Dedicated Mentor", detail: "Personally matched, providing structured guidance and actionable feedback" },
                  { title: "Ask Questions Anytime", detail: "Ongoing support when you need clarity" },
                  { title: "Strategic Frameworks", detail: "Tools and resources to structure your business" },
                  { title: "Community Access", detail: "Learn from focused other entrepreneurs" },
                  { title: "All without fixed scheduled meetings", detail: "Guidance happens on your busy calendar." }
                ].map((item, i) => (
                  <li 
                    key={i} 
                    className="cursor-pointer"
                    onClick={() => setExpandedPricingItem(expandedPricingItem === i ? null : i)}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0"/>
                      <span className="flex-1">{item.title}</span>
                      <ChevronDown className={`h-4 w-4 text-indigo-300 transition-transform duration-200 ${expandedPricingItem === i ? 'rotate-180' : ''}`} />
                    </div>
                    {expandedPricingItem === i && (
                      <p className="mt-2 ml-6 text-sm text-indigo-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.detail}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Capital Circle */}
          <Card className="bg-gradient-to-br from-amber-900/80 to-slate-900 border-amber-500/50 text-left relative overflow-hidden" data-testid="card-capital-circle-pricing">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <Gem className="h-6 w-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Capital Circle</h3>
              </div>
              <div className="text-4xl font-display font-bold mb-2 text-white">$49<span className="text-lg text-amber-300 font-normal">/month</span></div>
              <p className="text-amber-200/80 text-sm mb-6">Raise capital with structure and support. For committed founders preparing to raise funding. Access is selective.</p>
              <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wide mb-4">Included</h4>
              <ul className="space-y-3 mb-6">
                {[
                  "Fundraising readiness review",
                  "Pitch feedback & positioning support",
                  "Structured preparation phase",
                  "Investor visibility after approval",
                  "Ongoing capital strategy guidance"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white text-sm">
                    <Check className="h-4 w-4 text-amber-400 shrink-0"/>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-300/60 mb-4 italic">Limited seats to maintain quality.</p>
              <p className="text-xs text-amber-200/70">Best for: founders ready to actively pursue funding</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
