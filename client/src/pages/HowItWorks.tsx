import { Link } from "wouter";

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

const steps = [
  {
    num: "Step 01",
    phase: ["Take your ", "free", " score"],
    tag: "Free, no sign-up needed",
    tagStyle: { color: C.teal, background: C.tealLight },
    title: "Find out exactly where your financial foundation stands",
    desc: "Answer 8 honest questions about your startup. You get an instant breakdown across three dimensions: business clarity, financial structure, and operational readiness. No vague results. A plain-language picture of what is working and what is not.",
    points: ["See your blind spots before they cost you", "Understand which financial gap to fix first", "Get a personalized snapshot of your startup's real state"],
    cardTitle: "Takes 5 minutes",
    cardDesc: "Results are instant and yours to keep. No email required to see your score.",
    cardIcon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={C.teal} strokeWidth={1.5}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
    ),
  },
  {
    num: "Step 02",
    phase: ["See your ", "dashboard"],
    tag: "Free account",
    tagStyle: { color: C.teal, background: C.tealLight },
    title: "Your score becomes a personal action plan",
    desc: "Once you create a free account, your dashboard tracks your Focus Score over time, shows you the specific gaps to address, and surfaces the right resources based on where you actually are. Not a generic checklist. A starting point built around your answers.",
    points: ["Score breakdown across clarity, financial structure, and operations", "Plain-language interpretation of what each gap means for your growth", "A clear first step to take, matched to your situation"],
    cardTitle: "Your dashboard is free, always",
    cardDesc: "Track your progress and revisit your score as your startup evolves. No expiry.",
    cardIcon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={C.teal} strokeWidth={1.5}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 17h7M17 14v7"/></svg>
    ),
  },
  {
    num: "Step 03",
    phase: ["Chat with a ", "specialist"],
    tag: "Online, at your own pace",
    tagStyle: { color: "#7A5C1E", background: C.goldPale, border: `1px solid rgba(196,154,60,0.25)` },
    title: "Get real answers to your specific situation",
    desc: "When your dashboard surfaces a gap you want to address, you can reach out directly to a specialist online. Ask your questions, share your context, and get guidance that is specific to your business. No generic advice, no waiting rooms.",
    points: ["Ask anything about your financial or operational situation", "Get practical, specific guidance based on your actual gaps", "No pressure to commit to anything until it feels right"],
    cardTitle: "Human, not automated",
    cardDesc: "You are talking to a specialist who has read your score and understands your context before you say a word.",
    cardIcon: (
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={C.teal} strokeWidth={1.5}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    ),
  },
];

const services = [
  { label: "One-time", title: "Advisory session", desc: "One focused call with a clear output. A diagnosis, a decision framework, or a specific action plan for your most pressing financial question." },
  { label: "Project-based", title: "Build your foundation", desc: "Accounting system setup, ERP selection and implementation, financial reporting structure. Scoped to your situation, delivered in weeks." },
  { label: "Ongoing", title: "Fractional CFO", desc: "A specialist in your corner every month. Financial oversight, reporting, and strategic guidance without the full-time hire." },
];

export default function HowItWorks() {
  return (
    <div style={{ backgroundColor: C.cream }} data-testid="page-how-it-works">

      {/* Page Header */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 2rem 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
          How it works
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.ink, marginBottom: 20 }} data-testid="text-hiw-headline">
          From first question to <em style={{ fontStyle: "italic", color: C.gold }}>real financial clarity</em>
        </h1>
        <p style={{ fontSize: 17, color: C.inkSoft, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
          Three steps. No membership required to start. You only go further if it makes sense for your situation.
        </p>
      </div>

      {/* Steps */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 2rem 100px" }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderTop: `1px solid ${C.borderSoft}`, padding: "56px 0", ...(i === steps.length - 1 ? { borderBottom: `1px solid ${C.borderSoft}` } : {}) }}
            data-testid={`step-block-${i}`}
          >
            <div style={{ paddingRight: 48, paddingTop: 4 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 10, display: "block" }}>{step.num}</span>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: C.ink, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                {step.phase[0]}<em style={{ fontStyle: "italic", color: C.gold }}>{step.phase[1]}</em>{step.phase[2] || ""}
              </div>
            </div>
            <div style={{ paddingLeft: 48, borderLeft: `1px solid ${C.borderSoft}` }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, marginBottom: 20, ...step.tagStyle }}>{step.tag}</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: C.ink, marginBottom: 12, lineHeight: 1.3 }}>{step.title}</h2>
              <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, marginBottom: 24 }}>{step.desc}</p>
              <ul style={{ listStyle: "none", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                {step.points.map((pt, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 7, display: "inline-block" }} />
                    {pt}
                  </li>
                ))}
              </ul>
              <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14, marginTop: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 4, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {step.cardIcon}
                </div>
                <div>
                  <strong style={{ fontSize: 13, fontWeight: 500, color: C.ink, display: "block", marginBottom: 2 }}>{step.cardTitle}</strong>
                  <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, margin: 0 }}>{step.cardDesc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What working together looks like */}
      <section style={{ backgroundColor: C.ink, padding: "80px 2rem" }} data-testid="section-services">
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 300, color: C.cream, marginBottom: 12, lineHeight: 1.2 }}>
            What working together <em style={{ fontStyle: "italic", color: C.gold }}>actually looks like</em>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(250,248,243,0.5)", maxWidth: 520, lineHeight: 1.7, marginBottom: 48 }}>
            Every engagement is scoped to your situation. No fixed packages, no upsells. Three types of work, priced by what you need.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>
            {services.map((s, i) => (
              <div key={i} style={{ padding: "32px 28px", background: C.ink }} data-testid={`service-card-${i}`}>
                <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: 14, display: "block" }}>{s.label}</span>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 400, color: C.cream, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(250,248,243,0.5)", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: C.goldPale, borderTop: `1px solid rgba(196,154,60,0.2)`, padding: "80px 2rem", textAlign: "center" }} data-testid="section-hiw-cta">
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 300, color: C.ink, lineHeight: 1.2, marginBottom: 16 }}>
            Start with your score. <em style={{ fontStyle: "italic" }}>Everything else follows.</em>
          </h2>
          <p style={{ fontSize: 16, color: C.inkSoft, marginBottom: 36, lineHeight: 1.7 }}>
            Five minutes to find out where your financial foundation actually stands. Free, no sign-up required to start.
          </p>
          <Link href="/founder-focus" data-testid="button-hiw-cta">
            <span
              className="inline-block cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: C.ink, color: C.cream, fontSize: 14, fontWeight: 500, padding: "14px 32px", borderRadius: 4, textDecoration: "none", display: "inline-block" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.teal)}
              onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
            >
              Take the Founder Focus Score
            </span>
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: C.inkMuted }}>No credit card. No sign-up to start. Just answers.</p>
        </div>
      </section>

    </div>
  );
}
