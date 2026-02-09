import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Target, Compass, DollarSign, Settings, Rocket, CheckCircle, Lock,
  Clock, AlertTriangle, Send, MessageSquare, BarChart3, Lightbulb,
  Users, FileText, TrendingUp, LogOut, ArrowRight, Loader2, GraduationCap
} from "lucide-react";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { BLOCKER_INFO, type Category } from "@/lib/founderFocusData";
import { Link } from "wouter";

const categoryIcons: Record<Category, React.ReactNode> = {
  Strategy: <Compass className="h-5 w-5" />,
  Sales: <DollarSign className="h-5 w-5" />,
  Operations: <Settings className="h-5 w-5" />,
  Execution: <Rocket className="h-5 w-5" />,
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

type Tab = "focus" | "plan" | "coaches" | "messages" | "profile";

interface TrialStatus {
  exists: boolean;
  id?: number;
  status?: string;
  trialStart?: string;
  trialEnd?: string;
  daysRemaining?: number;
  isExpired?: boolean;
  quizResult?: any;
  primaryBlocker?: Category;
  mentorId?: string;
}

export default function TrialDashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("focus");
  const [userEmail, setUserEmail] = useState("");
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [priorities, setPriorities] = useState<string[]>(["", "", ""]);
  const [savingPriorities, setSavingPriorities] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mentorInfo, setMentorInfo] = useState<{ mentorName: string; mentorEmail: string } | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = await getSupabase();
      if (!supabase) { navigate("/login"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        navigate("/login");
        return;
      }

      setUserEmail(session.user.email);
      await fetchTrialStatus(session.user.email);
    } catch (err) {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrialStatus = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/status/${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (!data.exists) {
        navigate("/dashboard-entrepreneur");
        return;
      }

      setTrialStatus(data);
      if (data.weeklyPriorities && Array.isArray(data.weeklyPriorities)) {
        const loaded = data.weeklyPriorities;
        setPriorities([loaded[0] || "", loaded[1] || "", loaded[2] || ""]);
      }
      if (data.exists && data.id && data.mentorId) {
        fetchMentorInfo(data.id);
        fetchMessages(data.id);
      }
    } catch (err) {
      console.error("Failed to fetch trial status:", err);
    }
  };

  const fetchMentorInfo = async (trialId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/${trialId}/mentor-info`);
      const data = await res.json();
      if (data.assigned) {
        setMentorInfo({ mentorName: data.mentorName, mentorEmail: data.mentorEmail });
      }
    } catch (err) {
      console.error("Failed to fetch mentor info:", err);
    }
  };

  const fetchMessages = async (trialId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/${trialId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !trialStatus?.id) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/${trialStatus.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }
      setNewMessage("");
      toast.success("Message sent!");
      await fetchMessages(trialStatus.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSavePriorities = async () => {
    setSavingPriorities(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trial/save-priorities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, priorities }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Priorities saved!");
    } catch (err) {
      toast.error("Failed to save priorities");
    } finally {
      setSavingPriorities(false);
    }
  };

  const handleLogout = async () => {
    const supabase = await getSupabase();
    if (supabase) await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!trialStatus) return null;

  const isExpired = trialStatus.isExpired;
  const blocker = trialStatus.primaryBlocker ? BLOCKER_INFO[trialStatus.primaryBlocker] : null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; locked: boolean }[] = [
    { id: "focus", label: "Clarity & Focus", icon: <Target className="h-4 w-4" />, locked: false },
    { id: "plan", label: "Business Plan", icon: <FileText className="h-4 w-4" />, locked: true },
    { id: "coaches", label: "Coaches", icon: <GraduationCap className="h-4 w-4" />, locked: true },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, locked: !trialStatus.mentorId },
    { id: "profile", label: "Profile", icon: <Users className="h-4 w-4" />, locked: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Trial Banner */}
      {!isExpired ? (
        <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 px-4" data-testid="banner-trial-active">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Trial ends in {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? "s" : ""}
              </span>
            </div>
            <Link href="/become-entrepreneur">
              <Button size="sm" variant="secondary" className="h-7 text-xs" data-testid="button-upgrade-banner">
                Apply for Full Access
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-3 px-4" data-testid="banner-trial-expired">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Your trial has ended. Apply to continue your journey.</span>
            </div>
            <Link href="/become-entrepreneur">
              <Button size="sm" variant="secondary" className="h-7 text-xs" data-testid="button-apply-expired">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold" data-testid="text-dashboard-title">Entrepreneur Dashboard</h1>
            <p className="text-slate-400 text-sm">{userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30" data-testid="badge-trial-status">
              {isExpired ? "Trial Expired" : "Trial Active"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.locked && setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                  : tab.locked
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              disabled={tab.locked}
              data-testid={`button-tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
              {tab.locked && <Lock className="h-3 w-3 text-slate-600" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "focus" && (
          <div className="space-y-8">
            {/* Quiz Result Recap */}
            {blocker && trialStatus.quizResult && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    Your Founder Focus Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${categoryBgColors[trialStatus.primaryBlocker!]} mb-4`}>
                        <span className={categoryTextColors[trialStatus.primaryBlocker!]}>{categoryIcons[trialStatus.primaryBlocker!]}</span>
                        <span className="font-bold text-white">Primary Blocker: {blocker.title}</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4" data-testid="text-blocker-recap">
                        {blocker.explanation}
                      </p>
                    </div>
                    <div className={`p-5 rounded-xl border ${categoryBgColors[trialStatus.primaryBlocker!]}`}>
                      <div className="flex items-start gap-3">
                        <Target className={`h-5 w-5 ${categoryTextColors[trialStatus.primaryBlocker!]} shrink-0 mt-0.5`} />
                        <div>
                          <p className="font-bold text-white mb-1">Your Next Action</p>
                          <p className="text-slate-300 text-sm">{blocker.action}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {trialStatus.quizResult?.categoryResults && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Score Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {trialStatus.quizResult.categoryResults.map((cat: any) => (
                          <div key={cat.category} className="text-center">
                            <div className={`text-2xl font-bold ${categoryTextColors[cat.category as Category]}`}>{cat.score}</div>
                            <div className="text-xs text-slate-400">{cat.category}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Weekly Priority Definition */}
            <Card className={`bg-slate-900 border-slate-700 ${isExpired ? "opacity-60 pointer-events-none" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Weekly Priority Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-6">
                  Define your top 3 priorities for this week. Focus on actions that address your primary blocker.
                </p>
                <div className="space-y-3 mb-6">
                  {priorities.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <Input
                        value={p}
                        onChange={(e) => {
                          const newP = [...priorities];
                          newP[i] = e.target.value;
                          setPriorities(newP);
                        }}
                        placeholder={`Priority ${i + 1}...`}
                        className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        data-testid={`input-priority-${i}`}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSavePriorities}
                  disabled={savingPriorities}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  data-testid="button-save-priorities"
                >
                  {savingPriorities ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Save Priorities
                </Button>
              </CardContent>
            </Card>

            {/* Focus Exercise */}
            <Card className={`bg-slate-900 border-slate-700 ${isExpired ? "opacity-60 pointer-events-none" : ""}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-indigo-500" />
                  Decision Focus Exercise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">
                  Use this exercise to make better decisions aligned with your goals.
                </p>
                <div className="space-y-4">
                  {[
                    { q: "What is the single most important decision I need to make this week?", hint: "Think about what's blocking your progress the most." },
                    { q: "What would happen if I didn't make this decision?", hint: "Consider the cost of inaction." },
                    { q: "What information do I need to decide?", hint: "List specific facts or data points." },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-white font-medium text-sm mb-1">{item.q}</p>
                      <p className="text-slate-500 text-xs">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "messages" && trialStatus.mentorId && (
          <Card className={`bg-slate-900 border-slate-700 ${isExpired ? "opacity-60 pointer-events-none" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-cyan-500" />
                Mentor Messaging
                {mentorInfo && (
                  <span className="text-sm font-normal text-slate-400 ml-2">with {mentorInfo.mentorName}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] flex flex-col">
                <div className="flex-1 space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                  {loadingMessages ? (
                    <div className="text-center py-12 text-slate-500">
                      <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No messages yet. Start a conversation with your mentor.</p>
                      <p className="text-xs mt-1">Text only. One-to-one messaging.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`p-3 rounded-lg max-w-[80%] ${
                        msg.from_email === userEmail 
                          ? "bg-cyan-500/10 border border-cyan-500/20 ml-auto" 
                          : "bg-slate-800 border border-slate-700"
                      }`}>
                        <p className="text-xs text-slate-500 mb-1 font-medium">{msg.from_name}</p>
                        <p className="text-sm text-white">{msg.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
                {!isExpired && (
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !sendingMessage && newMessage.trim() && handleSendMessage()}
                      placeholder="Type a message..."
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      data-testid="input-trial-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      data-testid="button-send-trial-message"
                    >
                      {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Section Display */}
        {(activeTab === "plan" || activeTab === "coaches" || activeTab === "profile" || (activeTab === "messages" && !trialStatus.mentorId)) && (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="py-16 text-center">
              <Lock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2" data-testid="text-locked-section">
                {activeTab === "messages" ? "Mentor Not Yet Assigned" : "Available After Membership"}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                {activeTab === "messages" 
                  ? "An admin will assign a mentor to your trial account. You'll be able to message them directly once assigned."
                  : "This section becomes available when you become a full member. Apply to unlock your complete entrepreneur dashboard."
                }
              </p>
              {activeTab !== "messages" && (
                <Link href="/become-entrepreneur">
                  <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950" data-testid="button-apply-locked">
                    Apply for Membership <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Post-Trial CTA */}
        {isExpired && (
          <Card className="bg-gradient-to-br from-indigo-900/50 to-cyan-900/50 border-indigo-500/30 mt-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3" data-testid="text-expired-cta">Ready to Continue Your Journey?</h3>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                Your trial has ended but your progress is saved. Apply to become a full member and unlock dedicated mentorship, business planning tools, and the complete entrepreneur dashboard.
              </p>
              <Link href="/become-entrepreneur">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full" data-testid="button-apply-full">
                  Apply for Full Membership <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
