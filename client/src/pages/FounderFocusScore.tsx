import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Target, Compass, DollarSign, Settings, Rocket, CheckCircle, Loader2, Zap, Clock, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { QUIZ_QUESTIONS, calculateResults, BLOCKER_INFO, type QuizResult, type Category } from "@/lib/founderFocusData";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

const categoryIcons: Record<Category, React.ReactNode> = {
  Strategy: <Compass className="h-6 w-6" />,
  Sales: <DollarSign className="h-6 w-6" />,
  Operations: <Settings className="h-6 w-6" />,
  Execution: <Rocket className="h-6 w-6" />,
};

const categoryColors: Record<Category, string> = {
  Strategy: "from-indigo-500 to-indigo-600",
  Sales: "from-emerald-500 to-emerald-600",
  Operations: "from-amber-500 to-amber-600",
  Execution: "from-cyan-500 to-cyan-600",
};

const categoryTextColors: Record<Category, string> = {
  Strategy: "text-indigo-500",
  Sales: "text-emerald-500",
  Operations: "text-amber-500",
  Execution: "text-cyan-500",
};

const categoryBgColors: Record<Category, string> = {
  Strategy: "bg-indigo-500/10 border-indigo-500/30",
  Sales: "bg-emerald-500/10 border-emerald-500/30",
  Operations: "bg-amber-500/10 border-amber-500/30",
  Execution: "bg-cyan-500/10 border-cyan-500/30",
};

type Phase = "landing" | "quiz" | "results" | "trial-signup";

export default function FounderFocusScore() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(8).fill(-1));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [trialEmail, setTrialEmail] = useState("");
  const [trialName, setTrialName] = useState("");
  const [isCreatingTrial, setIsCreatingTrial] = useState(false);
  const [trialCreated, setTrialCreated] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      const quizResult = calculateResults(newAnswers);
      setResult(quizResult);
      setTimeout(() => setPhase("results"), 400);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTrialSignup = async () => {
    if (!trialEmail || !trialName) {
      toast.error("Please enter your name and email");
      return;
    }

    setIsCreatingTrial(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trialEmail,
          name: trialName,
          quizResult: result,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create trial");

      setTrialCreated(true);
      toast.success("Trial activated! Check your email for login instructions.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsCreatingTrial(false);
    }
  };

  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-950 to-indigo-900/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 px-4 py-2 bg-cyan-500/10 text-cyan-300 border-cyan-500/30" data-testid="badge-free-tool">
                Focus Score
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400" data-testid="text-quiz-title">
                Founder Focus Score
              </h1>
              <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                Discover your single biggest growth blocker in under 5 minutes.
              </p>
              <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                Answer 8 quick questions and get a personalized diagnosis of what's holding your business back, plus one concrete action to fix it.
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
                {[
                  { icon: <Clock className="h-5 w-5 text-cyan-400" />, label: "5 minutes" },
                  { icon: <Target className="h-5 w-5 text-cyan-400" />, label: "Personalized" },
                  { icon: <Zap className="h-5 w-5 text-cyan-400" />, label: "No signup" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 border border-white/10">
                    {item.icon}
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="h-14 px-10 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] hover:scale-105 transition-all"
                onClick={() => { setPhase("quiz"); setCurrentQuestion(0); }}
                data-testid="button-start-quiz"
              >
                Start the Diagnostic <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-slate-800">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-center mb-10 text-white">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { num: "1", title: "Answer", desc: "8 quick questions about your business challenges" },
                { num: "2", title: "Discover", desc: "Your primary blocker across 4 key areas" },
                { num: "3", title: "Learn", desc: "What it means and why it matters" },
                { num: "4", title: "Act", desc: "One concrete step to take this week" },
              ].map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-cyan-400 font-bold">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "quiz") {
    const question = QUIZ_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
    const selectedAnswer = answers[currentQuestion];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="text-sm text-cyan-400 font-medium">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-800" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-10 text-white leading-tight" data-testid={`text-question-${currentQuestion}`}>
              {question.question}
            </h2>

            <div className="space-y-4 mb-10">
              {question.answers.map((answer, i) => (
                <button
                  key={i}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                    selectedAnswer === i
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white ring-1 ring-cyan-500/30"
                      : "bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                  onClick={() => handleAnswer(i)}
                  data-testid={`button-answer-${currentQuestion}-${i}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      selectedAnswer === i
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-lg">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="text-slate-400 hover:text-white"
                data-testid="button-previous"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <div className="flex gap-1.5">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentQuestion
                        ? "bg-cyan-500"
                        : answers[i] >= 0
                        ? "bg-cyan-500/40"
                        : "bg-slate-700"
                    }`}
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

  if (phase === "results" && result) {
    const blocker = BLOCKER_INFO[result.primaryBlocker];

    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
              Your Results
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-results-title">
              Your Founder Focus Score
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-slate-900 border-slate-700 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="relative w-36 h-36 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#scoreGradient)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.totalScore / 100) * 264} 264`}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-display font-bold text-white" data-testid="text-score-value">{result.totalScore}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {result.totalScore >= 80 ? "Strong foundation" : result.totalScore >= 60 ? "Solid but blocked" : "High friction"}
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${categoryColors[result.primaryBlocker]} border-none overflow-hidden`}>
              <CardContent className="p-8 text-center flex flex-col justify-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  {categoryIcons[result.primaryBlocker]}
                </div>
                <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Primary Blocker</p>
                <h2 className="text-2xl font-display font-bold text-white mb-2" data-testid="text-primary-blocker">{blocker.title}</h2>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-700 mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white mb-4">What This Means</h3>
              <p className="text-slate-300 leading-relaxed mb-6" data-testid="text-blocker-explanation">{blocker.explanation}</p>
              <div className={`p-5 rounded-xl border ${categoryBgColors[result.primaryBlocker]}`}>
                <div className="flex items-start gap-3">
                  <Target className={`h-5 w-5 ${categoryTextColors[result.primaryBlocker]} shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-bold text-white mb-1">Your Next Action</p>
                    <p className="text-slate-300 text-sm" data-testid="text-next-action">{blocker.action}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 mb-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white mb-6">Score Breakdown</h3>
              <div className="space-y-4">
                {result.categoryResults.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={categoryTextColors[cat.category]}>{categoryIcons[cat.category]}</span>
                        <span className="text-white font-medium">{cat.category}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{cat.score} pts</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${categoryColors[cat.category]}`}
                        style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/80 to-cyan-900/80 border-indigo-500/30 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <BarChart3 className="h-10 w-10 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-white mb-3" data-testid="text-trial-cta">
                Unlock the Entrepreneur Dashboard for 7 Days
              </h3>
              <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                Get free access to clarity and focus tools, priority setting exercises, and direct mentor messaging to accelerate your next steps.
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
                {[
                  { label: "Focus tools", icon: <Target className="h-4 w-4" /> },
                  { label: "Mentor messaging", icon: <CheckCircle className="h-4 w-4" /> },
                  { label: "7 days free", icon: <Clock className="h-4 w-4" /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-indigo-200 bg-white/5 rounded-lg px-3 py-2 justify-center">
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
              {!trialCreated ? (
                <div className="max-w-md mx-auto space-y-3">
                  <Input
                    placeholder="Your full name"
                    value={trialName}
                    onChange={(e) => setTrialName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                    data-testid="input-trial-name"
                  />
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-12"
                    data-testid="input-trial-email"
                  />
                  <Button
                    size="lg"
                    className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full"
                    onClick={handleTrialSignup}
                    disabled={isCreatingTrial}
                    data-testid="button-activate-trial"
                  >
                    {isCreatingTrial ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your trial...</>
                    ) : (
                      <>Activate Free Trial <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </Button>
                  <p className="text-xs text-slate-400 text-center">No credit card required. No commitment.</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6" data-testid="text-trial-success">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-white mb-2">Trial Activated!</h4>
                  <p className="text-slate-300 text-sm mb-4">
                    Check your email for login instructions. Your 7-day trial starts now.
                  </p>
                  <Link href="/login">
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-full" data-testid="button-login-trial">
                      Log In to Your Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white"
              onClick={() => { setPhase("landing"); setAnswers(new Array(8).fill(-1)); setCurrentQuestion(0); setResult(null); }}
              data-testid="button-retake"
            >
              Retake the diagnostic
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
