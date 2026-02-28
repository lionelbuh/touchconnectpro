import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, DollarSign, Users, Star, Save, Loader2, Link as LinkIcon, Target, LogOut, X, MessageSquare, AlertCircle, Mail, User, FileText, Upload, CreditCard, CheckCircle2, ExternalLink, Check, Send, Reply, Edit, ClipboardCheck, RefreshCw } from "lucide-react";
import { DashboardMobileNav, NavTab } from "@/components/DashboardNav";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";
import MyAgreements from "@/components/MyAgreements";
import { COACH_CONTRACT, CONTRACT_VERSION } from "@/lib/contracts";

// Helper to format UTC timestamps from database to PST
const formatToPST = (timestamp: string | Date) => {
  if (!timestamp) return "—";
  let dateStr = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
  // If timestamp doesn't have timezone info, treat it as UTC
  if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
    dateStr = dateStr.replace(' ', 'T') + 'Z';
  }
  return new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) + " PST";
};

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
  "Product Marketing",
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
  monthlyRetainerDescription: string;
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
  external_reputation?: {
    platform_name: string;
    average_rating: number;
    review_count: number;
    profile_url: string;
    verified: boolean;
    verified_by_admin_id?: string | null;
    verified_at?: string | null;
  } | null;
}

function parseRates(hourlyRate: string): CoachRates {
  try {
    const parsed = JSON.parse(hourlyRate);
    if (parsed.introCallRate && parsed.sessionRate && parsed.monthlyRate) {
      return { ...parsed, monthlyRetainerDescription: parsed.monthlyRetainerDescription || "" };
    }
  } catch {
    // Legacy format - single rate
  }
  return { introCallRate: "", sessionRate: hourlyRate || "", monthlyRate: "", monthlyRetainerDescription: "" };
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
  const [monthlyRetainerDescription, setMonthlyRetainerDescription] = useState("");
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
  const [stripeCountry, setStripeCountry] = useState("US");
  
  // Contact requests state
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [loadingContactRequests, setLoadingContactRequests] = useState(false);
  const [replyingToRequest, setReplyingToRequest] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  // Profile edit mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [originalProfileValues, setOriginalProfileValues] = useState<{
    expertise: string[];
    focusAreas: string;
    introCallRate: string;
    sessionRate: string;
    monthlyRate: string;
    monthlyRetainerDescription: string;
    linkedin: string;
    bio: string;
    profileImage: string;
  } | null>(null);
  
  // Coach agreement state
  const [needsAgreement, setNeedsAgreement] = useState(false);
  const [checkingAgreement, setCheckingAgreement] = useState(true);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [agreementAlreadyChecked, setAgreementAlreadyChecked] = useState(false);
  const [agreementCheckboxChecked, setAgreementCheckboxChecked] = useState(false);
  
  // Cancellation status
  const [hasPendingCancellation, setHasPendingCancellation] = useState(false);
  const [hasProcessedCancellation, setHasProcessedCancellation] = useState(false);

  // External reputation state
  const [externalPlatform, setExternalPlatform] = useState("");
  const [externalRating, setExternalRating] = useState("");
  const [externalReviewCount, setExternalReviewCount] = useState("");
  const [externalProfileUrl, setExternalProfileUrl] = useState("");
  const [externalVerified, setExternalVerified] = useState(false);
  const [externalVerifiedAt, setExternalVerifiedAt] = useState<string | null>(null);
  const [isEditingReputation, setIsEditingReputation] = useState(false);
  const [savingReputation, setSavingReputation] = useState(false);

  const enterEditMode = () => {
    setOriginalProfileValues({
      expertise,
      focusAreas,
      introCallRate,
      sessionRate,
      monthlyRate,
      monthlyRetainerDescription,
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
      setMonthlyRetainerDescription(originalProfileValues.monthlyRetainerDescription);
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
          setMonthlyRetainerDescription(rates.monthlyRetainerDescription);
          setLinkedin(data.linkedin || "");
          setBio(data.bio || "");
          setProfileImage(data.profile_image || "");
          // Set external reputation
          if (data.external_reputation) {
            setExternalPlatform(data.external_reputation.platform_name || "");
            setExternalRating(String(data.external_reputation.average_rating || ""));
            setExternalReviewCount(String(data.external_reputation.review_count || ""));
            setExternalProfileUrl(data.external_reputation.profile_url || "");
            setExternalVerified(data.external_reputation.verified || false);
            setExternalVerifiedAt(data.external_reputation.verified_at || null);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Check if coach needs to accept new agreement
  useEffect(() => {
    async function checkAgreement() {
      if (!profile?.email) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/contract-acceptances/check-coach-agreement/${encodeURIComponent(profile.email)}`);
        if (response.ok) {
          const data = await response.json();
          setNeedsAgreement(!data.hasAccepted);
        }
      } catch (error) {
        console.error("Error checking agreement:", error);
      } finally {
        setCheckingAgreement(false);
        setAgreementAlreadyChecked(true);
      }
    }
    
    if (profile?.email && !agreementAlreadyChecked) {
      checkAgreement();
    }
  }, [profile?.email, agreementAlreadyChecked]);

  // Check if coach has a pending cancellation request
  useEffect(() => {
    async function checkCancellation() {
      if (!profile?.email) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/cancellation-status/${encodeURIComponent(profile.email)}`);
        if (response.ok) {
          const data = await response.json();
          setHasPendingCancellation(data.hasPendingCancellation);
          setHasProcessedCancellation(data.hasProcessedCancellation);
        }
      } catch (error) {
        console.error("Error checking cancellation status:", error);
      }
    }
    checkCancellation();
  }, [profile?.email]);

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
      const response = await fetch(`${API_BASE_URL}/api/stripe/connect/account-link/${profile.id}?country=${stripeCountry}`);
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
            ? { introCallRate, sessionRate, monthlyRate, monthlyRetainerDescription }
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

  const handleSaveReputation = async () => {
    if (!profile?.id) return;
    
    if (!externalPlatform || !externalRating || !externalReviewCount || !externalProfileUrl) {
      toast.error("Please fill in all external reputation fields");
      return;
    }
    
    setSavingReputation(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coaches/${profile.id}/external-reputation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_name: externalPlatform,
          average_rating: externalRating,
          review_count: externalReviewCount,
          profile_url: externalProfileUrl
        })
      });
      
      if (response.ok) {
        setExternalVerified(false);
        setExternalVerifiedAt(null);
        setIsEditingReputation(false);
        toast.success("External reputation updated! Verification has been reset and will be reviewed by our team.");
      } else {
        toast.error("Failed to update external reputation");
      }
    } catch (error) {
      toast.error("Error saving external reputation");
    } finally {
      setSavingReputation(false);
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF6B5C" }} />
      </div>
    );
  }

  const coachNavTabs: NavTab[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "entrepreneurs", label: "Entrepreneurs", icon: <Users className="h-4 w-4" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, badge: unreadMessageCount > 0 ? <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadMessageCount}</span> : undefined },
    { id: "earnings", label: "Earnings", icon: <DollarSign className="h-4 w-4" /> },
    { id: "agreements", label: "My Agreements", icon: <ClipboardCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      <DashboardMobileNav
        tabs={coachNavTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        title="Coach Dashboard"
        userName={profile?.full_name || "Coach"}
        userRole={profile?.is_disabled ? "Disabled" : "Coach"}
        onLogout={handleLogout}
      />
      <div className="flex flex-1">
      <aside className="w-64 hidden md:flex flex-col" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E8E8E8" }}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10" style={{ backgroundColor: profile?.is_disabled ? undefined : "#FF6B5C", borderColor: "#E8E8E8", borderWidth: "1px" }}>
              <AvatarFallback className={`text-white ${profile?.is_disabled ? "bg-red-500" : ""}`} style={!profile?.is_disabled ? { backgroundColor: "#FF6B5C" } : undefined}>
                {profile?.full_name ? getInitials(profile.full_name) : "CO"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0D566C" }}>{profile?.full_name || "Coach"}</div>
              <div className="text-xs" style={{ color: profile?.is_disabled ? "#dc2626" : "#8A8A8A" }}>
                {profile?.is_disabled ? "Disabled" : sessionRate ? `$${sessionRate}/session` : "Set your rates"}
              </div>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start font-medium rounded-xl"
              style={activeTab === "overview" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#4A4A4A" }}
              onClick={() => setActiveTab("overview")}
              data-testid="button-overview-tab"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start font-medium rounded-xl"
              style={activeTab === "entrepreneurs" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#4A4A4A" }}
              onClick={() => setActiveTab("entrepreneurs")}
              data-testid="button-entrepreneurs-tab"
            >
              <Users className="mr-2 h-4 w-4" /> Entrepreneurs
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start font-medium rounded-xl relative"
              style={activeTab === "messages" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#4A4A4A" }}
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
              variant="ghost" 
              className="w-full justify-start font-medium rounded-xl"
              style={activeTab === "earnings" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#4A4A4A" }}
              onClick={() => setActiveTab("earnings")}
              data-testid="button-earnings-tab"
            >
              <DollarSign className="mr-2 h-4 w-4" /> Earnings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start font-medium rounded-xl"
              style={activeTab === "agreements" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#4A4A4A" }}
              onClick={() => setActiveTab("agreements")}
              data-testid="button-agreements-tab"
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> My Agreements
            </Button>
          </nav>
          <div className="pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
            <Button 
              variant="ghost"
              className="w-full justify-start font-medium hover:text-red-600 hover:bg-red-50 rounded-xl"
              style={{ color: "#4A4A4A" }}
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
              <Card className="mb-6 rounded-2xl border-red-300 bg-red-50" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 mb-1">Account Disabled</h3>
                      <p className="text-red-700">Your coaching account has been disabled. Your profile is currently in view-only mode. Please use the Messages tab to contact the Admin team if you would like to reactivate your account.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasPendingCancellation && (
              <Card className="mb-6 rounded-2xl border-orange-300 bg-orange-50" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }} data-testid="cancellation-banner">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-orange-800 mb-1">Cancellation Request Pending</h3>
                      <p className="text-orange-700">You have submitted a cancellation request. Our team will process it within 2-3 business days. If you've changed your mind, please contact us at <a href="mailto:hello@touchconnectpro.com" className="underline font-medium">hello@touchconnectpro.com</a> to cancel your request.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasProcessedCancellation && (
              <Card className="mb-6 rounded-2xl border-green-300 bg-green-50" style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }} data-testid="cancellation-approved-banner">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Cancellation Approved</h3>
                      <p className="text-green-700">Your cancellation request has been received and approved. Thank you for being part of TouchConnectPro. If you ever wish to return, you're always welcome back!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stripe Connect Status Card */}
            {!profile?.is_disabled && (
              <Card className={`mb-6 rounded-2xl ${stripeStatus?.chargesEnabled ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`} style={{ boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <CreditCard className={`h-6 w-6 ${stripeStatus?.chargesEnabled ? 'text-green-500' : 'text-amber-500'} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${stripeStatus?.chargesEnabled ? 'text-green-800' : 'text-amber-800'} mb-1`}>
                        {stripeStatus?.chargesEnabled ? 'Payment Setup Complete' : 'Set Up Payments'}
                      </h3>
                      {stripeStatus?.chargesEnabled ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>You can receive payments from entrepreneurs. You keep 80% of each transaction.</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`${API_BASE_URL}/api/stripe/connect/dashboard-link/${profile?.id}`);
                                  if (response.ok) {
                                    const data = await response.json();
                                    window.open(data.url, '_blank');
                                  } else {
                                    const error = await response.json();
                                    toast.error(error.error || "Failed to open Stripe dashboard");
                                  }
                                } catch (error) {
                                  toast.error("Error opening Stripe dashboard");
                                }
                              }}
                              className="rounded-xl"
                              style={{ backgroundColor: "#0D566C", color: "#FFFFFF", border: "none" }}
                              data-testid="button-stripe-dashboard"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Stripe Dashboard
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (!confirm("Are you sure you want to disconnect your Stripe account? You'll need to connect a new one to receive payments.")) return;
                                try {
                                  const response = await fetch(`${API_BASE_URL}/api/stripe/connect/reset/${profile?.id}`, { method: 'POST' });
                                  if (response.ok) {
                                    toast.success("Stripe account disconnected. You can now connect a new account.");
                                    setStripeStatus({ hasAccount: false, onboardingComplete: false, chargesEnabled: false, payoutsEnabled: false });
                                  } else {
                                    const error = await response.json();
                                    toast.error(error.error || "Failed to disconnect Stripe account");
                                  }
                                } catch (error) {
                                  toast.error("Error disconnecting Stripe account");
                                }
                              }}
                              className="rounded-xl"
                              style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                              data-testid="button-reset-stripe"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Connect Different Account
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-amber-700 mb-3">
                            Connect your Stripe account to receive payments from entrepreneurs. You'll keep 80% of each transaction.
                          </p>
                          {!stripeStatus?.hasAccount && (
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-amber-800 mb-1">Your country</label>
                              <select
                                value={stripeCountry}
                                onChange={(e) => setStripeCountry(e.target.value)}
                                className="w-full max-w-xs p-2 border border-amber-300 rounded-lg bg-white text-[#0D566C] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D566C]/30"
                                data-testid="select-stripe-country"
                              >
                                <option value="US">United States</option>
                                <option value="AU">Australia</option>
                                <option value="BE">Belgium</option>
                                <option value="CA">Canada</option>
                                <option value="FR">France</option>
                                <option value="DE">Germany</option>
                                <option value="JP">Japan</option>
                                <option value="MX">Mexico</option>
                                <option value="NL">Netherlands</option>
                                <option value="PT">Portugal</option>
                                <option value="SG">Singapore</option>
                                <option value="ES">Spain</option>
                                <option value="SE">Sweden</option>
                                <option value="CH">Switzerland</option>
                                <option value="GB">United Kingdom</option>
                              </select>
                            </div>
                          )}
                          <Button
                            onClick={handleStripeOnboarding}
                            disabled={loadingStripe}
                            className="rounded-full"
                            style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
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
              <h1 className="text-3xl font-display font-bold" style={{ color: "#0D566C" }}>
                Welcome, {profile?.full_name?.split(" ")[0] || "Coach"}!
              </h1>
              <p className="mt-2" style={{ color: "#8A8A8A" }}>
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
                      className="rounded-xl"
                      style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                      onClick={cancelEditMode}
                      disabled={saving}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveAndExitEdit} 
                      disabled={saving}
                      className="rounded-full"
                      style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
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
                      className="rounded-xl"
                      style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
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
                      className="rounded-full"
                      style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
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
            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <Star className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  Your Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>What do you specialize in?</p>
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map(item => (
                      <Badge key={item} variant="secondary" className="flex items-center gap-2 pr-1" style={{ backgroundColor: "rgba(13,86,108,0.1)", color: "#0D566C", borderColor: "rgba(13,86,108,0.3)" }}>
                        {item}
                        {isEditingProfile && !profile?.is_disabled && (
                          <button
                            onClick={() => removeExpertise(item)}
                            style={{ color: "#0D566C" }}
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
                      className="w-full px-3 py-2 rounded-xl focus:ring-2"
                      data-testid="select-coach-expertise"
                      style={{ minHeight: "120px", backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                    >
                      {EXPERTISE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <p className="text-xs" style={{ color: "#8A8A8A" }}>Hold Ctrl/Cmd to select multiple options</p>
                  </>
                ) : (
                  expertise.length === 0 && <p className="italic" style={{ color: "#8A8A8A" }}>No expertise selected</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <DollarSign className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  Your Rates for Your Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>You keep 80%, we keep 20%</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>15 Minutes Introductory Call</label>
                      <div className="flex gap-2">
                        <span className="flex items-center" style={{ color: "#8A8A8A" }}>$</span>
                        <input 
                          type="number" 
                          value={introCallRate}
                          onChange={(e) => setIntroCallRate(e.target.value)}
                          placeholder="25"
                          className="flex-1 px-3 py-2 rounded-xl h-11"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                          data-testid="input-coach-introcall-rate"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Per Session</label>
                      <div className="flex gap-2">
                        <span className="flex items-center" style={{ color: "#8A8A8A" }}>$</span>
                        <input 
                          type="number" 
                          value={sessionRate}
                          onChange={(e) => setSessionRate(e.target.value)}
                          placeholder="150"
                          className="flex-1 px-3 py-2 rounded-xl h-11"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                          data-testid="input-coach-session-rate"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Monthly Coaching Retainer</label>
                      <div className="flex gap-2">
                        <span className="flex items-center" style={{ color: "#8A8A8A" }}>$</span>
                        <input 
                          type="number" 
                          value={monthlyRate}
                          onChange={(e) => setMonthlyRate(e.target.value)}
                          placeholder="500"
                          className="flex-1 px-3 py-2 rounded-xl h-11"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                          data-testid="input-coach-monthly-rate"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Monthly Retainer Description (Optional)</label>
                      <textarea 
                        value={monthlyRetainerDescription}
                        onChange={(e) => setMonthlyRetainerDescription(e.target.value)}
                        placeholder="Describe what's included in your monthly coaching retainer..."
                        className="w-full px-3 py-2 rounded-xl min-h-[60px]"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                        data-testid="input-coach-monthly-description"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: "#8A8A8A" }}>15 Min Intro Call:</span>
                      <span className="font-medium" style={{ color: "#4A4A4A" }}>{introCallRate ? `$${introCallRate}` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: "#8A8A8A" }}>Per Session:</span>
                      <span className="font-medium" style={{ color: "#4A4A4A" }}>{sessionRate ? `$${sessionRate}` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm" style={{ color: "#8A8A8A" }}>Monthly Retainer:</span>
                      <span className="font-medium" style={{ color: "#4A4A4A" }}>{monthlyRate ? `$${monthlyRate}` : "Not set"}</span>
                    </div>
                    {monthlyRetainerDescription && (
                      <div className="pt-2" style={{ borderTop: "1px solid #E8E8E8" }}>
                        <span className="text-xs block mb-1" style={{ color: "#8A8A8A" }}>What's included:</span>
                        <p className="text-sm" style={{ color: "#4A4A4A" }}>{monthlyRetainerDescription}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <LinkIcon className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  LinkedIn Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>Your LinkedIn profile URL</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl h-11"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                    data-testid="input-linkedin"
                  />
                ) : (
                  linkedin ? (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline break-all" style={{ color: "#0D566C" }}>{linkedin}</a>
                  ) : (
                    <p className="italic" style={{ color: "#8A8A8A" }}>No LinkedIn profile set</p>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <Target className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>Topics you help entrepreneurs with</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <select 
                    value={focusAreas}
                    onChange={(e) => setFocusAreas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl h-11"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                    data-testid="select-focus-areas"
                  >
                    <option value="">Select a focus area...</option>
                    {FOCUS_AREAS_OPTIONS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                ) : (
                  focusAreas ? (
                    <Badge variant="secondary" style={{ backgroundColor: "rgba(13,86,108,0.1)", color: "#0D566C", borderColor: "rgba(13,86,108,0.3)" }}>{focusAreas}</Badge>
                  ) : (
                    <p className="italic" style={{ color: "#8A8A8A" }}>No focus area selected</p>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:col-span-2" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <Star className="h-5 w-5" style={{ color: "#F5C542" }} />
                  External Reputation
                  {externalVerified && (
                    <Badge className="ml-2" style={{ backgroundColor: "#16a34a", color: "#FFFFFF" }}>Verified</Badge>
                  )}
                  {!externalVerified && externalPlatform && (
                    <Badge className="ml-2" style={{ backgroundColor: "#8A8A8A", color: "#FFFFFF" }}>Pending Verification</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>
                  Display your ratings from other coaching platforms. Updates reset verification status.
                </p>
                {isEditingReputation ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Platform Name *</label>
                      <input
                        type="text"
                        value={externalPlatform}
                        onChange={(e) => setExternalPlatform(e.target.value)}
                        placeholder="e.g., MentorCruise, Clarity.fm"
                        className="w-full px-3 py-2 rounded-xl h-11"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                        data-testid="input-external-platform"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Average Rating *</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={externalRating}
                          onChange={(e) => setExternalRating(e.target.value)}
                          placeholder="e.g., 4.9"
                          className="w-full px-3 py-2 rounded-xl h-11"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                          data-testid="input-external-rating"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>Number of Reviews *</label>
                        <input
                          type="number"
                          min="1"
                          value={externalReviewCount}
                          onChange={(e) => setExternalReviewCount(e.target.value)}
                          placeholder="e.g., 37"
                          className="w-full px-3 py-2 rounded-xl h-11"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                          data-testid="input-external-review-count"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "#8A8A8A" }}>External Profile URL * (for verification only)</label>
                      <input
                        type="url"
                        value={externalProfileUrl}
                        onChange={(e) => setExternalProfileUrl(e.target.value)}
                        placeholder="https://mentorcruise.com/mentor/yourname"
                        className="w-full px-3 py-2 rounded-xl h-11"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                        data-testid="input-external-url"
                      />
                      <p className="text-xs mt-1" style={{ color: "#F5C542" }}>This link is only used for verification and will never be shown publicly.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                        onClick={() => setIsEditingReputation(false)}
                        disabled={savingReputation}
                        data-testid="button-cancel-reputation"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveReputation}
                        disabled={savingReputation}
                        className="rounded-full"
                        style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                        data-testid="button-save-reputation"
                      >
                        {savingReputation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {externalPlatform ? (
                      <>
                        <div className="rounded-lg p-4" style={{ backgroundColor: "#F3F3F3", border: "1px solid #E8E8E8" }}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < Math.floor(parseFloat(externalRating) || 0)
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-slate-200 text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-lg" style={{ color: "#4A4A4A" }}>{externalRating}</span>
                            <span style={{ color: "#8A8A8A" }}>({externalReviewCount} reviews)</span>
                          </div>
                          <p className="text-sm" style={{ color: "#8A8A8A" }}>
                            Based on ratings from {externalPlatform}
                          </p>
                          {externalVerified && externalVerifiedAt && (
                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#16a34a" }}>
                              <Check className="h-3 w-3" />
                              Verified by TouchConnectPro on {new Date(externalVerifiedAt).toLocaleDateString()}
                            </p>
                          )}
                          {!externalVerified && (
                            <p className="text-xs mt-2" style={{ color: "#F5C542" }}>
                              Awaiting verification by our team
                            </p>
                          )}
                        </div>
                        {!profile?.is_disabled && (
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                            onClick={() => setIsEditingReputation(true)}
                            data-testid="button-edit-reputation"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Update Reputation Info
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="italic mb-4" style={{ color: "#8A8A8A" }}>No external reputation added yet</p>
                        {!profile?.is_disabled && (
                          <Button
                            onClick={() => setIsEditingReputation(true)}
                            className="rounded-full"
                            style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                            data-testid="button-add-reputation"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Add External Reputation
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <FileText className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  Your Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>Tell entrepreneurs about yourself</p>
                {isEditingProfile && !profile?.is_disabled ? (
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your background, experience, and what makes you a great coach..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                    data-testid="textarea-bio"
                  />
                ) : (
                  bio ? (
                    <p className="whitespace-pre-wrap" style={{ color: "#4A4A4A" }}>{bio}</p>
                  ) : (
                    <p className="italic" style={{ color: "#8A8A8A" }}>No bio added yet</p>
                  )
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                  <User className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm" style={{ color: "#8A8A8A" }}>{isEditingProfile ? "Upload a professional photo" : "Your profile photo"}</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl overflow-hidden" style={{ backgroundColor: "#F3F3F3", border: "2px solid #E8E8E8" }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10" style={{ color: "#0D566C" }} />
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
                        className="text-sm rounded-xl"
                        style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                        onClick={() => document.getElementById("coach-profile-upload")?.click()}
                        disabled={uploadingImage}
                        data-testid="button-upload-photo"
                      >
                        {uploadingImage ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {uploadingImage ? "Uploading..." : "Upload Photo"}
                      </Button>
                      <p className="text-xs" style={{ color: "#8A8A8A" }}>Max 5MB. JPG, PNG, GIF, WebP</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: "rgba(13,86,108,0.05)", border: "1px solid rgba(13,86,108,0.15)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "#0D566C" }}>Revenue Share Model</h3>
            <p className="text-sm" style={{ color: "#4A4A4A" }}>You set your hourly rate. We handle payments and take 20%. You keep 80% of every session.</p>
          </div>
          </>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div>
              <h1 className="text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Messages</h1>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Communicate with the TouchConnectPro admin team.</p>

              <Card className="mb-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                    <MessageSquare className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                    Send a Message to Admin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Type your message to the admin team..."
                    className="w-full min-h-24 p-4 rounded-xl focus:outline-none focus:ring-2"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
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
                    className="rounded-full"
                    style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                    data-testid="button-send-admin-message"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                    <MessageSquare className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                    Message History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminMessages.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {[...adminMessages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => (
                          <div 
                            key={msg.id} 
                            className="p-4 rounded-lg border-l-4"
                            style={isAdminEmail(msg.from_email) 
                              ? { backgroundColor: "rgba(255,107,92,0.05)", borderLeftColor: "#FF6B5C" } 
                              : { backgroundColor: "#F3F3F3", borderLeftColor: "#E8E8E8" }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold" style={{ color: isAdminEmail(msg.from_email) ? "#FF6B5C" : "#4A4A4A" }}>
                                {isAdminEmail(msg.from_email) ? "From Admin" : "You"}
                              </span>
                              <span className="text-xs" style={{ color: "#8A8A8A" }}>{formatToPST(msg.created_at)}</span>
                            </div>
                            <p className="whitespace-pre-wrap" style={{ color: "#4A4A4A" }}>{msg.message}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: "#E8E8E8" }} />
                      <p style={{ color: "#8A8A8A" }}>No messages yet. Send a message to get started!</p>
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
                <h1 className="text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Contact Requests</h1>
                <p className="mb-4" style={{ color: "#8A8A8A" }}>One-time messages from entrepreneurs interested in your coaching.</p>
                
                {loadingContactRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#FF6B5C" }} />
                  </div>
                ) : contactRequests.length > 0 ? (
                  <div className="space-y-4">
                    {contactRequests.map((request: any) => (
                      <Card key={request.id} className={`border-l-4 rounded-2xl ${request.status === 'closed' ? 'border-l-green-500' : ''}`} style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", ...(request.status !== 'closed' ? { borderLeftColor: "#FF6B5C" } : {}) }} data-testid={`card-contact-request-${request.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10" style={{ backgroundColor: "#FF6B5C" }}>
                                <AvatarFallback className="text-white" style={{ backgroundColor: "#FF6B5C" }}>
                                  {(request.entrepreneur_name || 'E').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold" style={{ color: "#0D566C" }}>{request.entrepreneur_name}</p>
                                <p className="text-sm" style={{ color: "#8A8A8A" }}>Entrepreneur</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge style={request.status === 'closed' ? { backgroundColor: "#16a34a", color: "#FFFFFF" } : request.status === 'pending' ? { backgroundColor: "#F5C542", color: "#FFFFFF" } : { backgroundColor: "#8A8A8A", color: "#FFFFFF" }}>
                                {request.status === 'closed' ? 'Replied' : request.status === 'pending' ? 'Awaiting Reply' : request.status}
                              </Badge>
                              <span className="text-xs" style={{ color: "#8A8A8A" }}>
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Original Message */}
                          <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: "#F3F3F3" }}>
                            <p className="text-xs font-semibold uppercase mb-1" style={{ color: "#8A8A8A" }}>Message</p>
                            <p className="text-sm whitespace-pre-wrap" style={{ color: "#4A4A4A" }}>{request.message}</p>
                          </div>
                          
                          {/* Reply Section */}
                          {request.status === 'closed' && request.reply ? (
                            <div className="p-3 rounded-lg border" style={{ backgroundColor: "rgba(22,163,106,0.05)", borderColor: "rgba(22,163,106,0.2)" }}>
                              <p className="text-xs font-semibold uppercase mb-1 flex items-center gap-1" style={{ color: "#16a34a" }}>
                                <Check className="h-3 w-3" /> Your Reply
                              </p>
                              <p className="text-sm whitespace-pre-wrap" style={{ color: "#4A4A4A" }}>{request.reply}</p>
                            </div>
                          ) : request.status === 'pending' && (
                            replyingToRequest === request.id ? (
                              <div className="space-y-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(245,197,66,0.1)", border: "1px solid rgba(245,197,66,0.3)" }}>
                                  <p className="text-xs" style={{ color: "#b45309" }}>
                                    <strong>One-time reply:</strong> After you send this reply, the conversation will close. Make it count!
                                  </p>
                                </div>
                                <textarea
                                  rows={3}
                                  placeholder="Write your reply..."
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2"
                                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                                  data-testid={`input-reply-${request.id}`}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                                    onClick={() => {
                                      setReplyingToRequest(null);
                                      setReplyMessage("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="rounded-full"
                                    style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
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
                                className="rounded-xl"
                                style={{ borderColor: "rgba(255,107,92,0.3)", color: "#FF6B5C" }}
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
                  <Card className="text-center py-8 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                    <CardContent>
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: "#E8E8E8" }} />
                      <p style={{ color: "#8A8A8A" }}>No contact requests yet. When entrepreneurs reach out, their messages will appear here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Clients Section */}
              <div>
                <h2 className="text-2xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>My Clients</h2>
                <p className="mb-4" style={{ color: "#8A8A8A" }}>Entrepreneurs who have purchased your coaching services.</p>

                {loadingClients ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF6B5C" }} />
                </div>
              ) : coachClients.length > 0 ? (
                <div className="space-y-4">
                  {coachClients.map((client) => (
                    <Card key={client.id} className="border-l-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderLeftColor: "#4B3F72" }}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12" style={{ backgroundColor: "#4B3F72" }}>
                              <AvatarFallback className="text-white" style={{ backgroundColor: "#4B3F72" }}>
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold" style={{ color: "#0D566C" }}>{client.name}</p>
                              <div className="flex items-center gap-2 text-sm" style={{ color: "#8A8A8A" }}>
                                <Mail className="h-4 w-4" />
                                {client.email}
                              </div>
                            </div>
                          </div>
                          <Badge style={client.status === "active" ? { backgroundColor: "#16a34a", color: "#FFFFFF" } : { backgroundColor: "#8A8A8A", color: "#FFFFFF" }}>
                            {client.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                  <CardContent>
                    <Users className="h-16 w-16 mx-auto mb-4" style={{ color: "#E8E8E8" }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "#4A4A4A" }}>No Entrepreneurs Yet</h3>
                    <p style={{ color: "#8A8A8A" }}>When entrepreneurs purchase your coaching services, they will appear here.</p>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div>
              <h1 className="text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Earnings</h1>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Track your earnings and commission history.</p>

              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF6B5C" }} />
                </div>
              ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-green-500 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: "#16a34a" }}>
                      ${transactions.reduce((sum, t) => sum + t.netEarnings, 0).toFixed(2)}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>After 20% commission</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderLeftColor: "#F5C542" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: "#F5C542" }}>
                      ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>Before commission</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderLeftColor: "#0D566C" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: "#0D566C" }}>{transactions.length}</div>
                    <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>Completed transactions</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: "#0D566C" }}>
                    <DollarSign className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: "1px solid #E8E8E8" }}>
                            <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Date</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Client</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Type</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Amount</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Commission (20%)</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Your Earnings</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: "#8A8A8A" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: "1px solid #F3F3F3" }}>
                              <td className="py-3 px-4 text-sm" style={{ color: "#4A4A4A" }}>
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm" style={{ color: "#4A4A4A" }}>{tx.clientName}</td>
                              <td className="py-3 px-4 text-sm" style={{ color: "#4A4A4A" }}>{tx.type}</td>
                              <td className="py-3 px-4 text-sm text-right" style={{ color: "#4A4A4A" }}>${tx.amount.toFixed(2)}</td>
                              <td className="py-3 px-4 text-sm text-right text-red-600">-${tx.commission.toFixed(2)}</td>
                              <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: "#16a34a" }}>${tx.netEarnings.toFixed(2)}</td>
                              <td className="py-3 px-4 text-center">
                                <Badge style={tx.status === "completed" ? { backgroundColor: "#16a34a", color: "#FFFFFF" } : tx.status === "pending" ? { backgroundColor: "#F5C542", color: "#FFFFFF" } : { backgroundColor: "#8A8A8A", color: "#FFFFFF" }}>
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
                      <DollarSign className="h-16 w-16 mx-auto mb-4" style={{ color: "#E8E8E8" }} />
                      <h3 className="text-lg font-semibold mb-2" style={{ color: "#4A4A4A" }}>No Transactions Yet</h3>
                      <p style={{ color: "#8A8A8A" }}>When you start earning from coaching sessions, your transaction history will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: "rgba(13,86,108,0.05)", border: "1px solid rgba(13,86,108,0.15)" }}>
                <h3 className="font-semibold mb-2" style={{ color: "#0D566C" }}>Revenue Share Model</h3>
                <p className="text-sm" style={{ color: "#4A4A4A" }}>You keep 80% of every transaction. TouchConnectPro handles payments and takes a 20% commission for platform services.</p>
              </div>
              </>
              )}
            </div>
          )}

          {/* Agreements Tab */}
          {activeTab === "agreements" && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0D566C" }}>My Agreements</h2>
              {profile?.email && <MyAgreements userEmail={profile.email} />}
              
              {/* Cancellation Section */}
              <div className="mt-12 pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#4A4A4A" }}>Cancel Coach Partnership</h3>
                <p className="text-sm mb-4" style={{ color: "#8A8A8A" }}>
                  If you wish to end your partnership with TouchConnectPro, please submit a cancellation request.
                </p>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => setShowCancelModal(true)}
                  data-testid="button-cancel-partnership"
                >
                  Request Cancellation
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
            <CardHeader>
              <CardTitle className="text-red-600">Cancel Coach Partnership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm" style={{ color: "#8A8A8A" }}>
                We're sorry to see you go. Please let us know why you'd like to end your partnership.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "#4A4A4A" }}>Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please share your reason..."
                  className="w-full min-h-[100px] p-3 rounded-xl resize-y"
                  style={{ backgroundColor: "#F3F3F3", borderColor: "#E8E8E8", color: "#4A4A4A", border: "1px solid #E8E8E8" }}
                  data-testid="input-cancel-reason"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-xl"
                  style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  data-testid="button-cancel-modal-close"
                >
                  Keep Partnership
                </Button>
                <Button 
                  variant="destructive"
                  className="rounded-full"
                  disabled={isCancelling || !cancelReason.trim()}
                  onClick={async () => {
                    if (!cancelReason.trim()) {
                      toast.error("Please provide a reason for cancellation");
                      return;
                    }
                    setIsCancelling(true);
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/cancellation-request`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userType: 'coach',
                          userName: profile?.full_name || 'Coach',
                          userEmail: profile?.email || '',
                          reason: cancelReason
                        })
                      });
                      if (response.ok) {
                        toast.success("Your cancellation request has been submitted. We will contact you shortly.");
                        setShowCancelModal(false);
                        setCancelReason("");
                      } else {
                        const data = await response.json();
                        toast.error(data.error || "Failed to submit request");
                      }
                    } catch (error) {
                      console.error("Cancellation error:", error);
                      toast.error("Failed to submit request. Please try again.");
                    } finally {
                      setIsCancelling(false);
                    }
                  }}
                  data-testid="button-confirm-cancel"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blocking Agreement Modal */}
      {needsAgreement && !checkingAgreement && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
            <CardHeader style={{ background: "linear-gradient(to right, #0D566C, #FF6B5C)", color: "#FFFFFF" }}>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Coach Agreement Required
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "rgba(245,197,66,0.1)", border: "1px solid rgba(245,197,66,0.3)" }}>
                  <p className="text-sm" style={{ color: "#b45309" }}>
                    <strong>Important:</strong> We have updated our Coach Agreement. Please review and accept the new terms to continue using your dashboard.
                  </p>
                </div>
                
                <div className="rounded-lg max-h-[40vh] overflow-y-auto" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8" }}>
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed" style={{ color: "#4A4A4A" }}>
                      {COACH_CONTRACT}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-4 rounded-lg" style={{ backgroundColor: "#F3F3F3" }}>
                  <input 
                    type="checkbox" 
                    id="agree-checkbox"
                    checked={agreementCheckboxChecked}
                    onChange={(e) => setAgreementCheckboxChecked(e.target.checked)}
                    className="mt-1"
                    data-testid="checkbox-agree"
                  />
                  <label htmlFor="agree-checkbox" className="text-sm" style={{ color: "#4A4A4A" }}>
                    I have read and agree to the TouchConnectPro Coach Agreement. I understand and accept all terms and conditions.
                  </label>
                </div>
              </div>
            </CardContent>
            <div className="p-4 flex justify-end" style={{ borderTop: "1px solid #E8E8E8" }}>
              <Button
                disabled={!agreementCheckboxChecked || acceptingAgreement}
                className="rounded-full"
                style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                onClick={async () => {
                  setAcceptingAgreement(true);
                  try {
                    const response = await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: profile?.email,
                        role: 'coach',
                        contractVersion: CONTRACT_VERSION,
                        contractText: COACH_CONTRACT,
                        userAgent: navigator.userAgent
                      })
                    });
                    if (response.ok) {
                      toast.success("Thank you for accepting the Coach Agreement!");
                      setNeedsAgreement(false);
                    } else {
                      toast.error("Failed to save agreement. Please try again.");
                    }
                  } catch (error) {
                    console.error("Error accepting agreement:", error);
                    toast.error("Failed to save agreement. Please try again.");
                  } finally {
                    setAcceptingAgreement(false);
                  }
                }}
                data-testid="button-accept-agreement"
              >
                {acceptingAgreement ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Accept Agreement"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
