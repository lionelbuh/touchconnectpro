import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect } from "react";

const faqSections = [
  {
    title: "About TouchConnectPro",
    items: [
      {
        question: "What is TouchConnectPro?",
        answer: "TouchConnectPro is a mentorship platform that connects entrepreneurs with experienced founders and business coaches to provide practical, execution focused guidance at every stage of building a business."
      },
      {
        question: "How is TouchConnectPro different from accelerators or incubators?",
        answer: "TouchConnectPro offers flexible, personalized mentorship without fixed cohorts, equity requirements, or rigid programs."
      },
      {
        question: "How is AI used on TouchConnectPro?",
        answer: "AI tools on TouchConnectPro help entrepreneurs clarify their ideas, improve wording, and create structured drafts such as basic business plans. Mentors then review, challenge, and guide entrepreneurs based on real world experience."
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        question: "Who can join TouchConnectPro?",
        answer: "Anyone with a business idea, product in progress, or startup vision can join. You don't need a pitch deck or business plan, our tools and mentors will help you shape and refine your thinking."
      },
      {
        question: "What tools do I need to get started?",
        answer: "Just your idea. We guide you with structured support, help shape your plan, and prepare you for investor-ready materials."
      },
      {
        question: "Is TouchConnectPro global?",
        answer: "Yes. Entrepreneurs and mentors can join from anywhere. Guidance is provided asynchronously, so time zones aren't a constraint. When working with specialist coaches, sessions are flexible and arranged directly, often with local experts."
      },
    ],
  },
  {
    title: "Mentors & Approval",
    items: [
      {
        question: "How does the approval process work?",
        answer: "After completing onboarding, your profile is shared with relevant mentors. If a mentor accepts your project, you'll be approved to join their portfolio. That's when billing begins. Until then, there's no charge."
      },
      {
        question: "What happens if no mentor accepts my project?",
        answer: "You pay nothing. We may provide suggestions to strengthen your idea and you can resubmit when you're ready."
      },
      {
        question: "Do I get matched with only one mentor?",
        answer: "Initially, yes. You're assigned to the mentor who best fits your startup. You may later request additional mentors for growth, pivots, or specific challenges."
      },
      {
        question: "Can I switch mentors later?",
        answer: "Yes. If your business evolves or you feel you'd benefit from a fresh perspective, you can discuss it with your current mentor to determine the right time for a transition. They'll help guide you and recommend the next mentor who best fits your goals."
      },
      {
        question: "Will I have the same mentor from the beginning to the end?",
        answer: "Most mentor relationships continue over time, but things can change. Your business may evolve or a mentor may become unavailable. If a change is needed, TouchConnectPro will help match you with a new mentor who fits your current goals and stage."
      },
    ],
  },
  {
    title: "Mentor Response Guidelines",
    items: [
      {
        question: "How often can I ask my mentor questions?",
        answer: "You can ask as many questions as you like, but mentors respond thoughtfully only when guidance is truly needed. This ensures you get high-quality, actionable feedback on the most important issues."
      },
      {
        question: "Is there a schedule for mentor responses?",
        answer: "Yes. To keep things structured, send all your questions by Sunday evening. Your mentor will review and respond by Friday, providing focused guidance for the week."
      },
      {
        question: "Why don't mentors respond immediately to every question?",
        answer: "Rapid-fire responses can dilute focus and overwhelm both founders and mentors. By batching questions, your mentor can provide high-value, thoughtful guidance and ensure your progress stays on track."
      },
      {
        question: "Can I get help on urgent issues outside the schedule?",
        answer: "For critical blockers or decisions that could stall your project, your mentor will prioritize guidance. Routine or clarifying questions should be included in the weekly batch."
      },
      {
        question: "What if I miss the Sunday deadline?",
        answer: "Your mentor will review questions in the next cycle. To make the most of mentor feedback, try to stick to the weekly schedule, it keeps your project moving efficiently."
      },
    ],
  },
  {
    title: "Trust & Privacy",
    items: [
      {
        question: "Are my ideas and data protected?",
        answer: "Yes. TouchConnectPro takes confidentiality seriously and provides a secure platform for sharing project information with mentors."
      },
      {
        question: "Who owns my intellectual property?",
        answer: "You retain full ownership of your ideas and intellectual property at all times."
      },
    ],
  },
  {
    title: "Pricing & Billing",
    items: [
      {
        question: "When does billing start?",
        answer: "Billing for the $49/month membership begins only after a mentor reviews your materials and approves you into their portfolio."
      },
      {
        question: "Are the coaching sessions included in the membership fee?",
        answer: "Membership includes full access to the platform, community, and mentor onboarding. Specialist coaching sessions are paid separately, with each expert setting their own price based on experience and expertise."
      },
      {
        question: "What if I need specialized help (Legal, Tech)?",
        answer: "TouchConnectPro facilitates connections with specialized mentors (Finance, Marketing, Engineering, Legal) who offer paid sessions. The coaches set their own price, you pay it in full, and we keep a 20% fee to support and sustain the platform."
      },
      {
        question: "Can I cancel my membership anytime?",
        answer: "Yes. You can cancel with one click inside your dashboard. Billing stops at the end of the current cycle."
      },
    ],
  },
  {
    title: "Funding & Growth",
    items: [
      {
        question: "Does TouchConnectPro support funding or investment?",
        answer: "We don't fund startups directly, but we connect you with mentors and investors who may be open to funding once your idea reaches the right level of clarity and readiness."
      },
      {
        question: "Can TouchConnectPro help me find funding for my startup?",
        answer: "TouchConnectPro connects entrepreneurs with resources and guidance to become investment-ready. We don't influence investor decisions or guarantee funding, but we help you prepare a strong pitch, refine your business story, and present your project to angel investors we're in contact with. You are also free to use the pitch you create on TouchConnectPro to approach any investors you find independently."
      },
    ],
  },
];

function generateFAQSchema() {
  const allItems = faqSections.flatMap((section) => section.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function QA() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify(generateFAQSchema());
    document.head.appendChild(script);
    return () => {
      const existing = document.getElementById("faq-schema");
      if (existing) existing.remove();
    };
  }, []);

  let itemCounter = 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-4">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white" data-testid="text-faq-title">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground" data-testid="text-faq-subtitle">Everything you need to know about TouchConnectPro</p>
        </header>

        <main className="max-w-3xl mx-auto space-y-10">
          {faqSections.map((section, sectionIndex) => (
            <section key={sectionIndex} aria-labelledby={`faq-section-${sectionIndex}`}>
              <h2 id={`faq-section-${sectionIndex}`} className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6" data-testid={`text-faq-section-${sectionIndex}`}>{section.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, itemIndex) => {
                  itemCounter++;
                  const valueId = `item-${itemCounter}`;
                  return (
                    <AccordionItem key={itemIndex} value={valueId}>
                      <AccordionTrigger data-testid={`button-faq-${valueId}`}>
                        <span>{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent data-testid={`text-faq-answer-${valueId}`}>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
