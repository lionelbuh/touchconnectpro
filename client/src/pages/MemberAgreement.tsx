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

const HighlightBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: C.tealLight, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
    <p style={{ fontSize: 14, color: C.teal, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{children}</p>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "#FEF6EC", border: `1px solid rgba(196,154,60,0.2)`, borderLeft: `3px solid ${C.gold}`, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
    <p style={{ fontSize: 14, color: "#7A5C1E", lineHeight: 1.65, margin: 0 }}>{children}</p>
  </div>
);

export default function MemberAgreement() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-member-agreement">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 2rem 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, paddingBottom: 40, borderBottom: `1px solid ${C.borderSoft}` }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "5px 14px", borderRadius: 100, marginBottom: 20 }}>Legal</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 300, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Member <em style={{ fontStyle: "italic", color: C.gold }}>Agreement</em>
          </h1>
          <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20 }}>Last updated: March 1, 2026 &nbsp;·&nbsp; Touch Equity Partners LLC</p>
          <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, padding: "20px 22px", background: C.goldPale, borderRadius: 10, borderLeft: `3px solid ${C.gold}` }}>
            This agreement covers your use of TouchConnectPro as a founder or member. By creating an account or using the platform, you confirm you have read and agree to what follows. It is written to be clear, not to hide anything.
          </div>
        </div>

        <Section num="Section 01" title="Who this agreement is between">
          <P>This Member Agreement is between Touch Equity Partners LLC ("Company", "we", "us", "our"), operator of TouchConnectPro at touchconnectpro.com, and you, the individual registering as a member ("Member", "you", "your").</P>
          <P>By creating a free account, taking the Founder Focus Score, or engaging with any part of the platform, you confirm that you have read this agreement and agree to be bound by it. If you do not agree, please do not use the platform.</P>
        </Section>

        <Divider />

        <Section num="Section 02" title="What this platform is and what it is not">
          <P>TouchConnectPro is a business advisory platform for early-stage founders. It provides a free diagnostic tool, a personal dashboard, and direct access to specialist advisors with expertise in accounting systems, ERP selection, financial reporting, and fractional CFO work.</P>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
            <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px" }}>
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal, display: "block", marginBottom: 8 }}>What we do</span>
              <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>Help founders identify financial and operational gaps and connect them with specialist guidance to address those gaps.</p>
            </div>
            <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px" }}>
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A04040", display: "block", marginBottom: 8 }}>What we do not do</span>
              <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>Provide legal advice, medical advice, psychological support, therapy, regulated financial advice, or investment brokerage services.</p>
            </div>
          </div>
          <WarningBox>Advisory conversations on this platform cover business, accounting, financial systems, and operational topics only. TouchConnectPro is not a therapy, mental health, or personal support service. Nothing communicated through the platform constitutes regulated financial advice, legal counsel, medical advice, or any other licensed professional service. All decisions remain yours.</WarningBox>
        </Section>

        <Divider />

        <Section num="Section 03" title="Your account">
          <P>Your free account gives you access to your Founder Focus Score history, your personal dashboard, weekly focus questions generated from your results, and the ability to message a specialist directly.</P>
          <DocList items={["You must provide accurate information when creating your account.", "You are responsible for keeping your login credentials secure.", "You are responsible for all activity that takes place under your account.", "You must be at least 18 years old to create an account."]} />
          <P>You may delete your account at any time by contacting us at <a href="mailto:hello@touchconnectpro.com" style={{ color: C.teal, textDecoration: "none", borderBottom: `1px solid rgba(29,106,90,0.3)` }}>hello@touchconnectpro.com</a>. Deletion removes your personal data within a reasonable period, in line with our Privacy Policy.</P>
        </Section>

        <Divider />

        <Section num="Section 04" title="How you agree to use the platform">
          <P>You agree to use TouchConnectPro for legitimate business purposes only. Specifically, you agree to:</P>
          <DocList items={["Use the platform professionally and in good faith", "Provide honest information in your diagnostic responses and messages", "Treat specialist advisors with respect in all communications", "Not attempt to circumvent the platform to solicit services outside of it in a way that violates this agreement", "Not use the platform for any unlawful purpose"]} />
          <P>We reserve the right to suspend or terminate access for violations of this agreement or behavior that we determine is harmful to the platform or its users.</P>
        </Section>

        <Divider />

        <Section num="Section 05" title="Use of AI tools">
          <P>TouchConnectPro uses AI tools to generate your weekly focus questions and to support certain platform features. By using the platform, you acknowledge that:</P>
          <DocList items={["Your quiz responses and account information may be processed by AI tools to generate personalized content in your dashboard.", "AI-generated outputs, including weekly questions and diagnostic summaries, are suggestions only. They are not a substitute for professional judgment.", "You should not submit confidential business information, personal identification data, or sensitive financial details that you would not want processed by an AI system.", "Touch Equity Partners LLC does not claim ownership of content you submit. You retain ownership of your inputs."]} />
          <HighlightBox>AI outputs on this platform are starting points for reflection, not final answers. You remain fully responsible for how you act on any AI-generated content.</HighlightBox>
        </Section>

        <Divider />

        <Section num="Section 06" title="Confidentiality">
          <P>Conversations between you and a specialist advisor on this platform are treated as confidential. We do not share the content of your messages with third parties except as required to operate the platform or comply with the law.</P>
          <P>Equally, if a specialist shares non-public information with you in the course of an advisory engagement, you agree not to disclose or use that information outside the context of your work together on this platform.</P>
        </Section>

        <Divider />

        <Section num="Section 07" title="Intellectual property">
          <P>All branding, software, diagnostic tools, frameworks, content, and materials on TouchConnectPro are owned by Touch Equity Partners LLC. You may not copy, reproduce, or use them for commercial purposes without written permission.</P>
          <P>Content you create or submit through the platform, such as your quiz answers and messages, remains yours. You grant Touch Equity Partners LLC a limited, non-exclusive license to process and display that content solely to provide the services described in this agreement.</P>
        </Section>

        <Divider />

        <Section num="Section 08" title="No guarantee of outcomes">
          <P>TouchConnectPro provides guidance, diagnostic tools, and access to specialist advisors. It does not guarantee any particular business result, financial improvement, funding outcome, or operational change.</P>
          <P>Specialist advisors on this platform provide practical guidance based on experience. Their input does not constitute regulated financial advice, legal advice, accounting certification, or any other licensed professional service. You are responsible for verifying the suitability of any guidance for your specific circumstances and for all decisions you make as a result.</P>
          <WarningBox>Results depend on your execution, your specific situation, and factors outside anyone's control. Using this platform does not guarantee any particular outcome for your business.</WarningBox>
        </Section>

        <Divider />

        <Section num="Section 09" title="Limitation of liability">
          <P>To the maximum extent permitted by applicable law, Touch Equity Partners LLC is not liable for:</P>
          <DocList items={["Business losses, financial outcomes, or decisions made based on platform content or advisory conversations", "Indirect, incidental, or consequential damages of any kind", "Interruptions to platform access due to technical issues or maintenance", "Actions or outcomes resulting from your use of AI-generated content", "Personal, emotional, or psychological harm of any nature"]} />
          <P>For free account holders, total liability shall not exceed zero, as no fee has been paid. For paid engagements, total liability shall not exceed the amount paid for the specific service in question.</P>
        </Section>

        <Divider />

        <Section num="Section 10" title="Indemnification">
          <P>You agree to indemnify and hold harmless Touch Equity Partners LLC from any claims, losses, liabilities, or expenses arising from your use of the platform, your violation of this agreement, or your interactions with specialist advisors or other users.</P>
        </Section>

        <Divider />

        <Section num="Section 11" title="Termination">
          <P>Either party may terminate this agreement at any time. You may close your account by contacting us. We may suspend or terminate your access if you violate this agreement or use the platform in a way that is harmful or unlawful.</P>
          <P>Sections covering intellectual property, confidentiality, limitation of liability, and indemnification survive termination.</P>
        </Section>

        <Divider />

        <Section num="Section 12" title="Changes to this agreement">
          <P>We may update this agreement as the platform evolves. The current version is always available on this page with an updated date. For significant changes, we will notify account holders by email before changes take effect. Continued use of the platform after an update means you accept the revised agreement.</P>
        </Section>

        <Divider />

        <Section num="Section 13" title="Governing law">
          <P>This agreement is governed by the laws of the State of California, without regard to conflict of law principles. Any disputes arising from this agreement shall be resolved in the courts of California unless otherwise agreed in writing.</P>
        </Section>

        <Divider />

        <Section num="Section 14" title="Electronic acceptance">
          <P>By creating an account or using TouchConnectPro, you confirm that you have read and understood this agreement and consent to be legally bound by it. This constitutes your electronic signature and acceptance of these terms.</P>
          <HighlightBox>You must be at least 18 years old to use this platform. By accepting, you confirm you meet this requirement.</HighlightBox>
        </Section>

        {/* Contact */}
        <div style={{ background: C.ink, borderRadius: 10, padding: 32, marginTop: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: C.cream, marginBottom: 10 }}>Questions about this agreement?</h2>
          <p style={{ fontSize: 14, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, marginBottom: 16 }}>If anything here is unclear or you have a question about a specific situation, reach out directly. We are a small team and we respond to every message.</p>
          <a href="mailto:hello@touchconnectpro.com" style={{ display: "inline-block", fontSize: 14, fontWeight: 500, color: C.gold, textDecoration: "none", borderBottom: `1px solid rgba(196,154,60,0.3)`, paddingBottom: 1 }}>hello@touchconnectpro.com</a>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 14, color: "rgba(250,248,243,0.55)" }}>Touch Equity Partners LLC &nbsp;·&nbsp; Operator of TouchConnectPro</p>
        </div>

      </div>
    </div>
  );
}
