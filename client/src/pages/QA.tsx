import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function QA() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">Everything you need to know about TouchConnectPro</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {/* Getting Started Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Getting Started</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Who can join TouchConnectPro?</AccordionTrigger>
                <AccordionContent>
                  Anyone with a business idea, product in progress, or startup vision can join. You don't need a pitch deck or business plan — AI tools and mentors will help you shape your thinking.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What tools do I need to get started?</AccordionTrigger>
                <AccordionContent>
                  Just your idea. We guide you with AI-coaching, structure your plan, and help you prepare investor-ready materials.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is TouchConnectPro global?</AccordionTrigger>
                <AccordionContent>
                  Yes — both entrepreneurs and mentors can join from anywhere. Time zones may vary, but sessions can be scheduled to fit.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Mentors & Approval Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Mentors & Approval</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-4">
                <AccordionTrigger>How does the approval process work?</AccordionTrigger>
                <AccordionContent>
                  After completing your onboarding, an AI-prepared profile is sent to relevant mentors. If one accepts your project, you'll be approved to join their portfolio — that's when billing begins. Until then, there's no charge.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>What happens if no mentor accepts my project?</AccordionTrigger>
                <AccordionContent>
                  You pay nothing. We may provide suggestions to strengthen your idea and you can resubmit when you're ready.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Do I get matched with only one mentor?</AccordionTrigger>
                <AccordionContent>
                  Initially, yes — you're assigned to the mentor who best fits your startup. You may later request additional mentors for growth, pivots, or specific challenges.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger>Can I switch mentors later?</AccordionTrigger>
                <AccordionContent>
                  Yes. If your business evolves or you need a different perspective, you can request a mentor change at any time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Pricing & Billing Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Pricing & Billing</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-8">
                <AccordionTrigger>When does billing start?</AccordionTrigger>
                <AccordionContent>
                  Billing for the $49/mo membership only begins *after* a mentor reviews your AI-prepared materials and approves you into their portfolio.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-9">
                <AccordionTrigger>Are the coaching sessions included in the membership fee?</AccordionTrigger>
                <AccordionContent>
                  Membership includes access to the platform, community, AI assistance, and mentor onboarding. Coaching sessions are paid separately because each expert sets their own price based on experience and specialty.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-10">
                <AccordionTrigger>What if I need specialized help (Legal, Tech)?</AccordionTrigger>
                <AccordionContent>
                  TouchConnectPro facilitates connections with specialized mentors (Finance, Marketing, Engineering, Legal) who offer paid sessions. The coaches set their own price, you pay it in full, and we keep a 20% fee to support and sustain the platform.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-11">
                <AccordionTrigger>Can I cancel my membership anytime?</AccordionTrigger>
                <AccordionContent>
                  Yes — you can cancel with one click inside your dashboard. Billing stops at the end of the current cycle.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Funding & Growth Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Funding & Growth</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-12">
                <AccordionTrigger>Does TouchConnectPro support funding or investment?</AccordionTrigger>
                <AccordionContent>
                  We don't fund startups directly, but we connect you with mentors and investors who may be open to funding once your idea reaches the right level of clarity and readiness.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
