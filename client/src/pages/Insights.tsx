import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb, Users, Rocket, BookOpen, Target, Compass } from "lucide-react";
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
    color: "cyan"
  },
  {
    icon: Compass,
    title: "First-time founders seeking experienced guidance",
    description: "You are building something for the first time and every decision feels high-stakes. Decision paralysis and execution risk are slowing you down when you need momentum most.",
    color: "indigo"
  },
  {
    icon: Rocket,
    title: "Early-stage startups preparing to launch or scale",
    description: "Your product exists but you are unsure if your operations are ready for growth. You need to know what to systematize, what to let go, and when to accelerate.",
    color: "emerald"
  }
];

const tagColors: Record<string, string> = {
  "Idea stage": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "First-time founder": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  "Early-stage startup": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
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
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-background overflow-hidden" data-testid="section-insights-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container px-4 mx-auto max-w-4xl relative z-10">
          <Badge variant="secondary" className="mb-4 px-3 py-1 bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs">
            Startup Radar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white leading-tight" data-testid="text-insights-h1">
            Operational Guidance for First-Time Founders and Early-Stage Startups
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mb-8">
            This page provides practical operational guidance for entrepreneurs with ideas, founders launching their first venture, and startups preparing to scale. Every article is designed to help you make better decisions and take your next step with confidence.
          </p>
          <Link href={`/insights/${insightArticles[0].slug}`} data-testid="link-explore-insights">
            <Button size="lg" className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full" data-testid="button-explore-insights">
              Explore Startup Radar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Audience Segmentation */}
      <section className="py-20 bg-background" data-testid="section-insights-audience">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white">
              Who This Is For
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Practical guidance for every stage of your founder journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audienceCards.map((card, i) => {
              const Icon = card.icon;
              const borderColor = card.color === "cyan" ? "border-cyan-500/20 hover:border-cyan-500/40" : card.color === "indigo" ? "border-indigo-500/20 hover:border-indigo-500/40" : "border-emerald-500/20 hover:border-emerald-500/40";
              const iconBg = card.color === "cyan" ? "bg-cyan-500/10 text-cyan-500" : card.color === "indigo" ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500";
              return (
                <Card key={i} className={`border ${borderColor} transition-colors bg-background`} data-testid={`card-audience-${i}`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2 text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800" data-testid="section-insights-frameworks">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Target className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">
                Founder Operations Frameworks
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                TouchConnectPro focuses on three pillars that define operational readiness for early-stage founders:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Decision Clarity", desc: "Cut through noise and focus on the decisions that actually move your business forward." },
              { label: "Execution Systems", desc: "Build repeatable processes that turn plans into measurable progress every week." },
              { label: "Operational Discipline", desc: "Develop the habits and structures that separate founders who ship from those who stall." }
            ].map((fw, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
                  <span className="text-indigo-500 font-bold text-sm">{i + 1}</span>
                </div>
                <h3 className="font-display font-bold mb-1 text-slate-900 dark:text-white">{fw.label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Index */}
      <section className="py-20 bg-background" data-testid="section-insights-articles">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-10">
            <BookOpen className="h-6 w-6 text-cyan-500" />
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
              Articles
            </h2>
          </div>
          <div className="space-y-4">
            {insightArticles.map((article, i) => (
              <Link key={article.slug} href={`/insights/${article.slug}`} data-testid={`link-article-${article.slug}`}>
                <div className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" data-testid={`card-article-${i}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={`text-xs ${tagColors[article.audienceTag] || ""}`}>
                        {article.audienceTag}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Soft Conversion */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800" data-testid="section-insights-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-white">
            Need guidance applying this to your situation?
          </h2>
          <p className="text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            TouchConnectPro supports founders at different stages with hands-on operational guidance from experienced operators. No pitch required. Just a willingness to take the next step.
          </p>
          <Link href="/founder-focus" data-testid="link-insights-talk">
            <Button size="lg" className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full" data-testid="button-insights-talk">
              Talk with an experienced operator <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
