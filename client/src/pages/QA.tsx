import { useState, useEffect } from "react";

const C = {
  cream: "#FAF8F3",
  ink: "#1A1814",
  inkSoft: "#4A4740",
  inkMuted: "#8C8880",
  gold: "#C49A3C",
  goldPale: "#FAF3E0",
  teal: "#1D6A5A",
  tealLight: "#E4F0ED",
  border: "rgba(26,24,20,0.12)",
  borderSoft: "rgba(26,24,20,0.07)",
};

const faqSections = [
  {
    title: "About TouchConnectPro",
    items: [
      {
        question: "What is TouchConnectPro?",
        answer: [
          "TouchConnectPro is a platform that helps early-stage founders understand and fix the financial and operational gaps in their business. It starts with a free diagnostic called the Founder Focus Score, which gives you a clear picture of where you stand across three dimensions: business clarity, financial structure, and operational readiness.",
          "From there, you get a personal dashboard with weekly action questions based on your results, and direct access to a specialist advisor who can help you address whatever gap is holding you back.",
        ],
      },
      {
        question: "Who is the specialist on the platform?",
        answer: [
          "The specialist on TouchConnectPro has hands-on experience in accounting systems, ERP selection and implementation, financial reporting, and fractional CFO work for early-stage businesses. This is not generic startup advice. It is specific, practical guidance from someone who has been inside the financial and operational mess that growing businesses face.",
        ],
      },
      {
        question: "How is this different from hiring an accountant or a CFO?",
        answer: [
          "A traditional accountant handles compliance: taxes, year-end filing, keeping your books clean. A full-time CFO manages your finances strategically but costs $150,000 or more per year. Neither is built for founders in the early stages who need practical guidance on setting up their financial foundation without a massive commitment.",
          "TouchConnectPro sits in between. You get specialist-level thinking on your specific situation, scoped to what you actually need, without retaining a full-time hire or committing to a compliance-only relationship.",
        ],
      },
      {
        question: "How is AI used on the platform?",
        answer: [
          "AI is used to generate your weekly focus questions based on your Founder Focus Score results. These questions are personalized to your specific gaps and refreshed as your situation evolves. They are designed to prompt reflection and action, not to replace human judgment.",
          "All advisory conversations are with a human specialist. AI does not respond to your messages or make recommendations on your behalf.",
        ],
      },
    ],
  },
  {
    title: "Getting started",
    items: [
      {
        question: "Who is TouchConnectPro for?",
        answer: [
          "TouchConnectPro is built for early-stage founders who are dealing with financial and operational gaps in their business. This includes first-time founders who have never set up proper accounting, founders who have recently raised money and now need real financial reporting, and bootstrapped founders whose systems are not keeping up with their growth.",
          "You do not need a business plan or a pitch deck to get started. You just need to be honest about where you are right now.",
        ],
      },
      {
        question: "What is the Founder Focus Score?",
        answer: [
          "The Founder Focus Score is a free 8-question diagnostic that gives you a clear picture of where your startup actually stands. It scores you across three dimensions: business clarity, financial structure, and operational readiness.",
          "The results are instant, plain-language, and specific to your answers. You also get one concrete next step to take this week based on your biggest gap. No signup is required to take it.",
        ],
      },
      {
        question: "Do I need to sign up to take the diagnostic?",
        answer: [
          "No. You can take the Founder Focus Score and see your results without creating an account. If you want to save your results, track your progress over time, and access your weekly focus questions, you can create a free account after completing the diagnostic. No credit card required.",
        ],
      },
      {
        question: "Is TouchConnectPro available globally?",
        answer: [
          "Yes. The diagnostic, dashboard, and messaging features are available to founders anywhere. Advisory conversations happen online and are asynchronous, so time zones are not a constraint for most interactions.",
        ],
      },
    ],
  },
  {
    title: "The diagnostic and dashboard",
    items: [
      {
        question: "How is my Focus Score calculated?",
        answer: [
          "Each of the 8 questions contributes points across the three dimensions of your score: business clarity, financial structure, and operational readiness. Your total score is an average across all three. The diagnostic is designed so that honest answers produce a useful result, not a flattering one.",
          "You can retake the score at any time. Your dashboard tracks changes over time so you can see whether your foundation is improving.",
        ],
      },
      {
        question: "What are the weekly focus questions?",
        answer: [
          "Each week, your dashboard surfaces questions built from your Focus Score results. They are designed to move you forward on your biggest gap without overwhelming you. Each question is tagged by topic so you know exactly what area it is addressing.",
          "The questions are generated by AI based on your diagnostic answers and refresh periodically as your situation changes. They are starting points for reflection and action, not a checklist to complete.",
        ],
      },
      {
        question: "Is my diagnostic data kept private?",
        answer: [
          "Yes. Your quiz answers and score are stored securely and are not shared with third parties. A specialist can view your score to provide relevant guidance, but your data is never used for advertising or sold to anyone.",
        ],
      },
      {
        question: "Is my data sold or shared with third parties?",
        answer: [
          "No. We do not sell personal data and we do not use it for advertising. Data is shared only with the trusted service providers that help us run the platform, such as our hosting and authentication providers, and only to the extent necessary. Full details are in our Privacy Policy.",
        ],
      },
      {
        question: "Can I delete my account?",
        answer: [
          "Yes. You can request account deletion at any time by emailing hello@touchconnectpro.com. We will remove your personal data within a reasonable period in line with our Privacy Policy.",
        ],
      },
    ],
  },
  {
    title: "Mentors, coaches & pricing",
    items: [
      {
        question: "How does the mentor and coach approval process work?",
        answer: [
          "After completing onboarding, your profile is shared with relevant mentors. If a mentor accepts your project, you will be approved to join their portfolio. That is when billing begins. Until then, there is no charge.",
        ],
      },
      {
        question: "Are coaching sessions included in the membership fee?",
        answer: [
          "Membership includes full access to the platform, community, and mentor onboarding. Specialist coaching sessions are paid separately, with each expert setting their own price based on experience and expertise.",
        ],
      },
      {
        question: "Can I cancel my membership anytime?",
        answer: [
          "Yes. You can cancel with one click inside your dashboard. Billing stops at the end of the current billing cycle.",
        ],
      },
      {
        question: "What if I need specialized help — legal, tech, or finance?",
        answer: [
          "TouchConnectPro connects you with specialist coaches across finance, marketing, engineering, and legal. Coaches set their own session rates. You pay the coach directly through the platform, and we keep a 20% fee to sustain the platform.",
        ],
      },
      {
        question: "Does TouchConnectPro support funding or investment?",
        answer: [
          "We do not fund startups directly, but we connect you with mentors and investors who may be open to funding once your idea reaches the right level of clarity and readiness. We also help you prepare a strong pitch and refine your business story.",
        ],
      },
    ],
  },
];

function generateFAQSchema() {
  const allItems = faqSections.flatMap(s => s.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    })),
  };
}

function FAQItem({ question, answer, testId }: { question: string; answer: string[]; testId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, cursor: "pointer", fontFamily: "inherit" }}
        data-testid={`button-faq-${testId}`}
      >
        <span
          style={{ fontSize: 15, fontWeight: 500, color: open ? C.teal : C.ink, lineHeight: 1.4, textAlign: "left", transition: "color 0.15s" }}
          className="q-text"
        >
          {question}
        </span>
        <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1px solid ${open ? C.teal : C.border}`, background: open ? C.teal : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s, border-color 0.2s" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={open ? "white" : C.inkMuted} strokeWidth="2" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      </button>
      <div style={{ maxHeight: open ? 600 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <div style={{ paddingBottom: 22 }}>
          {answer.map((para, i) => (
            <p key={i} style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.8, marginBottom: i < answer.length - 1 ? 10 : 0 }} data-testid={i === 0 ? `text-faq-answer-${testId}` : undefined}>
              {para}
            </p>
          ))}
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
    return () => { document.getElementById("faq-schema")?.remove(); };
  }, []);

  let counter = 0;

  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>

      {/* Page header */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "48px 2rem 52px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.teal, background: C.tealLight, padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
          FAQ
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.ink, marginBottom: 16 }} data-testid="text-faq-title">
          Questions founders <em style={{ fontStyle: "italic", color: C.gold }}>actually ask</em>
        </h1>
        <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }} data-testid="text-faq-subtitle">
          Everything you need to know about the platform, the diagnostic, and what working with a specialist looks like.
        </p>
      </div>

      {/* FAQ body */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 2rem 100px" }}>
        {faqSections.map((section, si) => (
          <div key={si} style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.inkMuted, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${C.borderSoft}`, display: "block" }} data-testid={`text-faq-section-${si}`}>
              {section.title}
            </span>
            {section.items.map((item, ii) => {
              counter++;
              return (
                <FAQItem
                  key={ii}
                  question={item.question}
                  answer={item.answer}
                  testId={`item-${counter}`}
                />
              );
            })}
          </div>
        ))}

        {/* Still have questions */}
        <div style={{ background: C.ink, borderRadius: 10, padding: "48px 40px", textAlign: "center", marginTop: 24 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 300, color: C.cream, marginBottom: 12, lineHeight: 1.3 }}>
            Still have a <em style={{ fontStyle: "italic", color: C.gold }}>question?</em>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, marginBottom: 28, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            If something is not covered here, reach out directly. We respond to every message.
          </p>
          <a
            href="mailto:hello@touchconnectpro.com"
            style={{ display: "inline-block", background: C.cream, color: C.ink, fontSize: 14, fontWeight: 500, padding: "13px 28px", borderRadius: 4, textDecoration: "none", transition: "background 0.15s, transform 0.1s", marginBottom: 12 }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldPale; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.cream; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            hello@touchconnectpro.com
          </a>
          <span style={{ display: "block", fontSize: 12, color: "rgba(250,248,243,0.3)", marginTop: 4 }}>
            Or take the free score and ask your question in the dashboard.
          </span>
        </div>
      </div>
    </div>
  );
}
