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
                  Yes. If your business evolves or you feel you'd benefit from a fresh perspective, you can discuss it with your current mentor to determine the right time for a transition. They'll help guide you and recommend the next mentor who best fits your goals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7b">
                <AccordionTrigger>Will I have the same mentor from the beginning to the end?</AccordionTrigger>
                <AccordionContent>
                  Most mentor relationships continue over time, but things can change — your business may evolve or a mentor may become unavailable. If a change is needed, TouchConnectPro will help match you with a new mentor who fits your current goals and stage.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Mentor Response Guidelines Section */}
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Mentor Response Guidelines</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-mentor-1">
                <AccordionTrigger>How often can I ask my mentor questions?</AccordionTrigger>
                <AccordionContent>
                  You can ask as many questions as you like, but mentors respond thoughtfully only when guidance is truly needed. This ensures you get high-quality, actionable feedback on the most important issues.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-mentor-2">
                <AccordionTrigger>Is there a schedule for mentor responses?</AccordionTrigger>
                <AccordionContent>
                  Yes. To keep things structured, send all your questions by Sunday evening. Your mentor will review and respond by Friday, providing focused guidance for the week.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-mentor-3">
                <AccordionTrigger>Why don't mentors respond immediately to every question?</AccordionTrigger>
                <AccordionContent>
                  Rapid-fire responses can dilute focus and overwhelm both founders and mentors. By batching questions, your mentor can provide high-value, thoughtful guidance and ensure your progress stays on track.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-mentor-4">
                <AccordionTrigger>Can I get help on urgent issues outside the schedule?</AccordionTrigger>
                <AccordionContent>
                  For critical blockers or decisions that could stall your project, your mentor will prioritize guidance. Routine or clarifying questions should be included in the weekly batch.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-mentor-5">
                <AccordionTrigger>What if I miss the Sunday deadline?</AccordionTrigger>
                <AccordionContent>
                  Your mentor will review questions in the next cycle. To make the most of mentor feedback, try to stick to the weekly schedule, it keeps your project moving efficiently.
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
              <AccordionItem value="item-13">
                <AccordionTrigger>Can TouchConnectPro help me find funding for my startup?</AccordionTrigger>
                <AccordionContent>
                  TouchConnectPro connects entrepreneurs with resources and guidance to become investment-ready. We don't influence investor decisions or guarantee funding, but we help you prepare a strong pitch, refine your business story, and present your project to angel investors we're in contact with. You are also free to use the pitch you create on TouchConnectPro to approach any investors you find independently.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
