import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-5" style={{ color: "#0D566C" }} data-testid="text-pricing-headline">
            Choose your path
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#4A4A4A" }}>
            Whether you are shaping your first idea or preparing to raise capital, start where you are and grow from there.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "#F3F3F3" }}>
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 items-start">

            {/* Community - Free */}
            <div
              className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
              style={{ boxShadow: "0 2px 16px rgba(224,224,224,0.5)" }}
              data-testid="card-community-free-pricing"
            >
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold mb-1" style={{ color: "#0D566C" }}>Community</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "#FF6B5C" }}>Free</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display font-bold" style={{ color: "#0D566C" }}>$0</span>
                  <span className="text-base" style={{ color: "#4A4A4A" }}>per month</span>
                </div>
                <p className="text-sm" style={{ color: "#8A8A8A" }}>No credit card required.</p>
              </div>

              <p className="text-base leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
                Perfect for exploring and refining your idea.
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Founder Focus Score to uncover your biggest blocker",
                  "Personalized insights to guide your next steps",
                  "Tools to refine your idea and structure your plan",
                  "Mentor-ready preparation so feedback is targeted and useful",
                  "Optional access to specialist coaches in legal, finance, and growth",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3 w-3" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="text-sm" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/founder-focus">
                <Button
                  className="w-full h-12 text-base font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#0D566C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-community-free-pricing"
                >
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Founders Circle - Most Popular */}
            <div
              className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col relative border-2"
              style={{ boxShadow: "0 4px 24px rgba(13,86,108,0.15)", borderColor: "#FF6B5C" }}
              data-testid="card-founders-circle-pricing"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#FF6B5C" }}>
                  <Star className="h-3.5 w-3.5 fill-current" /> Most Popular
                </span>
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-display font-bold mb-1" style={{ color: "#0D566C" }}>Founders Circle</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "#FF6B5C" }}>Available upon mentor acceptance</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display font-bold" style={{ color: "#0D566C" }}>$9.99</span>
                  <span className="text-base" style={{ color: "#4A4A4A" }}>per month</span>
                </div>
              </div>

              <p className="text-base leading-relaxed mb-6" style={{ color: "#4A4A4A" }}>
                For founders ready to build with direct support.
              </p>

              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#8A8A8A" }}>
                Includes everything in Community, plus:
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "A dedicated mentor",
                  "Ongoing access for questions and feedback",
                  "Proven strategic frameworks",
                  "Deeper community access",
                  "Flexible guidance without mandatory weekly calls",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3 w-3" style={{ color: "#0D566C" }} />
                    </div>
                    <span className="text-sm" style={{ color: "#4A4A4A" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/become-entrepreneur">
                <Button
                  className="w-full h-12 text-base font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-founders-circle-pricing"
                >
                  Join Founders Circle <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Capital Circle */}
            <div
              className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
              style={{ backgroundColor: "#0D566C", boxShadow: "0 4px 24px rgba(13,86,108,0.25)" }}
              data-testid="card-capital-circle-pricing"
            >
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold mb-1 text-white">Capital Circle</h3>
                <p className="text-sm font-medium mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>Selective access</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-display font-bold text-white">$49</span>
                  <span className="text-base" style={{ color: "rgba(255,255,255,0.7)" }}>per month</span>
                </div>
              </div>

              <p className="text-base leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>
                For committed founders preparing to raise funding with structure and support.
              </p>

              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                Includes:
              </p>

              <ul className="space-y-3 mb-6 flex-1">
                {[
                  "Fundraising readiness review",
                  "Pitch deck feedback and positioning guidance",
                  "Structured preparation phase",
                  "Investor visibility after approval",
                  "Ongoing capital strategy support",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                      <Check className="h-3 w-3" style={{ color: "#F5C542" }} />
                    </div>
                    <span className="text-sm text-white">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs mb-6 italic" style={{ color: "rgba(255,255,255,0.5)" }}>
                Limited seats to ensure focused, high-quality support.
              </p>

              <Link href="/become-entrepreneur">
                <Button
                  className="w-full h-12 text-base font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#F5C542", color: "#0D566C", border: "none" }}
                  data-testid="button-capital-circle-pricing"
                >
                  Apply for Capital Circle <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-5" style={{ color: "#0D566C" }}>
            Not sure which plan is right for you?
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "#4A4A4A" }}>
            Start with the free Community plan. You can always grow into the next step when you are ready.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-pricing-cta"
            >
              Get started for free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
