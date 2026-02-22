import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, Rocket, Compass, BookOpen, Target } from "lucide-react";
import { insightArticles } from "@/lib/insightsData";
import { useEffect } from "react";

function setMetaTag(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (name.startsWith("og:")) (el as HTMLMetaElement).setAttribute("property", name);
    else (el as HTMLMetaElement).setAttribute("name", name);
    document.head.appendChild(el);
  }
  (el as HTMLMetaElement).setAttribute("content", content);
}

const audienceCards = [
  {
    icon: Lightbulb,
    title: "Entrepreneurs with an idea and no clear roadmap",
    description: "You have an idea that excites you but you are unsure where to start. The path from concept to validation feels overwhelming, and you need structured clarity to take the first real step.",
  },
  {
    icon: Compass,
    title: "First-time founders seeking experienced guidance",
    description: "You are building something for the first time and every decision feels high-stakes. Decision paralysis and execution risk are slowing you down when you need momentum most.",
  },
  {
    icon: Rocket,
    title: "Early-stage startups preparing to launch or scale",
    description: "Your product exists but you are unsure if your operations are ready for growth. You need to know what to systematize, what to let go, and when to accelerate.",
  }
];

const tagColors: Record<string, { bg: string; color: string }> = {
  "Idea stage": { bg: "rgba(255,107,92,0.1)", color: "#FF6B5C" },
  "First-time founder": { bg: "rgba(75,63,114,0.1)", color: "#4B3F72" },
  "Early-stage startup": { bg: "rgba(13,86,108,0.1)", color: "#0D566C" },
};

export default function Insights() {
  useEffect(() => {
    document.title = "Startup Radar – Insights for Founders and Early-Stage Startups | TouchConnectPro";
    setMetaTag("description", "Practical operational guidance for first-time founders and early-stage startups. Frameworks for decision clarity, execution systems, and operational discipline.");
    setMetaTag("og:title", "Startup Radar – Insights for Founders and Early-Stage Startups | TouchConnectPro");
    setMetaTag("og:description", "Practical operational guidance for first-time founders and early-stage startups. Frameworks for decision clarity, execution systems, and operational discipline.");
    setMetaTag("og:type", "website");
    setMetaTag("og:url", "https://www.touchconnectpro.com/insights");
  }, []);

  return (
    <div className="flex flex-col" data-testid="page-insights">
      {/* Hero */}
      <section className="pt-20 pb-12 md:pt-24 md:pb-16" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-insights-hero">
        <div className="container px-4 mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-wider mb-4 inline-block px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" }}>
            Startup Radar
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-6" style={{ color: "#0D566C" }} data-testid="text-insights-h1">
            Operational Guidance for First-Time Founders and Early-Stage Startups
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mb-10" style={{ color: "#4A4A4A" }}>
            This page provides practical operational guidance for entrepreneurs with ideas, founders launching their first venture, and startups preparing to scale. Every article is designed to help you make better decisions and take your next step with confidence.
          </p>
          <Link href={`/insights/${insightArticles[0].slug}`} data-testid="link-explore-insights">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-explore-insights"
            >
              Explore Startup Radar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-insights-audience">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3" style={{ color: "#0D566C" }}>
              Who This Is For
            </h2>
            <p style={{ color: "#4A4A4A" }}>
              Practical guidance for every stage of your founder journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {audienceCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}
                  data-testid={`card-audience-${i}`}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(245,197,66,0.15)" }}>
                    <Icon className="h-7 w-7" style={{ color: "#F5C542" }} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-3" style={{ color: "#0D566C" }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Operations Frameworks */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#FAF9F7" }} data-testid="section-insights-frameworks">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex items-start gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(75,63,114,0.1)" }}>
              <Target className="h-7 w-7" style={{ color: "#4B3F72" }} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>
                Founder Operations Frameworks
              </h2>
              <p className="leading-relaxed" style={{ color: "#4A4A4A" }}>
                TouchConnectPro focuses on three pillars that define operational readiness for early-stage founders:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Decision Clarity", desc: "Cut through noise and focus on the decisions that actually move your business forward." },
              { label: "Execution Systems", desc: "Build repeatable processes that turn plans into measurable progress every week." },
              { label: "Operational Discipline", desc: "Develop the habits and structures that separate founders who ship from those who stall." }
            ].map((fw, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }}
              >
                <span className="absolute -top-4 -right-2 text-8xl font-display font-bold leading-none select-none pointer-events-none" style={{ color: "rgba(13,86,108,0.05)" }}>
                  {i + 1}
                </span>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 font-bold text-sm" style={{ backgroundColor: "rgba(245,197,66,0.2)", color: "#0D566C" }}>
                    {i + 1}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: "#0D566C" }}>{fw.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{fw.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#F3F3F3" }} data-testid="section-insights-articles">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: "#F5C542" }} />
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6" style={{ color: "#0D566C" }} />
              <h2 className="text-2xl md:text-3xl font-display font-bold" style={{ color: "#0D566C" }}>
                Articles
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insightArticles.map((article, i) => {
              const tag = tagColors[article.audienceTag] || { bg: "rgba(255,107,92,0.1)", color: "#FF6B5C" };
              return (
                <Link key={article.slug} href={`/insights/${article.slug}`} data-testid={`link-article-${article.slug}`}>
                  <div
                    className="group bg-white rounded-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full flex flex-col"
                    style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }}
                    data-testid={`card-article-${i}`}
                  >
                    <div className="flex-1">
                      <span
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                        style={{ backgroundColor: tag.bg, color: tag.color }}
                      >
                        {article.audienceTag}
                      </span>
                      <h3 className="font-display font-bold text-lg mb-2 transition-colors duration-200" style={{ color: "#0D566C" }}>
                        {article.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>
                        {article.summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium transition-colors duration-200" style={{ color: "#FF6B5C" }}>
                      Read article <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#0D566C" }} data-testid="section-insights-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-5 text-white">
            Ready to move from reading to building?
          </h2>
          <p className="text-lg mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
            TouchConnectPro supports founders at different stages with hands-on operational guidance from experienced operators. No pitch required. Just a willingness to take the next step.
          </p>
          <Link href="/founder-focus" data-testid="link-insights-talk">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-insights-talk"
            >
              Start refining your idea <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
