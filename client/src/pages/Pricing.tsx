import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, HelpCircle, ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Membership: Your Growth Foundation</h1>
          <p className="text-xl text-muted-foreground">Zero-barrier entry. Pay only when you are accepted by a mentor and ready to grow.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Tier */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-8">
              <h3 className="text-2xl font-bold mb-2">Free Entry</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Start refining your idea immediately. No credit card required.</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Link href="/idea-submit">
                <Button variant="outline" className="w-full mb-8">Start Refining Idea</Button>
              </Link>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span className="font-medium">AI-Powered Idea Refinement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Draft Business Plan Generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Prepare Materials for Mentor Review</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-slate-300 shrink-0" />
                  <span>Validation, not yet investor-grade</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Member Tier */}
          <Card className="border-indigo-500 shadow-xl relative overflow-hidden bg-white dark:bg-slate-900 z-10">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <CardHeader className="p-8">
              <h3 className="text-2xl font-bold mb-2">Member</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Membership begins after mentor acceptance.</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="mb-8 p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 pt-1">📋</div>
                  <div>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">Waiting List</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Only if your idea is approved and you are in a mentor's portfolio</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Dedicated Mentor-Coach Match</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>30-min Onboarding Session (Month 1)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Monthly 1-hour Group Coaching</span>
                </li>
                 <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Pitch-Creation Tools & Frameworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Community Learning Environment</span>
                </li>
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
              <div className="md:w-1/3 bg-slate-800/50 p-6 rounded-xl border border-slate-700 relative z-10">
                <h3 className="font-bold text-emerald-400 mb-2">Unlock Full Support</h3>
                <div className="text-4xl font-bold mb-2">$49</div>
                <p className="text-sm text-slate-300 mb-4">Per month to unlock the full support system you'll need during your journey to reach the market.</p>
                <p className="text-xs text-slate-500 italic">Available only after mentor approval.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>When does billing start?</AccordionTrigger>
              <AccordionContent>
                Billing for the $49/mo membership only begins *after* a mentor reviews your AI-prepared materials and approves you into their portfolio.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What if I need specialized help (Legal, Tech)?</AccordionTrigger>
              <AccordionContent>
                TouchConnectPro facilitates connections with specialized mentors (Finance, Marketing, Engineering, Legal) who offer paid sessions. We earn a 20% commission on these sessions to keep the platform running.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger>What is the Equity Partnership?</AccordionTrigger>
              <AccordionContent>
                For founders ready to raise capital, we offer an intensive "Investor Readiness" track. In exchange for this high-level support and access to our investor network, TouchConnectPro takes a 10% equity stake in the successful round we facilitate.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
