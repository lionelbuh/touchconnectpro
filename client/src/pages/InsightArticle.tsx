import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { insightArticles } from "@/lib/insightsData";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

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

const tagColors: Record<string, string> = {
  "Idea stage": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "First-time founder": "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  "Early-stage startup": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
};

export default function InsightArticle() {
  const { slug } = useParams<{ slug: string }>();
  const articleIndex = insightArticles.findIndex(a => a.slug === slug);
  const article = insightArticles[articleIndex];

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | TouchConnectPro Insights`;
      setMetaTag("description", article.summary);
      setMetaTag("og:title", `${article.title} | TouchConnectPro Insights`);
      setMetaTag("og:description", article.summary);
      setMetaTag("og:type", "article");
      setMetaTag("og:url", `https://www.touchconnectpro.com/insights/${article.slug}`);
    }
  }, [article]);

  if (!article) return <NotFound />;

  const prevArticle = articleIndex > 0 ? insightArticles[articleIndex - 1] : null;
  const nextArticle = articleIndex < insightArticles.length - 1 ? insightArticles[articleIndex + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary,
    "author": {
      "@type": "Organization",
      "name": "TouchConnectPro",
      "url": "https://touchconnectpro.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TouchConnectPro"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://touchconnectpro.com/insights/${article.slug}`
    }
  };

  return (
    <div className="flex flex-col" data-testid="page-insight-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="container px-4 mx-auto max-w-3xl relative z-10">
          <Link href="/insights" data-testid="link-back-insights">
            <span className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mb-6 cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Back to Insights
            </span>
          </Link>
          <Badge variant="outline" className={`mb-4 text-xs ${tagColors[article.audienceTag] || ""}`}>
            {article.audienceTag}
          </Badge>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight mb-6" data-testid="text-article-title">
            {article.title}
          </h1>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <p className="text-slate-200 leading-relaxed text-lg italic">
              {article.shortAnswer}
            </p>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto max-w-3xl">
          <article className="space-y-12">
            {article.sections.map((section, i) => (
              <div key={i} data-testid={`section-article-${i}`}>
                <h2 className="text-xl md:text-2xl font-display font-bold mb-4 text-slate-900 dark:text-white">
                  {section.heading}
                </h2>
                {section.content.map((p, j) => (
                  <p key={j} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2 mt-3">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Practical Next Steps */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700" data-testid="section-practical-steps">
              <h2 className="text-xl font-display font-bold mb-4 text-slate-900 dark:text-white">
                Practical Next Steps
              </h2>
              <ol className="space-y-3">
                {article.practicalSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-sm font-bold text-cyan-500">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* How TouchConnectPro Helps */}
            <div className="bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 rounded-xl p-6 border border-cyan-800/30" data-testid="section-how-we-help">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-display font-bold text-white">How TouchConnectPro Helps</h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">{article.howWeHelp}</p>
              <Link href="/become-entrepreneur" data-testid="link-article-cta">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full" data-testid="button-article-cta">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </article>

          {/* Article Navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {prevArticle ? (
                <Link href={`/insights/${prevArticle.slug}`} data-testid="link-prev-article">
                  <div className="group flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer flex-1">
                    <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Previous</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{prevArticle.title}</p>
                    </div>
                  </div>
                </Link>
              ) : <div />}
              {nextArticle ? (
                <Link href={`/insights/${nextArticle.slug}`} data-testid="link-next-article">
                  <div className="group flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500/40 transition-colors cursor-pointer flex-1 text-right">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Next</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{nextArticle.title}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                  </div>
                </Link>
              ) : <div />}
            </div>
          </div>

          {/* Back to Hub */}
          <div className="mt-8 text-center">
            <Link href="/insights" data-testid="link-back-to-insights">
              <Button variant="outline" className="rounded-full" data-testid="button-back-to-insights">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Insights
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
