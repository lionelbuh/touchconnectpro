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

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.inkMuted, marginBottom: 8, display: "block" }}>{num}</span>
    <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: C.ink, marginBottom: 16, lineHeight: 1.3 }}>{title}</h2>
    {children}
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.8, marginBottom: 14 }}>{children}</p>
);

const Divider = () => <div style={{ height: 1, background: C.borderSoft, margin: "48px 0" }} />;

const DocList = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: "none", margin: "12px 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: C.inkSoft, lineHeight: 1.6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 8, display: "inline-block" }} />
        {item}
      </li>
    ))}
  </ul>
);

const cookieCards = [
  {
    name: "Essential cookies",
    status: "Always active",
    statusColor: C.teal,
    statusBg: C.tealLight,
    desc: "These cookies are required for TouchConnectPro to function. Without them, you cannot log in, your session cannot be maintained, and basic security features would not work. They cannot be turned off.",
    examples: ["User authentication", "Session management", "Security and fraud prevention", "Dashboard access"],
  },
  {
    name: "Analytics cookies",
    status: "Your choice",
    statusColor: "#7A5C1E",
    statusBg: C.goldPale,
    desc: "We use Google Analytics to understand which parts of the platform are most useful to founders and where we can improve. These cookies collect anonymized information only: pages visited, time spent, and general device and browser type. They are never linked to your personal account or your Focus Score results. Analytics cookies are off by default and only activated if you explicitly accept them.",
    examples: ["Pages visited", "Time on page", "Device and browser type", "Country-level location"],
  },
];

export default function CookiePolicy() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-cookie-policy">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 2rem 100px" }}>

        <div style={{ marginBottom: 56, paddingBottom: 40, borderBottom: `1px solid ${C.borderSoft}` }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "5px 14px", borderRadius: 100, marginBottom: 20 }}>Legal</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 300, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Cookie <em style={{ fontStyle: "italic", color: C.gold }}>Policy</em>
          </h1>
          <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20 }}>Last updated: March 1, 2026 &nbsp;·&nbsp; Touch Equity Partners LLC</p>
          <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, padding: "20px 22px", background: C.goldPale, borderRadius: 10, borderLeft: `3px solid ${C.gold}` }}>
            The short version: we use two types of cookies. Essential ones keep the platform running and cannot be turned off. Analytics ones help us understand how founders use the site and are off by default until you say yes.
          </div>
        </div>

        <Section num="Section 01" title="What cookies are">
          <P>Cookies are small text files that a website stores on your device when you visit. They serve different purposes depending on the type: some are essential for the site to work at all, others collect anonymized information about how the site is used to help improve it.</P>
          <P>TouchConnectPro uses a minimal set of cookies. We do not use advertising cookies, retargeting cookies, or any tracking technology designed to follow you across other websites.</P>
        </Section>

        <Divider />

        <Section num="Section 02" title="The cookies we use">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "16px 0" }}>
            {cookieCards.map(card => (
              <div key={card.name} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{card.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, color: card.statusColor, background: card.statusBg }}>{card.status}</span>
                </div>
                <p style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.65, marginBottom: 12 }}>{card.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                  {card.examples.map(ex => (
                    <span key={ex} style={{ fontSize: 11, color: C.inkSoft, background: C.cream, border: `1px solid ${C.borderSoft}`, padding: "3px 10px", borderRadius: 100 }}>{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
            <p style={{ fontSize: 14, color: C.teal, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>We do not use advertising cookies, marketing pixels, or any cookies designed to track your activity outside of TouchConnectPro.</p>
          </div>
        </Section>

        <Divider />

        <Section num="Section 03" title="How we collect your consent">
          <P>When you first visit TouchConnectPro, a cookie banner gives you a clear choice: accept analytics cookies or decline them. The platform works fully either way. Your preference is saved so you are not asked again on future visits.</P>
          <P>If you close the banner without choosing, analytics cookies stay off until you actively accept them.</P>
        </Section>

        <Divider />

        <Section num="Section 04" title="Managing your preferences">
          <P>You can change your cookie preferences at any time in two ways:</P>
          <DocList items={["Use the Cookie Settings link in the footer of any page to update your choice directly.", "Clear cookies from your browser settings. This resets your preference and the banner will appear again on your next visit."]} />
          <button
            onClick={() => (window as any).openCookieSettings?.()}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.ink, color: C.cream, fontSize: 13, fontWeight: 500, padding: "11px 22px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}
            onMouseEnter={e => (e.currentTarget.style.background = C.teal)}
            onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
            data-testid="button-cookie-settings-inline"
          >
            Open cookie settings
          </button>
        </Section>

        <Divider />

        <Section num="Section 05" title="Third-party cookies">
          <P>The only third-party cookies on TouchConnectPro come from Google Analytics, and only when you have consented. Google Analytics operates under its own privacy framework. You can read more at <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: C.teal, textDecoration: "none", borderBottom: `1px solid rgba(29,106,90,0.3)` }}>policies.google.com/privacy</a>.</P>
          <P>We do not allow any other third-party cookies on this site.</P>
        </Section>

        <Divider />

        <Section num="Section 06" title="Changes to this policy">
          <P>If we change how we use cookies, we will update this page and revise the date at the top. For changes that affect your consent, we will notify account holders by email and present the cookie banner again so you can review your preferences.</P>
        </Section>

        <div style={{ background: C.ink, borderRadius: 10, padding: 32, marginTop: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: C.cream, marginBottom: 10 }}>Questions about cookies?</h2>
          <p style={{ fontSize: 14, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, marginBottom: 16 }}>If anything here is unclear or you want to know more about how we handle your data, reach out directly.</p>
          <a href="mailto:hello@touchconnectpro.com" style={{ display: "inline-block", fontSize: 14, fontWeight: 500, color: C.gold, textDecoration: "none", borderBottom: `1px solid rgba(196,154,60,0.3)`, paddingBottom: 1 }}>hello@touchconnectpro.com</a>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 14, color: "rgba(250,248,243,0.55)" }}>Touch Equity Partners LLC</p>
        </div>

      </div>
    </div>
  );
}
