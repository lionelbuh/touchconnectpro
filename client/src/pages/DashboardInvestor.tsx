import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Zap, Briefcase, TrendingUp, Settings, DollarSign, Target, Save, Loader2, Building2, Link as LinkIcon, LogOut, MessageSquare, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";

interface InvestorProfile {
  id: string;
  full_name: string;
  email: string;
  linkedin: string | null;
  fund_name: string;
  investment_focus: string;
  investment_preference: string;
  investment_amount: string;
  country: string;
  state: string | null;
  is_disabled?: boolean;
}

export default function DashboardInvestor() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [fundName, setFundName] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentPreference, setInvestmentPreference] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages">("overview");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [investorReadMessageIds, setInvestorReadMessageIds] = useState<string[]>([]);

  const handleLogout = async () => {
    try {
      const supabase = await getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = await getSupabase();
        if (!supabase) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setLoading(false);
          return;
        }

        setUserEmail(user.email);

        const response = await fetch(`${API_BASE_URL}/api/investors/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFundName(data.fund_name || "");
          setInvestmentFocus(data.investment_focus || "");
          setInvestmentPreference(data.investment_preference || "");
          setInvestmentAmount(data.investment_amount || "");
          setLinkedin(data.linkedin || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Load read message IDs from localStorage
  useEffect(() => {
    const savedReadIds = localStorage.getItem("tcp_investorReadMessageIds");
    if (savedReadIds) {
      setInvestorReadMessageIds(JSON.parse(savedReadIds));
    }
  }, []);

  // Load admin messages from database
  useEffect(() => {
    async function loadMessages() {
      if (!profile?.email) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(profile.email)}`);
        if (response.ok) {
          const data = await response.json();
          setAdminMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
    loadMessages();
  }, [profile?.email]);

  // Mark admin messages as read when viewing messages tab
  useEffect(() => {
    if (activeTab === "messages" && profile?.email) {
      const adminMessagesToMark = adminMessages
        .filter((m: any) => m.to_email === profile.email && m.from_email === "admin@touchconnectpro.com" && !investorReadMessageIds.includes(m.id))
        .map((m: any) => m.id);
      
      if (adminMessagesToMark.length > 0) {
        const updatedReadIds = [...investorReadMessageIds, ...adminMessagesToMark];
        setInvestorReadMessageIds(updatedReadIds);
        localStorage.setItem("tcp_investorReadMessageIds", JSON.stringify(updatedReadIds));
      }
    }
  }, [activeTab, adminMessages, profile?.email, investorReadMessageIds]);

  // Calculate unread message count
  const unreadMessageCount = adminMessages.filter(
    (m: any) => m.to_email === profile?.email && m.from_email === "admin@touchconnectpro.com" && !investorReadMessageIds.includes(m.id)
  ).length;

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/investors/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundName,
          investmentFocus,
          investmentPreference,
          investmentAmount,
          linkedin
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className={`h-10 w-10 border border-slate-200 ${profile?.is_disabled ? "bg-red-500" : "bg-amber-500"}`}>
              <AvatarFallback className="text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "IN"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{profile?.full_name || "Investor"}</div>
              <div className={`text-xs ${profile?.is_disabled ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                {profile?.is_disabled ? "Disabled" : (fundName || "Investment Fund")}
              </div>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            <Button 
              variant={activeTab === "overview" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium"
              onClick={() => setActiveTab("overview")}
              data-testid="button-overview-tab"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button 
              variant={activeTab === "messages" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600 relative"
              onClick={() => setActiveTab("messages")}
              data-testid="button-messages-tab"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
              {unreadMessageCount > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadMessageCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <TrendingUp className="mr-2 h-4 w-4" /> My Investments
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Briefcase className="mr-2 h-4 w-4" /> Portfolio
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Zap className="mr-2 h-4 w-4" /> Deal Flow
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button 
              variant="ghost"
              className="w-full justify-start font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
            {profile?.is_disabled && (
              <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">Account Disabled</h3>
                      <p className="text-red-700 dark:text-red-400">Your investor account has been disabled. Your profile is currently in view-only mode. Please use the Messages tab to contact the Admin team if you would like to reactivate your account.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                Welcome, {profile?.full_name?.split(" ")[0] || "Investor"}!
              </h1>
              <p className="text-muted-foreground mt-2">
                {profile?.is_disabled
                  ? "Your profile is currently in view-only mode."
                  : "Manage your investment profile and access pre-vetted startups."}
              </p>
            </div>
            {!profile?.is_disabled && (
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700"
                data-testid="button-save-profile"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  Fund / Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your investment fund or organization name</p>
                <input
                  type="text"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="Enter fund name..."
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="input-fund-name"
                />
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Investment Preference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What type of investments interest you?</p>
                <select 
                  value={investmentPreference}
                  onChange={(e) => setInvestmentPreference(e.target.value)}
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="select-investment-preference"
                >
                  <option value="">Select investment type...</option>
                  <option value="platform">TouchConnectPro as a whole</option>
                  <option value="projects">Individual Projects</option>
                  <option value="both">Both</option>
                </select>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Investment Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What's your typical check size?</p>
                <select 
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="select-investment-amount"
                >
                  <option value="">Select investment amount...</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="20000-50000">$20,000 - $50,000</option>
                  <option value="50000-100000">$50,000 - $100,000</option>
                  <option value="100000-500000">$100,000 - $500,000</option>
                  <option value="500000-1000000">$500,000 - $1,000,000</option>
                  <option value="1000000plus">$1,000,000+</option>
                </select>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-amber-600" />
                  LinkedIn Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your LinkedIn profile URL</p>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="input-linkedin"
                />
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Investment Focus & Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What industries or sectors do you focus on?</p>
                <textarea 
                  value={investmentFocus}
                  onChange={(e) => setInvestmentFocus(e.target.value)}
                  placeholder="e.g., SaaS, AI/ML, healthtech, fintech, climate tech..."
                  rows={4}
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="input-investment-focus"
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Investment Opportunities</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">Get access to pre-vetted startups that have been through our AI refinement and mentor evaluation process. Connect directly with founders ready for investment.</p>
          </div>
          </>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Messages</h1>
              <p className="text-muted-foreground mb-8">Communicate with the TouchConnectPro admin team.</p>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    Send a Message to Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Type your message to the admin team..."
                    className="w-full min-h-24 p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    data-testid="textarea-admin-message"
                  />
                  <Button 
                    onClick={async () => {
                      if (adminMessage.trim() && profile?.email) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/messages`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fromName: profile.full_name,
                              fromEmail: profile.email,
                              toName: "Admin",
                              toEmail: "admin@touchconnectpro.com",
                              message: adminMessage
                            })
                          });
                          if (response.ok) {
                            const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(profile.email)}`);
                            if (loadResponse.ok) {
                              const data = await loadResponse.json();
                              setAdminMessages(data.messages || []);
                            }
                            setAdminMessage("");
                            toast.success("Message sent to admin!");
                          } else {
                            toast.error("Failed to send message");
                          }
                        } catch (error) {
                          toast.error("Error sending message");
                        }
                      }
                    }}
                    disabled={!adminMessage.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                    data-testid="button-send-admin-message"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    Message History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminMessages.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {adminMessages.map((msg: any) => (
                          <div 
                            key={msg.id} 
                            className={`p-4 rounded-lg ${msg.from_email === "admin@touchconnectpro.com" ? "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-l-amber-500" : "bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-slate-400"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-semibold ${msg.from_email === "admin@touchconnectpro.com" ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                {msg.from_email === "admin@touchconnectpro.com" ? "From Admin" : "You"}
                              </span>
                              <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet. Send a message to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
