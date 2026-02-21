import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, BookOpen } from "lucide-react";
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

const tagColors: Record<string, { bg: string; color: string }> = {
  "Idea stage": { bg: "rgba(255,107,92,0.1)", color: "#FF6B5C" },
  "First-time founder": { bg: "rgba(75,63,114,0.1)", color: "#4B3F72" },
  "Early-stage startup": { bg: "rgba(13,86,108,0.1)", color: "#0D566C" },
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
  const tag = tagColors[article.audienceTag] || { bg: "rgba(255,107,92,0.1)", color: "#FF6B5C" };

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
      <section className="pt-28 pb-12 md:pt-36 md:pb-16" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl">
          <Link href="/insights" data-testid="link-back-insights">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 cursor-pointer transition-colors duration-200" style={{ color: "#FF6B5C" }}>
              <ArrowLeft className="h-4 w-4" /> Back to Startup Radar
            </span>
          </Link>
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: tag.bg, color: tag.color }}
          >
            {article.audienceTag}
          </span>
          <h1 className="text-2xl md:text-4xl font-display font-bold leading-tight mb-6" style={{ color: "#0D566C" }} data-testid="text-article-title">
            {article.title}
          </h1>
          <div className="bg-white rounded-xl p-5 md:p-6" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)", borderLeft: "4px solid #F5C542" }}>
            <p className="leading-relaxed text-lg italic" style={{ color: "#4A4A4A" }}>
              {article.shortAnswer}
            </p>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "#F3F3F3" }}>
        <div className="container px-4 mx-auto max-w-3xl">
          <article className="space-y-10">
            {article.sections.map((section, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 md:p-8"
                style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.4)" }}
                data-testid={`section-article-${i}`}
              >
                <h2 className="text-xl md:text-2xl font-display font-bold mb-4" style={{ color: "#0D566C" }}>
                  {section.heading}
                </h2>
                {section.content.map((p, j) => (
                  <p key={j} className="leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-2.5 mt-4">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
                          <Check className="h-3 w-3" style={{ color: "#0D566C" }} />
                        </div>
                        <span style={{ color: "#4A4A4A" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Practical Next Steps */}
            <div
              className="bg-white rounded-2xl p-6 md:p-8"
              style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.4)" }}
              data-testid="section-practical-steps"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-7 rounded-full" style={{ backgroundColor: "#F5C542" }} />
                <h2 className="text-xl font-display font-bold" style={{ color: "#0D566C" }}>
                  Practical Next Steps
                </h2>
              </div>
              <ol className="space-y-4">
                {article.practicalSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{ backgroundColor: "rgba(245,197,66,0.2)", color: "#0D566C" }}
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5" style={{ color: "#4A4A4A" }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* How TouchConnectPro Helps */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ backgroundColor: "#0D566C" }}
              data-testid="section-how-we-help"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5" style={{ color: "#F5C542" }} />
                <h2 className="text-lg font-display font-bold text-white">How TouchConnectPro Helps</h2>
              </div>
              <p className="leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>{article.howWeHelp}</p>
              <Link href="/founder-focus" data-testid="link-article-cta">
                <Button
                  className="font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-article-cta"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Article Navigation */}
      <section className="py-12" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container px-4 mx-auto max-w-3xl">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            {prevArticle ? (
              <Link href={`/insights/${prevArticle.slug}`} data-testid="link-prev-article">
                <div
                  className="group flex items-center gap-3 p-5 rounded-xl bg-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex-1"
                  style={{ boxShadow: "0 2px 10px rgba(224,224,224,0.4)" }}
                >
                  <ArrowLeft className="h-5 w-5 shrink-0 transition-colors" style={{ color: "#FF6B5C" }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium mb-0.5" style={{ color: "#8A8A8A" }}>Previous</p>
                    <p className="text-sm font-semibold truncate" style={{ color: "#0D566C" }}>{prevArticle.title}</p>
                  </div>
                </div>
              </Link>
            ) : <div />}
            {nextArticle ? (
              <Link href={`/insights/${nextArticle.slug}`} data-testid="link-next-article">
                <div
                  className="group flex items-center gap-3 p-5 rounded-xl bg-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex-1 text-right"
                  style={{ boxShadow: "0 2px 10px rgba(224,224,224,0.4)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium mb-0.5" style={{ color: "#8A8A8A" }}>Next</p>
                    <p className="text-sm font-semibold truncate" style={{ color: "#0D566C" }}>{nextArticle.title}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-colors" style={{ color: "#FF6B5C" }} />
                </div>
              </Link>
            ) : <div />}
          </div>

          <div className="text-center">
            <Link href="/insights" data-testid="link-back-to-insights">
              <Button
                variant="outline"
                className="rounded-full font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{ borderColor: "#0D566C", color: "#0D566C" }}
                data-testid="button-back-to-insights"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Insights
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
