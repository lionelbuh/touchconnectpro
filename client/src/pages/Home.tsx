import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, BookOpen, Eye, Compass, CheckCircle, Quote } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

const rotatingGroups = [
  ["No more guessing.", "No more going in circles.", "No more doing it alone."],
  ["First-time founders.", "Side-hustlers ready to commit.", "Talents ready for a new direction."],
  ["Clarity first.", "Action next.", "Results that matter."],
  ["Career changers.", "Aspiring entrepreneurs.", "People ready to start."],
];

const founderQuotes = [
  {
    quote: "I had the idea for months but no clue where to start. The Focus Score gave me a clear picture in five minutes.",
    name: "Jason M.",
    role: "First-time founder",
  },
  {
    quote: "I thought I was further along than I was. The diagnostic showed me exactly what I was missing before I wasted more time.",
    name: "Priya K.",
    role: "Side-hustle to startup",
  },
];

export default function Home() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setGroupIndex((prev) => (prev + 1) % rotatingGroups.length);
        setVisible(true);
      }, 600);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-10" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #0D566C 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #FF6B5C 0%, transparent 70%)" }} />
        </div>

        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-4" style={{ color: "#0D566C" }} data-testid="text-hero-headline">
            Built for founders who are tired of figuring it out alone.
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto" style={{ color: "#4A4A4A" }}>
            Find out where you actually stand, what's holding you back, and what to do next — in 5 minutes.
          </p>
          <div className="min-h-[100px] flex items-center justify-center mb-8" data-testid="text-hero-rotating">
            <div
              className="transition-all duration-500 ease-in-out"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
            >
              {rotatingGroups[groupIndex].map((line, i) => (
                <p key={i} className="text-lg md:text-xl font-medium leading-relaxed" style={{ color: "#4A4A4A" }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-hero-cta"
            >
              Take the Founder Focus Score <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm" style={{ color: "#8A8A8A" }}>Free. 5 minutes. Tells you exactly where you stand.</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-social-proof">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {founderQuotes.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 relative" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }} data-testid={`card-quote-${i}`}>
                <Quote className="h-8 w-8 mb-3 opacity-20" style={{ color: "#0D566C" }} />
                <p className="text-base leading-relaxed mb-4 italic" style={{ color: "#4A4A4A" }}>
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#0D566C" }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0D566C" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "#8A8A8A" }}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Focus Score Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-founder-focus">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(255,107,92,0.12)" }}>
              <Target className="h-7 w-7" style={{ color: "#FF6B5C" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: "#0D566C" }}>
              Your Founder Focus Score
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-2" style={{ color: "#4A4A4A" }}>
              A free diagnostic built for early-stage founders. Answer 8 honest questions and get a clear picture of where your startup journey actually stands.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
            {[
              { title: "See your blind spots", desc: "Find out what's really holding you back — not what you think is." },
              { title: "Get a personalized snapshot", desc: "Your score breaks down clarity, readiness, and next steps in plain language." },
              { title: "Know what to do next", desc: "No vague advice. You get a specific starting point based on your answers." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }} data-testid={`card-focus-benefit-${i}`}>
                <CheckCircle className="h-8 w-8 mx-auto mb-3" style={{ color: "#FF6B5C" }} />
                <h3 className="text-base font-bold mb-2" style={{ color: "#0D566C" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/founder-focus">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                data-testid="button-focus-score-cta"
              >
                Take the Founder Focus Score <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm" style={{ color: "#8A8A8A" }}>No sign-up required to start. Results are instant.</p>
          </div>
        </div>
      </section>

      {/* What Is TouchConnectPro Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-what-is-tcp">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
              <Compass className="h-6 w-6" style={{ color: "#F5C542" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6" style={{ color: "#0D566C" }}>
              What Happens After Your Score?
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: "#4A4A4A" }}>
            <p>
              Your Focus Score is the starting point. What comes next is what makes the difference.
            </p>
            <p>
              TouchConnectPro connects you with experienced mentors who have actually built businesses. They help you go from "I have an idea" to "I have a plan someone would fund."
            </p>
            <p>
              You get structured guidance, not generic advice. Every step is clear, purposeful, and built around where you are right now.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { num: "1", text: "Take your Focus Score and see where you stand" },
              { num: "2", text: "Get matched with a mentor who fits your stage" },
              { num: "3", text: "Build with structure, clarity, and real support" },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-3 bg-white rounded-xl p-4" style={{ boxShadow: "0 2px 10px rgba(224,224,224,0.5)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm" style={{ backgroundColor: "rgba(245,197,66,0.2)", color: "#0D566C" }}>
                  {step.num}
                </div>
                <p className="text-sm font-medium" style={{ color: "#4A4A4A" }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-features">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: "#0D566C" }}>
              How It Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#4A4A4A" }}>
              Simple tools and real guidance to help you move forward with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="h-7 w-7" />,
                title: "Focus with Clarity",
                desc: "Get simple tools that help you see exactly what to do next, without feeling overwhelmed.",
              },
              {
                icon: <BarChart3 className="h-7 w-7" />,
                title: "Track Your Progress",
                desc: "Know what's working and what needs attention, so you can move forward confidently.",
              },
              {
                icon: <BookOpen className="h-7 w-7" />,
                title: "Learn from Real Founders",
                desc: "Tips, insights, and practical guidance from people who have been in your shoes.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}
                data-testid={`card-feature-${i}`}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
                  <span style={{ color: "#F5C542" }}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#0D566C" }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: "#4A4A4A" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TouchConnectPro / Mentorship Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-why-tcp">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(75,63,114,0.1)" }}>
                <Compass className="h-8 w-8" style={{ color: "#4B3F72" }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6" style={{ color: "#4B3F72" }}>
                A human touch for every idea
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "#4A4A4A" }}>
                AI can organize your thinking, but humans provide creativity, perspective, and guidance. You'll never feel stuck. Every next step is clear, purposeful, and actionable.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Clarity", value: "See what matters" },
                  { label: "Direction", value: "Know your next step" },
                  { label: "Guidance", value: "Human mentorship" },
                  { label: "Progress", value: "Measurable growth" },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 text-center" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }}>
                    <p className="font-bold mb-1" style={{ color: "#4B3F72" }}>{item.label}</p>
                    <p className="text-sm" style={{ color: "#4A4A4A" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#0D566C" }} data-testid="section-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
            Stop overthinking. Start with your score.
          </h2>
          <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            Five minutes to find out where you stand, what's missing, and what to do first. It's free and the results are yours to keep.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-cta-get-started"
            >
              Take the Founder Focus Score <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>No credit card. No sign-up to start. Just answers.</p>
        </div>
      </section>

    </div>
  );
}
