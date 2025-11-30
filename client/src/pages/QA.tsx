import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function QA() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">Everything you need to know about TouchConnectPro</p>
        </div>

        <div className="max-w-3xl mx-auto">
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
                TouchConnectPro facilitates connections with specialized mentors (Finance, Marketing, Engineering, Legal) who offer paid sessions. The coaches set their own price, you pay it in full, and we keep a 20% fee to support and sustain the platform.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
