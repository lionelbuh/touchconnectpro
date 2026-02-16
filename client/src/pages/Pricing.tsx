import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, ShieldCheck, ChevronDown, Target, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Pricing() {
  const [expandedPricingItem, setExpandedPricingItem] = useState<number | null>(null);
  
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Membership: Your Growth Foundation</h1>
          <p className="text-xl text-muted-foreground">
            For $49/month, your personalized mentor gives structured guidance and tailored feedback at every stage, from refining your idea to building a strong business foundation. Ask questions anytime and tap into optional expert coaches when needed, all without blocking your calendar with unnecessary meetings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {/* Focus Score */}
          <Card className="bg-gradient-to-br from-emerald-900/80 to-slate-900 border-emerald-500/40 text-left relative overflow-hidden" data-testid="card-free-diagnostic-pricing">
            <CardContent className="p-8">
              <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">No Account Needed</Badge>
              <h3 className="text-2xl font-bold mb-2 text-white">Focus Score</h3>
              <div className="text-4xl font-display font-bold mb-4 text-white">Free<span className="text-lg text-emerald-300 font-normal"> – Instant Results</span></div>
              <p className="text-emerald-200/80 text-sm mb-6">Test the platform before committing. Get your personalized Founder Focus Score in 2 minutes.</p>
              <ul className="space-y-4 mb-8">
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-emerald-400"/> Founder Focus Score</span>
                  <span className="text-sm text-slate-400 ml-6">Discover your biggest startup blocker with our quick diagnostic.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-emerald-400"/> Personalized Insights</span>
                  <span className="text-sm text-slate-400 ml-6">Get actionable recommendations tailored to your situation.</span>
                </li>
                <li className="text-slate-300">
                  <span className="flex items-center gap-2 font-semibold"><ArrowRight className="h-4 w-4 text-emerald-400"/> 7-Day Trial Access</span>
                  <span className="text-sm text-slate-400 ml-6">Unlock a trial dashboard to set priorities and connect with a mentor.</span>
                </li>
              </ul>
              <Link href="/founder-focus">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" data-testid="button-free-diagnostic-pricing">Take the Free Quiz <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          {/* Free Tier - matching homepage */}
          <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">Free Entry</h3>
              <div className="text-4xl font-display font-bold mb-4 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span> <span className="text-base text-slate-400 font-normal">– No credit card required</span></div>
              <ul className="space-y-4 mb-8">
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
              </ul>
              <Link href="/become-entrepreneur">
                <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white">Start Free - No Credit Card</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Member Tier - matching homepage */}
          <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2 text-white">Member</h3>
              <div className="text-4xl font-display font-bold mb-4 text-white">$49<span className="text-lg text-indigo-300 font-normal">/month</span></div>
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
              <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-4">What's Included</h4>
              <ul className="space-y-3 mb-6">
                {[
                  { title: "Dedicated Mentor", detail: "Personally matched, providing structured guidance and actionable feedback" },
                  { title: "Ask Questions Anytime", detail: "Ongoing support when you need clarity" },
                  { title: "Strategic Frameworks", detail: "Tools and resources to structure your business" },
                  { title: "Community Access", detail: "Learn from focused other entrepreneurs" },
                  { title: "All without fixed scheduled meetings", detail: "Guidance happens on your busy calendar." },
                  { title: "Optional Specialist Coaches", detail: "Access to specialist coaches in legal, finance, and growth (paid separately)" }
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
        </div>

        {/* Equity Partnership Section */}
        <div className="max-w-5xl mx-auto mb-24">
          <Card className="bg-slate-900 text-white border-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <CardContent className="p-10 md:p-12 flex flex-col md:flex-row gap-10 items-center">
              <div className="md:w-2/3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-4 border border-amber-500/30">
                  <ShieldCheck className="h-3 w-3" /> INVESTOR READY
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Angel-Stage Support & Equity Partnership</h2>
                <p className="text-slate-300 mb-6 text-lg">
                  When you're ready to raise capital, we intensify our support. We refine your pitch, build projections, and develop your fundraising strategy.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500"/> Investor-Standard Pitch Deck</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500"/> Financial Projections</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500"/> Fundraising Strategy</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-500"/> Pitch Practice</div>
                </div>
              </div>
              <div className="md:w-1/3 bg-yellow-400 p-6 rounded-xl border border-yellow-500 relative z-10">
                <h3 className="font-bold text-black mb-2">Unlock Full Support</h3>
                <div className="text-4xl font-bold text-black mb-2">$49</div>
                <p className="text-sm text-black mb-4">per month gives you access to the full support system you'll need to go from idea to market.</p>
                <p className="text-xs text-gray-700 italic">Available only after mentor approval.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
