import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getSupabase, clearSupabaseSession } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = await getSupabase();
        if (!supabase) { setCheckingAuth(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }
        if (user && user.email) {
          const email = user.email.toLowerCase();
          setUserEmail(email);
          let role: string | null = null;
          const { data: entrepreneurApp } = await supabase.from("ideas").select("status").ilike("entrepreneur_email", email).in("status", ["approved", "pre-approved"]).limit(1);
          if (entrepreneurApp && entrepreneurApp.length > 0) role = "entrepreneur";
          if (!role) {
            const { data: mentorApp } = await supabase.from("mentor_applications").select("status").ilike("email", email).eq("status", "approved").limit(1);
            if (mentorApp && mentorApp.length > 0) role = "mentor";
          }
          if (!role) {
            const { data: coachApp } = await supabase.from("coach_applications").select("status").ilike("email", email).eq("status", "approved").limit(1);
            if (coachApp && coachApp.length > 0) role = "coach";
          }
          if (!role) {
            const { data: investorApp } = await supabase.from("investor_applications").select("status").ilike("email", email).eq("status", "approved").limit(1);
            if (investorApp && investorApp.length > 0) role = "investor";
          }
          if (!role) {
            const { data: trialUser } = await supabase.from("trial_users").select("status").ilike("email", email).in("status", ["trial_active", "trial_expired"]).limit(1);
            if (trialUser && trialUser.length > 0) role = "trial_entrepreneur";
          }
          if (role) setUserRole(role);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  const handleGoToDashboard = () => {
    if (userRole === "trial_entrepreneur") navigate("/trial-dashboard");
    else if (userRole === "entrepreneur") navigate("/dashboard-entrepreneur");
    else if (userRole === "mentor") navigate("/dashboard-mentor");
    else if (userRole === "coach") navigate("/dashboard-coach");
    else if (userRole === "investor") navigate("/dashboard-investor");
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error("Please fill in email and password"); return; }
    setLoading(true);
    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error("Supabase client not initialized. Check environment variables.");
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
      if (data.session) {
        await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      }
      if (data.user) {
        const userEmail = data.user.email?.toLowerCase();
        let applicationRole: string | null = null;
        if (userEmail) {
          const { data: entrepreneurApp } = await supabase.from("ideas").select("status").ilike("entrepreneur_email", userEmail).in("status", ["approved", "pre-approved"]).limit(1);
          if (entrepreneurApp && entrepreneurApp.length > 0) applicationRole = "entrepreneur";
          if (!applicationRole) {
            const { data: mentorApp } = await supabase.from("mentor_applications").select("status").ilike("email", userEmail).eq("status", "approved").limit(1);
            if (mentorApp && mentorApp.length > 0) applicationRole = "mentor";
          }
          if (!applicationRole) {
            const { data: coachApp } = await supabase.from("coach_applications").select("status").ilike("email", userEmail).eq("status", "approved").limit(1);
            if (coachApp && coachApp.length > 0) applicationRole = "coach";
          }
          if (!applicationRole) {
            const { data: investorApp } = await supabase.from("investor_applications").select("status").ilike("email", userEmail).eq("status", "approved").limit(1);
            if (investorApp && investorApp.length > 0) applicationRole = "investor";
          }
          if (!applicationRole) {
            const { data: trialUser } = await supabase.from("trial_users").select("status").ilike("email", userEmail).in("status", ["trial_active", "trial_expired"]).limit(1);
            if (trialUser && trialUser.length > 0) applicationRole = "trial_entrepreneur";
          }
        }
        let finalRole = applicationRole;
        if (!finalRole) {
          const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id);
          finalRole = profile?.[0]?.role;
        }
        if (!finalRole) finalRole = data.user.user_metadata?.user_type || "entrepreneur";
        let dashboardPath = "/dashboard-entrepreneur";
        if (finalRole === "trial_entrepreneur") dashboardPath = "/trial-dashboard";
        else if (finalRole === "mentor") dashboardPath = "/dashboard-mentor";
        else if (finalRole === "coach") dashboardPath = "/dashboard-coach";
        else if (finalRole === "investor") dashboardPath = "/dashboard-investor";
        const currentParams = new URLSearchParams(window.location.search);
        const paymentStatus = currentParams.get("payment");
        const sessionId = currentParams.get("session_id");
        if (paymentStatus && dashboardPath === "/dashboard-entrepreneur") {
          const params = new URLSearchParams();
          params.set("payment", paymentStatus);
          if (sessionId) params.set("session_id", sessionId);
          dashboardPath = `${dashboardPath}?${params.toString()}`;
        }
        try {
          const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "https://touchconnectprowebswervice.onrender.com");
          fetch(`${apiBase}/api/track-login`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${data.session?.access_token || ""}` }, body: JSON.stringify({ email: userEmail, role: finalRole }) }).catch(() => {});
        } catch {}
        toast.success("Logged in successfully!");
        navigate(dashboardPath);
      }
    } catch (error: any) {
      const errorMsg = (error.message || "").toLowerCase();
      if (errorMsg.includes("invalid") || errorMsg.includes("credentials") || errorMsg.includes("password") || errorMsg.includes("wrong") || errorMsg.includes("incorrect") || errorMsg.includes("login")) {
        toast.error("Wrong password. Please try again.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: C.cream }}>
        <Loader2 style={{ width: 28, height: 28, color: C.teal, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (userRole) {
    return (
      <div className="login-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
        <style>{`
          @media (max-width: 768px) {
            .login-grid { grid-template-columns: 1fr !important; }
            .login-left-panel { display: none !important; }
            .login-right-panel { padding: 40px 24px !important; }
          }
        `}</style>
        <LeftPanel />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", backgroundColor: C.cream }}>
          <div style={{ width: "100%", maxWidth: 380 }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 300, color: C.ink, letterSpacing: "-0.01em", marginBottom: 6 }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6 }}>
                You're signed in as {userEmail}
              </p>
            </div>
            <button
              onClick={handleGoToDashboard}
              style={{ width: "100%", height: 46, background: C.ink, color: C.cream, fontSize: 14, fontWeight: 500, border: "none", borderRadius: 4, cursor: "pointer", marginBottom: 12, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.teal)}
              onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
              data-testid="button-go-to-dashboard"
            >
              Go to my dashboard
            </button>
            <button
              onClick={async () => {
                const supabase = await getSupabase();
                if (supabase) await supabase.auth.signOut();
                setUserRole(null); setUserEmail(null);
                toast.success("Signed out successfully");
              }}
              style={{ width: "100%", height: 46, background: "transparent", color: C.inkMuted, fontSize: 14, fontWeight: 500, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", transition: "color 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget.style.color = C.ink); (e.currentTarget.style.borderColor = C.ink); }}
              onMouseLeave={e => { (e.currentTarget.style.color = C.inkMuted); (e.currentTarget.style.borderColor = C.border); }}
              data-testid="button-logout-login"
            >
              Sign out
            </button>
            <Link href="/" data-testid="link-back-home">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.inkMuted, marginTop: 24, cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
              >
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: "currentColor", fill: "none", strokeWidth: 1.5 }}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back to home
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .login-grid { grid-template-columns: 1fr !important; }
          .login-left-panel { display: none !important; }
          .login-right-panel { padding: 40px 24px !important; }
        }
        input:focus { outline: none; border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(29,106,90,0.08) !important; }
      `}</style>

      <LeftPanel />

      {/* Right Panel */}
      <div className="login-right-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "48px 40px", backgroundColor: C.cream }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {isRecovery ? (
            <>
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 300, color: C.ink, letterSpacing: "-0.01em", marginBottom: 6, lineHeight: 1.2 }}>
                  Reset your password
                </h2>
                <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6 }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.inkSoft, marginBottom: 7, letterSpacing: "0.02em" }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRecovery()}
                  style={{ width: "100%", height: 44, padding: "0 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: "inherit", fontSize: 15, color: C.ink, transition: "border-color 0.15s, box-shadow 0.15s" }}
                  data-testid="input-recovery-email"
                />
              </div>
              <button
                onClick={handleRecovery}
                disabled={loading}
                style={{ width: "100%", height: 46, background: loading ? C.inkMuted : C.ink, color: C.cream, fontSize: 14, fontWeight: 500, border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, transition: "background 0.15s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.teal; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.ink; }}
                data-testid="button-send-reset"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <button
                onClick={() => setIsRecovery(false)}
                style={{ width: "100%", marginTop: 16, fontSize: 13, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
                data-testid="button-back-to-login"
              >
                ← Back to sign in
              </button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 300, color: C.ink, letterSpacing: "-0.01em", marginBottom: 6, lineHeight: 1.2 }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6 }}>
                  Sign in to your TouchConnectPro account to access your dashboard and score.
                </p>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.inkSoft, marginBottom: 7, letterSpacing: "0.02em" }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={{ width: "100%", height: 44, padding: "0 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: "inherit", fontSize: 15, color: C.ink, transition: "border-color 0.15s, box-shadow 0.15s" }}
                  data-testid="input-email"
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: C.inkSoft, letterSpacing: "0.02em" }}>
                    Password
                  </label>
                  <button
                    onClick={() => setIsRecovery(true)}
                    style={{ fontSize: 12, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", padding: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.teal)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{ width: "100%", height: 44, padding: "0 40px 0 14px", background: "white", border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: "inherit", fontSize: 15, color: C.ink, transition: "border-color 0.15s, box-shadow 0.15s" }}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.inkMuted, lineHeight: 1 }}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 1.5 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: "currentColor", fill: "none", strokeWidth: 1.5 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{ width: "100%", height: 46, background: loading ? C.inkMuted : C.ink, color: C.cream, fontSize: 14, fontWeight: 500, border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, letterSpacing: "0.01em", transition: "background 0.15s, transform 0.1s" }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = C.teal; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = C.ink; e.currentTarget.style.transform = "translateY(0)"; } }}
                data-testid="button-login"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
                <span style={{ fontSize: 11, color: C.inkMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
              </div>

              {/* Clear session link */}
              <div style={{ textAlign: "center", marginBottom: 0 }}>
                <button
                  onClick={() => { clearSupabaseSession(); toast.success("Session cleared. Please log in again."); window.location.reload(); }}
                  style={{ fontSize: 13, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", lineHeight: 1.5 }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
                  data-testid="button-clear-session"
                >
                  Having trouble signing in? <strong style={{ color: C.teal, fontWeight: 500 }}>Clear your session</strong>
                </button>
              </div>

              {/* Signup strip */}
              <div style={{ marginTop: 32, padding: "18px 20px", background: C.goldPale, border: "1px solid rgba(196,154,60,0.2)", borderRadius: 10, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 12 }}>
                  No account yet? The Founder Focus Score and your dashboard are free. No credit card required.
                </p>
                <Link href="/founder-focus" data-testid="link-create-account">
                  <span
                    style={{ display: "inline-block", background: C.ink, color: C.cream, fontSize: 13, fontWeight: 500, padding: "10px 24px", borderRadius: 4, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.teal)}
                    onMouseLeave={e => (e.currentTarget.style.background = C.ink)}
                  >
                    Create a free account
                  </span>
                </Link>
              </div>
            </>
          )}

          {/* Back to home */}
          <Link href="/" data-testid="link-back-home">
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.inkMuted, marginTop: 28, cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
              onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
            >
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: "currentColor", fill: "none", strokeWidth: 1.5 }}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to home
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  function handleRecovery() {
    (async () => {
      if (!recoveryEmail) { toast.error("Please enter your email address"); return; }
      setLoading(true);
      try {
        const supabase = await getSupabase();
        if (!supabase) throw new Error("Supabase not initialized");
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent! Check your inbox.");
        setIsRecovery(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to send reset email");
      } finally {
        setLoading(false);
      }
    })();
  }
}

function LeftPanel() {
  return (
    <div
      className="login-left-panel"
      style={{
        background: "#1A1814",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 48px 48px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(196,154,60,0.1)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(196,154,60,0.07)", pointerEvents: "none" }} />

      {/* Logo */}
      <Link href="/">
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 600, color: "#FAF8F3", letterSpacing: "-0.01em", cursor: "pointer" }}>
          Touch<span style={{ color: "#C49A3C" }}>Connect</span>Pro
        </span>
      </Link>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1D6A5A", marginBottom: 20 }}>
          <span style={{ width: 20, height: 1, background: "#1D6A5A", display: "inline-block" }} />
          Your dashboard is waiting
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 300, color: "#FAF8F3", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
          Know exactly where your <em style={{ fontStyle: "italic", color: "#C49A3C" }}>financial foundation</em> stands
        </h1>
        <p style={{ fontSize: 15, color: "rgba(250,248,243,0.5)", lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
          Your Focus Score, weekly action questions, and direct access to a Fractional CFO specialist. All in one place.
        </p>

        {/* Score preview */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "22px 24px", maxWidth: 340 }}>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,248,243,0.3)", marginBottom: 12, display: "block" }}>
            Your Founder Focus Score
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Business clarity", value: 78, color: "#1D6A5A" },
              { label: "Financial structure", value: 41, color: "#C97B5A" },
              { label: "Operational readiness", value: 73, color: "#C49A3C" },
            ].map(bar => (
              <div key={bar.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(250,248,243,0.4)", marginBottom: 4 }}>
                  <span>{bar.label}</span>
                  <span style={{ color: "rgba(250,248,243,0.7)" }}>{bar.value}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ width: `${bar.value}%`, height: "100%", background: bar.color, borderRadius: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: 12, color: "rgba(250,248,243,0.2)", lineHeight: 1.6 }}>
        <Link href="/privacy-policy"><span style={{ color: "rgba(250,248,243,0.3)", cursor: "pointer" }}>Privacy Policy</span></Link>
        {" · "}
        <Link href="/terms-of-service"><span style={{ color: "rgba(250,248,243,0.3)", cursor: "pointer" }}>Terms of Service</span></Link>
        {" · "}
        <Link href="/cookie-policy"><span style={{ color: "rgba(250,248,243,0.3)", cursor: "pointer" }}>Cookies</span></Link>
      </div>
    </div>
  );
}
