import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, Users, Settings, Trash2, Power, Mail, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/config";

interface MentorApplication {
  id: string;
  fullName: string;
  email: string;
  linkedin: string;
  bio: string;
  expertise: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  country?: string;
  state?: string;
  rejection_reason?: string;
  updated_at?: string;
  is_resubmitted?: boolean;
}

interface CoachApplication {
  id: string;
  fullName: string;
  email: string;
  linkedin: string;
  expertise: string;
  focusAreas: string;
  hourlyRate: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  country?: string;
  state?: string;
  rejection_reason?: string;
  updated_at?: string;
  is_resubmitted?: boolean;
}

interface InvestorApplication {
  id: string;
  fullName: string;
  email: string;
  linkedin: string;
  fundName: string;
  investmentFocus: string;
  investmentPreference: string;
  investmentAmount: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  country?: string;
  state?: string;
  rejection_reason?: string;
  updated_at?: string;
  is_resubmitted?: boolean;
}

interface EntrepreneurApplication {
  fullName: string;
  email: string;
  ideaName: string;
  problem: string;
  solution: string;
  status: "pending" | "approved" | "rejected" | "submitted";
  submittedAt: string;
  id: string;
  ideaReview?: any;
  businessPlan?: any;
  portfolio?: string;
  rejection_reason?: string;
  updated_at?: string;
  is_resubmitted?: boolean;
  [key: string]: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: "entrepreneur" | "mentor" | "coach" | "investor";
  status: "active" | "disabled";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"approvals" | "members">("approvals");
  const [activeMembersSubTab, setActiveMembersSubTab] = useState<"portfolio" | "messaging" | "management">("portfolio");
  const [activeApprovalsSubTab, setActiveApprovalsSubTab] = useState<"entrepreneurs" | "mentors" | "coaches" | "investors">("entrepreneurs");
  const [activeMembersCategoryTab, setActiveMembersCategoryTab] = useState<"entrepreneurs" | "mentors" | "coaches" | "investors">("entrepreneurs");
  const [mentorApplications, setMentorApplications] = useState<MentorApplication[]>([]);
  const [coachApplications, setCoachApplications] = useState<CoachApplication[]>([]);
  const [investorApplications, setInvestorApplications] = useState<InvestorApplication[]>([]);
  const [entrepreneurApplications, setEntrepreneurApplications] = useState<EntrepreneurApplication[]>([]);
  const [approvedMentors, setApprovedMentors] = useState<any[]>([]);
  const [approvedCoaches, setApprovedCoaches] = useState<any[]>([]);
  const [approvedInvestors, setApprovedInvestors] = useState<any[]>([]);
  const [approvedEntrepreneurs, setApprovedEntrepreneurs] = useState<any[]>([]);
  const [members, setMembers] = useState<User[]>([
    { id: "m1", name: "Alex Johnson", email: "alex@tech.com", type: "entrepreneur" as const, status: "active" as const },
    { id: "m2", name: "Maria Garcia", email: "maria@startup.com", type: "entrepreneur" as const, status: "active" as const },
    { id: "m3", name: "Sarah Chen", email: "sarah@mentor.com", type: "mentor" as const, status: "active" as const },
  ]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [messageText, setMessageText] = useState("");
  const [portfolioAssignment, setPortfolioAssignment] = useState("");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [adminReadMessageIds, setAdminReadMessageIds] = useState<number[]>([]);
  const [disabledProfessionals, setDisabledProfessionals] = useState<{[key: string]: boolean}>({});
  const [expandedProposal, setExpandedProposal] = useState<{[key: string]: boolean}>({});
  const [expandedBusinessPlan, setExpandedBusinessPlan] = useState<{[key: string]: boolean}>({});
  const [portfolioForApp, setPortfolioForApp] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showRejected, setShowRejected] = useState<{[key: string]: boolean}>({});
  const [mentorAssignments, setMentorAssignments] = useState<{[entrepreneurId: string]: {mentorId: string; mentorName: string; portfolioNumber: number}}>({})

  useEffect(() => {
    const loadData = async () => {
      // Load mentor applications from API
      try {
        console.log("=== FETCHING MENTORS ===");
        const mentorResponse = await fetch(`${API_BASE_URL}/api/mentors`);
        if (mentorResponse.ok) {
          const mentors = await mentorResponse.json();
          console.log("Mentors received:", mentors);
          if (Array.isArray(mentors)) {
            const mappedMentors = mentors.map((m: any) => ({
              id: m.id,
              fullName: m.full_name,
              email: m.email,
              linkedin: m.linkedin,
              bio: m.bio,
              expertise: m.expertise,
              experience: m.experience,
              country: m.country,
              state: m.state,
              status: m.status === "submitted" ? "pending" : m.status,
              submittedAt: m.created_at,
              is_resubmitted: m.is_resubmitted
            }));
            setMentorApplications(mappedMentors);
            setApprovedMentors(mappedMentors.filter((app: any) => app.status === "approved"));
          }
        }
      } catch (err) {
        console.error("Error fetching mentors:", err);
      }

      // Load coach applications from API
      try {
        console.log("=== FETCHING COACHES ===");
        const coachResponse = await fetch(`${API_BASE_URL}/api/coaches`);
        if (coachResponse.ok) {
          const coaches = await coachResponse.json();
          console.log("Coaches received:", coaches);
          if (Array.isArray(coaches)) {
            const mappedCoaches = coaches.map((c: any) => ({
              id: c.id,
              fullName: c.full_name,
              email: c.email,
              linkedin: c.linkedin,
              expertise: c.expertise,
              focusAreas: c.focus_areas,
              hourlyRate: c.hourly_rate,
              country: c.country,
              state: c.state,
              status: c.status === "submitted" ? "pending" : c.status,
              submittedAt: c.created_at,
              is_resubmitted: c.is_resubmitted
            }));
            setCoachApplications(mappedCoaches);
            setApprovedCoaches(mappedCoaches.filter((app: any) => app.status === "approved"));
          }
        }
      } catch (err) {
        console.error("Error fetching coaches:", err);
      }

      // Load investor applications from API
      try {
        console.log("=== FETCHING INVESTORS ===");
        const investorResponse = await fetch(`${API_BASE_URL}/api/investors`);
        if (investorResponse.ok) {
          const investors = await investorResponse.json();
          console.log("Investors received:", investors);
          if (Array.isArray(investors)) {
            const mappedInvestors = investors.map((i: any) => ({
              id: i.id,
              fullName: i.full_name,
              email: i.email,
              linkedin: i.linkedin,
              fundName: i.fund_name,
              investmentFocus: i.investment_focus,
              investmentPreference: i.investment_preference,
              investmentAmount: i.investment_amount,
              country: i.country,
              state: i.state,
              status: i.status === "submitted" ? "pending" : i.status,
              submittedAt: i.created_at,
              is_resubmitted: i.is_resubmitted
            }));
            setInvestorApplications(mappedInvestors);
            setApprovedInvestors(mappedInvestors.filter((app: any) => app.status === "approved"));
          }
        }
      } catch (err) {
        console.error("Error fetching investors:", err);
      }
      // Load all messages from database
      try {
        const messagesResponse = await fetch(`${API_BASE_URL}/api/messages`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessageHistory(messagesData.messages || []);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
      const savedAdminRead = localStorage.getItem("tcp_adminReadMessageIds");
      if (savedAdminRead) {
        setAdminReadMessageIds(JSON.parse(savedAdminRead));
      }
      const savedDisabled = localStorage.getItem("tcp_disabledProfessionals");
      if (savedDisabled) {
        setDisabledProfessionals(JSON.parse(savedDisabled));
      }

      // Load entrepreneur applications from backend API
      try {
        console.log("=== ADMIN FETCH START ===");
        console.log("Fetching from:", `${API_BASE_URL}/api/ideas`);
        
        const response = await fetch(`${API_BASE_URL}/api/ideas`);
        console.log("Response status:", response.status);
        
        const ideas = await response.json();
        console.log("Ideas received:", ideas);
        console.log("Ideas count:", Array.isArray(ideas) ? ideas.length : "not array");
        
        if (Array.isArray(ideas) && ideas.length > 0) {
          const entrepreneurs = ideas.map((idea: any) => ({
            id: idea.id,
            fullName: idea.entrepreneur_name || idea.data?.fullName || "Unknown",
            email: idea.entrepreneur_email || idea.data?.email || "N/A",
            ideaName: idea.data?.ideaName || "Untitled",
            problem: idea.data?.problem || "",
            solution: idea.data?.ideaDescription || "",
            status: idea.status,
            submittedAt: idea.created_at,
            ideaReview: idea.data?.ideaReview || {},
            businessPlan: idea.business_plan || {},
            linkedin: idea.linkedin_profile || "",
            is_resubmitted: idea.is_resubmitted,
            ...idea.data
          }));
          console.log("Mapped entrepreneurs:", entrepreneurs.length);
          setEntrepreneurApplications(entrepreneurs);
          setApprovedEntrepreneurs(entrepreneurs.filter((app: any) => app.status === "approved"));
        } else {
          console.log("No ideas found or not an array");
        }
      } catch (err) {
        console.error("=== ADMIN FETCH ERROR ===", err);
      }

      // Fetch all mentor assignments to show badges
      try {
        const assignmentsResponse = await fetch(`${API_BASE_URL}/api/mentor-assignments`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          console.log("Assignments received:", assignmentsData);
          if (Array.isArray(assignmentsData.assignments)) {
            const assignmentMap: {[entrepreneurId: string]: {mentorId: string; mentorName: string; portfolioNumber: number}} = {};
            assignmentsData.assignments.forEach((a: any) => {
              if (a.entrepreneur_id && a.mentor_id) {
                assignmentMap[a.entrepreneur_id] = {
                  mentorId: a.mentor_id,
                  mentorName: a.mentor_name || "Mentor",
                  portfolioNumber: a.portfolio_number || 1
                };
              }
            });
            setMentorAssignments(assignmentMap);
          }
        }
      } catch (err) {
        console.error("Error fetching mentor assignments:", err);
      }
    };

    loadData();
  }, []);

  const handleApproveMentor = async (index: number) => {
    const mentor = mentorApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentors/${mentor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });
      if (response.ok) {
        const updated = [...mentorApplications];
        updated[index].status = "approved";
        setMentorApplications(updated);
        setApprovedMentors(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error approving mentor:", err);
    }
  };

  const handleRejectMentor = async (index: number) => {
    const mentor = mentorApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentors/${mentor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });
      if (response.ok) {
        const updated = [...mentorApplications];
        updated[index].status = "rejected";
        setMentorApplications(updated);
        setApprovedMentors(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error rejecting mentor:", err);
    }
  };

  const handleApproveCoach = async (index: number) => {
    const coach = coachApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });
      if (response.ok) {
        const updated = [...coachApplications];
        updated[index].status = "approved";
        setCoachApplications(updated);
        setApprovedCoaches(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error approving coach:", err);
    }
  };

  const handleRejectCoach = async (index: number) => {
    const coach = coachApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });
      if (response.ok) {
        const updated = [...coachApplications];
        updated[index].status = "rejected";
        setCoachApplications(updated);
        setApprovedCoaches(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error rejecting coach:", err);
    }
  };

  const handleApproveInvestor = async (index: number) => {
    const investor = investorApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/investors/${investor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });
      if (response.ok) {
        const updated = [...investorApplications];
        updated[index].status = "approved";
        setInvestorApplications(updated);
        setApprovedInvestors(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error approving investor:", err);
    }
  };

  const handleRejectInvestor = async (index: number) => {
    const investor = investorApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/investors/${investor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });
      if (response.ok) {
        const updated = [...investorApplications];
        updated[index].status = "rejected";
        setInvestorApplications(updated);
        setApprovedInvestors(updated.filter((app: any) => app.status === "approved"));
      }
    } catch (err) {
      console.error("Error rejecting investor:", err);
    }
  };

  const handleToggleMemberStatus = (id: string) => {
    const updated = members.map(m => 
      m.id === id ? { ...m, status: (m.status === "active" ? "disabled" : "active") as "active" | "disabled" } : m
    );
    setMembers(updated);
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedMember) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromName: "Admin",
            fromEmail: "admin@touchconnectpro.com",
            toName: selectedMember.name,
            toEmail: selectedMember.email,
            message: messageText
          })
        });
        if (response.ok) {
          // Reload all messages
          const messagesResponse = await fetch(`${API_BASE_URL}/api/messages`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            setMessageHistory(messagesData.messages || []);
          }
          console.log(`Message sent to ${selectedMember.name}: ${messageText}`);
          setMessageText("");
          setShowMessageModal(false);
          setSelectedMember(null);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const markMessagesAsReadByAdmin = (memberEmail: string) => {
    const messagesToMark = messageHistory
      .filter((m: any) => m.from_email === memberEmail && m.from_email !== "admin@touchconnectpro.com")
      .map((m: any) => m.id);
    if (messagesToMark.length > 0) {
      const combined = [...adminReadMessageIds, ...messagesToMark];
      const updatedReadIds = combined.filter((id, index) => combined.indexOf(id) === index);
      setAdminReadMessageIds(updatedReadIds);
      localStorage.setItem("tcp_adminReadMessageIds", JSON.stringify(updatedReadIds));
    }
  };

  const openConversationModal = (member: User) => {
    setSelectedMember(member);
    setShowMessageModal(true);
    markMessagesAsReadByAdmin(member.email);
  };

  const handleToggleProfessionalStatus = (type: "entrepreneur" | "mentor" | "coach" | "investor", idx: number) => {
    const key = `${type}-${idx}`;
    const updated = { ...disabledProfessionals, [key]: !disabledProfessionals[key] };
    setDisabledProfessionals(updated);
    localStorage.setItem("tcp_disabledProfessionals", JSON.stringify(updated));
  };

  const handleApproveEntrepreneur = async (index: number) => {
    const entrepreneur = entrepreneurApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/ideas/${entrepreneur.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" })
      });
      if (response.ok) {
        const data = await response.json();
        const updated = [...entrepreneurApplications];
        updated[index].status = "approved";
        setEntrepreneurApplications(updated);
        setApprovedEntrepreneurs(updated.filter((app: any) => app.status === "approved"));
        console.log("Entrepreneur approved, email sent:", data.emailSent);
      }
    } catch (err) {
      console.error("Error approving entrepreneur:", err);
    }
  };

  const handleRejectEntrepreneur = async (index: number) => {
    const entrepreneur = entrepreneurApplications[index];
    try {
      const response = await fetch(`${API_BASE_URL}/api/ideas/${entrepreneur.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" })
      });
      if (response.ok) {
        const data = await response.json();
        const updated = [...entrepreneurApplications];
        updated[index].status = "rejected";
        setEntrepreneurApplications(updated);
        setApprovedEntrepreneurs(updated.filter((app: any) => app.status === "approved"));
        console.log("Entrepreneur rejected, email sent:", data.emailSent);
      }
    } catch (err) {
      console.error("Error rejecting entrepreneur:", err);
    }
  };

  const handleAssignPortfolio = async () => {
    if (portfolioAssignment && selectedMember && selectedMentor) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/mentor-assignments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entrepreneurId: selectedMember.id,
            mentorId: selectedMentor,
            portfolioNumber: parseInt(portfolioAssignment)
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully assigned ${selectedMember.name} to mentor portfolio ${portfolioAssignment}`, data);
          
          // Refresh mentor assignments to update the badge
          const assignmentsResponse = await fetch(`${API_BASE_URL}/api/mentor-assignments`);
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            if (Array.isArray(assignmentsData.assignments)) {
              const assignmentMap: {[entrepreneurId: string]: {mentorId: string; mentorName: string; portfolioNumber: number}} = {};
              assignmentsData.assignments.forEach((a: any) => {
                if (a.entrepreneur_id && a.mentor_id) {
                  assignmentMap[a.entrepreneur_id] = {
                    mentorId: a.mentor_id,
                    mentorName: a.mentor_name || "Mentor",
                    portfolioNumber: a.portfolio_number || 1
                  };
                }
              });
              setMentorAssignments(assignmentMap);
            }
          }
          
          alert(`${selectedMember.name} has been assigned to the selected mentor's Portfolio ${portfolioAssignment}`);
        } else {
          const error = await response.json();
          console.error("Error assigning portfolio:", error);
          alert("Failed to assign portfolio: " + (error.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Error assigning portfolio:", err);
        alert("Failed to assign portfolio. Please try again.");
      }
      
      setPortfolioAssignment("");
      setSelectedMentor("");
      setShowPortfolioModal(false);
      setSelectedMember(null);
    }
  };

  const pendingEntrepreneurApplications = entrepreneurApplications.filter(app => app.status === "pending" || app.status === "submitted");
  const pendingMentorApplications = mentorApplications.filter(app => app.status === "pending");
  const pendingCoachApplications = coachApplications.filter(app => app.status === "pending");
  const pendingInvestorApplications = investorApplications.filter(app => app.status === "pending");
  const rejectedEntrepreneurApplications = entrepreneurApplications.filter(app => app.status === "rejected");
  const rejectedMentorApplications = mentorApplications.filter(app => app.status === "rejected");
  const rejectedCoachApplications = coachApplications.filter(app => app.status === "rejected");
  const rejectedInvestorApplications = investorApplications.filter(app => app.status === "rejected");

  const filterAndSort = (items: any[], nameField: string) => {
    const filtered = items.filter(item => item[nameField]?.toLowerCase().includes(searchTerm.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => {
      const nameA = (a[nameField] || "").toString().toLowerCase();
      const nameB = (b[nameField] || "").toString().toLowerCase();
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    return sorted;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage platform users, approvals, and communications</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button 
            variant={activeTab === "approvals" ? "default" : "outline"}
            onClick={() => setActiveTab("approvals")}
            className={activeTab === "approvals" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
            data-testid="button-approvals-tab"
          >
            <Check className="mr-2 h-4 w-4" /> Approvals
          </Button>
          <Button 
            variant={activeTab === "members" ? "default" : "outline"}
            onClick={() => setActiveTab("members")}
            className={activeTab === "members" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
            data-testid="button-members-tab"
          >
            <Users className="mr-2 h-4 w-4" /> Members & Portfolios
          </Button>
        </div>

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="space-y-8">
            {/* Approvals Sub-tabs */}
            <div className="flex gap-2 mb-6 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-2">
              <Button 
                variant={activeApprovalsSubTab === "entrepreneurs" ? "default" : "ghost"}
                onClick={() => setActiveApprovalsSubTab("entrepreneurs")}
                className={activeApprovalsSubTab === "entrepreneurs" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                data-testid="button-entrepreneurs-subtab"
              >
                Entrepreneurs
              </Button>
              <Button 
                variant={activeApprovalsSubTab === "mentors" ? "default" : "ghost"}
                onClick={() => setActiveApprovalsSubTab("mentors")}
                className={activeApprovalsSubTab === "mentors" ? "bg-blue-600 hover:bg-blue-700" : ""}
                data-testid="button-mentors-subtab"
              >
                Mentors
              </Button>
              <Button 
                variant={activeApprovalsSubTab === "coaches" ? "default" : "ghost"}
                onClick={() => setActiveApprovalsSubTab("coaches")}
                className={activeApprovalsSubTab === "coaches" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                data-testid="button-coaches-subtab"
              >
                Coaches
              </Button>
              <Button 
                variant={activeApprovalsSubTab === "investors" ? "default" : "ghost"}
                onClick={() => setActiveApprovalsSubTab("investors")}
                className={activeApprovalsSubTab === "investors" ? "bg-amber-600 hover:bg-amber-700" : ""}
                data-testid="button-investors-subtab"
              >
                Investors
              </Button>
            </div>

            {/* Entrepreneur Approvals */}
            {activeApprovalsSubTab === "entrepreneurs" && (
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Entrepreneur Approvals</h2>
              {pendingEntrepreneurApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No pending entrepreneur approvals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {pendingEntrepreneurApplications.map((app, idx) => {
                    const actualIdx = entrepreneurApplications.findIndex(a => a === app);
                    const isProposalExpanded = expandedProposal[app.id];
                    const isBusinessPlanExpanded = expandedBusinessPlan[app.id];
                    return (
                      <Card key={actualIdx} className="border-l-4 border-l-emerald-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle>{app.fullName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                            </div>
                            <div className="flex gap-2">
                              {app.is_resubmitted && <Badge className="bg-purple-600">Resubmission</Badge>}
                              <Badge className="bg-emerald-600">Pending</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                              <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{app.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                              <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                              <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                              <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Idea/Company Name</p>
                              <p className="text-slate-900 dark:text-white">{app.ideaName}</p>
                            </div>
                          </div>

                          {/* Idea Proposal Section */}
                          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                              onClick={() => setExpandedProposal({...expandedProposal, [app.id]: !isProposalExpanded})}
                              data-testid={`button-expand-proposal-${actualIdx}`}
                            >
                              {isProposalExpanded ? "▼" : "▶"} Idea Proposal (43 Questions)
                            </Button>
                            {isProposalExpanded && app.ideaReview && (
                              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                {Object.entries(app.ideaReview).map(([key, value]: [string, any], i) => (
                                  <div key={i} className="text-sm">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1">{String(value || 'N/A')}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Business Plan Section */}
                          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                              onClick={() => setExpandedBusinessPlan({...expandedBusinessPlan, [app.id]: !isBusinessPlanExpanded})}
                              data-testid={`button-expand-businessplan-${actualIdx}`}
                            >
                              {isBusinessPlanExpanded ? "▼" : "▶"} Business Plan AI Draft (11 Sections)
                            </Button>
                            {isBusinessPlanExpanded && app.businessPlan && (
                              <div className="mt-4 space-y-4 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">1. Executive Summary</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.executiveSummary || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">2. Problem Statement</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.problemStatement || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">3. Solution</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.solution || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">4. Target Market</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.targetMarket || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">5. Market Size</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.marketSize || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">6. Revenue Model</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.revenueModel || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">7. Competitive Advantage</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.competitiveAdvantage || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">8. 12-Month Roadmap</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.roadmap12Month || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">9. Funding Requirements</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.fundingRequirements || 'N/A'}</p>
                                </div>
                                <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">10. Risks & Mitigation</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.risksAndMitigation || 'N/A'}</p>
                                </div>
                                <div className="text-sm">
                                  <p className="font-semibold text-slate-700 dark:text-slate-300">11. Success Metrics</p>
                                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.successMetrics || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 relative z-10">
                            <Button 
                              type="button"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              onClick={() => handleApproveEntrepreneur(actualIdx)}
                              data-testid={`button-admin-approve-entrepreneur-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              onClick={() => handleRejectEntrepreneur(actualIdx)}
                              data-testid={`button-admin-reject-entrepreneur-${actualIdx}`}
                            >
                              <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Mentor Approvals */}
            {activeApprovalsSubTab === "mentors" && (
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Mentor Approvals</h2>
              {pendingMentorApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No pending mentor approvals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingMentorApplications.map((app, idx) => {
                    const actualIdx = mentorApplications.findIndex(a => a === app);
                    return (
                      <Card key={actualIdx} className="border-l-4 border-l-amber-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle>{app.fullName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                            </div>
                            <div className="flex gap-2">
                              {app.is_resubmitted && <Badge className="bg-purple-600">Resubmission</Badge>}
                              <Badge className="bg-amber-600">Pending</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                              <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{app.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                              <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Years Experience</p>
                              <p className="text-slate-900 dark:text-white">{app.experience}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                              <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                              <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                              <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bio</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.bio}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 relative z-10">
                            <Button 
                              type="button"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              onClick={() => handleApproveMentor(actualIdx)}
                              data-testid={`button-admin-approve-mentor-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              onClick={() => handleRejectMentor(actualIdx)}
                              data-testid={`button-admin-reject-mentor-${actualIdx}`}
                            >
                              <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Coach Approvals */}
            {activeApprovalsSubTab === "coaches" && (
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Coach Approvals</h2>
              {pendingCoachApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No pending coach approvals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingCoachApplications.map((app, idx) => {
                    const actualIdx = coachApplications.findIndex(a => a === app);
                    return (
                      <Card key={actualIdx} className="border-l-4 border-l-cyan-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle>{app.fullName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                            </div>
                            <div className="flex gap-2">
                              {app.is_resubmitted && <Badge className="bg-purple-600">Resubmission</Badge>}
                              <Badge className="bg-cyan-600">Pending</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                              <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{app.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                              <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Hourly Rate</p>
                              <p className="text-slate-900 dark:text-white">${app.hourlyRate}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                              <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                              <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                              <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Focus Areas</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.focusAreas}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 relative z-10">
                            <Button 
                              type="button"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              onClick={() => handleApproveCoach(actualIdx)}
                              data-testid={`button-admin-approve-coach-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              onClick={() => handleRejectCoach(actualIdx)}
                              data-testid={`button-admin-reject-coach-${actualIdx}`}
                            >
                              <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Investor Approvals */}
            {activeApprovalsSubTab === "investors" && (
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Investor Approvals</h2>
              {pendingInvestorApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No pending investor approvals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingInvestorApplications.map((app, idx) => {
                    const actualIdx = investorApplications.findIndex(a => a === app);
                    return (
                      <Card key={actualIdx} className="border-l-4 border-l-amber-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle>{app.fullName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                            </div>
                            <div className="flex gap-2">
                              {app.is_resubmitted && <Badge className="bg-purple-600">Resubmission</Badge>}
                              <Badge className="bg-amber-600">Pending</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                              <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{app.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                              <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Fund Name</p>
                              <p className="text-slate-900 dark:text-white">{app.fundName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Amount</p>
                              <p className="text-slate-900 dark:text-white">{app.investmentAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Preference</p>
                              <p className="text-slate-900 dark:text-white">{app.investmentPreference}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                              <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                              <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Focus</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.investmentFocus}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 relative z-10">
                            <Button 
                              type="button"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              onClick={() => handleApproveInvestor(actualIdx)}
                              data-testid={`button-admin-approve-investor-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              type="button"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              onClick={() => handleRejectInvestor(actualIdx)}
                              data-testid={`button-admin-reject-investor-${actualIdx}`}
                            >
                              <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            )}

          </div>
        )}

        {/* Members & Portfolios Tab */}
        {activeTab === "members" && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Members & Portfolio Management</h2>
              </div>
              
              {/* Category Sub-tabs - matching Approvals tab style */}
              <div className="flex gap-2 mb-6 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-2">
                <Button 
                  variant={activeMembersCategoryTab === "entrepreneurs" ? "default" : "ghost"}
                  onClick={() => setActiveMembersCategoryTab("entrepreneurs")}
                  className={activeMembersCategoryTab === "entrepreneurs" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  data-testid="button-members-entrepreneurs-subtab"
                >
                  Entrepreneurs
                </Button>
                <Button 
                  variant={activeMembersCategoryTab === "mentors" ? "default" : "ghost"}
                  onClick={() => setActiveMembersCategoryTab("mentors")}
                  className={activeMembersCategoryTab === "mentors" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  data-testid="button-members-mentors-subtab"
                >
                  Mentors
                </Button>
                <Button 
                  variant={activeMembersCategoryTab === "coaches" ? "default" : "ghost"}
                  onClick={() => setActiveMembersCategoryTab("coaches")}
                  className={activeMembersCategoryTab === "coaches" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  data-testid="button-members-coaches-subtab"
                >
                  Coaches
                </Button>
                <Button 
                  variant={activeMembersCategoryTab === "investors" ? "default" : "ghost"}
                  onClick={() => setActiveMembersCategoryTab("investors")}
                  className={activeMembersCategoryTab === "investors" ? "bg-amber-600 hover:bg-amber-700" : ""}
                  data-testid="button-members-investors-subtab"
                >
                  Investors
                </Button>
              </div>
              
              {/* Action Sub-tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button 
                  variant={activeMembersSubTab === "portfolio" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("portfolio")}
                  className={activeMembersSubTab === "portfolio" ? "bg-slate-700 hover:bg-slate-800" : ""}
                  size="sm"
                  data-testid="button-members-subtab-portfolio"
                >
                  Portfolio Assignment
                </Button>
                <Button 
                  variant={activeMembersSubTab === "messaging" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("messaging")}
                  className={`${activeMembersSubTab === "messaging" ? "bg-slate-700 hover:bg-slate-800" : ""} relative`}
                  size="sm"
                  data-testid="button-members-subtab-messaging"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Messages
                  {messageHistory.filter((m: any) => m.from_email !== "admin@touchconnectpro.com" && !adminReadMessageIds.includes(m.id)).length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                      {messageHistory.filter((m: any) => m.from_email !== "admin@touchconnectpro.com" && !adminReadMessageIds.includes(m.id)).length}
                    </span>
                  )}
                </Button>
                <Button 
                  variant={activeMembersSubTab === "management" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("management")}
                  className={activeMembersSubTab === "management" ? "bg-slate-700 hover:bg-slate-800" : ""}
                  size="sm"
                  data-testid="button-members-subtab-management"
                >
                  <Power className="mr-2 h-4 w-4" /> User Management
                </Button>
              </div>

              {/* Search and Sort Controls */}
              <div className="flex gap-4 mb-6 flex-wrap items-end">
                <div className="flex-1 min-w-64">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Search by Name</label>
                  <input 
                    type="text" 
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    data-testid="input-search-members"
                  />
                </div>
                <div className="flex gap-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Sort:</label>
                  <Button 
                    variant={sortOrder === "asc" ? "default" : "outline"}
                    onClick={() => setSortOrder("asc")}
                    size="sm"
                    className={sortOrder === "asc" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                    data-testid="button-sort-asc"
                  >
                    A-Z
                  </Button>
                  <Button 
                    variant={sortOrder === "desc" ? "default" : "outline"}
                    onClick={() => setSortOrder("desc")}
                    size="sm"
                    className={sortOrder === "desc" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                    data-testid="button-sort-desc"
                  >
                    Z-A
                  </Button>
                </div>
              </div>

              <>
              {/* Portfolio Assignment Sub-tab */}
              {activeMembersSubTab === "portfolio" && (
              <div>
              {/* Entrepreneurs - Full Details */}
              {activeMembersCategoryTab === "entrepreneurs" && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Approved Entrepreneurs</h2>
                  {entrepreneurApplications.filter(app => app.status === "approved").length === 0 ? (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground">No approved entrepreneur applications</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {filterAndSort(entrepreneurApplications.filter(app => app.status === "approved"), "fullName").map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-emerald-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle>{app.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge className="bg-emerald-600">Approved</Badge>
                                {mentorAssignments[app.id] ? (
                                  <Badge className="bg-cyan-600">
                                    {mentorAssignments[app.id].mentorName} (P{mentorAssignments[app.id].portfolioNumber})
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                                    No Mentor Assigned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                <p className="text-slate-900 dark:text-white">{app.email}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Idea Name</p>
                                <p className="text-slate-900 dark:text-white">{app.ideaName || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                                <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Portfolio</p>
                                <p className="text-slate-900 dark:text-white">{app.portfolio || "Unassigned"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                                <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                            {app.problem && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Problem Statement</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{app.problem}</p>
                              </div>
                            )}
                            {app.solution && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Solution</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{app.solution}</p>
                              </div>
                            )}
                            
                            {/* Idea Proposal Section - Same format as Approvals tab */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                                onClick={() => setExpandedProposal(prev => ({ ...prev, [`member-${app.id}`]: !prev[`member-${app.id}`] }))}
                                data-testid={`button-toggle-proposal-member-${idx}`}
                              >
                                {expandedProposal[`member-${app.id}`] ? "▼" : "▶"} Idea Proposal (43 Questions)
                              </Button>
                              {expandedProposal[`member-${app.id}`] && app.ideaReview && (
                                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                  {Object.entries(app.ideaReview).map(([key, value]: [string, any], i) => (
                                    <div key={i} className="text-sm">
                                      <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                      <p className="text-slate-600 dark:text-slate-400 mt-1">{String(value || 'N/A')}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Business Plan Section - Same format as Approvals tab */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                                onClick={() => setExpandedBusinessPlan(prev => ({ ...prev, [`member-${app.id}`]: !prev[`member-${app.id}`] }))}
                                data-testid={`button-toggle-businessplan-member-${idx}`}
                              >
                                {expandedBusinessPlan[`member-${app.id}`] ? "▼" : "▶"} Business Plan AI Draft (11 Sections)
                              </Button>
                              {expandedBusinessPlan[`member-${app.id}`] && app.businessPlan && (
                                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">1. Executive Summary</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.executiveSummary || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">2. Problem Statement</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.problemStatement || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">3. Solution</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.solution || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">4. Target Market</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.targetMarket || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">5. Competitive Analysis</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.competitiveAnalysis || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">6. Business Model</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.businessModel || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">7. Marketing Strategy</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.marketingStrategy || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">8. Financial Projections</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.financialProjections || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">9. Team</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.team || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">10. Milestones</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.milestones || 'N/A'}</p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">11. Funding Requirements</p>
                                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.fundingRequirements || 'N/A'}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMember({
                                    id: app.id,
                                    name: app.fullName,
                                    email: app.email,
                                    type: "entrepreneur" as const,
                                    status: "active" as const
                                  });
                                  setShowPortfolioModal(true);
                                }}
                                data-testid={`button-assign-portfolio-entrepreneur-${idx}`}
                              >
                                Assign to Portfolio
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedMember({
                                    id: app.id,
                                    name: app.fullName,
                                    email: app.email,
                                    type: "entrepreneur" as const,
                                    status: "active" as const
                                  });
                                  setShowMessageModal(true);
                                }}
                                data-testid={`button-message-entrepreneur-${idx}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Rejected Entrepreneurs - Collapsible Section */}
                  {entrepreneurApplications.filter(app => app.status === "rejected").length > 0 && (
                    <div className="mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejected(prev => ({ ...prev, entrepreneurs: !prev.entrepreneurs }))}
                        className="w-full justify-between text-slate-600 dark:text-slate-400 border-dashed"
                        data-testid="button-toggle-rejected-entrepreneurs"
                      >
                        <span>Rejected Entrepreneurs ({entrepreneurApplications.filter(app => app.status === "rejected").length})</span>
                        <span>{showRejected.entrepreneurs ? "▼" : "▶"}</span>
                      </Button>
                      {showRejected.entrepreneurs && (
                        <div className="space-y-6 mt-4">
                          {filterAndSort(entrepreneurApplications.filter(app => app.status === "rejected"), "fullName").map((app, idx) => (
                            <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle>{app.fullName}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                                  </div>
                                  <Badge className="bg-red-600">Rejected</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                    <p className="text-slate-900 dark:text-white">{app.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                    <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Idea Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.ideaName || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                    <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                                    <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                                  </div>
                                </div>
                                {app.problem && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Problem Statement</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.problem}</p>
                                  </div>
                                )}
                                {app.solution && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Solution</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.solution}</p>
                                  </div>
                                )}
                                
                                {/* Idea Proposal Section for Rejected */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                  <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                                    onClick={() => setExpandedProposal(prev => ({ ...prev, [`rejected-${app.id}`]: !prev[`rejected-${app.id}`] }))}
                                    data-testid={`button-toggle-proposal-rejected-${idx}`}
                                  >
                                    {expandedProposal[`rejected-${app.id}`] ? "▼" : "▶"} Idea Proposal (43 Questions)
                                  </Button>
                                  {expandedProposal[`rejected-${app.id}`] && app.ideaReview && (
                                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                      {Object.entries(app.ideaReview).map(([key, value]: [string, any], i) => (
                                        <div key={i} className="text-sm">
                                          <p className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                          <p className="text-slate-600 dark:text-slate-400 mt-1">{String(value || 'N/A')}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Business Plan Section for Rejected */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                  <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-cyan-600 hover:text-cyan-700 font-semibold"
                                    onClick={() => setExpandedBusinessPlan(prev => ({ ...prev, [`rejected-${app.id}`]: !prev[`rejected-${app.id}`] }))}
                                    data-testid={`button-toggle-businessplan-rejected-${idx}`}
                                  >
                                    {expandedBusinessPlan[`rejected-${app.id}`] ? "▼" : "▶"} Business Plan AI Draft (11 Sections)
                                  </Button>
                                  {expandedBusinessPlan[`rejected-${app.id}`] && app.businessPlan && (
                                    <div className="mt-4 space-y-4 max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800/30 p-4 rounded">
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">1. Executive Summary</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.executiveSummary || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">2. Problem Statement</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.problemStatement || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">3. Solution</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.solution || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">4. Target Market</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.targetMarket || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">5. Competitive Analysis</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.competitiveAnalysis || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">6. Business Model</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.businessModel || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">7. Marketing Strategy</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.marketingStrategy || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">8. Financial Projections</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.financialProjections || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">9. Team</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.team || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">10. Milestones</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.milestones || 'N/A'}</p>
                                      </div>
                                      <div className="text-sm">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">11. Funding Requirements</p>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs leading-relaxed">{app.businessPlan.fundingRequirements || 'N/A'}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mentors - Full Details */}
              {activeMembersCategoryTab === "mentors" && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Approved Mentors</h2>
                  {mentorApplications.filter(app => app.status === "approved").length === 0 ? (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground">No approved mentor applications</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {filterAndSort(mentorApplications.filter(app => app.status === "approved"), "fullName").map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle>{app.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                              </div>
                              <Badge className="bg-blue-600">Approved</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                <p className="text-slate-900 dark:text-white">{app.email}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                                <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Experience</p>
                                <p className="text-slate-900 dark:text-white">{app.experience}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                                <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                                <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                            {app.bio && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bio</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{app.bio}</p>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedMember({
                                    id: app.id,
                                    name: app.fullName,
                                    email: app.email,
                                    type: "mentor" as const,
                                    status: "active" as const
                                  });
                                  setShowMessageModal(true);
                                }}
                                data-testid={`button-message-mentor-${idx}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Rejected Mentors - Collapsible Section */}
                  {mentorApplications.filter(app => app.status === "rejected").length > 0 && (
                    <div className="mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejected(prev => ({ ...prev, mentors: !prev.mentors }))}
                        className="w-full justify-between text-slate-600 dark:text-slate-400 border-dashed"
                        data-testid="button-toggle-rejected-mentors"
                      >
                        <span>Rejected Mentors ({mentorApplications.filter(app => app.status === "rejected").length})</span>
                        <span>{showRejected.mentors ? "▼" : "▶"}</span>
                      </Button>
                      {showRejected.mentors && (
                        <div className="space-y-6 mt-4">
                          {filterAndSort(mentorApplications.filter(app => app.status === "rejected"), "fullName").map((app, idx) => (
                            <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle>{app.fullName}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                                  </div>
                                  <Badge className="bg-red-600">Rejected</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                    <p className="text-slate-900 dark:text-white">{app.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                    <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                                    <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Experience</p>
                                    <p className="text-slate-900 dark:text-white">{app.experience}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                    <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                                  </div>
                                </div>
                                {app.bio && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bio</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.bio}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Coaches - Full Details */}
              {activeMembersCategoryTab === "coaches" && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Approved Coaches</h2>
                  {coachApplications.filter(app => app.status === "approved").length === 0 ? (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground">No approved coach applications</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {filterAndSort(coachApplications.filter(app => app.status === "approved"), "fullName").map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-cyan-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle>{app.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                              </div>
                              <Badge className="bg-cyan-600">Approved</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                <p className="text-slate-900 dark:text-white">{app.email}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                                <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Focus Areas</p>
                                <p className="text-slate-900 dark:text-white">{app.focusAreas}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Hourly Rate</p>
                                <p className="text-slate-900 dark:text-white">${app.hourlyRate}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                                <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                                <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedMember({
                                    id: app.id,
                                    name: app.fullName,
                                    email: app.email,
                                    type: "coach" as const,
                                    status: "active" as const
                                  });
                                  setShowMessageModal(true);
                                }}
                                data-testid={`button-message-coach-${idx}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Rejected Coaches - Collapsible Section */}
                  {coachApplications.filter(app => app.status === "rejected").length > 0 && (
                    <div className="mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejected(prev => ({ ...prev, coaches: !prev.coaches }))}
                        className="w-full justify-between text-slate-600 dark:text-slate-400 border-dashed"
                        data-testid="button-toggle-rejected-coaches"
                      >
                        <span>Rejected Coaches ({coachApplications.filter(app => app.status === "rejected").length})</span>
                        <span>{showRejected.coaches ? "▼" : "▶"}</span>
                      </Button>
                      {showRejected.coaches && (
                        <div className="space-y-6 mt-4">
                          {filterAndSort(coachApplications.filter(app => app.status === "rejected"), "fullName").map((app, idx) => (
                            <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle>{app.fullName}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                                  </div>
                                  <Badge className="bg-red-600">Rejected</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                    <p className="text-slate-900 dark:text-white">{app.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                    <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                                    <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Focus Areas</p>
                                    <p className="text-slate-900 dark:text-white">{app.focusAreas}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Hourly Rate</p>
                                    <p className="text-slate-900 dark:text-white">${app.hourlyRate}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Investors - Full Details */}
              {activeMembersCategoryTab === "investors" && (
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Approved Investors</h2>
                  {investorApplications.filter(app => app.status === "approved").length === 0 ? (
                    <Card>
                      <CardContent className="pt-12 pb-12 text-center">
                        <p className="text-muted-foreground">No approved investor applications</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {filterAndSort(investorApplications.filter(app => app.status === "approved"), "fullName").map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-amber-500">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle>{app.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                              </div>
                              <Badge className="bg-amber-600">Approved</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                <p className="text-slate-900 dark:text-white">{app.email}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Fund Name</p>
                                <p className="text-slate-900 dark:text-white">{app.fundName}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Amount</p>
                                <p className="text-slate-900 dark:text-white">{app.investmentAmount}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Preference</p>
                                <p className="text-slate-900 dark:text-white">{app.investmentPreference}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Focus</p>
                                <p className="text-slate-900 dark:text-white">{app.investmentFocus}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Country</p>
                                <p className="text-slate-900 dark:text-white">{app.country || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
                                <p className="text-slate-900 dark:text-white">{app.state || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Submitted</p>
                                <p className="text-slate-900 dark:text-white text-xs">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedMember({
                                    id: app.id,
                                    name: app.fullName,
                                    email: app.email,
                                    type: "investor" as const,
                                    status: "active" as const
                                  });
                                  setShowMessageModal(true);
                                }}
                                data-testid={`button-message-investor-${idx}`}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {/* Rejected Investors - Collapsible Section */}
                  {investorApplications.filter(app => app.status === "rejected").length > 0 && (
                    <div className="mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowRejected(prev => ({ ...prev, investors: !prev.investors }))}
                        className="w-full justify-between text-slate-600 dark:text-slate-400 border-dashed"
                        data-testid="button-toggle-rejected-investors"
                      >
                        <span>Rejected Investors ({investorApplications.filter(app => app.status === "rejected").length})</span>
                        <span>{showRejected.investors ? "▼" : "▶"}</span>
                      </Button>
                      {showRejected.investors && (
                        <div className="space-y-6 mt-4">
                          {filterAndSort(investorApplications.filter(app => app.status === "rejected"), "fullName").map((app, idx) => (
                            <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle>{app.fullName}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                                  </div>
                                  <Badge className="bg-red-600">Rejected</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email</p>
                                    <p className="text-slate-900 dark:text-white">{app.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LinkedIn</p>
                                    <p className="text-slate-900 dark:text-white truncate">{app.linkedin || "—"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Fund Name</p>
                                    <p className="text-slate-900 dark:text-white">{app.fundName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Amount</p>
                                    <p className="text-slate-900 dark:text-white">{app.investmentAmount}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Preference</p>
                                    <p className="text-slate-900 dark:text-white">{app.investmentPreference}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
              )}

              {/* Messaging Sub-tab */}
              {activeMembersSubTab === "messaging" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Send Messages to {activeMembersCategoryTab.charAt(0).toUpperCase() + activeMembersCategoryTab.slice(1)}</h3>
                <div className="space-y-6">
                  {/* Entrepreneurs - show only when selected */}
                  {activeMembersCategoryTab === "entrepreneurs" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">👨‍💼 Approved Entrepreneurs</h4>
                    <div className="space-y-3">
                      {filterAndSort(entrepreneurApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved entrepreneurs to message
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(entrepreneurApplications.filter(app => app.status === "approved"), "fullName").map((entrepreneur, idx) => {
                          const unreadReplies = messageHistory.filter((m: any) => m.from_email === entrepreneur.email && !adminReadMessageIds.includes(m.id)).length;
                          const hasUnreadReplies = unreadReplies > 0;
                          return (
                          <Card key={`msg-${entrepreneur.id}`} className={hasUnreadReplies ? "border-l-4 border-l-amber-500" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                      {entrepreneur.fullName}
                                      {hasUnreadReplies && (
                                        <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                          {unreadReplies} New
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{entrepreneur.email}</p>
                                  </div>
                                </div>
                                <Button onClick={() => openConversationModal({id: entrepreneur.id, name: entrepreneur.fullName, email: entrepreneur.email, type: "entrepreneur", status: "active"})} data-testid={`button-message-entrepreneur-${idx}`} size="sm" className={hasUnreadReplies ? "bg-amber-600 hover:bg-amber-700" : ""}>
                                  <MessageSquare className="mr-2 h-4 w-4" /> {hasUnreadReplies ? "View Reply" : "Message"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        }))
                      }
                    </div>
                  </div>
                  )}
                  {/* Mentors - show only when selected */}
                  {activeMembersCategoryTab === "mentors" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">🎓 Approved Mentors</h4>
                    <div className="space-y-3">
                      {filterAndSort(mentorApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved mentors to message
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(mentorApplications.filter(app => app.status === "approved"), "fullName").map((mentor, idx) => {
                          const unreadReplies = messageHistory.filter((m: any) => m.from_email === mentor.email && !adminReadMessageIds.includes(m.id)).length;
                          const hasUnreadReplies = unreadReplies > 0;
                          return (
                          <Card key={idx} className={hasUnreadReplies ? "border-l-4 border-l-amber-500" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {mentor.fullName}
                                    {hasUnreadReplies && (
                                      <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                        {unreadReplies} New
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{mentor.email}</p>
                                </div>
                                <Button onClick={() => openConversationModal({id: mentor.id, name: mentor.fullName, email: mentor.email, type: "mentor", status: "active"})} data-testid={`button-message-mentor-${idx}`} size="sm" className={hasUnreadReplies ? "bg-amber-600 hover:bg-amber-700" : ""}>
                                  <MessageSquare className="mr-2 h-4 w-4" /> {hasUnreadReplies ? "View Reply" : "Message"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                  {/* Coaches - show only when selected */}
                  {activeMembersCategoryTab === "coaches" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💪 Approved Coaches</h4>
                    <div className="space-y-3">
                      {filterAndSort(coachApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved coaches to message
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(coachApplications.filter(app => app.status === "approved"), "fullName").map((coach, idx) => {
                          const unreadReplies = messageHistory.filter((m: any) => m.from_email === coach.email && !adminReadMessageIds.includes(m.id)).length;
                          const hasUnreadReplies = unreadReplies > 0;
                          return (
                          <Card key={idx} className={hasUnreadReplies ? "border-l-4 border-l-amber-500" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {coach.fullName}
                                    {hasUnreadReplies && (
                                      <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                        {unreadReplies} New
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{coach.email}</p>
                                </div>
                                <Button onClick={() => openConversationModal({id: coach.id, name: coach.fullName, email: coach.email, type: "coach", status: "active"})} data-testid={`button-message-coach-${idx}`} size="sm" className={hasUnreadReplies ? "bg-amber-600 hover:bg-amber-700" : ""}>
                                  <MessageSquare className="mr-2 h-4 w-4" /> {hasUnreadReplies ? "View Reply" : "Message"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                  {/* Investors - show only when selected */}
                  {activeMembersCategoryTab === "investors" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💰 Approved Investors</h4>
                    <div className="space-y-3">
                      {filterAndSort(investorApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved investors to message
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(investorApplications.filter(app => app.status === "approved"), "fullName").map((investor, idx) => {
                          const unreadReplies = messageHistory.filter((m: any) => m.from_email === investor.email && !adminReadMessageIds.includes(m.id)).length;
                          const hasUnreadReplies = unreadReplies > 0;
                          return (
                          <Card key={idx} className={hasUnreadReplies ? "border-l-4 border-l-amber-500" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {investor.fullName}
                                    {hasUnreadReplies && (
                                      <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                        {unreadReplies} New
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{investor.email}</p>
                                </div>
                                <Button onClick={() => openConversationModal({id: investor.id, name: investor.fullName, email: investor.email, type: "investor", status: "active"})} data-testid={`button-message-investor-${idx}`} size="sm" className={hasUnreadReplies ? "bg-amber-600 hover:bg-amber-700" : ""}>
                                  <MessageSquare className="mr-2 h-4 w-4" /> {hasUnreadReplies ? "View Reply" : "Message"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
              )}

              {/* User Management Sub-tab */}
              {activeMembersSubTab === "management" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Manage {activeMembersCategoryTab.charAt(0).toUpperCase() + activeMembersCategoryTab.slice(1)} Status</h3>
                <div className="space-y-6">
                  {/* Entrepreneurs - show only when selected */}
                  {activeMembersCategoryTab === "entrepreneurs" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">👨‍💼 Approved Entrepreneurs</h4>
                    <div className="space-y-3">
                      {filterAndSort(entrepreneurApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved entrepreneurs to manage
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(entrepreneurApplications.filter(app => app.status === "approved"), "fullName").map((entrepreneur, idx) => {
                          const isDisabled = disabledProfessionals[`entrepreneur-${idx}`];
                          return (
                          <Card key={`mgmt-${entrepreneur.id}`} className={isDisabled ? "opacity-60" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{entrepreneur.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{entrepreneur.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant={isDisabled ? "default" : "destructive"} onClick={() => handleToggleProfessionalStatus("entrepreneur", idx)} data-testid={`button-toggle-entrepreneur-${idx}`} size="sm">{isDisabled ? "Enable" : "Disable"}</Button>
                                  <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-entrepreneur-${idx}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                  {/* Mentors - show only when selected */}
                  {activeMembersCategoryTab === "mentors" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">🎓 Approved Mentors</h4>
                    <div className="space-y-3">
                      {filterAndSort(mentorApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved mentors to manage
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(mentorApplications.filter(app => app.status === "approved"), "fullName").map((mentor, idx) => {
                          const isDisabled = disabledProfessionals[`mentor-${idx}`];
                          return (
                          <Card key={idx} className={isDisabled ? "opacity-60" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{mentor.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{mentor.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant={isDisabled ? "default" : "destructive"} onClick={() => handleToggleProfessionalStatus("mentor", idx)} data-testid={`button-toggle-mentor-${idx}`} size="sm">{isDisabled ? "Enable" : "Disable"}</Button>
                                  <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-mentor-${idx}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                  {/* Coaches - show only when selected */}
                  {activeMembersCategoryTab === "coaches" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💪 Approved Coaches</h4>
                    <div className="space-y-3">
                      {filterAndSort(coachApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved coaches to manage
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(coachApplications.filter(app => app.status === "approved"), "fullName").map((coach, idx) => {
                          const isDisabled = disabledProfessionals[`coach-${idx}`];
                          return (
                          <Card key={idx} className={isDisabled ? "opacity-60" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{coach.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{coach.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant={isDisabled ? "default" : "destructive"} onClick={() => handleToggleProfessionalStatus("coach", idx)} data-testid={`button-toggle-coach-${idx}`} size="sm">{isDisabled ? "Enable" : "Disable"}</Button>
                                  <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-coach-${idx}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                  {/* Investors - show only when selected */}
                  {activeMembersCategoryTab === "investors" && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💰 Approved Investors</h4>
                    <div className="space-y-3">
                      {filterAndSort(investorApplications.filter(app => app.status === "approved"), "fullName").length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                            No approved investors to manage
                          </CardContent>
                        </Card>
                      ) : (
                        filterAndSort(investorApplications.filter(app => app.status === "approved"), "fullName").map((investor, idx) => {
                          const isDisabled = disabledProfessionals[`investor-${idx}`];
                          return (
                          <Card key={idx} className={isDisabled ? "opacity-60" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{investor.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{investor.email}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant={isDisabled ? "default" : "destructive"} onClick={() => handleToggleProfessionalStatus("investor", idx)} data-testid={`button-toggle-investor-${idx}`} size="sm">{isDisabled ? "Enable" : "Disable"}</Button>
                                  <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-investor-${idx}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
              )}
              </>
            </div>
          </div>
        )}

      </div>

      {/* Portfolio Assignment Modal */}
      {showPortfolioModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign {selectedMember.name} to Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Select Mentor</label>
                <select 
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  data-testid="select-mentor"
                >
                  <option value="">Choose a mentor...</option>
                  {approvedMentors.length === 0 ? (
                    <option disabled>No approved mentors available</option>
                  ) : (
                    approvedMentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.fullName} - {mentor.expertise}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Portfolio Number</label>
                <select 
                  value={portfolioAssignment}
                  onChange={(e) => setPortfolioAssignment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  data-testid="select-portfolio"
                >
                  <option value="">Choose a portfolio...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>Portfolio {num}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPortfolioModal(false)}>Cancel</Button>
                <Button 
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700" 
                  onClick={handleAssignPortfolio} 
                  disabled={!selectedMentor || !portfolioAssignment}
                  data-testid="button-assign"
                >
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessageModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[500px] overflow-y-auto">
            <CardHeader>
              <CardTitle>Conversation with {selectedMember.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messageHistory.filter((m: any) => m.to_email === selectedMember.email || m.from_email === selectedMember.email).length > 0 && (
              <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Message History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {messageHistory
                    .filter((m: any) => m.to_email === selectedMember.email || m.from_email === selectedMember.email)
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((msg: any) => (
                    <div key={msg.id} className={`text-xs p-2 rounded ${msg.from_email === "admin@touchconnectpro.com" ? "bg-white dark:bg-slate-700" : "bg-amber-50 dark:bg-amber-900/30 border-l-2 border-l-amber-500"}`}>
                      <p className={`font-semibold ${msg.from_email === "admin@touchconnectpro.com" ? "text-slate-700 dark:text-slate-200" : "text-amber-700 dark:text-amber-400"}`}>
                        {msg.from_email === "admin@touchconnectpro.com" ? `Admin → ${msg.to_name}` : `${msg.from_name} → Admin`}
                        {msg.from_email !== "admin@touchconnectpro.com" && <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">Reply</span>}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{msg.message}</p>
                      <p className="text-slate-500 text-xs mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full min-h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                data-testid="textarea-message"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleSendMessage} data-testid="button-send-message">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
