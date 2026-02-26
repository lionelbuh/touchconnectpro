import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Target, Compass, DollarSign, Settings, Rocket, CheckCircle, Loader2, Zap, Clock, Users, Briefcase, Lightbulb, Check } from "lucide-react";
import { Link } from "wouter";
import {
  SEGMENTATION_QUESTION,
  TRACK_QUESTIONS,
  TRACK_LABELS,
  TRACK_BLOCKER_INFO,
  calculateResults,
  BLOCKER_INFO,
  type QuizResult,
  type Category,
  type TrackType,
} from "@/lib/founderFocusData";
import { COMMUNITY_FREE_CONTRACT, COMMUNITY_FREE_CONTRACT_VERSION } from "@/lib/contracts";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

const categoryIcons: Record<Category, React.ReactNode> = {
  Strategy: <Compass className="h-6 w-6" />,
  Sales: <DollarSign className="h-6 w-6" />,
  Operations: <Settings className="h-6 w-6" />,
  Execution: <Rocket className="h-6 w-6" />,
};

const categoryAccentColors: Record<Category, string> = {
  Strategy: "#4B3F72",
  Sales: "#0D566C",
  Operations: "#F5C542",
  Execution: "#FF6B5C",
};

const segmentIcons = [
  <Rocket className="h-6 w-6" />,
  <Briefcase className="h-6 w-6" />,
  <Lightbulb className="h-6 w-6" />,
  <Compass className="h-6 w-6" />,
];

type Phase = "landing" | "segmentation" | "quiz" | "contact" | "results" | "community-signup";

export default function FounderFocusScore() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedTrack, setSelectedTrack] = useState<TrackType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(8).fill(-1));
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
  const prevQuestionRef = useRef(0);

  useEffect(() => {
    if (phase !== prevPhaseRef.current || currentQuestion !== prevQuestionRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevPhaseRef.current = phase;
      prevQuestionRef.current = currentQuestion;
    }
  }, [phase, currentQuestion]);

  const questions = selectedTrack ? TRACK_QUESTIONS[selectedTrack] : [];

  const handleSegmentSelect = (index: number) => {
    const option = SEGMENTATION_QUESTION.options[index];
    setSelectedTrack(option.track);
    setAnswers(new Array(8).fill(-1));
    setCurrentQuestion(0);
    setTimeout(() => setPhase("quiz"), 300);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      const quizResult = calculateResults(newAnswers, selectedTrack!);
      setResult(quizResult);
      setTimeout(() => setPhase("contact"), 400);

      try {
        fetch(`${API_BASE_URL}/api/founder-focus-completed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scores: quizResult.scores,
            overallScore: quizResult.overallScore,
            totalScore: quizResult.totalScore,
            topBlocker: quizResult.topBlocker,
            track: selectedTrack,
            trackLabel: TRACK_LABELS[selectedTrack!],
          }),
        });
      } catch (e) {
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleCommunitySignup = async () => {
    if (!signupEmail || !signupName || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!agreedToContract) {
      toast.error("Please agree to the Community Free Membership Agreement to continue");
      return;
    }

    setIsCreatingAccount(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          name: signupName,
          password: signupPassword,
          quizResult: result,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      try {
        await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signupEmail.toLowerCase().trim(),
            role: "entrepreneur",
            contractVersion: COMMUNITY_FREE_CONTRACT_VERSION,
            contractText: COMMUNITY_FREE_CONTRACT,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (contractErr) {
        console.error("Contract acceptance save error (non-blocking):", contractErr);
      }

      setAccountCreated(true);
      toast.success("Account created! You can now log in to your dashboard.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // ── Landing ──
  if (phase === "landing") {
    return (
      <div className="flex flex-col">
        <section className="pt-20 pb-12 md:pt-24 md:pb-16" style={{ backgroundColor: "#FAF9F7" }}>
          <div className="container px-4 mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-snug tracking-tight mb-5" style={{ color: "#0D566C" }} data-testid="text-quiz-title">
              Founder Focus Score
            </h1>
            <p className="text-xl md:text-2xl font-display font-medium mb-4" style={{ color: "#4B3F72" }}>
              Discover your biggest growth blocker in under five minutes.
            </p>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "#4A4A4A" }}>
              Answer 8 personalized questions based on your profile and get a clear diagnosis of what is holding you back, plus one concrete step to move forward this week.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
              {[
                { icon: <Clock className="h-5 w-5" style={{ color: "#F5C542" }} />, label: "5 minutes" },
                { icon: <Target className="h-5 w-5" style={{ color: "#F5C542" }} />, label: "Personalized" },
                { icon: <Zap className="h-5 w-5" style={{ color: "#F5C542" }} />, label: "No signup required" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.5)" }}>
                  {item.icon}
                  <span className="text-sm font-medium" style={{ color: "#4A4A4A" }}>{item.label}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="h-14 px-10 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              onClick={() => setPhase("segmentation")}
              data-testid="button-start-quiz"
            >
              Start the diagnostic <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-20" style={{ backgroundColor: "#F3F3F3" }}>
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-12" style={{ color: "#0D566C" }}>How it works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: "1", title: "Tell us", desc: "Select the profile that best describes you." },
                { num: "2", title: "Answer", desc: "Respond to 8 short, personalized questions about your current challenges." },
                { num: "3", title: "Discover", desc: "See your primary blocker across four key areas of growth." },
                { num: "4", title: "Act", desc: "Receive one clear action step to take this week." },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold" style={{ backgroundColor: "rgba(245,197,66,0.2)", color: "#0D566C" }}>
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: "#0D566C" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Segmentation ──
  if (phase === "segmentation") {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Getting started</span>
              <span className="text-sm font-medium" style={{ color: "#0D566C" }}>Step 1 of 2</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#E8E8E8" }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: "5%", backgroundColor: "#FF6B5C" }} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 leading-tight text-center" style={{ color: "#0D566C" }} data-testid="text-segmentation-question">
              {SEGMENTATION_QUESTION.question}
            </h2>

            <div className="space-y-4 mb-10">
              {SEGMENTATION_QUESTION.options.map((option, i) => (
                <button
                  key={i}
                  className="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white"
                  style={{ borderColor: "#E8E8E8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF6B5C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E8E8"; }}
                  onClick={() => handleSegmentSelect(i)}
                  data-testid={`button-segment-${i}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(245,197,66,0.15)", color: "#F5C542" }}>
                      {segmentIcons[i]}
                    </div>
                    <span className="text-lg font-medium" style={{ color: "#4A4A4A" }}>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-start">
              <Button
                variant="ghost"
                onClick={() => setPhase("landing")}
                className="font-medium"
                style={{ color: "#8A8A8A" }}
                data-testid="button-back-landing"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  if (phase === "quiz" && selectedTrack) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const selectedAnswer = answers[currentQuestion];

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
                  {TRACK_LABELS[selectedTrack]}
                </span>
                <span className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              <span className="text-sm font-medium" style={{ color: "#0D566C" }}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#E8E8E8" }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: "#FF6B5C" }} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 leading-tight" style={{ color: "#0D566C" }} data-testid={`text-question-${currentQuestion}`}>
              {question.question}
            </h2>

            <div className="space-y-4 mb-10">
              {question.answers.map((answer, i) => (
                <button
                  key={i}
                  className="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: selectedAnswer === i ? "rgba(255,107,92,0.06)" : "#FFFFFF",
                    borderColor: selectedAnswer === i ? "#FF6B5C" : "#E8E8E8",
                  }}
                  onMouseEnter={(e) => { if (selectedAnswer !== i) e.currentTarget.style.borderColor = "#FF6B5C"; }}
                  onMouseLeave={(e) => { if (selectedAnswer !== i) e.currentTarget.style.borderColor = "#E8E8E8"; }}
                  onClick={() => handleAnswer(i)}
                  data-testid={`button-answer-${currentQuestion}-${i}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: selectedAnswer === i ? "#FF6B5C" : "rgba(13,86,108,0.08)",
                        color: selectedAnswer === i ? "#FFFFFF" : "#0D566C",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-lg" style={{ color: "#4A4A4A" }}>{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentQuestion === 0) {
                    setPhase("segmentation");
                  } else {
                    handlePrevious();
                  }
                }}
                className="font-medium"
                style={{ color: "#8A8A8A" }}
                data-testid="button-previous"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {currentQuestion === 0 ? "Change Profile" : "Previous"}
              </Button>
              <div className="flex gap-1.5">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === currentQuestion ? "#FF6B5C" : answers[i] >= 0 ? "rgba(255,107,92,0.4)" : "#E8E8E8",
                    }}
                  />
                ))}
              </div>
              <div className="w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Contact Info (after Q8) ──
  if (phase === "contact" && result) {
    const handleSeeResults = async () => {
      if (contactName.trim() && contactEmail.trim()) {
        setIsAutoCreating(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/community/auto-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: contactEmail.trim(),
              name: contactName.trim(),
              quizResult: result,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setAutoAccountCreated(true);
            try {
              await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: contactEmail.toLowerCase().trim(),
                  role: "entrepreneur",
                  contractVersion: COMMUNITY_FREE_CONTRACT_VERSION,
                  contractText: COMMUNITY_FREE_CONTRACT,
                  userAgent: navigator.userAgent,
                }),
              });
            } catch (contractErr) {
              console.error("Contract acceptance save error (non-blocking):", contractErr);
            }
          } else {
            if (data.error?.includes("already exists")) {
              setAutoAccountCreated(true);
            } else {
              console.error("[AUTO SIGNUP] Error:", data.error);
            }
          }
        } catch (err) {
          console.error("[AUTO SIGNUP] Network error:", err);
        } finally {
          setIsAutoCreating(false);
        }
      }
      setPhase("results");
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
                  Almost Done
                </span>
                <span className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Last Step</span>
              </div>
              <span className="text-sm font-medium" style={{ color: "#0D566C" }}>100%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#E8E8E8" }}>
              <div className="h-2 rounded-full transition-all duration-500" style={{ width: "100%", backgroundColor: "#FF6B5C" }} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 leading-tight" style={{ color: "#0D566C" }} data-testid="text-contact-title">
              Where should we send your results?
            </h2>
            <p className="text-lg mb-10" style={{ color: "#8A8A8A" }}>
              Enter your details below so we can save your Founder Focus Score and set up your free dashboard.
            </p>

            <div className="space-y-4 mb-10 max-w-lg">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#4A4A4A" }}>Full Name</label>
                <Input
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  autoComplete="name"
                  className="h-12 rounded-xl text-base"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A" }}
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#4A4A4A" }}>Email Address</label>
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  autoComplete="email"
                  className="h-12 rounded-xl text-base"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A" }}
                  data-testid="input-contact-email"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setPhase("quiz");
                  setCurrentQuestion(questions.length - 1);
                }}
                className="font-medium"
                style={{ color: "#8A8A8A" }}
                data-testid="button-back-to-quiz"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSeeResults}
                disabled={isAutoCreating}
                className="rounded-full px-8 h-12 font-semibold transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                data-testid="button-see-results"
              >
                {isAutoCreating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
                ) : (
                  <>See My Results <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (phase === "results" && result && selectedTrack) {
    const trackBlocker = TRACK_BLOCKER_INFO[selectedTrack][result.primaryBlocker];
    const blocker = trackBlocker || BLOCKER_INFO[result.primaryBlocker];

    return (
      <div className="flex flex-col">
        {/* Results Header */}
        <section className="pt-28 pb-12 md:pt-36 md:pb-16" style={{ backgroundColor: "#FAF9F7" }}>
          <div className="container px-4 mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3 inline-block px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.08)", color: "#0D566C" }}>
              Your Results
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3" style={{ color: "#0D566C" }} data-testid="text-results-title">
              Your Founder Focus Score
            </h1>
            <p className="text-sm" style={{ color: "#8A8A8A" }}>
              Track: <span className="font-medium" style={{ color: "#4B3F72" }}>{TRACK_LABELS[selectedTrack]}</span>
            </p>
          </div>
        </section>

        {/* Score + Blocker Cards */}
        <section className="pb-12" style={{ backgroundColor: "#FAF9F7" }}>
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Score Circle */}
              <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 2px 16px rgba(224,224,224,0.5)" }}>
                <div className="relative w-36 h-36 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E8E8" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#FF6B5C" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.totalScore / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-display font-bold" style={{ color: "#0D566C" }} data-testid="text-score-value">{result.totalScore}</span>
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: "#8A8A8A" }}>
                  {result.totalScore >= 80 ? "Strong foundation" : result.totalScore >= 60 ? "Solid but blocked" : "High friction"}
                </p>
              </div>

              {/* Primary Blocker */}
              <div className="rounded-2xl p-8 text-center flex flex-col justify-center" style={{ backgroundColor: categoryAccentColors[result.primaryBlocker] }}>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 text-white">
                  {categoryIcons[result.primaryBlocker]}
                </div>
                <p className="text-white/70 text-sm uppercase tracking-wider mb-2">Primary Blocker</p>
                <h2 className="text-2xl font-display font-bold text-white" data-testid="text-primary-blocker">{blocker.title}</h2>
              </div>
            </div>
          </div>
        </section>

        {/* What This Means */}
        <section className="py-12" style={{ backgroundColor: "#F3F3F3" }}>
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 2px 16px rgba(224,224,224,0.5)" }}>
              <h3 className="text-xl font-display font-bold mb-4" style={{ color: "#0D566C" }}>What This Means</h3>
              <p className="leading-relaxed mb-6" style={{ color: "#4A4A4A" }} data-testid="text-blocker-explanation">{blocker.explanation}</p>
              <div className="p-5 rounded-xl" style={{ backgroundColor: "rgba(245,197,66,0.1)", border: "1px solid rgba(245,197,66,0.3)" }}>
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#F5C542" }} />
                  <div>
                    <p className="font-bold mb-1" style={{ color: "#0D566C" }}>Your Next Action</p>
                    <p className="text-sm" style={{ color: "#4A4A4A" }} data-testid="text-next-action">{blocker.action}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Score Breakdown */}
        <section className="py-12" style={{ backgroundColor: "#F3F3F3" }}>
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "0 2px 16px rgba(224,224,224,0.5)" }}>
              <h3 className="text-xl font-display font-bold mb-6" style={{ color: "#0D566C" }}>Score Breakdown</h3>
              <div className="space-y-5">
                {result.categoryResults.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: categoryAccentColors[cat.category] }}>{categoryIcons[cat.category]}</span>
                        <span className="font-medium" style={{ color: "#0D566C" }}>{cat.category}</span>
                      </div>
                      <span className="text-sm" style={{ color: "#8A8A8A" }}>{cat.score} pts</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: "#E8E8E8" }}>
                      <div
                        className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(cat.percentage, 5)}%`, backgroundColor: categoryAccentColors[cat.category] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {autoAccountCreated ? (
          <section className="py-16 md:py-20" style={{ backgroundColor: "#0D566C" }}>
            <div className="container px-4 mx-auto max-w-3xl">
              <div className="text-center">
                <div className="max-w-md mx-auto rounded-xl p-8" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }} data-testid="text-auto-signup-success">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "#F5C542" }} />
                  <h4 className="text-xl font-display font-bold text-white mb-3">Your Dashboard Is Almost Ready!</h4>
                  <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
                    We've sent an email to <span className="font-semibold text-white">{contactEmail}</span> with a link to set your password.
                  </p>
                  <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: "rgba(245,197,66,0.15)", border: "1px solid rgba(245,197,66,0.3)" }}>
                    <p className="text-sm font-semibold text-white mb-1">Next step:</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                      Open the email from TouchConnectPro and click <strong>"Set Your Password & Log In"</strong> to create your password and access your dashboard.
                    </p>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Check your inbox (and spam folder) for the email.
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 md:py-20" style={{ backgroundColor: "#0D566C" }}>
            <div className="container px-4 mx-auto max-w-3xl">
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto mb-4" style={{ color: "#F5C542" }} />
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3" data-testid="text-community-cta">
                  Join the Free Entrepreneur Community
                </h3>
                <p className="mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Sign up with your email and password to unlock your dashboard. Access clarity and focus tools, priority-setting exercises, and connect with coaches and other founders to accelerate your next steps.
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
                  {[
                    { label: "Focus tools", icon: <Target className="h-4 w-4" /> },
                    { label: "Coach access", icon: <CheckCircle className="h-4 w-4" /> },
                    { label: "100% free", icon: <Zap className="h-4 w-4" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
                {!accountCreated ? (
                  <form className="max-w-md mx-auto space-y-3" onSubmit={(e) => { e.preventDefault(); handleCommunitySignup(); }} autoComplete="off">
                    <Input
                      name="signup-name"
                      id="signup-name"
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      autoComplete="name"
                      className="h-12 rounded-xl border-white/20 text-white placeholder:text-white/40"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      data-testid="input-signup-name"
                    />
                    <Input
                      name="signup-email"
                      id="signup-email"
                      type="email"
                      placeholder="Your email address"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      autoComplete="email"
                      className="h-12 rounded-xl border-white/20 text-white placeholder:text-white/40"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      data-testid="input-signup-email"
                    />
                    <Input
                      name="signup-password"
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password (min 6 characters)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-12 rounded-xl border-white/20 text-white placeholder:text-white/40"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      data-testid="input-signup-password"
                    />
                    <div className="text-left">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedToContract}
                          onChange={(e) => setAgreedToContract(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded"
                          style={{ accentColor: "#FF6B5C" }}
                          data-testid="checkbox-agree-contract"
                        />
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowContractText(!showContractText)}
                            className="underline transition-colors"
                            style={{ color: "#F5C542" }}
                            data-testid="button-view-contract"
                          >
                            Community Free Membership Agreement
                          </button>
                        </span>
                      </label>
                      {showContractText && (
                        <div className="mt-3 max-h-48 overflow-y-auto rounded-lg p-4 text-xs whitespace-pre-wrap" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                          {COMMUNITY_FREE_CONTRACT}
                        </div>
                      )}
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 font-semibold rounded-full transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                      disabled={isCreatingAccount}
                      data-testid="button-join-community"
                    >
                      {isCreatingAccount ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your account...</>
                      ) : (
                        <>Join the Community — Free <ArrowRight className="ml-2 h-5 w-5" /></>
                      )}
                    </Button>
                    <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.5)" }}>No credit card required. No commitment.</p>
                  </form>
                ) : (
                  <div className="max-w-md mx-auto rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }} data-testid="text-signup-success">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: "#F5C542" }} />
                    <h4 className="text-lg font-bold text-white mb-2">Welcome to the Community!</h4>
                    <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Your account is ready. Log in to access your entrepreneur dashboard.
                    </p>
                    <Link href="/login">
                      <Button
                        className="rounded-full font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                        data-testid="button-go-to-login"
                      >
                        Go to Login <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  }

  return null;
}
