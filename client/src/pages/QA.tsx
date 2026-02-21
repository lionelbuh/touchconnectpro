import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
        answer: "Community \u2013 Free: No billing. Get started immediately and explore the community and coaching sessions at your own pace.\n\nFounders Circle \u2013 $9.99/month: Billing starts immediately upon signup. Gain full access to personalized mentorship, structured feedback, and expert coaching support.\n\nCapital Circle \u2013 $49/month: Billing begins only after your application is reviewed and approved by a mentor. This ensures your project is ready for focused guidance and investor access."
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

function FAQItem({ question, answer, testId }: { question: string; answer: string; testId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden transition-all duration-200"
      style={{ boxShadow: "0 2px 10px rgba(224,224,224,0.4)" }}
    >
      <button
        className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 group"
        onClick={() => setOpen(!open)}
        data-testid={`button-faq-${testId}`}
      >
        <span className="text-base font-semibold leading-snug" style={{ color: "#0D566C" }}>{question}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform duration-300"
          style={{ color: "#FF6B5C", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "600px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="px-5 md:px-6 pb-5 md:pb-6">
          <div className="pt-0 border-t" style={{ borderColor: "#F3F3F3" }}>
            <p className="pt-4 leading-relaxed text-[15px] whitespace-pre-line" style={{ color: "#4A4A4A" }} data-testid={`text-faq-answer-${testId}`}>
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-5" style={{ color: "#0D566C" }} data-testid="text-faq-title">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A4A4A" }} data-testid="text-faq-subtitle">
            Everything you need to know about TouchConnectPro.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      {faqSections.map((section, sectionIndex) => {
        const bg = sectionIndex % 2 === 0 ? "#F3F3F3" : "#FAF9F7";
        return (
          <section
            key={sectionIndex}
            className="py-14 md:py-20"
            style={{ backgroundColor: bg }}
            aria-labelledby={`faq-section-${sectionIndex}`}
          >
            <div className="container px-4 mx-auto max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#F5C542" }} />
                <h2
                  id={`faq-section-${sectionIndex}`}
                  className="text-xl md:text-2xl font-display font-bold"
                  style={{ color: "#0D566C" }}
                  data-testid={`text-faq-section-${sectionIndex}`}
                >
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => {
                  itemCounter++;
                  const testId = `item-${itemCounter}`;
                  return (
                    <FAQItem
                      key={itemIndex}
                      question={item.question}
                      answer={item.answer}
                      testId={testId}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
