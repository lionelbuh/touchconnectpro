import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, BookOpen, DollarSign, Users, Settings, Star, Save, Loader2, Link as LinkIcon, Target, LogOut, X, MessageSquare, AlertCircle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";

const EXPERTISE_OPTIONS = [
  "Business Planning",
  "Pitch Preparation",
  "Market Research",
  "Product Development",
  "Marketing Strategy",
  "Sales & Go-to-Market",
  "Fundraising & Investor Relations",
  "Financial Planning",
  "Operations & Scaling",
  "Tech & Engineering",
  "Legal & Compliance",
  "HR & Team Building",
  "Customer Discovery",
  "Brand Strategy",
  "Digital Marketing",
  "Content Marketing",
  "Social Media Strategy",
  "Customer Support",
  "Growth Hacking",
  "Data Analysis"
];

interface CoachProfile {
  id: string;
  full_name: string;
  email: string;
  linkedin: string | null;
  expertise: string;
  focus_areas: string;
  hourly_rate: string;
  country: string;
  state: string | null;
  is_disabled?: boolean;
}

export default function DashboardCoach() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expertise, setExpertise] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages">("overview");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [coachReadMessageIds, setCoachReadMessageIds] = useState<string[]>([]);

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

        // First try to get session from localStorage (faster, more reliable)
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        
        // If no session, try getUser() as fallback
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }
        
        if (!user?.email) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/coaches/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Parse comma-separated expertise string into array
          setExpertise(data.expertise ? data.expertise.split(", ").map((e: string) => e.trim()).filter((e: string) => e) : []);
          setFocusAreas(data.focus_areas || "");
          setHourlyRate(data.hourly_rate || "");
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
    const savedReadIds = localStorage.getItem("tcp_coachReadMessageIds");
    if (savedReadIds) {
      setCoachReadMessageIds(JSON.parse(savedReadIds));
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
        .filter((m: any) => m.to_email === profile.email && m.from_email === "admin@touchconnectpro.com" && !coachReadMessageIds.includes(m.id))
        .map((m: any) => m.id);
      
      if (adminMessagesToMark.length > 0) {
        const updatedReadIds = [...coachReadMessageIds, ...adminMessagesToMark];
        setCoachReadMessageIds(updatedReadIds);
        localStorage.setItem("tcp_coachReadMessageIds", JSON.stringify(updatedReadIds));
      }
    }
  }, [activeTab, adminMessages, profile?.email, coachReadMessageIds]);

  // Calculate unread message count
  const unreadMessageCount = adminMessages.filter(
    (m: any) => m.to_email === profile?.email && m.from_email === "admin@touchconnectpro.com" && !coachReadMessageIds.includes(m.id)
  ).length;

  const handleExpertiseChange = (selectedOptions: HTMLCollection) => {
    const selected = Array.from(selectedOptions).map((option: any) => option.value);
    setExpertise(selected as string[]);
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    if (expertise.length === 0) {
      toast.error("Please select at least one area of expertise");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coaches/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertise: expertise.join(", "),
          focusAreas,
          hourlyRate,
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
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className={`h-10 w-10 border border-slate-200 ${profile?.is_disabled ? "bg-red-500" : "bg-cyan-500"}`}>
              <AvatarFallback className="text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "CO"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{profile?.full_name || "Coach"}</div>
              <div className={`text-xs ${profile?.is_disabled ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                {profile?.is_disabled ? "Disabled" : `$${hourlyRate || "0"}/hour`}
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
              <BookOpen className="mr-2 h-4 w-4" /> My Courses
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <DollarSign className="mr-2 h-4 w-4" /> Earnings
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Users className="mr-2 h-4 w-4" /> Students
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
                      <p className="text-red-700 dark:text-red-400">Your coaching account has been disabled. Your profile is currently in view-only mode. Please use the Messages tab to contact the Admin team if you would like to reactivate your account.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                Welcome, {profile?.full_name?.split(" ")[0] || "Coach"}!
              </h1>
              <p className="text-muted-foreground mt-2">
                {profile?.is_disabled 
                  ? "Your profile is currently in view-only mode."
                  : "Manage your coaching profile and start helping entrepreneurs."}
              </p>
            </div>
            {!profile?.is_disabled && (
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-save-profile"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-cyan-600" />
                  Your Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What do you specialize in?</p>
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map(item => (
                      <Badge key={item} variant="secondary" className="bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 flex items-center gap-2 pr-1">
                        {item}
                        {!profile?.is_disabled && (
                          <button
                            onClick={() => removeExpertise(item)}
                            className="hover:text-cyan-700 dark:hover:text-cyan-300"
                            data-testid={`button-remove-expertise-${item}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
                <select 
                  multiple
                  value={expertise}
                  onChange={(e) => handleExpertiseChange(e.target.selectedOptions)}
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="select-coach-expertise"
                  style={{ minHeight: "120px" }}
                >
                  {EXPERTISE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.is_disabled ? "View only" : "Hold Ctrl/Cmd to select multiple options"}</p>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan-600" />
                  Set Your Price
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">You keep 80%, we keep 20%</p>
                <div className="flex gap-2">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center">$</span>
                  <input 
                    type="number" 
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="100"
                    disabled={profile?.is_disabled}
                    className={`flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    data-testid="input-coach-price"
                  />
                  <span className="text-slate-600 dark:text-slate-400 flex items-center">/hour</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-cyan-600" />
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
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="input-linkedin"
                />
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-600" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Topics you help entrepreneurs with</p>
                <textarea 
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  placeholder="e.g., Business planning, pitch preparation, market research..."
                  rows={3}
                  disabled={profile?.is_disabled}
                  className={`w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 ${profile?.is_disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  data-testid="input-focus-areas"
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-lg">
            <h3 className="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Revenue Share Model</h3>
            <p className="text-sm text-cyan-800 dark:text-cyan-200">You set your hourly rate. We handle payments and take 20%. You keep 80% of every session.</p>
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
                    <MessageSquare className="h-5 w-5 text-cyan-600" />
                    Send a Message to Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Type your message to the admin team..."
                    className="w-full min-h-24 p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-send-admin-message"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-600" />
                    Message History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminMessages.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {[...adminMessages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => (
                          <div 
                            key={msg.id} 
                            className={`p-4 rounded-lg ${msg.from_email === "admin@touchconnectpro.com" ? "bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-l-cyan-500" : "bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-slate-400"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-semibold ${msg.from_email === "admin@touchconnectpro.com" ? "text-cyan-700 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>
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
