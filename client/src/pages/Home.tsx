import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, BookOpen, Eye, Compass } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-10" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #0D566C 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #FF6B5C 0%, transparent 70%)" }} />
        </div>

        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-6" style={{ color: "#0D566C" }} data-testid="text-hero-headline">
            AI helps organize your thoughts.<br className="hidden md:inline" /> Mentors help you make them real.
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: "#4A4A4A" }}>
            Turn your ideas into action with clarity and guidance. AI structures your ideas, but your mentor keeps them creative, personal, and actionable.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-hero-cta"
            >
              Try it free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-5 text-sm" style={{ color: "#8A8A8A" }}>No credit card required. Start in under 5 minutes.</p>
        </div>
      </section>

      {/* Features / How It Works Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-features">
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

      {/* Why TouchConnectPro Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-why-tcp">
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

      {/* What Is TouchConnectPro Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-what-is-tcp">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
              <Target className="h-6 w-6" style={{ color: "#F5C542" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6" style={{ color: "#0D566C" }}>
              What Is TouchConnectPro?
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: "#4A4A4A" }}>
            <p>
              TouchConnectPro is a mentorship platform designed to support early stage entrepreneurs through structured, real world guidance.
            </p>
            <p>
              We help founders move from idea to execution by connecting them with vetted mentors who understand the challenges of building a business from the ground up.
            </p>
            <p>
              Whether you are validating an idea, launching a product, or preparing for growth, TouchConnectPro gives you access to experience that accelerates progress.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { num: "1", text: "Validate your idea with real feedback" },
              { num: "2", text: "Build with structured mentor guidance" },
              { num: "3", text: "Grow with confidence and clarity" },
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

      {/* Call to Action Section */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#0D566C" }} data-testid="section-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
            Ready to turn your idea into action?
          </h2>
          <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            Start today for free and see how a mentor-guided approach helps you focus, learn, and move forward.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-cta-get-started"
            >
              Get started now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
