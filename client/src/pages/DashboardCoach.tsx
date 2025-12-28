import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, DollarSign, Users, Star, Save, Loader2, Link as LinkIcon, Target, LogOut, X, MessageSquare, AlertCircle, Mail, User, FileText, Upload, CreditCard, CheckCircle2, ExternalLink, Check, Send, Reply, Edit, ClipboardCheck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";
import MyAgreements from "@/components/MyAgreements";

interface StripeConnectStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId?: string;
  email?: string;
}

const FOCUS_AREAS_OPTIONS = [
  "Business Strategy",
  "Pitching & Fundraising",
  "Product & Technology",
  "Marketing & Brand",
  "Sales & Growth",
  "Finance & Analytics",
  "People & Operations",
  "Legal & Compliance",
  "Customer Experience"
];

interface CoachClient {
  id: string;
  name: string;
  email: string;
  status: string;
  joinedAt: string;
}

interface Transaction {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  commission: number;
  netEarnings: number;
  type: string;
  date: string;
  status: string;
}

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

interface CoachRates {
  introCallRate: string;
  sessionRate: string;
  monthlyRate: string;
}

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
  bio?: string | null;
  profile_image?: string | null;
}

function parseRates(hourlyRate: string): CoachRates {
  try {
    const parsed = JSON.parse(hourlyRate);
    if (parsed.introCallRate && parsed.sessionRate && parsed.monthlyRate) {
      return parsed;
    }
  } catch {
    // Legacy format - single rate
  }
  return { introCallRate: "", sessionRate: hourlyRate || "", monthlyRate: "" };
}

export default function DashboardCoach() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expertise, setExpertise] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState("");
  const [introCallRate, setIntroCallRate] = useState("");
  const [sessionRate, setSessionRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "entrepreneurs" | "messages" | "earnings" | "agreements">("overview");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [coachReadMessageIds, setCoachReadMessageIds] = useState<string[]>([]);
  const [coachClients, setCoachClients] = useState<CoachClient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);
  
  // Contact requests state
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [loadingContactRequests, setLoadingContactRequests] = useState(false);
  const [replyingToRequest, setReplyingToRequest] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  // Profile edit mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [originalProfileValues, setOriginalProfileValues] = useState<{
    expertise: string[];
    focusAreas: string;
    introCallRate: string;
    sessionRate: string;
    monthlyRate: string;
    linkedin: string;
    bio: string;
    profileImage: string;
  } | null>(null);

  const enterEditMode = () => {
    setOriginalProfileValues({
      expertise,
      focusAreas,
      introCallRate,
      sessionRate,
      monthlyRate,
      linkedin,
      bio,
      profileImage
    });
    setIsEditingProfile(true);
  };

  const cancelEditMode = () => {
    if (originalProfileValues) {
      setExpertise(originalProfileValues.expertise);
      setFocusAreas(originalProfileValues.focusAreas);
      setIntroCallRate(originalProfileValues.introCallRate);
      setSessionRate(originalProfileValues.sessionRate);
      setMonthlyRate(originalProfileValues.monthlyRate);
      setLinkedin(originalProfileValues.linkedin);
      setBio(originalProfileValues.bio);
      setProfileImage(originalProfileValues.profileImage);
    }
    setIsEditingProfile(false);
    setOriginalProfileValues(null);
  };

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
          user = userData.user || undefined;
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
          // Parse rates (handles both new JSON format and legacy single rate)
          const rates = parseRates(data.hourly_rate || "");
          setIntroCallRate(rates.introCallRate);
          setSessionRate(rates.sessionRate);
          setMonthlyRate(rates.monthlyRate);
          setLinkedin(data.linkedin || "");
          setBio(data.bio || "");
          setProfileImage(data.profile_image || "");
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

  // Load coach clients (entrepreneurs who purchased services)
  useEffect(() => {
    async function loadClients() {
      if (!profile?.id) return;
      setLoadingClients(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/coaches/${profile.id}/clients`);
        if (response.ok) {
          const data = await response.json();
          setCoachClients(data.clients || []);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, [profile?.id]);

  // Load transactions/earnings
  useEffect(() => {
    async function loadTransactions() {
      if (!profile?.id) return;
      setLoadingTransactions(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/coaches/${profile.id}/transactions`);
        if (response.ok) {
          const data = await response.json();
          // Use server-provided commission values (already calculated)
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    }
    loadTransactions();
  }, [profile?.id]);

  // Load Stripe Connect status
  useEffect(() => {
    async function loadStripeStatus() {
      if (!profile?.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/stripe/connect/account-status/${profile.id}`);
        if (response.ok) {
          const data = await response.json();
          setStripeStatus(data);
        }
      } catch (error) {
        console.error("Error loading Stripe status:", error);
      }
    }
    loadStripeStatus();
  }, [profile?.id]);

  // Load contact requests from entrepreneurs
  useEffect(() => {
    async function loadContactRequests() {
      if (!profile?.id) return;
      setLoadingContactRequests(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/coaches/${profile.id}/contact-requests`);
        if (response.ok) {
          const data = await response.json();
          setContactRequests(data.requests || []);
        }
      } catch (error) {
        console.error("Error loading contact requests:", error);
      } finally {
        setLoadingContactRequests(false);
      }
    }
    loadContactRequests();
  }, [profile?.id]);

  // Handle reply to contact request
  const handleReplyToRequest = async (requestId: string) => {
    if (!replyMessage.trim()) return;
    
    setSendingReply(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-contact-requests/${requestId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: replyMessage.trim(),
          coachEmail: profile?.email
        })
      });
      
      if (response.ok) {
        toast.success("Reply sent successfully!");
        setReplyingToRequest(null);
        setReplyMessage("");
        // Reload contact requests to update UI
        const refreshResponse = await fetch(`${API_BASE_URL}/api/coaches/${profile?.id}/contact-requests`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setContactRequests(data.requests || []);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Stripe return URL and refresh status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeParam = params.get('stripe');
    
    if (stripeParam === 'success' || stripeParam === 'refresh') {
      // Refresh Stripe status after returning from onboarding
      const refreshStripeStatus = async () => {
        if (!profile?.id) return;
        try {
          const response = await fetch(`${API_BASE_URL}/api/stripe/connect/account-status/${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            setStripeStatus(data);
            if (data.onboardingComplete) {
              toast.success("Stripe account connected successfully!");
            }
          }
        } catch (error) {
          console.error("Error refreshing Stripe status:", error);
        }
      };
      
      refreshStripeStatus();
      
      // Clean up URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [profile?.id]);

  // Handle Stripe onboarding
  const handleStripeOnboarding = async () => {
    console.log("[STRIPE ONBOARDING] Button clicked, profile:", profile?.id, "API_BASE_URL:", API_BASE_URL);
    if (!profile?.id) {
      console.log("[STRIPE ONBOARDING] No profile ID, returning early");
      return;
    }
    setLoadingStripe(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/connect/account-link/${profile.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("Could not get Stripe onboarding link");
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to start Stripe onboarding");
      }
    } catch (error) {
      console.error("Stripe onboarding error:", error);
      toast.error("Error starting Stripe onboarding");
    } finally {
      setLoadingStripe(false);
    }
  };

  // Include all admin email aliases
  const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
  const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());

  // Mark admin messages as read when viewing messages tab
  useEffect(() => {
    if (activeTab === "messages" && profile?.email) {
      const adminMessagesToMark = adminMessages
        .filter((m: any) => m.to_email === profile.email && isAdminEmail(m.from_email) && !coachReadMessageIds.includes(m.id))
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
    (m: any) => m.to_email === profile?.email && isAdminEmail(m.from_email) && !coachReadMessageIds.includes(m.id)
  ).length;

  const handleExpertiseChange = (selectedOptions: HTMLCollection) => {
    const selected = Array.from(selectedOptions).map((option: any) => option.value);
    setExpertise(selected as string[]);
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!profile?.id) return false;

    if (expertise.length === 0) {
      toast.error("Please select at least one area of expertise");
      return false;
    }

    setSaving(true);
    try {
      const allRatesProvided = introCallRate && sessionRate && monthlyRate;
      const response = await fetch(`${API_BASE_URL}/api/coaches/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertise: expertise.join(", "),
          focusAreas,
          ...(allRatesProvided 
            ? { introCallRate, sessionRate, monthlyRate }
            : { hourlyRate: sessionRate || profile.hourly_rate }),
          linkedin,
          bio,
          profileImage
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        return true;
      } else {
        toast.error("Failed to update profile");
        return false;
      }
    } catch (error) {
      toast.error("Error saving profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExitEdit = async () => {
    const success = await handleSave();
    if (success) {
      setIsEditingProfile(false);
      setOriginalProfileValues(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    setUploadingImage(true);
    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error("Supabase not configured");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `coach-${profile?.id}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(data.path);
      
      setProfileImage(urlData.publicUrl);
      toast.success("Image uploaded! Don't forget to save your profile.");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
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
                {profile?.is_disabled ? "Disabled" : sessionRate ? `$${sessionRate}/session` : "Set your rates"}
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
              variant={activeTab === "entrepreneurs" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("entrepreneurs")}
              data-testid="button-entrepreneurs-tab"
            >
              <Users className="mr-2 h-4 w-4" /> Entrepreneurs
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
            <Button 
              variant={activeTab === "earnings" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("earnings")}
              data-testid="button-earnings-tab"
            >
              <DollarSign className="mr-2 h-4 w-4" /> Earnings
            </Button>
            <Button 
              variant={activeTab === "agreements" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("agreements")}
              data-testid="button-agreements-tab"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> My Agreements
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

            {/* Stripe Connect Status Card */}
            {!profile?.is_disabled && (
              <Card className={`mb-6 ${stripeStatus?.chargesEnabled ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800'}`}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <CreditCard className={`h-6 w-6 ${stripeStatus?.chargesEnabled ? 'text-green-500' : 'text-amber-500'} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${stripeStatus?.chargesEnabled ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'} mb-1`}>
                        {stripeStatus?.chargesEnabled ? 'Payment Setup Complete' : 'Set Up Payments'}
                      </h3>
                      {stripeStatus?.chargesEnabled ? (
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>You can receive payments from entrepreneurs. You keep 80% of each transaction.</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-amber-700 dark:text-amber-400 mb-3">
                            Connect your Stripe account to receive payments from entrepreneurs. You'll keep 80% of each transaction.
                          </p>
                          <Button
                            onClick={handleStripeOnboarding}
                            disabled={loadingStripe}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            data-testid="button-stripe-onboarding"
                          >
                            {loadingStripe ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="mr-2 h-4 w-4" />
                            )}
                            {stripeStatus?.hasAccount ? 'Complete Stripe Setup' : 'Connect with Stripe'}
                          </Button>
                        </>
                      )}
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
                  : isEditingProfile 
                    ? "Edit your coaching profile details below."
                    : "View your coaching profile. Click Edit to make changes."}
              </p>
            </div>
            {!profile?.is_disabled && (
              <div className="flex gap-2">
                {isEditingProfile ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={cancelEditMode}
                      disabled={saving}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveAndExitEdit} 
                      disabled={saving}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-save-profile"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const url = `${window.location.origin}/coach/${profile?.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Profile link copied! Share it to attract clients.");
                        window.open(`/coach/${profile?.id}`, '_blank');
                      }}
                      data-testid="button-view-public-profile"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Public Profile
                    </Button>
                    <Button 
                      onClick={enterEditMode}
                      className="bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-edit-profile"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
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
                        {isEditingProfile && !profile?.is_disabled && (
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
                {isEditingProfile && !profile?.is_disabled ? (
                  <>
                    <select 
                      multiple
                      value={expertise}
                      onChange={(e) => handleExpertiseChange(e.target.selectedOptions)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                      data-testid="select-coach-expertise"
                      style={{ minHeight: "120px" }}
                    >
                      {EXPERTISE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Hold Ctrl/Cmd to select multiple options</p>
                  </>
                ) : (
                  expertise.length === 0 && <p className="text-slate-500 italic">No expertise selected</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan-600" />
                  Your Rates for Your Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">You keep 80%, we keep 20%</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">15 Minutes Introductory Call</label>
                      <div className="flex gap-2">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center">$</span>
                        <input 
                          type="number" 
                          value={introCallRate}
                          onChange={(e) => setIntroCallRate(e.target.value)}
                          placeholder="25"
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                          data-testid="input-coach-introcall-rate"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Per Session</label>
                      <div className="flex gap-2">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center">$</span>
                        <input 
                          type="number" 
                          value={sessionRate}
                          onChange={(e) => setSessionRate(e.target.value)}
                          placeholder="150"
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                          data-testid="input-coach-session-rate"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Per Month / Full Courses</label>
                      <div className="flex gap-2">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center">$</span>
                        <input 
                          type="number" 
                          value={monthlyRate}
                          onChange={(e) => setMonthlyRate(e.target.value)}
                          placeholder="500"
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                          data-testid="input-coach-monthly-rate"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">15 Min Intro Call:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{introCallRate ? `$${introCallRate}` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Per Session:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{sessionRate ? `$${sessionRate}` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Monthly/Course:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{monthlyRate ? `$${monthlyRate}` : "Not set"}</span>
                    </div>
                  </div>
                )}
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
                {isEditingProfile && !profile?.is_disabled ? (
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-linkedin"
                  />
                ) : (
                  linkedin ? (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline break-all">{linkedin}</a>
                  ) : (
                    <p className="text-slate-500 italic">No LinkedIn profile set</p>
                  )
                )}
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
                {isEditingProfile && !profile?.is_disabled ? (
                  <select 
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="select-focus-areas"
                  >
                    <option value="">Select a focus area...</option>
                    {FOCUS_AREAS_OPTIONS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                ) : (
                  focusAreas ? (
                    <Badge variant="secondary" className="bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100">{focusAreas}</Badge>
                  ) : (
                    <p className="text-slate-500 italic">No focus area selected</p>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  Your Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tell entrepreneurs about yourself</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your background, experience, and what makes you a great coach..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="textarea-bio"
                  />
                ) : (
                  bio ? (
                    <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{bio}</p>
                  ) : (
                    <p className="text-slate-500 italic">No bio added yet</p>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-600" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">{isEditingProfile ? "Upload a professional photo" : "Your profile photo"}</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-2xl overflow-hidden border-2 border-cyan-300 dark:border-cyan-700">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-cyan-600" />
                    )}
                  </div>
                  {isEditingProfile && !profile?.is_disabled && (
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        id="coach-profile-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("coach-profile-upload")?.click()}
                        disabled={uploadingImage}
                        className="text-sm"
                        data-testid="button-upload-photo"
                      >
                        {uploadingImage ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {uploadingImage ? "Uploading..." : "Upload Photo"}
                      </Button>
                      <p className="text-xs text-slate-500">Max 5MB. JPG, PNG, GIF, WebP</p>
                    </div>
                  )}
                </div>
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
                            className={`p-4 rounded-lg ${isAdminEmail(msg.from_email) ? "bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-l-cyan-500" : "bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-slate-400"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-semibold ${isAdminEmail(msg.from_email) ? "text-cyan-700 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}>
                                {isAdminEmail(msg.from_email) ? "From Admin" : "You"}
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

          {/* Entrepreneurs Tab */}
          {activeTab === "entrepreneurs" && (
            <div className="space-y-8">
              {/* Contact Requests Section */}
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Contact Requests</h1>
                <p className="text-muted-foreground mb-4">One-time messages from entrepreneurs interested in your coaching.</p>
                
                {loadingContactRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                  </div>
                ) : contactRequests.length > 0 ? (
                  <div className="space-y-4">
                    {contactRequests.map((request: any) => (
                      <Card key={request.id} className={`border-l-4 ${request.status === 'closed' ? 'border-l-green-500' : 'border-l-cyan-500'}`} data-testid={`card-contact-request-${request.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-cyan-500">
                                <AvatarFallback className="text-white">
                                  {(request.entrepreneur_name || 'E').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{request.entrepreneur_name}</p>
                                <p className="text-sm text-muted-foreground">Entrepreneur</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={request.status === 'closed' ? 'bg-green-600' : request.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'}>
                                {request.status === 'closed' ? 'Replied' : request.status === 'pending' ? 'Awaiting Reply' : request.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Original Message */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mb-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Message</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{request.message}</p>
                          </div>
                          
                          {/* Reply Section */}
                          {request.status === 'closed' && request.reply ? (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Your Reply
                              </p>
                              <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">{request.reply}</p>
                            </div>
                          ) : request.status === 'pending' && (
                            replyingToRequest === request.id ? (
                              <div className="space-y-3">
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
                                  <p className="text-xs text-amber-800 dark:text-amber-200">
                                    <strong>One-time reply:</strong> After you send this reply, the conversation will close. Make it count!
                                  </p>
                                </div>
                                <textarea
                                  rows={3}
                                  placeholder="Write your reply..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                                  data-testid={`input-reply-${request.id}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingToRequest(null);
                                      setReplyMessage("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                    onClick={() => handleReplyToRequest(request.id)}
                                    disabled={sendingReply || !replyMessage.trim()}
                                    data-testid={`button-send-reply-${request.id}`}
                                  >
                                    {sendingReply ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Send className="h-4 w-4 mr-1" />
                                    )}
                                    Send Reply
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                                onClick={() => setReplyingToRequest(request.id)}
                                data-testid={`button-reply-${request.id}`}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply to this message
                              </Button>
                            )
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-8">
                    <CardContent>
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No contact requests yet. When entrepreneurs reach out, their messages will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Clients Section */}
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">My Clients</h2>
                <p className="text-muted-foreground mb-4">Entrepreneurs who have purchased your coaching services.</p>

                {loadingClients ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : coachClients.length > 0 ? (
                <div className="space-y-4">
                  {coachClients.map((client) => (
                    <Card key={client.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 bg-purple-500">
                              <AvatarFallback className="text-white">
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{client.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                          <Badge className={client.status === "active" ? "bg-green-600" : "bg-slate-500"}>
                            {client.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Entrepreneurs Yet</h3>
                    <p className="text-muted-foreground">When entrepreneurs purchase your coaching services, they will appear here.</p>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Earnings</h1>
              <p className="text-muted-foreground mb-8">Track your earnings and commission history.</p>

              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${transactions.reduce((sum, t) => sum + t.netEarnings, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">After 20% commission</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Before commission</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-slate-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-cyan-600" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Client</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Type</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Commission (20%)</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Your Earnings</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{tx.clientName}</td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{tx.type}</td>
                              <td className="py-3 px-4 text-sm text-right text-slate-700 dark:text-slate-300">${tx.amount.toFixed(2)}</td>
                              <td className="py-3 px-4 text-sm text-right text-red-600">-${tx.commission.toFixed(2)}</td>
                              <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">${tx.netEarnings.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center">
                                <Badge className={tx.status === "completed" ? "bg-green-600" : tx.status === "pending" ? "bg-amber-500" : "bg-slate-500"}>
                                  {tx.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Transactions Yet</h3>
                      <p className="text-muted-foreground">When you start earning from coaching sessions, your transaction history will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 p-6 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-lg">
                <h3 className="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Revenue Share Model</h3>
                <p className="text-sm text-cyan-800 dark:text-cyan-200">You keep 80% of every transaction. TouchConnectPro handles payments and takes a 20% commission for platform services.</p>
              </div>
              </>
              )}
            </div>
          )}

          {/* Agreements Tab */}
          {activeTab === "agreements" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Agreements</h2>
              {profile?.email && <MyAgreements userEmail={profile.email} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
