import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, TrendingUp, DollarSign, Target, Save, Loader2, Building2, Link as LinkIcon, LogOut, MessageSquare, AlertCircle, Calendar, Camera, FileText, Upload, Download, Paperclip, Reply, ChevronDown, Send, User, ClipboardCheck, CheckCircle } from "lucide-react";
import { DashboardMobileNav, NavTab } from "@/components/DashboardNav";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";
import MyAgreements from "@/components/MyAgreements";

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
  bio?: string;
  data?: {
    profileImage?: string;
    bio?: string;
    notes?: InvestorNote[];
  };
}

interface InvestorNote {
  id: string;
  text: string;
  timestamp: string;
  completed?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  responses?: NoteResponse[];
}

interface NoteResponse {
  id: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  fromAdmin?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  status: string;
  meetingUrl?: string;
}

export default function DashboardInvestor() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [fundName, setFundName] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentPreference, setInvestmentPreference] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "investments" | "meetings" | "agreements">("overview");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [investorReadMessageIds, setInvestorReadMessageIds] = useState<string[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasPendingCancellation, setHasPendingCancellation] = useState(false);
  const [hasProcessedCancellation, setHasProcessedCancellation] = useState(false);
  
  // Investment notes state (like mentor notes)
  const [investorNotes, setInvestorNotes] = useState<InvestorNote[]>([]);
  const [noteResponses, setNoteResponses] = useState<Record<string, string>>({});
  const [noteAttachments, setNoteAttachments] = useState<Record<string, File | null>>({});
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [submittingNoteId, setSubmittingNoteId] = useState<string | null>(null);
  
  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([]);

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

        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }
        
        if (!user?.email) {
          setLoading(false);
          return;
        }

        setUserEmail(user.email);

        const response = await fetch(`${API_BASE_URL}/api/investors/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFullName(data.full_name || "");
          setBio(data.bio || data.data?.bio || "");
          setFundName(data.fund_name || "");
          setInvestmentFocus(data.investment_focus || "");
          setInvestmentPreference(data.investment_preference || "");
          setInvestmentAmount(data.investment_amount || "");
          setLinkedin(data.linkedin || "");
          setProfileImage(data.data?.profileImage || "");
          setInvestorNotes(data.data?.notes || []);
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

  // Check if investor has a pending cancellation request
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

  // Load meetings for this investor
  useEffect(() => {
    if (!profile?.id) return;
    
    async function loadMeetings() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/investor-meetings/${encodeURIComponent(profile!.id)}`);
        if (response.ok) {
          const data = await response.json();
          const rawMeetings = data.meetings || [];
          const transformedMeetings: Meeting[] = rawMeetings.map((m: any) => {
            const startDate = m.startTime ? new Date(m.startTime) : null;
            return {
              id: m.id,
              title: m.topic || m.title || "Meeting",
              date: startDate ? startDate.toLocaleDateString() : (m.date || "TBD"),
              time: startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (m.time || "TBD"),
              host: m.hostName || m.host || "TouchConnectPro Admin",
              status: m.status || "scheduled",
              meetingUrl: m.joinUrl || m.meetingUrl
            };
          });
          setMeetings(transformedMeetings);
        }
      } catch (error) {
        console.error("Error loading meetings:", error);
      }
    }

    loadMeetings();
  }, [profile?.id]);

  // Include all admin email aliases
  const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
  const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());

  // Mark admin messages as read when viewing messages tab
  useEffect(() => {
    if (activeTab === "messages" && profile?.email) {
      const adminMessagesToMark = adminMessages
        .filter((m: any) => m.to_email === profile.email && isAdminEmail(m.from_email) && !investorReadMessageIds.includes(m.id))
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
    (m: any) => m.to_email === profile?.email && isAdminEmail(m.from_email) && !investorReadMessageIds.includes(m.id)
  ).length;

  // Calculate unread notes count
  const unreadNotesCount = investorNotes.filter(n => !n.completed).length;

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/investors/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          bio,
          fundName,
          investmentFocus,
          investmentPreference,
          investmentAmount,
          linkedin,
          profileImage
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.investor) {
          setProfile(result.investor);
          setBio(result.investor.data?.bio || bio);
          setProfileImage(result.investor.data?.profileImage || profileImage);
          setFullName(result.investor.full_name || fullName);
        }
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  // Submit response to an investment note
  const handleSubmitNoteResponse = async (noteId: string) => {
    const responseText = noteResponses[noteId] || "";
    const file = noteAttachments[noteId];
    
    if (!responseText.trim() && !file) {
      toast.error("Please enter a response or attach a file");
      return;
    }
    
    if (!profile?.id) {
      toast.error("Profile not found");
      return;
    }
    
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("File type not allowed. Please use PDF, Word, Excel, CSV, TXT, or images.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
    }
    
    setSubmittingNoteId(noteId);
    
    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentSize = null;
      let attachmentType = null;
      
      if (file) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/upload-investor-attachment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
            fileType: file.type,
            investorId: profile.id
          })
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || "Failed to upload file");
        }
        
        const uploadResult = await uploadResponse.json();
        attachmentUrl = uploadResult.url;
        attachmentName = file.name;
        attachmentSize = file.size;
        attachmentType = file.type;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/investor-notes/${profile.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId,
          text: responseText,
          attachmentUrl,
          attachmentName,
          attachmentSize,
          attachmentType,
          fromAdmin: false
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit response");
      }
      
      const result = await response.json();
      setInvestorNotes(result.notes || []);
      
      setNoteResponses(prev => ({ ...prev, [noteId]: "" }));
      setNoteAttachments(prev => ({ ...prev, [noteId]: null }));
      
      toast.success("Response submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error submitting response");
    } finally {
      setSubmittingNoteId(null);
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

  const investorNavTabs: NavTab[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, badge: unreadMessageCount > 0 ? <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadMessageCount}</span> : undefined },
    { id: "investments", label: "My Investments", icon: <TrendingUp className="h-4 w-4" />, badge: unreadNotesCount > 0 ? <span className="bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadNotesCount}</span> : undefined },
    { id: "meetings", label: "My Meetings", icon: <Calendar className="h-4 w-4" /> },
    { id: "agreements", label: "My Agreements", icon: <ClipboardCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardMobileNav
        tabs={investorNavTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        title="Investor Dashboard"
        userName={fullName || profile?.full_name || "Investor"}
        userRole={profile?.is_disabled ? "Disabled" : "Investor"}
        onLogout={handleLogout}
      />
      <div className="flex flex-1">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className={`h-10 w-10 border border-slate-200 ${profile?.is_disabled ? "bg-red-500" : "bg-amber-500"}`}>
              {profileImage ? (
                <AvatarImage src={profileImage} alt={fullName} />
              ) : (
                <AvatarFallback className="text-white">
                  {profile?.full_name ? getInitials(profile.full_name) : "IN"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-bold text-sm">{fullName || profile?.full_name || "Investor"}</div>
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
            <Button 
              variant={activeTab === "investments" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600 relative"
              onClick={() => setActiveTab("investments")}
              data-testid="button-investments-tab"
            >
              <TrendingUp className="mr-2 h-4 w-4" /> My Investments
              {unreadNotesCount > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadNotesCount}
                </span>
              )}
            </Button>
            <Button 
              variant={activeTab === "meetings" ? "secondary" : "ghost"} 
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("meetings")}
              data-testid="button-meetings-tab"
            >
              <Calendar className="mr-2 h-4 w-4" /> My Meetings
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
                      <p className="text-red-700 dark:text-red-400">Your investor account has been disabled. Your profile is currently in view-only mode. Please use the Messages tab to contact the Admin team if you would like to reactivate your account.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {hasPendingCancellation && (
              <Card className="mb-6 border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-1">Cancellation Request Pending</h3>
                      <p className="text-orange-700 dark:text-orange-400">Your cancellation request has been received and is being processed. You can still change your mind – just email us at <a href="mailto:hello@touchconnectpro.com" className="underline hover:text-orange-600">hello@touchconnectpro.com</a>.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasProcessedCancellation && (
              <Card className="mb-6 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">Cancellation Approved</h3>
                      <p className="text-green-700 dark:text-green-400">Your cancellation request has been received and approved. Thank you for being part of TouchConnectPro. If you ever wish to return, you're always welcome back!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          <header className="mb-8 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-amber-300">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={fullName} />
                ) : (
                  <AvatarFallback className="text-xl bg-amber-500 text-white">
                    {fullName ? getInitials(fullName) : "IN"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                  Welcome, {fullName?.split(" ")[0] || profile?.full_name?.split(" ")[0] || "Investor"}!
                </h1>
                <p className="text-muted-foreground mt-2">
                  {profile?.is_disabled
                    ? "Your profile is currently in view-only mode."
                    : "Manage your investment profile and access pre-vetted startups."}
                </p>
              </div>
            </div>
            {!profile?.is_disabled && (
              <div className="flex gap-2">
                {isEditingProfile ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700"
                      data-testid="button-save-profile"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                    data-testid="button-edit-profile"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </header>

          {/* Bio Display Box - shown in Overview when not editing */}
          {!isEditingProfile && bio && (
            <Card className="mb-6 border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Profile Picture Section */}
          {isEditingProfile && (
            <Card className="mb-6 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-amber-600" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-amber-300">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt={fullName} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-amber-500 text-white">
                      {fullName ? getInitials(fullName) : "IN"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                    data-testid="input-profile-image"
                  />
                  <label htmlFor="profile-image-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span><Upload className="mr-2 h-4 w-4" /> Upload Photo</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">Max 5MB, JPG or PNG</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            {isEditingProfile && (
              <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-600" />
                    Full Name
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name..."
                    data-testid="input-full-name"
                  />
                </CardContent>
              </Card>
            )}

            {/* Email (Non-editable) */}
            {isEditingProfile && (
              <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                    Email Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Input
                    value={profile?.email || ""}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    data-testid="input-email"
                  />
                  <p className="text-xs text-slate-500">To change your email, please contact admin</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  Fund / Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your investment fund or organization name</p>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    placeholder="Enter fund name..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                    data-testid="input-fund-name"
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">{fundName || "Not specified"}</p>
                )}
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
                {isEditingProfile ? (
                  <select 
                    value={investmentPreference}
                    onChange={(e) => setInvestmentPreference(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                    data-testid="select-investment-preference"
                  >
                    <option value="">Select investment type...</option>
                    <option value="platform">TouchConnectPro as a whole</option>
                    <option value="projects">Individual Projects</option>
                    <option value="both">Both</option>
                  </select>
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">
                    {investmentPreference === "platform" ? "TouchConnectPro as a whole" :
                     investmentPreference === "projects" ? "Individual Projects" :
                     investmentPreference === "both" ? "Both" : "Not specified"}
                  </p>
                )}
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
                {isEditingProfile ? (
                  <select 
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
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
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">{investmentAmount || "Not specified"}</p>
                )}
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
                {isEditingProfile ? (
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                    data-testid="input-linkedin"
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">
                    {linkedin ? (
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">{linkedin}</a>
                    ) : "Not specified"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Investment Focus & Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What industries or sectors do you focus on?</p>
                {isEditingProfile ? (
                  <textarea 
                    value={investmentFocus}
                    onChange={(e) => setInvestmentFocus(e.target.value)}
                    placeholder="e.g., SaaS, AI/ML, healthtech, fintech, climate tech..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                    data-testid="input-investment-focus"
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white whitespace-pre-wrap">{investmentFocus || "Not specified"}</p>
                )}
              </CardContent>
            </Card>

            {/* Bio Section */}
            {isEditingProfile && (
              <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Bio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tell us about yourself and your investment philosophy</p>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Your professional background, investment philosophy, what you look for in startups..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                    data-testid="input-bio"
                  />
                </CardContent>
              </Card>
            )}
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
                      {[...adminMessages].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => (
                          <div 
                            key={msg.id} 
                            className={`p-4 rounded-lg ${isAdminEmail(msg.from_email) ? "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-l-amber-500" : "bg-slate-50 dark:bg-slate-800/50 border-l-4 border-l-slate-400"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-semibold ${isAdminEmail(msg.from_email) ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                                {isAdminEmail(msg.from_email) ? "From Admin" : "You"}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatToPST(msg.created_at)}</span>
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

          {/* My Investments Tab (Notes from Admin) */}
          {activeTab === "investments" && (
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">My Investments</h1>
              <p className="text-muted-foreground mb-8">Investment opportunities and notes from the TouchConnectPro admin team.</p>

              {investorNotes.length > 0 ? (
                <div className="space-y-4">
                  {investorNotes.map((note, idx) => {
                    const isExpanded = expandedNoteId === note.id;
                    const isSubmitting = submittingNoteId === note.id;
                    
                    return (
                      <Card key={note.id} className={`border-l-4 ${note.completed ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' : 'border-l-amber-500'}`} data-testid={`card-note-${note.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <div className={`text-3xl font-bold min-w-12 ${note.completed ? 'text-green-500' : 'text-amber-500'}`}>{idx + 1}.</div>
                            <div className="flex-1">
                              {note.completed && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Marked as Complete by Admin
                                </div>
                              )}
                              <p className={`leading-relaxed ${note.completed ? 'text-green-900 dark:text-green-100' : 'text-slate-900 dark:text-white'}`}>{note.text}</p>
                              {note.attachmentUrl && (
                                <a 
                                  href={note.attachmentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 mt-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  {note.attachmentName || 'Download Attachment'}
                                  <Download className="h-3 w-3" />
                                </a>
                              )}
                              {note.timestamp && <p className={`text-xs mt-3 ${note.completed ? 'text-green-700 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'}`}>Added on {new Date(note.timestamp).toLocaleDateString()}</p>}
                              
                              {/* Existing Responses */}
                              {note.responses && note.responses.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <Reply className="h-4 w-4" /> Responses ({note.responses.length})
                                  </p>
                                  {note.responses.map((resp, respIdx) => (
                                    <div key={resp.id || respIdx} className={`rounded-lg p-3 border ${resp.fromAdmin ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                      <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-medium ${resp.fromAdmin ? 'text-amber-600' : 'text-slate-500'}`}>
                                          {resp.fromAdmin ? 'Admin' : 'You'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(resp.timestamp).toLocaleString()}</span>
                                      </div>
                                      {resp.text && <p className="text-sm text-slate-800 dark:text-slate-200">{resp.text}</p>}
                                      {resp.attachmentUrl && (
                                        <a 
                                          href={resp.attachmentUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 mt-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                                        >
                                          <Paperclip className="h-4 w-4" />
                                          {resp.attachmentName || 'Download Attachment'}
                                          <Download className="h-3 w-3" />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Response Form */}
                              {!note.completed && (
                                <div className="mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                  >
                                    <Reply className="mr-2 h-4 w-4" />
                                    {isExpanded ? 'Hide Response Form' : 'Respond'}
                                  </Button>
                                  
                                  {isExpanded && (
                                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                      <textarea
                                        value={noteResponses[note.id] || ""}
                                        onChange={(e) => setNoteResponses(prev => ({ ...prev, [note.id]: e.target.value }))}
                                        placeholder="Write your response..."
                                        className="w-full min-h-20 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        data-testid={`textarea-response-${note.id}`}
                                      />
                                      
                                      <div className="flex items-center gap-4 mt-3">
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setNoteAttachments(prev => ({ ...prev, [note.id]: file }));
                                          }}
                                          className="hidden"
                                          id={`attachment-${note.id}`}
                                          data-testid={`input-attachment-${note.id}`}
                                        />
                                        <label htmlFor={`attachment-${note.id}`} className="cursor-pointer">
                                          <Button variant="outline" size="sm" asChild>
                                            <span><Paperclip className="mr-2 h-4 w-4" /> Attach File</span>
                                          </Button>
                                        </label>
                                        {noteAttachments[note.id] && (
                                          <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {noteAttachments[note.id]?.name}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <Button
                                        onClick={() => handleSubmitNoteResponse(note.id)}
                                        disabled={isSubmitting || (!noteResponses[note.id]?.trim() && !noteAttachments[note.id])}
                                        className="mt-3 bg-amber-600 hover:bg-amber-700"
                                        data-testid={`button-submit-response-${note.id}`}
                                      >
                                        {isSubmitting ? (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="mr-2 h-4 w-4" />
                                        )}
                                        Submit Response
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <TrendingUp className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Investment Notes Yet</h3>
                      <p className="text-muted-foreground">When the admin team identifies investment opportunities for you, they'll appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* My Meetings Tab */}
          {activeTab === "meetings" && (
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">My Meetings</h1>
              <p className="text-muted-foreground mb-8">Scheduled meetings with the TouchConnectPro team.</p>

              {meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Card key={meeting.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{meeting.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {meeting.date} at {meeting.time}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">Host: {meeting.host}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              meeting.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                              meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {meeting.status}
                            </span>
                            {meeting.meetingUrl && (
                              <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                  Join Meeting
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Meetings Scheduled</h3>
                      <p className="text-muted-foreground">When meetings are scheduled with you, they'll appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Agreements Tab */}
          {activeTab === "agreements" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Agreements</h2>
              {profile?.email && <MyAgreements userEmail={profile.email} />}
              
              {/* Cancellation Section */}
              <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Cancel Investor Partnership</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  If you wish to end your partnership with TouchConnectPro, please submit a cancellation request.
                </p>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Cancel Investor Partnership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We're sorry to see you go. Please let us know why you'd like to end your partnership.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please share your reason..."
                  className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white resize-y"
                  data-testid="input-cancel-reason"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
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
                          userType: 'investor',
                          userName: profile?.full_name || 'Investor',
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
      </div>
    </div>
  );
}
