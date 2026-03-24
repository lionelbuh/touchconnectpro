import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, CheckCircle, Users } from "lucide-react";
import { Link } from "wouter";
import { QUESTIONS, computeResults, type QuizResult, type Dimension } from "@/lib/founderFocusData";
import { COMMUNITY_FREE_CONTRACT } from "@/lib/contracts";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { getSupabase } from "@/lib/supabase";

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

type Phase = "landing" | "quiz" | "contact" | "results";

function QuizShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px 80px" }}>
      {children}
    </div>
  );
}

function ProgressBar({ value, count }: { value: number; count?: string }) {
  return (
    <div style={{ width: "100%", maxWidth: 620, marginBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.inkMuted }}>Founder Focus Score</span>
        {count && <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: C.inkMuted }}>{count}</span>}
      </div>
      <div style={{ height: 3, background: C.borderSoft, borderRadius: 100, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: C.teal, borderRadius: 100, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function FounderFocusScore() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<Dimension, number>>({ clarity: 0, finance: 0, ops: 0 });
  const [result, setResult] = useState<QuizResult | null>(null);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [showContractText, setShowContractText] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [autoAccountCreated, setAutoAccountCreated] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  const prevPhaseRef = useRef<Phase>("landing");
  const prevQRef = useRef(0);

  useEffect(() => {
    if (phase !== prevPhaseRef.current || currentQuestion !== prevQRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevPhaseRef.current = phase;
      prevQRef.current = currentQuestion;
    }
  }, [phase, currentQuestion]);

  const handleSelectAnswer = (qId: string, value: string, optScores: Partial<Record<Dimension, number>>) => {
    setAnswers(prev => {
      const prevValue = prev[qId];
      if (prevValue === value) return prev;

      const prevOpt = QUESTIONS[currentQuestion].options.find(o => o.value === prevValue);
      const newScores = { ...scores };

      if (prevOpt) {
        for (const [dim, delta] of Object.entries(prevOpt.scores)) {
          newScores[dim as Dimension] = (newScores[dim as Dimension] || 0) - (delta || 0);
        }
      }
      for (const [dim, delta] of Object.entries(optScores)) {
        newScores[dim as Dimension] = (newScores[dim as Dimension] || 0) + (delta || 0);
      }
      setScores(newScores);
      return { ...prev, [qId]: value };
    });
  };

  const handleNext = () => {
    const q = QUESTIONS[currentQuestion];
    if (!answers[q.id]) return;
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(q => q + 1);
    } else {
      const quizResult = computeResults(scores, answers);
      setResult(quizResult);
      setPhase("contact");
      try {
        fetch(`${API_BASE_URL}/api/founder-focus-completed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scores: quizResult.raw, totalScore: quizResult.total, topBlocker: quizResult.minDim }),
        });
      } catch (e) {}
    }
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;
    const q = QUESTIONS[currentQuestion];
    const prevValue = answers[q.id];
    if (prevValue) {
      const opt = q.options.find(o => o.value === prevValue);
      if (opt) {
        setScores(prev => {
          const next = { ...prev };
          for (const [dim, delta] of Object.entries(opt.scores)) {
            next[dim as Dimension] = (next[dim as Dimension] || 0) - (delta || 0);
          }
          return next;
        });
        setAnswers(prev => { const next = { ...prev }; delete next[q.id]; return next; });
      }
    }
    setCurrentQuestion(q => q - 1);
  };

  const handleSeeResults = async () => {
    if (contactName.trim() && contactEmail.trim()) {
      setIsAutoCreating(true);
      const clientTempPassword = `TCP_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const normalizedEmail = contactEmail.trim().toLowerCase();
      try {
        const res = await fetch(`${API_BASE_URL}/api/community/auto-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contactEmail.trim(), name: contactName.trim(), quizResult: result, quizAnswers: answers, clientPassword: clientTempPassword }),
        });
        const data = await res.json();
        if (res.ok) {
          setAutoAccountCreated(true);
          const loginPassword = data.tempPassword || clientTempPassword;
          try {
            const supabaseClient = await getSupabase();
            if (supabaseClient) {
              const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({ email: normalizedEmail, password: loginPassword });
              if (!signInError && signInData?.session) {
                toast.success("Welcome! Taking you to your dashboard...");
                setTimeout(() => { window.location.href = "/dashboard-entrepreneur"; }, 500);
                return;
              }
              if (signInError) {
                const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({ email: normalizedEmail, password: clientTempPassword });
                if (!retryError && retryData?.session) {
                  toast.success("Welcome! Taking you to your dashboard...");
                  setTimeout(() => { window.location.href = "/dashboard-entrepreneur"; }, 500);
                  return;
                }
              }
            }
          } catch (loginErr) { console.error("[AUTO LOGIN] Error:", loginErr); }
        } else {
          if (data.error?.includes("already exists")) {
            setAutoAccountCreated(true);
            toast.info("An account already exists for this email. Please log in to access your dashboard.");
          }
        }
      } catch (err) { console.error("[AUTO SIGNUP] Network error:", err); }
      finally { setIsAutoCreating(false); }
    }
    setPhase("results");
  };

  const handleCommunitySignup = async () => {
    if (!signupEmail || !signupName || !signupPassword) { toast.error("Please fill in all fields"); return; }
    if (signupPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (!agreedToContract) { toast.error("Please agree to the Community Free Membership Agreement to continue"); return; }
    setIsCreatingAccount(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, name: signupName, password: signupPassword, quizResult: result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      setAccountCreated(true);
      toast.success("Account created! You can now log in to your dashboard.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally { setIsCreatingAccount(false); }
  };

  const resetQuiz = () => {
    setPhase("landing");
    setCurrentQuestion(0);
    setAnswers({});
    setScores({ clarity: 0, finance: 0, ops: 0 });
    setResult(null);
    setAutoAccountCreated(false);
    setAccountCreated(false);
    setContactName("");
    setContactEmail("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  };

  // ── Landing ──
  if (phase === "landing") {
    return (
      <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>
        <QuizShell>
          <div style={{ width: "100%", maxWidth: 580, textAlign: "center", animation: "slideIn 0.4s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.teal, background: C.tealLight, padding: "6px 14px", borderRadius: 100, marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
              Free diagnostic
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px,5vw,48px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", color: C.ink, marginBottom: 20 }} data-testid="text-quiz-title">
              Discover your biggest <em style={{ fontStyle: "italic", color: C.gold }}>growth blocker</em>
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.75, marginBottom: 40, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              Answer 8 questions and get a clear diagnosis of what is holding you back, plus one concrete step to take this week.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 40 }}>
              {["5 minutes", "Personalized to your answers", "No sign-up required"].map((label, i) => (
                <span key={i} style={{ fontSize: 12, color: C.inkSoft, background: "white", border: `1px solid ${C.border}`, padding: "7px 16px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
            <button
              onClick={() => setPhase("quiz")}
              style={{ display: "inline-block", background: C.ink, color: C.cream, fontSize: 15, fontWeight: 500, padding: "16px 40px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s, transform 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.teal; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.transform = "translateY(0)"; }}
              data-testid="button-start-quiz"
            >
              Start the diagnostic →
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: C.inkMuted }}>Free. Your results are yours to keep.</p>
          </div>

          <div style={{ width: "100%", maxWidth: 620, marginTop: 72, borderTop: `1px solid ${C.borderSoft}`, paddingTop: 48 }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.inkMuted, marginBottom: 32, textAlign: "center" }}>How it works</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {[
                { num: "01", title: "Answer", desc: "8 honest questions about where your business actually is." },
                { num: "02", title: "Score", desc: "Get scored across clarity, finance, and operations." },
                { num: "03", title: "Diagnose", desc: "See your primary growth blocker in plain language." },
                { num: "04", title: "Act", desc: "One concrete step to take this week." },
              ].map(step => (
                <div key={step.num} style={{ textAlign: "center" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: C.gold, display: "block", marginBottom: 8 }}>{step.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, display: "block", marginBottom: 4 }}>{step.title}</span>
                  <span style={{ fontSize: 12, color: C.inkMuted, lineHeight: 1.5 }}>{step.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </QuizShell>
      </div>
    );
  }

  // ── Quiz ──
  if (phase === "quiz") {
    const q = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    const selectedValue = answers[q.id];

    return (
      <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>
        <QuizShell>
          <ProgressBar value={progress} count={`${currentQuestion + 1} of ${QUESTIONS.length}`} />
          <div style={{ width: "100%", maxWidth: 620, animation: "slideIn 0.3s ease" }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.teal, marginBottom: 16, display: "block" }}>{q.eyebrow}</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 300, lineHeight: 1.25, color: C.ink, letterSpacing: "-0.01em", marginBottom: 8 }} data-testid={`text-question-${currentQuestion}`}>
              {q.text}
            </h2>
            <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6, marginBottom: 32 }}>{q.sub}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {q.options.map((opt, i) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(q.id, opt.value, opt.scores)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px", background: isSelected ? C.tealLight : "white", border: `1px solid ${isSelected ? C.teal : C.border}`, borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.15s, background 0.15s, transform 0.1s", width: "100%" }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(26,24,20,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; } }}
                    data-testid={`button-answer-${currentQuestion}-${i}`}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${isSelected ? C.teal : C.border}`, background: isSelected ? C.teal : C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: isSelected ? "white" : C.inkMuted, flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                      {opt.letter}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 15, fontWeight: 500, color: C.ink, display: "block", marginBottom: 2, lineHeight: 1.4 }}>{opt.label}</span>
                      <span style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.5 }}>{opt.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={currentQuestion === 0 ? () => setPhase("landing") : handlePrevious}
                style={{ fontSize: 13, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "10px 0", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
                data-testid="button-previous"
              >
                ← {currentQuestion === 0 ? "Back" : "Previous"}
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedValue}
                style={{ background: C.ink, color: C.cream, fontSize: 14, fontWeight: 500, padding: "13px 32px", borderRadius: 4, border: "none", cursor: selectedValue ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: selectedValue ? 1 : 0.35, transition: "background 0.15s, transform 0.1s, opacity 0.15s" }}
                onMouseEnter={e => { if (selectedValue) { e.currentTarget.style.background = C.teal; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.transform = "translateY(0)"; }}
                data-testid="button-next"
              >
                {currentQuestion === QUESTIONS.length - 1 ? "See my results" : "Next question"}
              </button>
            </div>
          </div>
        </QuizShell>
      </div>
    );
  }

  // ── Contact ──
  if (phase === "contact" && result) {
    return (
      <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>
        <QuizShell>
          <ProgressBar value={100} count="Last step" />
          <div style={{ width: "100%", maxWidth: 620, animation: "slideIn 0.3s ease" }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.teal, marginBottom: 16, display: "block" }}>Your results</span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 300, lineHeight: 1.25, color: C.ink, letterSpacing: "-0.01em", marginBottom: 8 }} data-testid="text-contact-title">
              Where should we send your results?
            </h2>
            <p style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.6, marginBottom: 32 }}>
              Enter your details and we will save your score and set up your free dashboard. Or skip to see results now.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32, maxWidth: 480 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 6 }}>Full name</label>
                <Input placeholder="Your full name" value={contactName} onChange={e => setContactName(e.target.value)} autoComplete="name" style={{ background: "white", borderColor: C.border, color: C.ink, height: 48, borderRadius: 4 }} data-testid="input-contact-name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 6 }}>Email address</label>
                <Input type="email" placeholder="Your email address" value={contactEmail} onChange={e => setContactEmail(e.target.value)} autoComplete="email" style={{ background: "white", borderColor: C.border, color: C.ink, height: 48, borderRadius: 4 }} data-testid="input-contact-email" />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => { setPhase("quiz"); setCurrentQuestion(QUESTIONS.length - 1); }}
                style={{ fontSize: 13, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "10px 0", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
                data-testid="button-back-to-quiz"
              >
                ← Back
              </button>
              <button
                onClick={handleSeeResults}
                disabled={isAutoCreating}
                style={{ background: C.ink, color: C.cream, fontSize: 14, fontWeight: 500, padding: "13px 32px", borderRadius: 4, border: "none", cursor: isAutoCreating ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isAutoCreating ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s, transform 0.1s" }}
                onMouseEnter={e => { if (!isAutoCreating) { e.currentTarget.style.background = C.teal; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.transform = "translateY(0)"; }}
                data-testid="button-see-results"
              >
                {isAutoCreating ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Setting up...</> : <>See my results <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
            </div>
          </div>
        </QuizShell>
      </div>
    );
  }

  // ── Results ──
  if (phase === "results" && result) {
    const getBarColor = (pct: number) => pct >= 65 ? C.teal : pct >= 40 ? C.gold : "#C97B5A";
    const dimLabels: Record<Dimension, string> = { clarity: "Business clarity", finance: "Financial structure", ops: "Operational readiness" };

    return (
      <div style={{ backgroundColor: C.cream, minHeight: "100vh" }}>
        <QuizShell>
          <div style={{ width: "100%", maxWidth: 660, animation: "slideIn 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.teal, background: C.tealLight, padding: "5px 14px", borderRadius: 100, marginBottom: 20 }}>Your results</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 300, color: C.ink, lineHeight: 1.2, marginBottom: 8 }} data-testid="text-results-title">
                Your Founder <em style={{ fontStyle: "italic", color: C.gold }}>Focus Score</em>
              </h2>
            </div>

            {/* Dark score card */}
            <div style={{ background: C.ink, borderRadius: 10, padding: "36px 40px", marginBottom: 20, display: "grid", gridTemplateColumns: "140px 1fr", gap: 40, alignItems: "center" }}>
              <div style={{ textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: 40 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 64, fontWeight: 300, color: C.cream, lineHeight: 1, letterSpacing: "-0.03em" }} data-testid="text-score-value">
                  {result.total}<span style={{ fontSize: 20, color: "rgba(250,248,243,0.35)" }}>/100</span>
                </div>
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.gold, background: "rgba(196,154,60,0.15)", padding: "3px 10px", borderRadius: 100, marginTop: 10 }}>
                  {result.total >= 80 ? "Strong foundation" : result.total >= 60 ? "Solid, but blocked" : "High friction"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(["clarity", "finance", "ops"] as Dimension[]).map(dim => (
                  <div key={dim}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(250,248,243,0.5)", marginBottom: 5 }}>
                      <span>{dimLabels[dim]}</span>
                      <span style={{ color: "rgba(250,248,243,0.8)", fontWeight: 500 }}>{result.raw[dim]}%</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.max(result.raw[dim], 5)}%`, background: getBarColor(result.raw[dim]), borderRadius: 100, transition: "width 1s ease 0.3s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: 28, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.inkMuted, marginBottom: 12, display: "block" }}>Your diagnosis</span>
              <p style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.75 }} data-testid="text-blocker-explanation">{result.diagnosis.text}</p>
            </div>

            {/* Primary gap */}
            <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: 28, marginBottom: 16, borderLeft: `4px solid ${C.teal}` }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.inkMuted, marginBottom: 8, display: "block" }}>Primary gap</span>
              <h3 style={{ fontSize: 18, fontFamily: "Georgia, serif", fontWeight: 400, color: C.ink, margin: 0 }} data-testid="text-primary-blocker">{result.diagnosis.label}</h3>
            </div>

            {/* Next step */}
            <div style={{ background: C.goldPale, border: `1px solid rgba(196,154,60,0.25)`, borderRadius: 10, padding: "24px 28px", marginBottom: 32, borderLeft: `4px solid ${C.gold}` }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.gold, marginBottom: 10, display: "block" }}>Your concrete next step this week</span>
              <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.7, fontWeight: 500, margin: 0 }} data-testid="text-next-action">{result.nextStep}</p>
            </div>

            {/* Community signup CTA */}
            {autoAccountCreated ? (
              <div style={{ background: C.tealLight, border: `1px solid rgba(29,106,90,0.2)`, borderRadius: 10, padding: 32, textAlign: "center" }} data-testid="text-auto-signup-success">
                <CheckCircle style={{ width: 40, height: 40, color: C.teal, margin: "0 auto 16px" }} />
                <h4 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 400, color: C.ink, marginBottom: 12 }}>Your dashboard is almost ready</h4>
                <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.7, marginBottom: 16 }}>
                  We have sent an email to <strong>{contactEmail}</strong> with a link to set your password.
                </p>
                <div style={{ background: C.goldPale, border: `1px solid rgba(196,154,60,0.2)`, borderRadius: 8, padding: "14px 18px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 4 }}>Next step</p>
                  <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>Open the email from TouchConnectPro and click <strong>"Set Your Password & Log In"</strong> to access your dashboard.</p>
                </div>
                <p style={{ fontSize: 12, color: C.inkMuted }}>Check your inbox and spam folder.</p>
              </div>
            ) : (
              <div style={{ background: C.ink, borderRadius: 10, padding: 40 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <Users style={{ width: 32, height: 32, color: C.gold, margin: "0 auto 12px" }} />
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, color: C.cream, marginBottom: 10 }} data-testid="text-community-cta">
                    Save your results. <em style={{ fontStyle: "italic", color: C.gold }}>It&apos;s free.</em>
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(250,248,243,0.55)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 24px" }}>
                    Create a free account to access your personal dashboard, track your score over time, and connect with specialist advisors.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 28 }}>
                    {["Score saved to dashboard", "Coach access", "100% free"].map((label, i) => (
                      <span key={i} style={{ fontSize: 12, color: "rgba(250,248,243,0.6)", background: "rgba(255,255,255,0.08)", padding: "5px 14px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, display: "inline-block" }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {!accountCreated ? (
                  <form onSubmit={e => { e.preventDefault(); handleCommunitySignup(); }} style={{ maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    <Input name="signup-name" placeholder="Your full name" value={signupName} onChange={e => setSignupName(e.target.value)} autoComplete="name" style={{ height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 4 }} data-testid="input-signup-name" />
                    <Input name="signup-email" type="email" placeholder="Your email address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} autoComplete="email" style={{ height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 4 }} data-testid="input-signup-email" />
                    <Input name="signup-password" type="password" placeholder="Choose a password (min 6 characters)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} autoComplete="new-password" style={{ height: 48, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", borderRadius: 4 }} data-testid="input-signup-password" />
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={agreedToContract} onChange={e => setAgreedToContract(e.target.checked)} style={{ marginTop: 2, accentColor: C.gold }} data-testid="checkbox-agree-contract" />
                      <span style={{ fontSize: 13, color: "rgba(250,248,243,0.7)", lineHeight: 1.5 }}>
                        I agree to the{" "}
                        <button type="button" onClick={() => setShowContractText(!showContractText)} style={{ color: C.gold, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: 13 }} data-testid="button-view-contract">
                          Community Free Membership Agreement
                        </button>
                      </span>
                    </label>
                    {showContractText && (
                      <div style={{ maxHeight: 192, overflowY: "auto", borderRadius: 6, padding: 16, fontSize: 12, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(250,248,243,0.55)" }}>
                        {COMMUNITY_FREE_CONTRACT}
                      </div>
                    )}
                    <button type="submit" disabled={isCreatingAccount} style={{ height: 48, background: C.gold, color: C.ink, fontSize: 14, fontWeight: 600, borderRadius: 4, border: "none", cursor: isCreatingAccount ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isCreatingAccount ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
                      onMouseEnter={e => { if (!isCreatingAccount) e.currentTarget.style.background = "#D4AA4C"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.gold; }}
                      data-testid="button-join-community"
                    >
                      {isCreatingAccount ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Creating account...</> : <>Join the community — free <ArrowRight style={{ width: 16, height: 16 }} /></>}
                    </button>
                    <p style={{ textAlign: "center", fontSize: 12, color: "rgba(250,248,243,0.4)", margin: 0 }}>No credit card. No commitment.</p>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: 32, background: "rgba(255,255,255,0.06)", borderRadius: 10 }} data-testid="text-signup-success">
                    <CheckCircle style={{ width: 36, height: 36, color: C.gold, margin: "0 auto 12px" }} />
                    <h4 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 400, color: C.cream, marginBottom: 10 }}>Welcome to the community</h4>
                    <p style={{ fontSize: 14, color: "rgba(250,248,243,0.6)", marginBottom: 20 }}>Your account is ready. Log in to access your entrepreneur dashboard.</p>
                    <Link href="/login">
                      <button style={{ background: C.gold, color: C.ink, fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 4, border: "none", cursor: "pointer", fontFamily: "inherit" }} data-testid="button-go-to-login">
                        Go to login →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <button onClick={resetQuiz} style={{ fontSize: 12, color: C.inkMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkMuted)}
              >
                Retake the quiz
              </button>
            </div>
          </div>
        </QuizShell>
      </div>
    );
  }

  return null;
}
