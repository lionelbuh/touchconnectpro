import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, UserCheck, Rocket, TrendingUp, Check } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-5" style={{ color: "#0D566C" }} data-testid="text-hiw-headline">
            How It Works
          </h1>
          <p className="text-xl md:text-2xl font-display font-medium mb-4" style={{ color: "#4B3F72" }}>
            A simple path from idea to real progress.
          </p>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A4A4A" }}>
            We help you move forward step by step, with clarity and real support.
          </p>
        </div>
      </section>

      {/* Phase 1 */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-phase-1">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
                <Lightbulb className="h-8 w-8" style={{ color: "#F5C542" }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#FF6B5C" }}>Phase 1</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4" style={{ color: "#0D566C" }}>Start for Free</h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
                Begin shaping your idea today. No credit card required. Use our tools to clarify your value, structure your thinking, and build a strong first draft of your business plan.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Turn your concept into a clear vision",
                  "Organize your priorities",
                  "Check that your idea has real potential",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="font-medium" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/founder-focus">
                <Button
                  className="h-12 px-8 text-base font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-phase1-cta"
                >
                  Start refining your idea <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-phase-2">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(75,63,114,0.1)" }}>
                <UserCheck className="h-8 w-8" style={{ color: "#4B3F72" }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#FF6B5C" }}>Phase 2</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Get Matched With a Mentor</h2>
              <p className="text-sm font-semibold mb-4 inline-block px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
                Membership: Community - FREE
              </p>
              <p className="text-lg leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>
                When your idea is ready, submit it for review. A dedicated mentor evaluates it and, if aligned, welcomes you into their portfolio.
              </p>
              <p className="text-lg leading-relaxed mb-6 font-medium" style={{ color: "#4B3F72" }}>
                This is where focused guidance begins.
              </p>
              <ul className="space-y-3">
                {[
                  "Receive clear, actionable feedback",
                  "Align on meaningful goals",
                  "Start building with direction",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="font-medium" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 3 */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-phase-3">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
                <Rocket className="h-8 w-8" style={{ color: "#F5C542" }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#FF6B5C" }}>Phase 3</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Build With Ongoing Support</h2>
              <p className="text-sm font-semibold mb-4 inline-block px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
                Membership: $9.99 per month
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
                You now unlock full support: monthly guidance, community learning, and optional access to experts in finance, legal, and marketing.
              </p>
              <ul className="space-y-3">
                {[
                  "Step-by-step resources to move faster",
                  "Direct access to your mentor throughout the month",
                  "Marketplace access to specialized experts",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="font-medium" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 4 */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-phase-4">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(75,63,114,0.1)" }}>
                <TrendingUp className="h-8 w-8" style={{ color: "#4B3F72" }} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#FF6B5C" }}>Phase 4</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Become Investor Ready</h2>
              <p className="text-sm font-semibold mb-4 inline-block px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
                Membership: $49 per month
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
                When you are ready to raise, we help you prepare properly. We support your pitch deck, refine your fundraising strategy, and connect you with angel investors who review final projects.
              </p>
              <ul className="space-y-3">
                {[
                  "Investor-ready pitch deck",
                  "Clear fundraising roadmap",
                  "Access to our angel network",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="font-medium" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#0D566C" }} data-testid="section-hiw-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-5 text-white">
            Ready to take the first step?
          </h2>
          <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            Start refining your idea today and build with clarity and confidence.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-hiw-cta"
            >
              Get started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
