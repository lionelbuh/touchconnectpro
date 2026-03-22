import { ArrowRight, TrendingDown, Clock, AlertTriangle, BarChart2, FileText, Users } from "lucide-react";
import { Link } from "wouter";

const painPoints = [
  {
    icon: <TrendingDown />,
    title: "You're building without knowing your numbers",
    desc: "Revenue, margins, burn rate — if these aren't part of your weekly thinking, you're flying blind. Most founders don't find out until it's too late.",
  },
  {
    icon: <Clock />,
    title: "You're wasting time on the wrong things",
    desc: "Content, product features, cold outreach — when your financial foundation is weak, none of it compounds the way it should.",
  },
  {
    icon: <AlertTriangle />,
    title: "Investors are asking questions you can't answer",
    desc: "What's your CAC? Payback period? Gross margin? If these feel foreign, you're not ready for a funding conversation — yet.",
  },
];

const steps = [
  {
    num: "1",
    title: "Take the Founder Focus Score",
    desc: "8 honest questions about your business, your numbers, and your stage. Takes 5 minutes. Results are instant and free to keep.",
    tag: "Free · No sign-up required",
  },
  {
    num: "2",
    title: "Get your personalized snapshot",
    desc: "See your score across 5 dimensions: clarity, financial readiness, market understanding, team, and momentum. Know exactly where you stand.",
    tag: "Instant results",
  },
  {
    num: "3",
    title: "Match with the right advisor",
    desc: "Based on your gaps, we surface coaches and mentors who specialize in exactly what you need — not generic startup advice.",
    tag: "Free first call available",
  },
  {
    num: "4",
    title: "Build the foundation, then scale",
    desc: "With your gaps identified and an advisor who has solved this before, you move from reactive to strategic. That's when things start to compound.",
    tag: "Structured guidance",
  },
];

const scorePills = [
  "Financial readiness",
  "Market clarity",
  "Customer understanding",
  "Team & execution",
  "Momentum & traction",
];

const testimonials = [
  {
    quote: "I had the idea for months but no clue where to start. The Focus Score gave me a clear picture in five minutes — and the advisor match was spot on.",
    name: "Jason M.",
    role: "First-time founder",
  },
  {
    quote: "I thought I was further along than I was. The diagnostic showed me exactly what I was missing before I wasted more time and money on the wrong things.",
    name: "Priya K.",
    role: "Side-hustle to startup",
  },
];

const audiences = [
  {
    title: "Pre-revenue & early stage",
    desc: "You have an idea and maybe a few customers, but your financial model is a spreadsheet held together by guesswork. Let's fix that.",
  },
  {
    title: "Revenue but no clarity",
    desc: "You're making money but you don't fully understand where it's coming from, where it's going, or how to make more of it predictably.",
  },
  {
    title: "Bootstrapped and scaling",
    desc: "Your spreadsheets are breaking down. You're growing fast but your financial systems aren't keeping up. Time to fix the foundation before it costs you more.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col" style={{ backgroundColor: "#FAF8F3" }}>

      {/* HERO */}
      <section style={{ backgroundColor: "#FAF8F3" }}>
        <div className="mx-auto px-6 py-24 md:py-32 max-w-6xl grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* Left */}
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest rounded-full px-4 py-1.5 mb-7"
              style={{ color: "#1D6A5A", backgroundColor: "#E4F0ED", letterSpacing: "0.12em" }}
              data-testid="text-hero-eyebrow"
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#1D6A5A" }} />
              For early-stage founders
            </div>
            <h1
              className="font-display font-light leading-tight mb-6"
              style={{ fontSize: "clamp(36px, 5vw, 54px)", color: "#1A1814", letterSpacing: "-0.02em", lineHeight: 1.1 }}
              data-testid="text-hero-headline"
            >
              Your business idea needs{" "}
              <em className="not-italic" style={{ color: "#C49A3C" }}>a financial foundation,</em>{" "}
              not just a dream
            </h1>
            <p className="text-lg leading-relaxed mb-9" style={{ color: "#4A4740", maxWidth: 460 }}>
              Most founders build fast and figure out the money side later. That's where things quietly fall apart. TouchConnectPro connects you with advisors who fix the financial and operational gaps before they become expensive problems.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/founder-focus" data-testid="button-hero-cta">
                <span
                  className="inline-block text-sm font-medium px-7 py-4 rounded cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: "#1A1814", color: "#FAF8F3", borderRadius: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1D6A5A")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1A1814")}
                >
                  Take your free Founder Focus Score
                </span>
              </Link>
              <Link href="/how-it-works" data-testid="link-hero-how">
                <span
                  className="text-sm cursor-pointer pb-px transition-colors duration-200"
                  style={{ color: "#4A4740", borderBottom: "1px solid rgba(26,24,20,0.3)" }}
                >
                  See how it works
                </span>
              </Link>
            </div>
            <p className="mt-5 text-xs" style={{ color: "#8C8880" }}>Free. No sign-up required to start.</p>
          </div>

          {/* Right — Score Card Mockup */}
          <div
            className="rounded-xl p-8"
            style={{ background: "white", border: "1px solid rgba(26,24,20,0.12)", boxShadow: "0 4px 32px rgba(26,24,20,0.06)" }}
            data-testid="card-score-mockup"
          >
            <p className="text-sm font-medium mb-5 pb-4" style={{ color: "#4A4740", borderBottom: "1px solid rgba(26,24,20,0.07)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              Your Founder Focus Score
            </p>
            {[
              { label: "Financial readiness", pct: 42, color: "#C49A3C" },
              { label: "Market clarity", pct: 71, color: "#1D6A5A" },
              { label: "Customer understanding", pct: 58, color: "#C49A3C" },
            ].map(bar => (
              <div key={bar.label} className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium" style={{ color: "#4A4740" }}>{bar.label}</span>
                  <span className="text-xs" style={{ color: "#8C8880" }}>{bar.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(26,24,20,0.07)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} />
                </div>
              </div>
            ))}
            <div className="flex items-baseline gap-2 my-6">
              <span className="font-display font-light" style={{ fontSize: 52, color: "#1A1814", letterSpacing: "-0.03em", lineHeight: 1 }}>57</span>
              <span className="text-lg font-light" style={{ color: "#8C8880" }}>/100</span>
            </div>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
              style={{ color: "#1D6A5A", backgroundColor: "#E4F0ED", letterSpacing: "0.06em" }}
            >
              Financial Foundation Gap
            </span>
            <p className="text-sm leading-relaxed rounded px-4 py-3" style={{ color: "#4A4740", background: "#FAF3E0", borderLeft: "3px solid #C49A3C" }}>
              Strong on market clarity, but your financial model needs attention before you're ready for a funding conversation.
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section style={{ backgroundColor: "#1A1814" }} data-testid="section-problems">
        <div className="mx-auto px-6 py-20 md:py-24 max-w-5xl text-center">
          <span className="block text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#8C8880", letterSpacing: "0.12em" }}>
            Why most founders stall
          </span>
          <h2
            className="font-display font-light mb-4"
            style={{ fontSize: "clamp(26px, 4vw, 40px)", color: "#FAF8F3", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            The idea isn't the problem.{" "}
            <em className="not-italic" style={{ color: "#C49A3C" }}>The foundation is.</em>
          </h2>
          <p className="text-base mb-14 mx-auto" style={{ color: "rgba(250,248,243,0.5)", maxWidth: 480, lineHeight: 1.7 }}>
            Most founders don't run out of ambition. They run out of clarity, structure, and the right people around them at the right time.
          </p>
          <div
            className="grid md:grid-cols-3 gap-px text-left overflow-hidden rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {painPoints.map((item, i) => (
              <div key={i} className="p-8" style={{ backgroundColor: "#1A1814" }} data-testid={`card-pain-${i}`}>
                <div
                  className="w-9 h-9 rounded flex items-center justify-center mb-4"
                  style={{ backgroundColor: "rgba(196,154,60,0.15)" }}
                >
                  <span style={{ color: "#C49A3C", width: 18, height: 18, display: "flex" }}>
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-display font-normal text-base mb-2.5" style={{ color: "#FAF8F3", lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,243,0.5)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ backgroundColor: "#FAF8F3" }} data-testid="section-how-it-works">
        <div className="mx-auto px-6 py-24 md:py-28 max-w-3xl">
          <div className="text-center mb-16">
            <h2
              className="font-display font-light mb-3"
              style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "#1A1814", lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              Four steps to{" "}
              <em className="not-italic" style={{ color: "#C49A3C" }}>financial clarity</em>
            </h2>
            <p className="text-base" style={{ color: "#4A4740", maxWidth: 400, margin: "0 auto" }}>
              No guesswork. No vague roadmaps. A clear path from "I have an idea" to "I have a plan."
            </p>
          </div>
          <div className="flex flex-col">
            {steps.map((step, i) => (
              <div
                key={i}
                className="grid gap-6 py-8"
                style={{ gridTemplateColumns: "56px 1fr", borderBottom: i < steps.length - 1 ? "1px solid rgba(26,24,20,0.07)" : "none" }}
                data-testid={`step-${i}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ border: "1px solid rgba(26,24,20,0.12)", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#8C8880" }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="font-display font-normal text-xl mb-2" style={{ color: "#1A1814", lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "#4A4740" }}>{step.desc}</p>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#C49A3C", letterSpacing: "0.06em" }}>
                    {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER FOCUS SCORE CTA */}
      <section
        style={{ backgroundColor: "#FAF3E0", borderTop: "1px solid rgba(196,154,60,0.2)", borderBottom: "1px solid rgba(196,154,60,0.2)" }}
        data-testid="section-score-cta"
      >
        <div className="mx-auto px-6 py-20 md:py-24 max-w-2xl text-center">
          <span className="block text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#8C8880", letterSpacing: "0.12em" }}>
            Start here
          </span>
          <h2
            className="font-display font-light mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "#1A1814", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            Know where you stand{" "}
            <em className="not-italic">before</em>{" "}
            you spend another dollar
          </h2>
          <p className="text-base leading-relaxed mb-9" style={{ color: "#4A4740" }}>
            The Founder Focus Score is a free 5-minute diagnostic that scores your startup across five dimensions. You'll walk away knowing exactly what's strong, what's weak, and what to fix first.
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center mb-9">
            {scorePills.map(pill => (
              <span
                key={pill}
                className="text-sm px-4 py-2 rounded-full"
                style={{ color: "#4A4740", background: "white", border: "1px solid rgba(26,24,20,0.12)" }}
              >
                {pill}
              </span>
            ))}
          </div>
          <Link href="/founder-focus" data-testid="button-score-cta">
            <span
              className="inline-block text-sm font-medium px-8 py-4 rounded cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ backgroundColor: "#1A1814", color: "#FAF8F3", borderRadius: 4 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1D6A5A")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#1A1814")}
            >
              Take the Founder Focus Score — it's free
            </span>
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#8C8880" }}>No credit card. No sign-up to start.</p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ backgroundColor: "#FAF8F3" }} data-testid="section-testimonials">
        <div className="mx-auto px-6 py-24 md:py-28 max-w-4xl">
          <div className="text-center mb-14">
            <h2
              className="font-display font-light"
              style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "#1A1814", lineHeight: 1.2, letterSpacing: "-0.01em" }}
            >
              Founders who stopped guessing
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-8"
                style={{ background: "white", border: "1px solid rgba(26,24,20,0.12)" }}
                data-testid={`card-testimonial-${i}`}
              >
                <p
                  className="font-light mb-6 leading-relaxed"
                  style={{ fontFamily: "Georgia, serif", fontSize: 17, fontStyle: "italic", color: "#1A1814", lineHeight: 1.6 }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: "#E4F0ED", color: "#1D6A5A" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1A1814" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#8C8880" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{ backgroundColor: "#1A1814" }} data-testid="section-who">
        <div className="mx-auto px-6 py-20 md:py-24 max-w-5xl">
          <h2
            className="font-display font-light mb-12"
            style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "#FAF8F3", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            Built for founders who are{" "}
            <em className="not-italic" style={{ color: "#C49A3C" }}>serious about the foundation</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a, i) => (
              <div
                key={i}
                className="rounded-xl p-7"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                data-testid={`card-who-${i}`}
              >
                <h3 className="font-display font-normal text-base mb-2.5" style={{ color: "#FAF8F3", lineHeight: 1.3 }}>
                  {a.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,243,0.5)" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTOR STRIP */}
      <section style={{ backgroundColor: "#FAF8F3" }} data-testid="section-mentors" id="mentors">
        <div className="mx-auto px-6 py-24 md:py-28 max-w-5xl grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#8C8880", letterSpacing: "0.12em" }}>
              Real advisors, real expertise
            </span>
            <h2
              className="font-display font-light mb-5"
              style={{ fontSize: "clamp(26px, 3.5vw, 36px)", color: "#1A1814", lineHeight: 1.25, letterSpacing: "-0.01em" }}
            >
              Not generic advice.{" "}
              <em className="not-italic" style={{ color: "#C49A3C" }}>Specialists</em>{" "}
              who have solved your exact problem.
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#4A4740", lineHeight: 1.75 }}>
              Every advisor on TouchConnectPro has hands-on experience in accounting systems, ERP implementation, financial operations, or fractional CFO work for early-stage businesses.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#4A4740", lineHeight: 1.75 }}>
              AI can organize your thinking. But it takes a human who has been inside the financial chaos of a growing startup to tell you exactly what to do next.
            </p>
          </div>
          <div
            className="rounded-xl p-7"
            style={{ background: "white", border: "1px solid rgba(26,24,20,0.12)" }}
            data-testid="card-mentor-sample"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#E4F0ED", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#1D6A5A" }}
            >
              L
            </div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#1A1814" }}>Lionel D.</p>
            <p className="text-xs mb-4" style={{ color: "#8C8880" }}>Accounting &amp; ERP Specialist · Fractional CFO</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {["QuickBooks", "NetSuite", "Odoo", "Financial modeling", "Fractional CFO"].map(tag => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ color: "#1D6A5A", backgroundColor: "#E4F0ED" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#4A4740" }}>
              Helps early-stage founders build accounting systems that don't fall apart when they start scaling. Specializes in ERP selection, financial reporting setup, and CFO-level advisory for startups that aren't ready for a full-time hire.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ backgroundColor: "#1D6A5A" }} data-testid="section-final-cta">
        <div className="mx-auto px-6 py-24 md:py-28 max-w-2xl text-center">
          <h2
            className="font-display font-light mb-5"
            style={{ fontSize: "clamp(30px, 4.5vw, 48px)", color: "#FAF8F3", lineHeight: 1.15, letterSpacing: "-0.02em" }}
          >
            Stop overthinking.{" "}
            <em className="not-italic">Start with your score.</em>
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(250,248,243,0.7)" }}>
            Five minutes to find out where you stand, what's missing in your financial foundation, and what to fix first. It's free and the results are yours to keep.
          </p>
          <Link href="/founder-focus" data-testid="button-final-cta">
            <span
              className="inline-block text-sm font-medium px-9 py-4 rounded cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              style={{ backgroundColor: "#FAF8F3", color: "#1D6A5A", borderRadius: 4 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "white")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#FAF8F3")}
            >
              Take the Founder Focus Score <ArrowRight className="inline ml-1 h-4 w-4" />
            </span>
          </Link>
          <p className="mt-5 text-xs" style={{ color: "rgba(250,248,243,0.4)" }}>No credit card. No sign-up to start. Just answers.</p>
        </div>
      </section>

    </div>
  );
}
