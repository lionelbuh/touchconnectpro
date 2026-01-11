import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, MessageSquare, Calendar, Settings, ChevronRight, ChevronDown, ChevronUp, Plus, LogOut, Briefcase, AlertCircle, Save, Loader2, ExternalLink, Send, GraduationCap, Camera, User, Download, Reply, FileText, ClipboardCheck, Paperclip, RefreshCw, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";
import { IDEA_PROPOSAL_QUESTIONS } from "@/lib/constants";
import MyAgreements from "@/components/MyAgreements";

interface MentorProfileData {
  id: string;
  full_name: string;
  email: string;
  linkedin: string | null;
  bio: string;
  expertise: string;
  experience: string;
  country: string;
  state: string | null;
  is_disabled?: boolean;
  data?: {
    profileImage?: string | null;
    [key: string]: any;
  };
}

export default function DashboardMentor() {
  const [mentorStatus, setMentorStatus] = useState<"notApplied" | "pending" | "approved">("approved");
  const [activeTab, setActiveTab] = useState<"overview" | "investors" | "portfolio" | "coaches" | "messages" | "meetings" | "profile" | "agreements">("overview");
  const [approvedInvestors, setApprovedInvestors] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);
  const [approvedCoaches, setApprovedCoaches] = useState<any[]>([]);
  const [coachRatings, setCoachRatings] = useState<Record<string, { averageRating: number; totalRatings: number }>>({});

  const [mentorProfile, setMentorProfile] = useState({
    fullName: "",
    email: "",
    linkedin: "",
    bio: "",
    expertise: "",
    yearsExperience: "",
    profileImage: null as string | null,
    approved: true
  });

  const [portfolios, setPortfolios] = useState<Array<{
    id: number;
    name: string;
    memberCount: number;
    members: Array<{
      id: string;
      name: string;
      email: string;
      linkedin?: string;
      businessIdea?: string;
      ideaName?: string;
      country?: string;
      state?: string;
      photoUrl?: string;
      ideaReview?: any;
      businessPlan?: any;
      meetingQuestions?: any;
      meetingQuestionsGeneratedAt?: string;
      mentorNotes?: any[];
      assignment_id?: string;
    }>;
    lastMeeting: string;
  }>>([]);
  
  const [expandedProposal, setExpandedProposal] = useState<{[key: string]: boolean}>({});
  const [expandedBusinessPlan, setExpandedBusinessPlan] = useState<{[key: string]: boolean}>({});
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: string]: boolean}>({});

  const [messages, setMessages] = useState<any[]>([]);
  const [entrepreneurMessages, setEntrepreneurMessages] = useState<any[]>([]);

  const [meetings, setMeetings] = useState<any[]>([]);

  const [newMessage, setNewMessage] = useState("");
  const [newMeeting, setNewMeeting] = useState({ date: "", time: "", topic: "", duration: 60 });
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [mentorReadMessageIds, setMentorReadMessageIds] = useState<string[]>([]);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<any>(null);
  const [showEntrepreneurMessageModal, setShowEntrepreneurMessageModal] = useState(false);
  const [entrepreneurMessage, setEntrepreneurMessage] = useState("");
  const [creatingZoomMeeting, setCreatingZoomMeeting] = useState(false);
  const [zoomMeetingResult, setZoomMeetingResult] = useState<any>(null);
  const [selectedEntrepreneurIds, setSelectedEntrepreneurIds] = useState<string[]>([]);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [zoomMeetings, setZoomMeetings] = useState<any[]>([]);
  
  // Message threads state (threaded conversations with entrepreneurs)
  const [messageThreads, setMessageThreads] = useState<any[]>([]);
  const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
  const [threadReplyText, setThreadReplyText] = useState<Record<number, string>>({});
  const [threadReplyAttachments, setThreadReplyAttachments] = useState<Record<number, {name: string; type: string; url: string}[]>>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [readThreadEntryCounts, setReadThreadEntryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          setLoading(false);
          return;
        }

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

        const response = await fetch(`${API_BASE_URL}/api/mentors/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data: MentorProfileData = await response.json();
          setProfileId(data.id);
          setIsAccountDisabled(data.is_disabled || false);
          setMentorProfile({
            fullName: data.full_name || "",
            email: data.email || "",
            linkedin: data.linkedin || "",
            bio: data.bio || "",
            expertise: data.expertise || "",
            yearsExperience: data.experience || "",
            profileImage: data.data?.profileImage || null,
            approved: true
          });
          setMentorStatus("approved");
        } else {
          setMentorStatus("notApplied");
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
    const savedReadIds = localStorage.getItem("tcp_mentorReadMessageIds");
    if (savedReadIds) {
      setMentorReadMessageIds(JSON.parse(savedReadIds));
    }
    // Load read thread entry counts
    const savedThreadCounts = localStorage.getItem("tcp_mentorReadThreadEntryCounts");
    if (savedThreadCounts) {
      setReadThreadEntryCounts(JSON.parse(savedThreadCounts));
    }
  }, []);

  // Load Zoom meetings for this mentor
  useEffect(() => {
    if (!profileId) return;
    
    async function loadMeetings() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/zoom/meetings/${encodeURIComponent(profileId)}`);
        if (response.ok) {
          const data = await response.json();
          setMeetings(data.meetings || []);
        }
      } catch (error) {
        console.error("Error loading meetings:", error);
      }
    }

    loadMeetings();
  }, [profileId]);

  // Load admin messages from database
  useEffect(() => {
    async function loadMessages() {
      if (!mentorProfile.email) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(mentorProfile.email)}`);
        if (response.ok) {
          const data = await response.json();
          setAdminMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    }
    loadMessages();
  }, [mentorProfile.email]);

  // Load message threads (threaded conversations with entrepreneurs)
  useEffect(() => {
    async function loadMessageThreads() {
      if (!mentorProfile.email) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/message-threads/${encodeURIComponent(mentorProfile.email)}`);
        if (response.ok) {
          const data = await response.json();
          setMessageThreads(data.threads || []);
        }
      } catch (error) {
        console.error("Error loading message threads:", error);
      }
    }
    loadMessageThreads();
  }, [mentorProfile.email]);

  // Helper: Upload file attachment (mentor)
  const uploadAttachment = async (file: File): Promise<{name: string; type: string; url: string} | null> => {
    try {
      setUploadingFile(true);
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const response = await fetch(`${API_BASE_URL}/api/message-threads/upload`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileData: base64,
                userEmail: mentorProfile.email
              })
            });
            if (response.ok) {
              const data = await response.json();
              resolve(data.attachment);
            } else {
              toast.error("Failed to upload file");
              resolve(null);
            }
          } catch (err) {
            reject(err);
          } finally {
            setUploadingFile(false);
          }
        };
        reader.onerror = () => {
          setUploadingFile(false);
          reject(reader.error);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadingFile(false);
      toast.error("Error uploading file");
      return null;
    }
  };

  // Helper: Handle file selection for reply (mentor)
  const handleReplyFileSelect = async (threadId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    for (const file of Array.from(files)) {
      const attachment = await uploadAttachment(file);
      if (attachment) {
        setThreadReplyAttachments(prev => ({
          ...prev,
          [threadId]: [...(prev[threadId] || []), attachment]
        }));
        toast.success(`${file.name} uploaded!`);
      }
    }
    e.target.value = ''; // Reset input
  };

  // Helper: Add reply to thread (mentor)
  const addThreadReply = async (threadId: number) => {
    const replyText = threadReplyText[threadId];
    if (!replyText?.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/message-threads/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          senderRole: "mentor",
          senderName: mentorProfile.fullName || "Mentor",
          attachments: threadReplyAttachments[threadId] || []
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMessageThreads(prev => prev.map(t => t.id === threadId ? data.thread : t));
        setThreadReplyText(prev => ({ ...prev, [threadId]: "" }));
        setThreadReplyAttachments(prev => ({ ...prev, [threadId]: [] }));
        toast.success("Reply sent!");
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Error sending reply");
    }
  };

  // Helper: Close thread (mentor only)
  const closeThread = async (threadId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/message-threads/${threadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" })
      });
      if (response.ok) {
        const data = await response.json();
        setMessageThreads(prev => prev.map(t => t.id === threadId ? data.thread : t));
        toast.success("Conversation closed");
      } else {
        toast.error("Failed to close conversation");
      }
    } catch (error) {
      console.error("Error closing thread:", error);
      toast.error("Error closing conversation");
    }
  };

  // Helper: Reopen thread (mentor only)
  const reopenThread = async (threadId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/message-threads/${threadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" })
      });
      if (response.ok) {
        const data = await response.json();
        setMessageThreads(prev => prev.map(t => t.id === threadId ? data.thread : t));
        toast.success("Conversation reopened");
      } else {
        toast.error("Failed to reopen conversation");
      }
    } catch (error) {
      console.error("Error reopening thread:", error);
      toast.error("Error reopening conversation");
    }
  };

  // Helper: Refresh threads
  const refreshThreads = async () => {
    if (!mentorProfile.email) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/message-threads/${encodeURIComponent(mentorProfile.email)}`);
      if (response.ok) {
        const data = await response.json();
        setMessageThreads(data.threads || []);
        toast.success("Conversations refreshed!");
      }
    } catch (error) {
      console.error("Error refreshing threads:", error);
    }
  };

  // Include all admin email aliases
  const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
  const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());

  // Mark admin messages and threads as read when viewing messages tab
  useEffect(() => {
    if (activeTab === "messages" && mentorProfile.email) {
      // Mark legacy admin messages as read
      const adminMessagesToMark = adminMessages
        .filter((m: any) => m.to_email === mentorProfile.email && isAdminEmail(m.from_email) && !mentorReadMessageIds.includes(m.id))
        .map((m: any) => m.id);
      
      if (adminMessagesToMark.length > 0) {
        const updatedReadIds = [...mentorReadMessageIds, ...adminMessagesToMark];
        setMentorReadMessageIds(updatedReadIds);
        localStorage.setItem("tcp_mentorReadMessageIds", JSON.stringify(updatedReadIds));
      }

      // Mark threads as read by storing current entry counts
      const newReadCounts: Record<string, number> = { ...readThreadEntryCounts };
      let hasChanges = false;
      messageThreads.forEach((thread: any) => {
        const entryCount = (thread.entries || []).length;
        const threadKey = String(thread.id);
        if (newReadCounts[threadKey] !== entryCount) {
          newReadCounts[threadKey] = entryCount;
          hasChanges = true;
        }
      });
      if (hasChanges) {
        setReadThreadEntryCounts(newReadCounts);
        localStorage.setItem("tcp_mentorReadThreadEntryCounts", JSON.stringify(newReadCounts));
      }
    }
  }, [activeTab, adminMessages, mentorProfile.email, mentorReadMessageIds, messageThreads, readThreadEntryCounts]);

  // Calculate unread message count using is_read from database
  // Count ALL unread messages to mentor (from admin + entrepreneurs)
  const unreadLegacyMessages = adminMessages.filter(
    (m: any) => m.to_email === mentorProfile.email && !m.is_read
  ).length;

  // Count unread thread messages (threads with new entries since last read)
  const unreadThreadMessages = messageThreads.filter((thread: any) => {
    const entries = thread.entries || [];
    if (entries.length === 0) return false;
    const threadKey = String(thread.id);
    const lastReadCount = readThreadEntryCounts[threadKey] || 0;
    // Unread if there are new entries AND the last entry is from entrepreneur
    if (entries.length > lastReadCount) {
      const lastEntry = entries[entries.length - 1];
      return lastEntry.sender_role === 'entrepreneur';
    }
    return false;
  }).length;

  // Total unread count (legacy + threads)
  const unreadMessageCount = unreadLegacyMessages + unreadThreadMessages;

  // Calculate unread messages specifically from mentees (exclude admin messages)
  const unreadFromMentees = adminMessages.filter(
    (m: any) => m.to_email === mentorProfile.email && 
                !m.is_read && 
                !isAdminEmail(m.from_email) &&
                m.from_email !== "system@touchconnectpro.com"
  ).length + unreadThreadMessages;

  // Function to refresh portfolio data
  const refreshPortfolios = async (email?: string) => {
    const mentorEmail = email || mentorProfile.email;
    if (!mentorEmail) {
      console.log("[DashboardMentor] Mentor email not set yet");
      return;
    }
    
    console.log("[DashboardMentor] Fetching entrepreneurs for mentor email:", mentorEmail);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor-assignments/mentor-email/${encodeURIComponent(mentorEmail)}`);
      console.log("[DashboardMentor] Fetch response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("[DashboardMentor] Received data:", data);
        
        if (!data.entrepreneurs || data.entrepreneurs.length === 0) {
          console.log("[DashboardMentor] No entrepreneurs found for this mentor");
          setPortfolios([]);
          return;
        }
        
        // Group entrepreneurs by portfolio number (1-10)
        const portfolioMap: { [key: number]: typeof data.entrepreneurs } = {};
        
        data.entrepreneurs?.forEach((item: any) => {
          const portfolioNum = item.portfolio_number || 1;
          if (!portfolioMap[portfolioNum]) {
            portfolioMap[portfolioNum] = [];
          }
          portfolioMap[portfolioNum].push(item);
        });
        
        // Create portfolios array
        const portfoliosArray = Object.entries(portfolioMap).map(([num, members]) => ({
          id: parseInt(num),
          name: `Portfolio ${num}`,
          memberCount: members.length,
          members: members.map((m: any) => {
            console.log("[DashboardMentor] Mapping member:", { assignment_id: m.assignment_id, notes: m.mentor_notes });
            return {
              id: m.entrepreneur?.id || "",
              assignment_id: m.assignment_id,
              name: m.entrepreneur?.full_name || "Unknown",
              email: m.entrepreneur?.email || "",
              linkedin: m.entrepreneur?.linkedin,
              businessIdea: m.entrepreneur?.business_idea,
              ideaName: m.entrepreneur?.idea_name,
              country: m.entrepreneur?.country,
              state: m.entrepreneur?.state,
              photoUrl: m.entrepreneur?.photo_url,
              ideaReview: m.entrepreneur?.ideaReview,
              businessPlan: m.entrepreneur?.businessPlan,
              meetingQuestions: m.entrepreneur?.meetingQuestions,
              meetingQuestionsGeneratedAt: m.entrepreneur?.meetingQuestionsGeneratedAt,
              mentorNotes: m.mentor_notes || [],
              bio: m.entrepreneur?.bio,
              fullBio: m.entrepreneur?.fullBio
            };
          }),
          lastMeeting: ""
        }));
        
        console.log("[DashboardMentor] Created portfolios array:", portfoliosArray);
        setPortfolios(portfoliosArray.length > 0 ? portfoliosArray : []);
      } else {
        console.error("[DashboardMentor] Fetch failed with status:", response.status);
        const error = await response.json();
        console.error("[DashboardMentor] Error details:", error);
      }
    } catch (error) {
      console.error("[DashboardMentor] Error fetching assigned entrepreneurs:", error);
    }
  };

  // Fetch assigned entrepreneurs when mentor email is available
  useEffect(() => {
    refreshPortfolios();
  }, [mentorProfile.email]);

  // Fetch approved coaches
  useEffect(() => {
    async function loadCoaches() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coaches`);
        if (response.ok) {
          const coaches = await response.json();
          const approved = coaches.filter((c: any) => c.status === "approved" && !c.is_disabled);
          setApprovedCoaches(approved);
          
          // Fetch ratings for each coach
          const ratingsMap: Record<string, { averageRating: number; totalRatings: number }> = {};
          await Promise.all(approved.map(async (coach: any) => {
            try {
              const ratingResponse = await fetch(`${API_BASE_URL}/api/coach-ratings/${coach.id}`);
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                if (ratingData.averageRating !== null) {
                  ratingsMap[coach.id] = {
                    averageRating: ratingData.averageRating,
                    totalRatings: ratingData.totalRatings
                  };
                }
              }
            } catch (e) {
              console.error("Error fetching coach rating:", e);
            }
          }));
          setCoachRatings(ratingsMap);
        }
      } catch (error) {
        console.error("Error loading coaches:", error);
      }
    }
    loadCoaches();
  }, []);

  const handleSaveProfile = async () => {
    if (!profileId) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentors/profile/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: mentorProfile.fullName,
          bio: mentorProfile.bio,
          expertise: mentorProfile.expertise,
          experience: mentorProfile.yearsExperience,
          linkedin: mentorProfile.linkedin,
          profileImage: mentorProfile.profileImage
        })
      });

      if (response.ok) {
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

  const handleLogout = () => {
    localStorage.removeItem("tcp_mentorProfile");
    localStorage.removeItem("tcp_mentorPortfolios");
    window.location.href = "/";
  };

  const handleAddPortfolio = () => {
    if (portfolios.length < 20) {
      const newPortfolio = {
        id: Math.max(...portfolios.map(p => p.id), 0) + 1,
        name: `Portfolio ${portfolios.length + 1}`,
        memberCount: 0,
        members: [],
        lastMeeting: ""
      };
      setPortfolios([...portfolios, newPortfolio]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedPortfolio !== null) {
      setMessages([
        {
          id: messages.length + 1,
          from: `Message to Portfolio ${selectedPortfolio + 1}`,
          text: newMessage,
          timestamp: "Just now"
        },
        ...messages
      ]);
      setNewMessage("");
      setShowMessageModal(false);
    }
  };

  const handleScheduleMeeting = () => {
    if (newMeeting.date && newMeeting.time && selectedPortfolio !== null) {
      setMeetings([
        {
          id: meetings.length + 1,
          portfolio: selectedPortfolio + 1,
          date: newMeeting.date,
          time: newMeeting.time,
          attendees: portfolios[selectedPortfolio].memberCount + 1,
          topic: newMeeting.topic || "Monthly Check-in"
        },
        ...meetings
      ]);
      setNewMeeting({ date: "", time: "", topic: "" });
      setShowMeetingModal(false);
    }
  };

  if (mentorStatus === "notApplied") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="max-w-md border-slate-300 dark:border-slate-700">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-center mb-2 text-slate-900 dark:text-white">Not Yet Applied</h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
              To access the mentor dashboard, you need to apply first. Click the button below to get started.
            </p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => window.location.href = "/become-mentor"}>
              Go to Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mentorStatus === "pending") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="max-w-md border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-center mb-2 text-slate-900 dark:text-white">Approval Pending</h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
              Your mentor application is being reviewed by our admin team. You'll be able to access your dashboard once approved.
            </p>
            <p className="text-center text-sm text-amber-700 dark:text-amber-300">
              This typically takes 24-48 hours. Check your email for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className={`h-10 w-10 border border-slate-200 ${isAccountDisabled ? "bg-red-500" : "bg-cyan-500"}`}>
              <AvatarFallback className="text-white">SC</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{mentorProfile.fullName}</div>
              <div className={`text-xs ${isAccountDisabled ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                {isAccountDisabled ? "Disabled" : "Mentor"}
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
              <Briefcase className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button 
              variant={activeTab === "portfolio" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("portfolio")}
              data-testid="button-portfolio-tab"
            >
              <Users className="mr-2 h-4 w-4" /> Portfolios
            </Button>
            <Button 
              variant={activeTab === "coaches" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("coaches")}
              data-testid="button-coaches-tab"
            >
              <GraduationCap className="mr-2 h-4 w-4" /> Available Coaches
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
            {/* Hidden for now - keep for future use
            <Button 
              variant={activeTab === "meetings" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("meetings")}
              data-testid="button-meetings-tab"
            >
              <Calendar className="mr-2 h-4 w-4" /> Meetings
            </Button>
            */}
            <Button 
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("profile")}
              data-testid="button-profile-tab"
            >
              <Settings className="mr-2 h-4 w-4" /> Profile
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {isAccountDisabled && (
                <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">Account Disabled</h3>
                        <p className="text-red-700 dark:text-red-400">Your mentor account has been disabled. Your dashboard is currently in view-only mode. Please use the Messages tab to contact the Admin team if you would like to reactivate your account.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0 shadow-lg">
                  {mentorProfile.profileImage ? (
                    <img src={mentorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    mentorProfile.fullName?.substring(0, 2).toUpperCase() || "MT"
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Mentor Dashboard</h1>
                  <p className="text-muted-foreground">
                    {isAccountDisabled 
                      ? "Your dashboard is currently in view-only mode."
                      : `Welcome back, ${mentorProfile.fullName}! Manage your portfolios and mentees here.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-cyan-500 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Portfolios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{portfolios.length}/20</div>
                    <p className="text-xs text-muted-foreground mt-1">Out of available slots</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{portfolios.reduce((sum, p) => sum + p.memberCount, 0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all portfolios</p>
                  </CardContent>
                </Card>

                <Card 
                  className="border-l-4 border-l-amber-500 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveTab("messages")}
                  data-testid="card-unread-messages"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{unreadFromMentees}</div>
                    <p className="text-xs text-muted-foreground mt-1">From your mentees</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{meetings.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Scheduled sessions</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setActiveTab("portfolio")}>
                    <Plus className="mr-2 h-4 w-4" /> View Portfolios
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Check Messages
                  </Button>
                  {/* Hidden for now - keep for future use
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("meetings")}>
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Meeting
                  </Button>
                  */}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Portfolios</h1>
                  <p className="text-muted-foreground">Manage your mentee portfolios ({portfolios.length}/20)</p>
                </div>
                {portfolios.length < 20 && !isAccountDisabled && (
                  <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleAddPortfolio} data-testid="button-add-portfolio">
                    <Plus className="mr-2 h-4 w-4" /> Add Portfolio
                  </Button>
                )}
              </div>

              <div className="space-y-8">
                {portfolios.map((portfolio, idx) => (
                  <Card key={portfolio.id} className="hover:shadow-lg transition-shadow border-cyan-200 dark:border-cyan-900/30">
                    <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Members: {portfolio.memberCount}/10</p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {portfolio.members.length > 0 ? (
                          <div className="space-y-6">
                            {portfolio.members.map((member) => {
                              const isProposalExpanded = expandedProposal[`member-${member.id}`];
                              const isBusinessPlanExpanded = expandedBusinessPlan[`member-${member.id}`];
                              return (
                              <Card key={member.id} className="border-l-4 border-l-emerald-500 shadow-md">
                                <CardContent className="pt-6 space-y-5">
                                  <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-cyan-200">
                                      {member.photoUrl ? (
                                        <AvatarImage src={member.photoUrl} alt={member.name} />
                                      ) : null}
                                      <AvatarFallback className="bg-cyan-500 text-white text-lg">
                                        {member.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{member.name}</h4>
                                      <p className="text-sm text-muted-foreground">{member.email}</p>
                                      <p className="text-sm font-medium text-cyan-600 mt-1">{member.ideaName || member.businessIdea || "No idea name"}</p>
                                    </div>
                                    {!isAccountDisabled && (
                                      <Button 
                                        variant="outline" 
                                        size="default"
                                        onClick={() => {
                                          setSelectedEntrepreneur(member);
                                          setShowEntrepreneurMessageModal(true);
                                        }}
                                        data-testid={`button-message-entrepreneur-${member.id}`}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" /> Message
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* About the Entrepreneur */}
                                  {(member.fullBio || member.bio) && (
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg">
                                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">About the Entrepreneur</p>
                                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{member.fullBio || member.bio}</p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg">
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Idea/Company</p>
                                      <p className="text-slate-900 dark:text-white">{member.ideaName || member.businessIdea || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                      {member.linkedin ? (
                                        <a href={member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                                          <ExternalLink className="h-3 w-3" /> View Profile
                                        </a>
                                      ) : <p className="text-slate-500">—</p>}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                      <p className="text-slate-900 dark:text-white">{member.country || "—"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                                      <p className="text-slate-900 dark:text-white">{member.state || "—"}</p>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <Button 
                                      variant="ghost" 
                                      className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                                      onClick={() => setExpandedProposal({...expandedProposal, [`member-${member.id}`]: !isProposalExpanded})}
                                      data-testid={`button-expand-proposal-${member.id}`}
                                    >
                                      {isProposalExpanded ? "▼" : "▶"} Idea Proposal (42 Questions)
                                    </Button>
                                    {isProposalExpanded && member.ideaReview && (
                                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-3 rounded text-xs">
                                        {IDEA_PROPOSAL_QUESTIONS.map((q) => (
                                          <div key={q.key}>
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">{q.label}</p>
                                            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{String(member.ideaReview[q.key] || 'N/A')}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <Button 
                                      variant="ghost" 
                                      className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold text-sm"
                                      onClick={() => setExpandedBusinessPlan({...expandedBusinessPlan, [`member-${member.id}`]: !isBusinessPlanExpanded})}
                                      data-testid={`button-expand-businessplan-${member.id}`}
                                    >
                                      {isBusinessPlanExpanded ? "▼" : "▶"} Business Plan AI Draft (11 Sections)
                                    </Button>
                                    {isBusinessPlanExpanded && member.businessPlan && (
                                      <div className="mt-3 space-y-3 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-3 rounded text-xs">
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">1. Executive Summary</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.executiveSummary || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">2. Problem Statement</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.problemStatement || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">3. Solution</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.solution || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">4. Target Market</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.targetMarket || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">5. Market Size</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.marketSize || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">6. Revenue Model</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.revenueModel || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">7. Competitive Advantage</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.competitiveAdvantage || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">8. Month Roadmap</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.roadmap12Month || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">9. Funding Requirements</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.fundingRequirements || 'N/A'}</p>
                                        </div>
                                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">10. Risks & Mitigation</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.risksAndMitigation || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <p className="font-semibold text-slate-700 dark:text-slate-300">11. Success Metrics</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{member.businessPlan.successMetrics || 'N/A'}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* AI Meeting Questions Section - View Only for Mentors */}
                                  {member.meetingQuestions && (
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                      <Button 
                                        variant="ghost" 
                                        className="w-full justify-start text-purple-600 hover:text-purple-700 font-semibold text-sm"
                                        onClick={() => setExpandedQuestions({...expandedQuestions, [`member-${member.id}`]: !expandedQuestions[`member-${member.id}`]})}
                                        data-testid={`button-expand-questions-${member.id}`}
                                      >
                                        {expandedQuestions[`member-${member.id}`] ? "▼" : "▶"} AI Meeting Questions (Prepared by Admin)
                                      </Button>
                                      {expandedQuestions[`member-${member.id}`] && (
                                        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                                          {member.meetingQuestionsGeneratedAt && (
                                            <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                                              Generated: {new Date(member.meetingQuestionsGeneratedAt).toLocaleDateString()}
                                            </p>
                                          )}
                                          {[
                                            { key: 'executiveSummary', label: '1. Executive Summary' },
                                            { key: 'problemStatement', label: '2. Problem Statement' },
                                            { key: 'solution', label: '3. Solution' },
                                            { key: 'targetMarket', label: '4. Target Market' },
                                            { key: 'marketSize', label: '5. Market Size' },
                                            { key: 'revenueModel', label: '6. Revenue Model' },
                                            { key: 'competitiveAdvantage', label: '7. Competitive Advantage' },
                                            { key: 'roadmap12Month', label: '8. Month Roadmap' },
                                            { key: 'fundingRequirements', label: '9. Funding Requirements' },
                                            { key: 'risksAndMitigation', label: '10. Risks & Mitigation' },
                                            { key: 'successMetrics', label: '11. Success Metrics' },
                                          ].map((section) => (
                                            <div key={section.key} className="text-sm border-b border-purple-200 dark:border-purple-800 pb-3">
                                              <p className="font-semibold text-purple-700 dark:text-purple-300">{section.label}</p>
                                              <ul className="mt-2 space-y-1">
                                                {(member.meetingQuestions[section.key] || []).map((q: string, qIdx: number) => (
                                                  <li key={qIdx} className="text-purple-600 dark:text-purple-400 text-xs pl-4 before:content-['•'] before:mr-2">
                                                    {q}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2 block">Next Steps & Notes</label>
                                    
                                    {/* Notes History */}
                                    {member.mentorNotes && member.mentorNotes.length > 0 && (
                                      <div className="mb-4 space-y-3 max-h-96 overflow-y-auto">
                                        {member.mentorNotes.map((note: any, idx: number) => {
                                          const noteText = typeof note === 'string' ? note : note.text;
                                          const noteTime = typeof note === 'string' ? null : note.timestamp;
                                          const isCompleted = typeof note === 'string' ? false : note.completed;
                                          const noteId = note.id || `note_idx_${idx}`;
                                          const noteResponses = note.responses || [];
                                          
                                          return (
                                            <div key={noteId} className={`rounded-lg border ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'}`} data-testid={`mentor-note-${noteId}`}>
                                              <div className="p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                  <div className="flex-1">
                                                    <p className={`text-sm ${isCompleted ? 'text-green-900 dark:text-green-100 line-through' : 'text-slate-900 dark:text-slate-100'}`}>{noteText}</p>
                                                    {noteTime && <p className={`text-xs mt-1 ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{new Date(noteTime).toLocaleDateString()}</p>}
                                                  </div>
                                                  <Button
                                                    size="sm"
                                                    variant={isCompleted ? "outline" : "default"}
                                                    className={isCompleted 
                                                      ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 dark:border-green-700' 
                                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }
                                                    onClick={async () => {
                                                      const assignmentId = member.assignment_id;
                                                      if (!assignmentId) return;
                                                      try {
                                                        const response = await fetch(`${API_BASE_URL}/api/mentor-assignments/${assignmentId}/toggle-note/${idx}`, {
                                                          method: "PATCH",
                                                          headers: { "Content-Type": "application/json" },
                                                          body: JSON.stringify({ completed: !isCompleted })
                                                        });
                                                        if (response.ok) {
                                                          await refreshPortfolios();
                                                          toast.success(isCompleted ? "Task reopened" : "Task marked complete!");
                                                        } else {
                                                          toast.error("Failed to update note");
                                                        }
                                                      } catch (error) {
                                                        toast.error("Error updating note");
                                                      }
                                                    }}
                                                    data-testid={`button-toggle-note-${member.id}-${idx}`}
                                                  >
                                                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                                                  </Button>
                                                </div>
                                              </div>
                                              
                                              {/* Entrepreneur Responses */}
                                              {noteResponses.length > 0 && (
                                                <div className="border-t border-slate-200 dark:border-slate-700 p-2 space-y-2">
                                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                    <Reply className="h-3 w-3" /> Entrepreneur Responses ({noteResponses.length})
                                                  </p>
                                                  {noteResponses.map((resp: any, respIdx: number) => (
                                                    <div key={resp.id || respIdx} className="bg-cyan-50 dark:bg-cyan-950/30 rounded p-2 text-xs border border-cyan-200 dark:border-cyan-800" data-testid={`mentor-response-view-${resp.id || respIdx}`}>
                                                      {resp.text && <p className="text-slate-800 dark:text-slate-200">{resp.text}</p>}
                                                      {resp.attachmentUrl && (
                                                        <a 
                                                          href={resp.attachmentUrl} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer"
                                                          className="inline-flex items-center gap-1 mt-1 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
                                                          data-testid={`button-download-note-response-${resp.id || respIdx}`}
                                                        >
                                                          <Download className="h-3 w-3" />
                                                          <FileText className="h-3 w-3" />
                                                          {resp.attachmentName || "Download File"}
                                                        </a>
                                                      )}
                                                      <p className="text-xs text-slate-500 mt-1">{new Date(resp.timestamp).toLocaleString()}</p>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    
                                    <textarea
                                      id={`new-notes-${member.id}`}
                                      placeholder="E.g., Next step suggested would be to choose a coach about Marketing..."
                                      className="w-full min-h-20 p-3 rounded-lg border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                      data-testid={`textarea-mentor-notes-${member.id}`}
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-slate-500">Add a new note - previous notes are stored above</p>
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        data-testid={`button-save-note-${member.id}`}
                                        onClick={async () => {
                                          const textarea = document.getElementById(`new-notes-${member.id}`) as HTMLTextAreaElement;
                                          const newNote = textarea?.value.trim();
                                          if (!newNote) {
                                            toast.error("Please enter a note");
                                            return;
                                          }
                                          const assignmentId = member.assignment_id;
                                          console.log("[MentorNotes] Saving note for assignment:", assignmentId);
                                          if (!assignmentId) {
                                            toast.error("No assignment ID found");
                                            return;
                                          }
                                          try {
                                            const response = await fetch(`${API_BASE_URL}/api/mentor-assignments/${assignmentId}`, {
                                              method: "PATCH",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ mentorNotes: newNote })
                                            });
                                            const data = await response.json();
                                            console.log("[MentorNotes] Response:", data);
                                            if (response.ok && data.success) {
                                              textarea.value = "";
                                              toast.success("Step added!");
                                              await refreshPortfolios();
                                            } else {
                                              toast.error(data.error || "Failed to save note");
                                            }
                                          } catch (error) {
                                            console.error("[MentorNotes] Error:", error);
                                            toast.error("Failed to save note");
                                          }
                                        }}
                                      >
                                        Save Note
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )})}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No members added yet</p>
                        )}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-muted-foreground mb-3">Last meeting: {portfolio.lastMeeting || "No meetings yet"}</p>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full text-sm"
                            onClick={() => {
                              setSelectedPortfolio(idx);
                              setShowMessageModal(true);
                            }}
                            data-testid={`button-message-portfolio-${portfolio.id}`}
                          >
                            <MessageSquare className="mr-2 h-3 w-3" /> Message Members
                          </Button>
                          {/* Hidden for now - keep for future use
                          <Button 
                            variant="outline" 
                            className="w-full text-sm"
                            onClick={() => {
                              setSelectedPortfolio(idx);
                              setShowMeetingModal(true);
                            }}
                            data-testid={`button-meeting-portfolio-${portfolio.id}`}
                          >
                            <Calendar className="mr-2 h-3 w-3" /> Schedule Meeting
                          </Button>
                          */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Coaches Tab */}
          {activeTab === "coaches" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Available Coaches</h1>
                  <p className="text-muted-foreground">Browse our network of expert coaches to recommend to your portfolio members.</p>
                </div>
              </div>

              {approvedCoaches.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No coaches available at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {approvedCoaches.map((coach) => {
                    const rating = coachRatings[coach.id];
                    return (
                      <Card key={coach.id} className={`border-l-4 ${!coach.stripe_account_id ? 'border-l-gray-400 opacity-80' : 'border-l-purple-500'}`} data-testid={`card-coach-${coach.id}`}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-purple-200">
                              {coach.profile_image && (
                                <AvatarImage src={coach.profile_image} alt={coach.full_name} />
                              )}
                              <AvatarFallback className="bg-purple-500 text-white">
                                {coach.full_name?.substring(0, 2).toUpperCase() || "CO"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{coach.full_name}</CardTitle>
                                  {!coach.stripe_account_id && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs px-2 py-0.5">
                                      Coming Soon
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1">
                                  {rating ? (
                                    <>
                                      <span className="text-yellow-400">★</span>
                                      <span className="text-sm font-semibold">{rating.averageRating}</span>
                                      <span className="text-xs text-muted-foreground">({rating.totalRatings})</span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No ratings yet</span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{coach.expertise}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {coach.bio && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">About</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{coach.bio}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Areas of Expertise</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{coach.focus_areas}</p>
                          </div>
                          {coach.linkedin && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                              <a 
                                href={coach.linkedin.startsWith('http') ? coach.linkedin : `https://${coach.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-cyan-600 hover:underline flex items-center gap-1"
                                data-testid={`link-coach-linkedin-${coach.id}`}
                              >
                                {coach.linkedin} <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          <div className="pt-2">
                            {(() => {
                              try {
                                const rates = JSON.parse(coach.hourly_rate);
                                if (rates.introCallRate && rates.sessionRate && rates.monthlyRate) {
                                  return (
                                    <div className="space-y-1">
                                      <div className="text-sm text-purple-600"><span className="font-medium">Intro Call:</span> ${rates.introCallRate}</div>
                                      <div className="text-sm text-purple-600"><span className="font-medium">Per Session:</span> ${rates.sessionRate}</div>
                                      <div className="text-sm text-purple-600"><span className="font-medium">Monthly:</span> ${rates.monthlyRate}</div>
                                    </div>
                                  );
                                }
                              } catch {}
                              return <span className="text-lg font-bold text-purple-600">${coach.hourly_rate}/hr</span>;
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (() => {
            const allEntrepreneurs = portfolios.flatMap(p => p.members);
            
            // Include all admin email aliases for proper message filtering
            const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
            const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());
            
            const adminMsgs = adminMessages.filter((m: any) => 
              isAdminEmail(m.from_email) || isAdminEmail(m.to_email)
            );
            const adminUnread = adminMsgs.filter((m: any) => 
              m.to_email === mentorProfile.email && !m.is_read
            ).length;
            
            const entrepreneurConversations = allEntrepreneurs.map(ent => {
              const msgs = adminMessages.filter((m: any) => 
                (m.from_email?.toLowerCase() === ent.email.toLowerCase()) || 
                (m.to_email?.toLowerCase() === ent.email.toLowerCase())
              );
              const unread = msgs.filter((m: any) => 
                m.to_email === mentorProfile.email && !m.is_read
              ).length;
              return { ...ent, messages: msgs, unreadCount: unread };
            }).filter(e => e.messages.length > 0 || allEntrepreneurs.some(ae => ae.email === e.email));
            
            return (
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Messages</h1>
              <p className="text-muted-foreground mb-8">Communicate with your entrepreneurs and the TouchConnectPro admin team.</p>

              {/* Admin Section */}
              <Card className="mb-6 border-cyan-200 dark:border-cyan-900/30">
                <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20 cursor-pointer" onClick={async () => {
                  const el = document.getElementById('admin-messages-section');
                  if (el) el.classList.toggle('hidden');
                  // Mark all admin messages as read
                  const unreadAdminMsgs = adminMsgs.filter((m: any) => m.to_email === mentorProfile.email && !m.is_read);
                  if (unreadAdminMsgs.length > 0) {
                    try {
                      await Promise.all(unreadAdminMsgs.map((m: any) => 
                        fetch(`${API_BASE_URL}/api/messages/${m.id}/read`, { method: "PATCH" })
                      ));
                      const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(mentorProfile.email)}`);
                      if (loadResponse.ok) {
                        const data = await loadResponse.json();
                        setAdminMessages(data.messages || []);
                      }
                    } catch (e) { console.error("Error marking as read:", e); }
                  }
                }}>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-cyan-600" />
                      Admin
                      {adminUnread > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" data-testid="badge-admin-unread">
                          {adminUnread} new
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent id="admin-messages-section" className="space-y-4 pt-4">
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Type your message to the admin team..."
                    className="w-full min-h-20 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    data-testid="textarea-admin-message"
                  />
                  <Button 
                    onClick={async () => {
                      if (adminMessage.trim() && mentorProfile.email) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/messages`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fromName: mentorProfile.fullName,
                              fromEmail: mentorProfile.email,
                              toName: "Admin",
                              toEmail: "admin@touchconnectpro.com",
                              message: adminMessage
                            })
                          });
                          if (response.ok) {
                            const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(mentorProfile.email)}`);
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
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-send-admin-message"
                  >
                    <Send className="mr-2 h-4 w-4" /> Send
                  </Button>
                  
                  {adminMsgs.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Conversation History</p>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {[...adminMsgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => {
                          const isFromMe = msg.from_email === mentorProfile.email;
                          return (
                            <div key={msg.id} onClick={async () => {
                              if (!isFromMe && !msg.is_read) {
                                try {
                                  await fetch(`${API_BASE_URL}/api/messages/${msg.id}/read`, { method: "PATCH" });
                                  const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(mentorProfile.email)}`);
                                  if (loadResponse.ok) {
                                    const data = await loadResponse.json();
                                    setAdminMessages(data.messages || []);
                                  }
                                } catch (e) {
                                  console.error("Error marking as read:", e);
                                }
                              }
                            }} className={`p-3 rounded-lg ${isFromMe ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-cyan-50 dark:bg-cyan-950/30'} ${!isFromMe && !msg.is_read ? 'cursor-pointer opacity-70 hover:opacity-100' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold ${isFromMe ? 'text-slate-700 dark:text-slate-300' : 'text-cyan-700 dark:text-cyan-400'}`}>
                                  {isFromMe ? 'You' : 'Admin'}
                                </span>
                                <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Entrepreneur Conversations (Threaded) */}
              <Card className="mb-6 border-emerald-200 dark:border-emerald-900/30">
                <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                      Entrepreneur Conversations
                    </div>
                    <Button 
                      onClick={refreshThreads}
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      data-testid="button-refresh-threads"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {messageThreads.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {messageThreads.map((thread: any) => {
                        const isExpanded = expandedThreadId === thread.id;
                        const isClosed = thread.status === "closed";
                        const entries = thread.entries || [];
                        const lastEntry = entries[entries.length - 1];
                        const entrepreneurEmail = thread.entrepreneur_email;
                        const entrepreneurName = allEntrepreneurs.find(e => e.email.toLowerCase() === entrepreneurEmail?.toLowerCase())?.name || "Entrepreneur";
                        
                        return (
                          <div 
                            key={thread.id} 
                            className={`rounded-lg border ${isClosed ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800'}`}
                            data-testid={`thread-${thread.id}`}
                          >
                            <div 
                              className="p-3 cursor-pointer flex items-start justify-between"
                              onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`font-semibold text-sm ${isClosed ? 'text-slate-500' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                    {thread.subject || "Conversation"} - {entrepreneurName}
                                  </p>
                                  {isClosed && (
                                    <Badge variant="secondary" className="text-xs bg-slate-200 dark:bg-slate-700">Closed</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {entries.length} {entries.length === 1 ? 'message' : 'messages'} • Last: {lastEntry ? new Date(lastEntry.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3">
                                {/* Thread Entries */}
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {entries.map((entry: any) => {
                                    const isFromMe = entry.senderRole === "mentor";
                                    return (
                                      <div 
                                        key={entry.id} 
                                        className={`p-2 rounded-lg text-sm ${isFromMe ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <span className={`text-xs font-semibold ${isFromMe ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {isFromMe ? 'You' : (entry.senderName || entrepreneurName)}
                                          </span>
                                          <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{entry.message}</p>
                                        {entry.attachments && entry.attachments.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {entry.attachments.map((att: any, idx: number) => (
                                              <a 
                                                key={idx}
                                                href={att.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                              >
                                                <Paperclip className="h-3 w-3" />
                                                {att.name || 'Attachment'}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Reply Form and Actions */}
                                {!isAccountDisabled && (
                                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {!isClosed && (
                                      <div className="space-y-2">
                                        {/* Reply attachments display */}
                                        {(threadReplyAttachments[thread.id]?.length || 0) > 0 && (
                                          <div className="flex flex-wrap gap-2">
                                            {threadReplyAttachments[thread.id].map((att, idx) => (
                                              <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-xs">
                                                <Paperclip className="h-3 w-3" />
                                                <span className="max-w-[100px] truncate">{att.name}</span>
                                                <button 
                                                  onClick={() => setThreadReplyAttachments(prev => ({
                                                    ...prev,
                                                    [thread.id]: prev[thread.id]?.filter((_, i) => i !== idx) || []
                                                  }))}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <div className="flex gap-2 items-center">
                                          <Input
                                            value={threadReplyText[thread.id] || ""}
                                            onChange={(e) => setThreadReplyText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                                            placeholder="Type your reply..."
                                            className="flex-1 text-sm"
                                            data-testid={`input-reply-${thread.id}`}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                addThreadReply(thread.id);
                                              }
                                            }}
                                          />
                                          <label className="cursor-pointer">
                                            <input
                                              type="file"
                                              multiple
                                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                                              onChange={(e) => handleReplyFileSelect(thread.id, e)}
                                              className="hidden"
                                              data-testid={`input-reply-attachment-${thread.id}`}
                                            />
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                                              <Paperclip className="h-4 w-4" />
                                            </div>
                                          </label>
                                          <Button
                                            onClick={() => addThreadReply(thread.id)}
                                            disabled={!threadReplyText[thread.id]?.trim() || uploadingFile}
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            data-testid={`button-reply-${thread.id}`}
                                          >
                                            <Reply className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex justify-end">
                                      {isClosed ? (
                                        <Button
                                          onClick={() => reopenThread(thread.id)}
                                          size="sm"
                                          variant="outline"
                                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                          data-testid={`button-reopen-${thread.id}`}
                                        >
                                          Reopen Conversation
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => closeThread(thread.id)}
                                          size="sm"
                                          variant="outline"
                                          className="text-slate-600 border-slate-300 hover:bg-slate-50"
                                          data-testid={`button-close-${thread.id}`}
                                        >
                                          <X className="h-3 w-3 mr-1" /> Close Conversation
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {isAccountDisabled && isClosed && (
                                  <p className="text-xs text-center text-muted-foreground py-2">This conversation is closed.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No conversations yet. Entrepreneurs can start conversations from their dashboard.</p>
                  )}
                </CardContent>
              </Card>
              
              {allEntrepreneurs.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No entrepreneurs assigned yet. Check your Portfolios tab.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
          })()}

          {/* Meetings Tab */}
          {activeTab === "meetings" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Meetings</h1>
                <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowMeetingModal(true)} data-testid="button-schedule-meeting">
                  <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
              </div>
              <div className="space-y-4">
                {meetings.length > 0 ? meetings.map((meeting) => {
                  // Look up participant names from portfolios
                  const allMembers = portfolios.flatMap(p => p.members);
                  const participantNames = (meeting.participants || [])
                    .map((id: string) => allMembers.find(m => m.id === id)?.name)
                    .filter(Boolean);
                  
                  return (
                  <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white mb-2">{meeting.topic}</p>
                          <p className="text-sm text-muted-foreground mb-1">Status: {meeting.status}</p>
                          {meeting.start_time && <p className="text-sm text-muted-foreground">{new Date(meeting.start_time).toLocaleString()}</p>}
                          <p className="text-sm text-muted-foreground">Duration: {meeting.duration} minutes</p>
                          {participantNames.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                <Users className="inline h-4 w-4 mr-1" />
                                Invited: {participantNames.join(", ")}
                              </p>
                            </div>
                          )}
                          <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-600 hover:underline flex items-center gap-1">
                            Join Meeting <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  );
                }) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No meetings scheduled yet. Create one to get started!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Mentor Profile</h1>
                  <p className="text-muted-foreground">
                    {isAccountDisabled 
                      ? "Your profile is currently in view-only mode."
                      : "Your professional profile visible to mentees and admins"}
                  </p>
                </div>
                {!isAccountDisabled && (
                  <Button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant={isEditingProfile ? "destructive" : "default"}
                    className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}
                    data-testid="button-edit-profile"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>

              {isEditingProfile ? (
                <Card className="border-cyan-200 dark:border-cyan-900/30 max-w-2xl">
                  <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                    <CardTitle>Edit Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Profile Picture</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-2xl overflow-hidden">
                          {mentorProfile.profileImage ? (
                            <img src={mentorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-10 w-10 text-cyan-600" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            id="mentor-profile-upload"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error("Image is too large. Please use an image under 5MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setMentorProfile({ ...mentorProfile, profileImage: reader.result as string });
                                  toast.success("Image added! Click 'Save Profile' to keep it.");
                                };
                                reader.onerror = () => {
                                  toast.error("Failed to read image file.");
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            data-testid="input-mentor-profile-image"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('mentor-profile-upload')?.click()}
                            data-testid="button-upload-mentor-photo"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                          {mentorProfile.profileImage && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setMentorProfile({ ...mentorProfile, profileImage: null })}
                              data-testid="button-remove-mentor-photo"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Full Name *</label>
                      <Input
                        value={mentorProfile.fullName}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, fullName: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Email Address</label>
                      <Input
                        type="email"
                        value={mentorProfile.email}
                        disabled
                        className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                        data-testid="input-mentor-email"
                      />
                      <p className="text-xs text-slate-500 mt-1">To change your email, please contact admin</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">LinkedIn Profile *</label>
                      <Input
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={mentorProfile.linkedin}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, linkedin: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-linkedin"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Professional Bio *</label>
                      <textarea
                        value={mentorProfile.bio}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, bio: e.target.value })}
                        className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Tell mentees about your experience, expertise, and what you bring to mentorship..."
                        data-testid="textarea-mentor-bio"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Areas of Expertise *</label>
                      <Input
                        value={mentorProfile.expertise}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, expertise: e.target.value })}
                        placeholder="e.g., SaaS, Product Strategy, Go-to-Market"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-expertise"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Years of Experience *</label>
                      <Input
                        value={mentorProfile.yearsExperience}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, yearsExperience: e.target.value })}
                        placeholder="e.g., 10+"
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-experience"
                      />
                    </div>

                    <Button 
                      className="w-full bg-cyan-600 hover:bg-cyan-700" 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      data-testid="button-save-mentor-profile"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-cyan-200 dark:border-cyan-900/30 max-w-2xl">
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-2xl overflow-hidden">
                        {mentorProfile.profileImage ? (
                          <img src={mentorProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-cyan-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-white">{mentorProfile.fullName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{mentorProfile.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Full Name</p>
                      <p className="text-slate-900 dark:text-white">{mentorProfile.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Email</p>
                      <p className="text-slate-900 dark:text-white">{mentorProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">LinkedIn</p>
                      <p className="text-cyan-600 dark:text-cyan-400">{mentorProfile.linkedin}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Professional Bio</p>
                      <p className="text-slate-900 dark:text-white">{mentorProfile.bio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Expertise</p>
                      <p className="text-slate-900 dark:text-white">{mentorProfile.expertise}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Experience</p>
                      <p className="text-slate-900 dark:text-white">{mentorProfile.yearsExperience}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Message Modal */}
      {showMessageModal && selectedPortfolio !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md">
            <CardHeader>
              <CardTitle>Send Message to Portfolio {selectedPortfolio + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                data-testid="textarea-new-message"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleSendMessage} data-testid="button-send-message">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Entrepreneur Message Modal */}
      {showEntrepreneurMessageModal && selectedEntrepreneur && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md">
            <CardHeader>
              <CardTitle>Message {selectedEntrepreneur.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={entrepreneurMessage}
                onChange={(e) => setEntrepreneurMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                data-testid="textarea-entrepreneur-message"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEntrepreneurMessageModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={async () => {
                  if (entrepreneurMessage.trim() && selectedEntrepreneur && mentorProfile.email) {
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/messages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fromName: mentorProfile.fullName,
                          fromEmail: mentorProfile.email,
                          toName: selectedEntrepreneur.name,
                          toEmail: selectedEntrepreneur.email,
                          message: entrepreneurMessage
                        })
                      });
                      if (response.ok) {
                        const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(mentorProfile.email)}`);
                        if (loadResponse.ok) {
                          const data = await loadResponse.json();
                          setAdminMessages(data.messages || []);
                        }
                        setEntrepreneurMessage("");
                        setShowEntrepreneurMessageModal(false);
                        toast.success("Message sent to " + selectedEntrepreneur.name);
                      } else {
                        toast.error("Failed to send message");
                      }
                    } catch (error) {
                      toast.error("Error sending message");
                    }
                  }
                }} data-testid="button-send-entrepreneur-message">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zoom Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {zoomMeetingResult ? "Meeting Created!" : "Create Zoom Meeting"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {!zoomMeetingResult ? (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Meeting Topic *</label>
                    <Input
                      placeholder="e.g., Portfolio Monthly Check-in"
                      value={newMeeting.topic}
                      onChange={(e) => setNewMeeting({ ...newMeeting, topic: e.target.value })}
                      className="bg-slate-50 dark:bg-slate-800/50"
                      data-testid="input-meeting-topic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Date (optional)</label>
                      <Input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-meeting-date"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Time (optional)</label>
                      <Input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-meeting-time"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Duration *</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" style={{flex: 1}}>
                        <input
                          type="radio"
                          name="duration"
                          value="30"
                          checked={newMeeting.duration === 30}
                          onChange={() => setNewMeeting({ ...newMeeting, duration: 30 })}
                          className="w-4 h-4"
                          data-testid="radio-duration-30"
                        />
                        <span className="font-medium">30 min</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800" style={{flex: 1}}>
                        <input
                          type="radio"
                          name="duration"
                          value="60"
                          checked={newMeeting.duration === 60}
                          onChange={() => setNewMeeting({ ...newMeeting, duration: 60 })}
                          className="w-4 h-4"
                          data-testid="radio-duration-60"
                        />
                        <span className="font-medium">1 hour</span>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Leave date/time empty to create an instant meeting.</p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setShowMeetingModal(false);
                      setNewMeeting({ date: "", time: "", topic: "", duration: 60 });
                    }}>Cancel</Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700" 
                      onClick={async () => {
                        if (!newMeeting.topic.trim()) {
                          toast.error("Please enter a meeting topic");
                          return;
                        }
                        setCreatingZoomMeeting(true);
                        try {
                          let startTime = undefined;
                          if (newMeeting.date && newMeeting.time) {
                            startTime = new Date(`${newMeeting.date}T${newMeeting.time}`).toISOString();
                          }
                          const response = await fetch(`${API_BASE_URL}/api/zoom/create-meeting`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              topic: newMeeting.topic,
                              duration: newMeeting.duration,
                              startTime,
                              mentorId: profileId,
                              portfolioNumber: selectedPortfolio !== null ? selectedPortfolio + 1 : 1
                            })
                          });
                          const data = await response.json();
                          if (response.ok && data.success) {
                            setZoomMeetingResult(data.meeting);
                            toast.success("Zoom meeting created!");
                          } else {
                            toast.error(data.error || "Failed to create Zoom meeting");
                          }
                        } catch (error) {
                          toast.error("Error creating Zoom meeting");
                        } finally {
                          setCreatingZoomMeeting(false);
                        }
                      }}
                      disabled={creatingZoomMeeting}
                      data-testid="button-create-zoom"
                    >
                      {creatingZoomMeeting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Zoom Meeting
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="font-semibold text-green-800 dark:text-green-200 mb-2">Meeting Created Successfully!</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">{zoomMeetingResult.topic}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Host Link (for you):</span>
                        <a href={zoomMeetingResult.start_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline flex items-center gap-1 inline">
                          Start Meeting <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Join Link (for attendees):</span>
                        <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded border text-xs break-all">
                          {zoomMeetingResult.join_url}
                        </div>
                      </div>
                      {zoomMeetingResult.password && (
                        <div>
                          <span className="font-medium">Password:</span> {zoomMeetingResult.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {portfolios.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="font-semibold text-slate-900 dark:text-white mb-3">Invite Entrepreneurs</p>
                      <p className="text-sm text-muted-foreground mb-3">Select who should receive the meeting invitation:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {portfolios.flatMap(p => p.members).map(member => (
                          <label key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedEntrepreneurIds.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEntrepreneurIds([...selectedEntrepreneurIds, member.id]);
                                } else {
                                  setSelectedEntrepreneurIds(selectedEntrepreneurIds.filter(id => id !== member.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-300"
                            />
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {selectedEntrepreneurIds.length > 0 && (
                        <Button 
                          className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700"
                          onClick={async () => {
                            setSendingInvites(true);
                            try {
                              const response = await fetch(`${API_BASE_URL}/api/zoom/send-invitations`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  meetingId: zoomMeetingResult.id,
                                  entrepreneurIds: selectedEntrepreneurIds,
                                  mentorName: mentorProfile.fullName,
                                  mentorEmail: mentorProfile.email
                                })
                              });
                              const data = await response.json();
                              if (response.ok && data.success) {
                                toast.success(`Invitations sent to ${data.messagesCreated} entrepreneur(s)!`);
                                setSelectedEntrepreneurIds([]);
                              } else {
                                toast.error(data.error || "Failed to send invitations");
                              }
                            } catch (error) {
                              toast.error("Error sending invitations");
                            } finally {
                              setSendingInvites(false);
                            }
                          }}
                          disabled={sendingInvites}
                          data-testid="button-send-invites"
                        >
                          {sendingInvites ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Send Invitations ({selectedEntrepreneurIds.length})
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => {
                        setShowMeetingModal(false);
                        setZoomMeetingResult(null);
                        setNewMeeting({ date: "", time: "", topic: "" });
                        setSelectedEntrepreneurIds([]);
                      }}
                    >
                      Close
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.open(zoomMeetingResult.start_url, "_blank")}
                      data-testid="button-start-meeting"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Start Meeting
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agreements Tab */}
      {activeTab === "agreements" && (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Agreements</h2>
          {mentorProfile?.email && <MyAgreements userEmail={mentorProfile.email} />}
        </div>
      )}
    </div>
  );
}
