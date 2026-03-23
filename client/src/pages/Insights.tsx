import { Link } from "wouter";
import { useEffect, useState } from "react";
import { insightArticles } from "@/lib/insightsData";

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

const TOPIC_COLORS: Record<string, { color: string; bg: string; border?: string }> = {
  "Accounting basics":   { color: C.teal,      bg: C.tealLight },
  "ERP and software":    { color: "#7A5C1E",   bg: C.goldPale, border: "1px solid rgba(196,154,60,0.2)" },
  "Fractional CFO":      { color: "#3D2F6E",   bg: "#EEEDFE" },
  "Financial structure": { color: "#3D2F6E",   bg: "#EEEDFE" },
  "Operational readiness": { color: "#5A3E2B", bg: "#F5EDE4" },
  "First-time founder":  { color: C.inkSoft,   bg: "#F1EFE8" },
};

const FILTER_TOPICS = ["All topics", "Accounting basics", "ERP and software", "Financial structure", "Fractional CFO", "Operational readiness"];

const SECTIONS = [
  { label: "Accounting basics",                 topics: ["Accounting basics"] },
  { label: "ERP and software selection",        topics: ["ERP and software"] },
  { label: "Financial structure and CFO thinking", topics: ["Financial structure", "Fractional CFO"] },
  { label: "Operational readiness",             topics: ["Operational readiness", "First-time founder"] },
];

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

export default function Insights() {
  const [activeFilter, setActiveFilter] = useState("All topics");

  useEffect(() => {
    document.title = "Insights for Early-Stage Founders | TouchConnectPro";
    setMetaTag("description", "Practical guidance on accounting systems, ERP selection, financial structure, and operational clarity for early-stage founders.");
    setMetaTag("og:title", "Insights for Early-Stage Founders | TouchConnectPro");
    setMetaTag("og:description", "Practical guidance on accounting systems, ERP selection, financial structure, and operational clarity. Written for founders building for the first time.");
  }, []);

  const featured = insightArticles.find(a => a.featured);

  const filteredSections = SECTIONS.map(sec => ({
    ...sec,
    articles: insightArticles.filter(a =>
      !a.featured &&
      sec.topics.includes(a.audienceTag) &&
      (activeFilter === "All topics" || a.audienceTag === activeFilter || sec.topics.some(t => t === activeFilter && sec.topics.includes(a.audienceTag)))
    ),
  })).filter(sec => {
    if (activeFilter === "All topics") return true;
    return sec.topics.some(t => t === activeFilter) || sec.articles.length > 0;
  });

  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-insights">

      {/* Page Header */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 2rem 48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
          Insights
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.ink, marginBottom: 20 }} data-testid="text-insights-title">
          The financial questions <em style={{ fontStyle: "italic", color: C.gold }}>every founder</em> eventually faces
        </h1>
        <p style={{ fontSize: 17, color: C.inkSoft, lineHeight: 1.75, maxWidth: 580 }}>
          Practical guidance on accounting systems, ERP selection, financial structure, and operational clarity. Written for founders who are building for the first time and need answers that are specific, not generic.
        </p>
      </div>

      {/* Topic Filter */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 2rem 48px", display: "flex", gap: 10, flexWrap: "wrap" }} data-testid="filter-topics">
        {FILTER_TOPICS.map(topic => (
          <button
            key={topic}
            data-testid={`filter-btn-${topic.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => setActiveFilter(topic)}
            style={{
              fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", padding: "7px 16px",
              borderRadius: 100, border: `1px solid ${activeFilter === topic ? C.ink : C.border}`,
              background: activeFilter === topic ? C.ink : "transparent",
              color: activeFilter === topic ? C.cream : C.inkSoft,
              cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
            }}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Featured Article */}
      {featured && (activeFilter === "All topics" || activeFilter === "Accounting basics") && (
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 2rem 56px" }}>
          <div style={{
            background: C.ink, borderRadius: 10, padding: "52px 56px",
            display: "grid", gridTemplateColumns: "1fr 320px", gap: 64, alignItems: "center",
          }} data-testid="card-featured-article">
            <div>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, background: "rgba(196,154,60,0.15)", padding: "4px 12px", borderRadius: 100, marginBottom: 20 }}>
                Featured
              </span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 300, color: C.cream, lineHeight: 1.25, marginBottom: 16, letterSpacing: "-0.01em" }}>
                What accounting system does your startup <em style={{ fontStyle: "italic", color: C.gold }}>actually need</em> right now?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(250,248,243,0.55)", lineHeight: 1.75, marginBottom: 28 }}>
                {featured.summary}
              </p>
              <Link href={`/insights/${featured.slug}`} data-testid="link-featured-article">
                <span style={{
                  display: "inline-block", background: C.cream, color: C.ink,
                  fontSize: 13, fontWeight: 500, padding: "10px 22px", borderRadius: 4,
                  textDecoration: "none", cursor: "pointer",
                }}>
                  Read the guide
                </span>
              </Link>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 48, display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { label: "Topic", value: "Accounting basics" },
                { label: "Best for", value: featured.bestFor || "" },
                { label: "Read time", value: featured.readTime || "" },
                { label: "Key question answered", value: featured.keyQuestion || "" },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(250,248,243,0.3)", marginBottom: 4, display: "block" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(250,248,243,0.65)", lineHeight: 1.5 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 2rem 100px" }}>
        {filteredSections.map(sec => {
          const sectionArticles = sec.articles.filter(a =>
            activeFilter === "All topics" || sec.topics.includes(activeFilter)
          );
          if (sectionArticles.length === 0) return null;
          return (
            <div key={sec.label} style={{ marginBottom: 64 }} data-testid={`articles-section-${sec.label.replace(/\s+/g, "-").toLowerCase()}`}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.borderSoft}` }}>
                {sec.label}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                {sectionArticles.map(article => {
                  const tc = TOPIC_COLORS[article.audienceTag] || { color: C.inkMuted, bg: "#F1EFE8" };
                  return (
                    <ArticleCard key={article.slug} article={article} tc={tc} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Strip */}
      <section style={{ background: C.goldPale, borderTop: "1px solid rgba(196,154,60,0.2)", borderBottom: "1px solid rgba(196,154,60,0.2)", padding: "64px 2rem", textAlign: "center" }} data-testid="section-insights-cta">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 300, color: C.ink, marginBottom: 14, lineHeight: 1.25 }}>
            Not sure which of these applies to <em style={{ fontStyle: "italic" }}>your situation?</em>
          </h2>
          <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.7, marginBottom: 28 }}>
            Take the Founder Focus Score. Five minutes to find out exactly which financial or operational gap is holding your startup back right now.
          </p>
          <Link href="/founder-focus" data-testid="button-insights-cta">
            <span
              style={{ display: "inline-block", background: C.ink, color: C.cream, fontSize: 14, fontWeight: 500, padding: "13px 28px", borderRadius: 4, textDecoration: "none", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.teal)}
              onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
            >
              Take the free Founder Focus Score
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
}

function ArticleCard({ article, tc }: { article: ReturnType<typeof insightArticles[0]["valueOf"]>; tc: { color: string; bg: string; border?: string } }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/insights/${article.slug}`} data-testid={`card-article-${article.slug}`}>
      <div
        style={{
          background: "white", border: `1px solid ${hovered ? "rgba(26,24,20,0.28)" : C.border}`,
          borderRadius: 10, padding: "28px 24px", textDecoration: "none",
          display: "flex", flexDirection: "column", height: "100%",
          transform: hovered ? "translateY(-2px)" : "none",
          transition: "border-color 0.2s, transform 0.15s", cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={{
          display: "inline-block", fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "3px 10px", borderRadius: 100,
          marginBottom: 16, alignSelf: "flex-start",
          color: tc.color, background: tc.bg, border: tc.border,
        }}>
          {article.audienceTag}
        </span>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 400, color: C.ink, lineHeight: 1.35, marginBottom: 12, flex: 1 }}>
          {article.title}
        </h3>
        <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.65, marginBottom: 20 }}>
          {article.summary}
        </p>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.teal, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
          Read article
          <span style={{ width: hovered ? 22 : 14, height: 1, background: C.teal, display: "inline-block", transition: "width 0.2s" }} />
        </span>
      </div>
    </Link>
  );
}
