import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Pricing() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">Choose the plan that fits your stage. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {/* Free Tier */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-8">
              <h3 className="text-2xl font-bold mb-2">Explorer</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Perfect for refining your idea and testing the waters.</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button variant="outline" className="w-full mb-8">Get Started</Button>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>3 AI Idea Rewrites per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Basic Business Plan Generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Access to Community Forum</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-slate-300 shrink-0" />
                  <span>No Mentor Access</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Founder Tier - Highlighted */}
          <Card className="border-indigo-500 shadow-xl relative overflow-hidden bg-white dark:bg-slate-900 scale-105 z-10">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <CardHeader className="p-8">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">MOST POPULAR</div>
              <h3 className="text-2xl font-bold mb-2">Founder</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">For builders ready to launch and scale.</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button className="w-full mb-8 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">Subscribe Now</Button>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Unlimited AI Idea Rewrites</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Advanced Business Plan Export (PDF)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Dedicated Mentor Match</span>
                </li>
                 <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Legal Contract Templates (Eversign)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>Join Founder Cohorts (Max 10)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Scale Tier */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
             <CardHeader className="p-8">
              <h3 className="text-2xl font-bold mb-2">Angel / VC</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-muted-foreground text-sm">For investors looking for deal flow.</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button variant="outline" className="w-full mb-8">Contact Sales</Button>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Curated Deal Flow</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Direct Access to Top Founders</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                  <span>Portfolio Management Dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. You will retain access to your plan features until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the mentor matching work?</AccordionTrigger>
              <AccordionContent>
                Once you subscribe to the Founder plan, we analyze your business idea and industry. Our system then suggests mentors with relevant expertise. You can request a match, and once accepted, you can schedule sessions.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-3">
              <AccordionTrigger>Is the AI business plan really usable?</AccordionTrigger>
              <AccordionContent>
                Absolutely. Our AI uses advanced models to generate structured, professional business plans that cover all key areas investors look for. It's a great starting point that you can further refine with your mentor.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
