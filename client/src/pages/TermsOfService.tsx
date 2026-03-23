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

const services = [
  { label: "Free", desc: "Founder Focus Score diagnostic and personal dashboard" },
  { label: "Free", desc: "Direct messaging with a specialist about your situation" },
  { label: "Paid", desc: "Advisory engagements scoped to your specific needs" },
];

export default function TermsOfService() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-terms-of-service">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 2rem 100px" }}>

        <div style={{ marginBottom: 56, paddingBottom: 40, borderBottom: `1px solid ${C.borderSoft}` }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "5px 14px", borderRadius: 100, marginBottom: 20 }}>Legal</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 300, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Terms of <em style={{ fontStyle: "italic", color: C.gold }}>Service</em>
          </h1>
          <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20 }}>Last updated: March 1, 2026 &nbsp;·&nbsp; Touch Equity Partners LLC</p>
          <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, padding: "20px 22px", background: C.goldPale, borderRadius: 10, borderLeft: `3px solid ${C.gold}` }}>
            The short version: TouchConnectPro is a diagnostic and advisory platform. The Founder Focus Score and your dashboard are free. Advisory services are scoped and priced through direct conversation. We do not guarantee business outcomes and you are responsible for your own decisions.
          </div>
        </div>

        <Section num="Section 01" title="Who operates this platform">
          <P>TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC ("Company", "we", "us", "our"), accessible at touchconnectpro.com.</P>
          <P>By visiting the site, taking the Founder Focus Score, creating an account, or engaging with an advisory service, you agree to these Terms of Service and our associated Privacy Policy and Cookie Policy. If you do not agree, please discontinue use of the platform.</P>
        </Section>

        <Divider />

        <Section num="Section 02" title="What TouchConnectPro is">
          <P>TouchConnectPro helps early-stage founders identify and address the financial and operational gaps in their business. The platform provides a free diagnostic tool, a personal dashboard, and direct access to specialist advisors with expertise in accounting systems, ERP selection, financial reporting, and fractional CFO work.</P>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0" }}>
            {services.map((s, i) => (
              <div key={i} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px" }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal, marginBottom: 6, display: "block" }}>{s.label}</span>
                <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: "#FEF6EC", border: `1px solid rgba(196,154,60,0.2)`, borderLeft: `3px solid ${C.gold}`, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
            <p style={{ fontSize: 14, color: "#7A5C1E", lineHeight: 1.65, margin: 0 }}>TouchConnectPro provides guidance and access to expertise. We do not guarantee business success, revenue growth, funding outcomes, or the results of any advisory engagement. All decisions remain yours.</p>
          </div>
        </Section>

        <Divider />

        <Section num="Section 03" title="Free account and diagnostic">
          <P>The Founder Focus Score, your dashboard, and direct messaging with a specialist are free to use. No credit card is required to take the diagnostic or create an account.</P>
          <P>Your account gives you access to your score history, weekly focus questions generated from your results, and the ability to message a specialist directly about your specific situation.</P>
          <P>We reserve the right to update or modify the free features of the platform at any time. We will notify account holders of significant changes by email.</P>
        </Section>

        <Divider />

        <Section num="Section 04" title="Advisory services and engagements">
          <P>If you choose to engage a specialist for paid advisory work, the scope, deliverables, timeline, and fee are agreed directly between you and the specialist before any work begins. Paid engagements may include:</P>
          <DocList items={["A one-time advisory session to address a specific question or decision", "A project-based engagement such as accounting system setup or ERP implementation", "An ongoing fractional CFO or financial advisory arrangement"]} />
          <P>No payment is processed through TouchConnectPro without your explicit agreement to a specific scope and fee. You will always know what you are paying for before you pay.</P>
        </Section>

        <Divider />

        <Section num="Section 05" title="Payments and refunds">
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Payment processing</h3>
            <P>Payments for advisory services are processed securely through Stripe. By making a payment, you agree to Stripe's terms of service in addition to these terms.</P>
          </div>
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Refund policy</h3>
            <P>Because advisory engagements are scoped and agreed in advance, refunds are handled on a case-by-case basis. If you are unsatisfied with a service, contact us within 7 days of the engagement and we will work to find a fair resolution.</P>
            <P>Refunds are not issued for work that has already been delivered and accepted, or for time spent in sessions that took place as scheduled.</P>
          </div>
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Cancellations</h3>
            <P>You may cancel or reschedule a session with at least 24 hours notice. Cancellations made with less than 24 hours notice may not be eligible for a refund at the specialist's discretion.</P>
          </div>
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
            <p style={{ fontSize: 14, color: C.teal, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>If you have a billing question or dispute, contact us at hello@touchconnectpro.com and we will respond within 2 business days.</p>
          </div>
        </Section>

        <Divider />

        <Section num="Section 06" title="Data protection and privacy">
          <P>By using TouchConnectPro, you agree to our Privacy Policy, which explains what personal data we collect, how we use it, and how you can request access, correction, or deletion.</P>
          <P>This includes your account information, your Founder Focus Score responses, your dashboard activity, and any messages sent through the platform. We do not sell personal data. Details of what is collected and why are set out in full in the Privacy Policy.</P>
        </Section>

        <Divider />

        <Section num="Section 07" title="Intellectual property">
          <P>All branding, software, content, diagnostic tools, frameworks, templates, and materials associated with TouchConnectPro are the exclusive property of Touch Equity Partners LLC.</P>
          <P>You may not copy, reproduce, resell, distribute, or use any platform materials for commercial or competitive purposes without prior written permission. Your personal Focus Score results and dashboard data belong to you.</P>
        </Section>

        <Divider />

        <Section num="Section 08" title="No guarantee of outcomes">
          <P>Advisory guidance, diagnostic results, and specialist recommendations are provided in good faith based on the information you share. They do not constitute financial, legal, or investment advice in a regulated sense.</P>
          <P>TouchConnectPro is not a licensed financial advisor, accounting firm, law firm, or funding provider. Any decisions you make based on content or conversations from this platform are entirely your own responsibility.</P>
          <div style={{ background: "#FEF6EC", border: `1px solid rgba(196,154,60,0.2)`, borderLeft: `3px solid ${C.gold}`, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
            <p style={{ fontSize: 14, color: "#7A5C1E", lineHeight: 1.65, margin: 0 }}>Results depend on your execution, your specific circumstances, and factors outside anyone's control. No advisory relationship guarantees a particular business or financial outcome.</p>
          </div>
        </Section>

        <Divider />

        <Section num="Section 09" title="Limitation of liability">
          <P>Touch Equity Partners LLC and TouchConnectPro are not liable for:</P>
          <DocList items={["Business losses, performance outcomes, or financial results", "Decisions made based on advisory sessions or platform content", "Disputes arising from agreements made outside the platform", "Interruptions to platform access due to technical issues or maintenance", "Third-party services connected to the platform"]} />
          <P>Use of the platform is voluntary. You are solely responsible for your business and financial decisions.</P>
        </Section>

        <Divider />

        <Section num="Section 10" title="Changes to these terms">
          <P>We may update these Terms of Service as the platform evolves. The most current version will always be on this page with an updated date at the top. For significant changes, we will notify account holders by email before the changes take effect.</P>
          <P>Continuing to use TouchConnectPro after an update means you accept the revised terms.</P>
        </Section>

        <div style={{ background: C.ink, borderRadius: 10, padding: 32, marginTop: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: C.cream, marginBottom: 10 }}>Questions about these terms?</h2>
          <p style={{ fontSize: 14, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, marginBottom: 16 }}>If anything here is unclear or you have a question about a specific situation, reach out directly. We are a small team and we respond to every message.</p>
          <a href="mailto:hello@touchconnectpro.com" style={{ display: "inline-block", fontSize: 14, fontWeight: 500, color: C.gold, textDecoration: "none", borderBottom: `1px solid rgba(196,154,60,0.3)`, paddingBottom: 1 }}>hello@touchconnectpro.com</a>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 14, color: "rgba(250,248,243,0.55)" }}>Touch Equity Partners LLC &nbsp;·&nbsp; Operator of TouchConnectPro</p>
        </div>

      </div>
    </div>
  );
}
