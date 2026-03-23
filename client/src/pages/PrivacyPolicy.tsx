import { Link } from "wouter";

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

const providers = [
  { name: "Supabase", role: "Authentication and database" },
  { name: "Render", role: "Hosting and infrastructure" },
  { name: "Google Analytics", role: "Website analytics (consent required)" },
  { name: "Resend", role: "Transactional email delivery" },
];

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

export default function PrivacyPolicy() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh" }} data-testid="page-privacy-policy">
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 2rem 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56, paddingBottom: 40, borderBottom: `1px solid ${C.borderSoft}` }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.teal, background: C.tealLight, padding: "5px 14px", borderRadius: 100, marginBottom: 20 }}>Legal</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px,4vw,44px)", fontWeight: 300, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Privacy <em style={{ fontStyle: "italic", color: C.gold }}>Policy</em>
          </h1>
          <p style={{ fontSize: 13, color: C.inkMuted, marginBottom: 20 }}>Last updated: March 1, 2026 &nbsp;·&nbsp; Touch Equity Partners LLC</p>
          <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75, padding: "20px 22px", background: C.goldPale, borderRadius: 10, borderLeft: `3px solid ${C.gold}` }}>
            The short version: we collect only what we need to run this platform, we never sell your data, and you can ask us to delete it at any time. Everything below explains the details.
          </div>
        </div>

        <Section num="Section 01" title="Who we are">
          <P>Touch Equity Partners LLC operates TouchConnectPro, accessible at touchconnectpro.com. TouchConnectPro is a platform that helps early-stage founders understand and fix the financial and operational gaps in their business, through diagnostic tools, personalized guidance, and direct access to specialist advisors.</P>
          <P>When this policy refers to "we", "us", or "our", it means Touch Equity Partners LLC. When it refers to "you", it means any person who visits the site, takes the Founder Focus Score, or creates an account.</P>
        </Section>

        <Divider />

        <Section num="Section 02" title="What data we collect and why">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Account and profile data</h3>
            <P>When you create a free account, we collect the minimum needed to identify you and operate your account:</P>
            <DocList items={["Full name", "Email address", "Any profile information you choose to add", "Login and authentication data"]} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Founder Focus Score responses</h3>
            <P>When you take the diagnostic quiz, we store your answers and your score results. This data powers your dashboard, generates your weekly focus questions, and allows our specialist to understand your situation before any conversation. We do not share this data with third parties.</P>
          </div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Messages and communications</h3>
            <P>When you send a message through the platform to a specialist, we store the content of that exchange to maintain the continuity of your conversation and the quality of the guidance you receive. If you contact us by email, we retain that correspondence.</P>
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 10 }}>Usage data</h3>
            <P>We collect limited, anonymized data on how the site is used, including pages visited, device and browser type, and approximate location at country level. This is used only to improve the platform. It is collected through Google Analytics and only with your consent where required by law.</P>
          </div>
        </Section>

        <Divider />

        <Section num="Section 03" title="How we use your data">
          <P>We use the data we collect to:</P>
          <DocList items={["Operate your account and your dashboard", "Display your Focus Score results and generate your weekly questions", "Enable direct messaging between you and a specialist", "Send you transactional emails related to your account", "Improve the platform based on usage patterns", "Meet our legal and regulatory obligations"]} />
          <div style={{ background: C.tealLight, borderRadius: 10, padding: "18px 22px", margin: "16px 0" }}>
            <p style={{ fontSize: 14, color: C.teal, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>We do not sell your personal data. We do not use it for advertising. We do not share it with third parties except the service providers listed in Section 04, who process it only to help us run the platform.</p>
          </div>
        </Section>

        <Divider />

        <Section num="Section 04" title="Third-party service providers">
          <P>We use a small number of trusted providers to run TouchConnectPro. Each processes personal data only as necessary to perform their specific service and is bound by their own data protection obligations.</P>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, margin: "16px 0" }}>
            {providers.map(p => (
              <div key={p.name} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.inkMuted }}>{p.role}</div>
              </div>
            ))}
          </div>
          <P>We do not use any advertising technology, tracking pixels, or third-party data enrichment tools.</P>
        </Section>

        <Divider />

        <Section num="Section 05" title="Cookies">
          <P>We use two types of cookies:</P>
          <DocList items={["Essential cookies that are required for login, security, and core functionality. These cannot be disabled without breaking the platform.", "Analytics cookies from Google Analytics, used only with your consent where required by applicable law."]} />
          <P>You can manage your cookie preferences at any time through the cookie banner or by contacting us directly.</P>
        </Section>

        <Divider />

        <Section num="Section 06" title="How long we keep your data">
          <P>We keep your personal data for as long as your account is active, or for as long as we need it to provide the services you have requested. If you ask us to delete your account, we will remove your personal data within a reasonable period, except where we are required to retain it by law.</P>
          <P>Anonymized usage and analytics data may be retained longer in aggregate form, as it cannot be linked back to you.</P>
        </Section>

        <Divider />

        <Section num="Section 07" title="Your rights">
          <P>If you are located in the European Union, United Kingdom, or a jurisdiction with equivalent data protection laws, you have the right to:</P>
          <DocList items={["Access the personal data we hold about you", "Correct any data that is inaccurate or incomplete", "Request that we delete your personal data", "Withdraw your consent to analytics cookies at any time", "Object to or request restrictions on certain types of processing", "Receive your data in a portable format"]} />
          <P>To exercise any of these rights, contact us at <a href="mailto:hello@touchconnectpro.com" style={{ color: C.teal, textDecoration: "none", borderBottom: `1px solid rgba(29,106,90,0.3)` }}>hello@touchconnectpro.com</a>. We will respond within 30 days.</P>
        </Section>

        <Divider />

        <Section num="Section 08" title="Security">
          <P>We apply reasonable technical and organizational measures to protect your personal data against unauthorized access, loss, or disclosure. This includes encrypted data transmission, access controls, and secure infrastructure provided by our hosting partners.</P>
          <P>No system is completely immune to risk. If you have concerns about the security of your data, please contact us directly.</P>
        </Section>

        <Divider />

        <Section num="Section 09" title="Changes to this policy">
          <P>We may update this Privacy Policy when our practices change or when required by law. Any update will be posted on this page with a revised date at the top. For significant changes, we will notify account holders by email.</P>
          <P>Continuing to use TouchConnectPro after a change is posted means you accept the updated policy.</P>
        </Section>

        {/* Contact */}
        <div style={{ background: C.ink, borderRadius: 10, padding: 32, marginTop: 48 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: C.cream, marginBottom: 10 }}>Questions about your privacy?</h2>
          <p style={{ fontSize: 14, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, marginBottom: 16 }}>We are a small team and we take privacy seriously. If something in this policy is unclear, or if you want to exercise any of your rights, reach out directly. We will get back to you within a few days.</p>
          <a href="mailto:hello@touchconnectpro.com" style={{ display: "inline-block", fontSize: 14, fontWeight: 500, color: C.gold, textDecoration: "none", borderBottom: `1px solid rgba(196,154,60,0.3)`, paddingBottom: 1 }}>hello@touchconnectpro.com</a>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 14, color: "rgba(250,248,243,0.55)" }}>Touch Equity Partners LLC</p>
        </div>

      </div>
    </div>
  );
}
