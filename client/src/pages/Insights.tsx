import { Link } from "wouter";
import { useEffect } from "react";
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

const tagColors: Record<string, { color: string; bg: string }> = {
  "Idea stage":         { color: C.teal,    bg: C.tealLight },
  "First-time founder": { color: "#7A5C1E", bg: C.goldPale },
  "Early-stage startup":{ color: "#4A3A7A", bg: "#EEE9FC" },
};

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
  useEffect(() => {
    document.title = "Founder Insights | TouchConnectPro";
    setMetaTag("description", "Practical startup guidance for early-stage founders. Topics covering financial structure, ERP selection, fractional CFO, and operational readiness.");
    setMetaTag("og:title", "Founder Insights | TouchConnectPro");
    setMetaTag("og:description", "Practical startup guidance for early-stage founders.");
  }, []);

  const groups = Array.from(new Set(insightArticles.map(a => a.audienceTag)));

  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-insights">

      {/* Header */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 2rem 64px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
          Knowledge hub
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.ink, marginBottom: 18 }} data-testid="text-insights-title">
          Guidance for <em style={{ fontStyle: "italic", color: C.gold }}>founders who mean business</em>
        </h1>
        <p style={{ fontSize: 17, color: C.inkSoft, lineHeight: 1.7, maxWidth: 580 }}>
          Practical articles on the financial and operational questions every early-stage founder faces. Written plainly, without jargon.
        </p>
      </div>

      {/* Articles by group */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2rem 80px" }}>
        {groups.map((group, gi) => (
          <div key={group} style={{ marginBottom: 64 }} data-testid={`articles-group-${gi}`}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkMuted, marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${C.borderSoft}` }}>
              {group}
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {insightArticles.filter(a => a.audienceTag === group).map(article => {
                const tc = tagColors[article.audienceTag] || { color: C.inkMuted, bg: "white" };
                return (
                  <Link key={article.slug} href={`/insights/${article.slug}`} data-testid={`card-article-${article.slug}`}>
                    <div
                      style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", height: "100%", boxSizing: "border-box" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.gold; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(26,24,20,0.06)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                    >
                      <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: tc.color, background: tc.bg, padding: "3px 10px", borderRadius: 100, width: "fit-content" }}>
                        {article.audienceTag}
                      </span>
                      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 400, color: C.ink, lineHeight: 1.45, margin: 0, flex: 1 }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.6, margin: 0 }}>{article.summary}</p>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.teal, marginTop: 4, letterSpacing: "0.03em" }}>Read article →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Score Strip */}
      <section style={{ background: C.ink, padding: "72px 2rem", textAlign: "center" }} data-testid="section-insights-cta">
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 300, color: C.cream, lineHeight: 1.2, marginBottom: 14 }}>
            Not sure which of these applies to <em style={{ fontStyle: "italic", color: C.gold }}>your situation?</em>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(250,248,243,0.5)", marginBottom: 36, lineHeight: 1.7 }}>
            Take the Founder Focus Score. Five minutes to find out exactly which financial or operational gap is holding your startup back right now.
          </p>
          <Link href="/founder-focus" data-testid="button-insights-cta">
            <span
              style={{ display: "inline-block", background: C.gold, color: C.ink, fontSize: 14, fontWeight: 600, padding: "14px 32px", borderRadius: 4, textDecoration: "none", cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#D4AA4C")}
              onMouseLeave={e => (e.currentTarget.style.background = C.gold)}
            >
              Take the free Founder Focus Score
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
}
