import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, Users, Settings, Trash2, Power, Mail, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface MentorApplication {
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
}

interface CoachApplication {
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
}

interface InvestorApplication {
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
}

interface EntrepreneurApplication {
  fullName: string;
  email: string;
  ideaName: string;
  problem: string;
  solution: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  id: string;
  ideaReview?: any;
  businessPlan?: any;
  portfolio?: string;
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
  const [disabledProfessionals, setDisabledProfessionals] = useState<{[key: string]: boolean}>({});
  const [expandedProposal, setExpandedProposal] = useState<{[key: string]: boolean}>({});
  const [expandedBusinessPlan, setExpandedBusinessPlan] = useState<{[key: string]: boolean}>({});
  const [portfolioForApp, setPortfolioForApp] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const loadData = async () => {
      // Load from localStorage (mentors, coaches, investors)
      const savedMentorApplications = localStorage.getItem("tcp_mentorApplications");
      if (savedMentorApplications) {
        const allMentors = JSON.parse(savedMentorApplications);
        setMentorApplications(allMentors);
        setApprovedMentors(allMentors.filter((app: any) => app.status === "approved"));
      }
      const savedCoachApplications = localStorage.getItem("tcp_coachApplications");
      if (savedCoachApplications) {
        const allCoaches = JSON.parse(savedCoachApplications);
        setCoachApplications(allCoaches);
        setApprovedCoaches(allCoaches.filter((app: any) => app.status === "approved"));
      }
      const savedInvestorApplications = localStorage.getItem("tcp_investorApplications");
      if (savedInvestorApplications) {
        const allInvestors = JSON.parse(savedInvestorApplications);
        setInvestorApplications(allInvestors);
        setApprovedInvestors(allInvestors.filter((app: any) => app.status === "approved"));
      }
      const savedMessages = localStorage.getItem("tcp_messageHistory");
      if (savedMessages) {
        setMessageHistory(JSON.parse(savedMessages));
      }
      const savedDisabled = localStorage.getItem("tcp_disabledProfessionals");
      if (savedDisabled) {
        setDisabledProfessionals(JSON.parse(savedDisabled));
      }

      // Load entrepreneur applications from Supabase
      try {
        if (!supabase) {
          throw new Error("Supabase not configured");
        }
        const { data: ideas, error } = await supabase
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (ideas && ideas.length > 0) {
          const entrepreneurs = ideas.map((idea: any) => ({
            id: idea.id,
            fullName: idea.entrepreneur_name || idea.idea_data?.fullName || "Unknown",
            email: idea.entrepreneur_email || idea.idea_data?.email || "N/A",
            ideaName: idea.idea_data?.ideaName || "Untitled",
            problem: idea.idea_data?.problem || "",
            solution: idea.idea_data?.ideaDescription || "",
            status: idea.status,
            submittedAt: idea.created_at,
            ideaReview: idea.idea_data?.ideaReview || {},
            businessPlan: idea.business_plan || {},
            linkedin: idea.linkedin_profile || "",
            ...idea.idea_data
          }));
          setEntrepreneurApplications(entrepreneurs);
          setApprovedEntrepreneurs(entrepreneurs.filter((app: any) => app.status === "approved"));
        } else {
          // Fallback to localStorage if no Supabase data
          const savedEntrepreneurApplications = localStorage.getItem("tcp_entrepreneurApplications");
          if (savedEntrepreneurApplications) {
            const allEntrepreneurs = JSON.parse(savedEntrepreneurApplications);
            setEntrepreneurApplications(allEntrepreneurs);
            setApprovedEntrepreneurs(allEntrepreneurs.filter((app: any) => app.status === "approved"));
          }
        }
      } catch (err) {
        // Fallback to localStorage on error
        const savedEntrepreneurApplications = localStorage.getItem("tcp_entrepreneurApplications");
        if (savedEntrepreneurApplications) {
          const allEntrepreneurs = JSON.parse(savedEntrepreneurApplications);
          setEntrepreneurApplications(allEntrepreneurs);
          setApprovedEntrepreneurs(allEntrepreneurs.filter((app: any) => app.status === "approved"));
        }
      }
    };

    loadData();
  }, []);

  const handleApproveMentor = (index: number) => {
    const updated = [...mentorApplications];
    updated[index].status = "approved";
    setMentorApplications(updated);
    setApprovedMentors(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_mentorApplications", JSON.stringify(updated));

    const mentorProfile = {
      fullName: updated[index].fullName,
      email: updated[index].email,
      linkedin: updated[index].linkedin,
      bio: updated[index].bio,
      expertise: updated[index].expertise,
      yearsExperience: updated[index].experience,
      profileImage: null,
      approved: true
    };
    localStorage.setItem("tcp_mentorProfile", JSON.stringify(mentorProfile));
  };

  const handleRejectMentor = (index: number) => {
    const updated = [...mentorApplications];
    updated[index].status = "rejected";
    setMentorApplications(updated);
    setApprovedMentors(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_mentorApplications", JSON.stringify(updated));
  };

  const handleApproveCoach = (index: number) => {
    const updated = [...coachApplications];
    updated[index].status = "approved";
    setCoachApplications(updated);
    setApprovedCoaches(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_coachApplications", JSON.stringify(updated));

    const coachProfile = {
      fullName: updated[index].fullName,
      email: updated[index].email,
      linkedin: updated[index].linkedin,
      expertise: updated[index].expertise,
      focusAreas: updated[index].focusAreas,
      hourlyRate: updated[index].hourlyRate,
      profileImage: null,
      approved: true
    };
    localStorage.setItem("tcp_coachProfile", JSON.stringify(coachProfile));
  };

  const handleRejectCoach = (index: number) => {
    const updated = [...coachApplications];
    updated[index].status = "rejected";
    setCoachApplications(updated);
    setApprovedCoaches(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_coachApplications", JSON.stringify(updated));
  };

  const handleApproveInvestor = (index: number) => {
    const updated = [...investorApplications];
    updated[index].status = "approved";
    setInvestorApplications(updated);
    setApprovedInvestors(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_investorApplications", JSON.stringify(updated));

    const investorProfile = {
      fullName: updated[index].fullName,
      email: updated[index].email,
      linkedin: updated[index].linkedin,
      fundName: updated[index].fundName,
      investmentFocus: updated[index].investmentFocus,
      investmentPreference: updated[index].investmentPreference,
      investmentAmount: updated[index].investmentAmount,
      profileImage: null,
      approved: true
    };
    localStorage.setItem("tcp_investorProfile", JSON.stringify(investorProfile));
  };

  const handleRejectInvestor = (index: number) => {
    const updated = [...investorApplications];
    updated[index].status = "rejected";
    setInvestorApplications(updated);
    setApprovedInvestors(updated.filter((app: any) => app.status === "approved"));
    localStorage.setItem("tcp_investorApplications", JSON.stringify(updated));
  };

  const handleToggleMemberStatus = (id: string) => {
    const updated = members.map(m => 
      m.id === id ? { ...m, status: (m.status === "active" ? "disabled" : "active") as "active" | "disabled" } : m
    );
    setMembers(updated);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedMember) {
      const newMessage = {
        id: Date.now(),
        from: "Admin",
        to: selectedMember.name,
        toEmail: selectedMember.email,
        message: messageText,
        timestamp: new Date().toISOString()
      };
      const updated = [...messageHistory, newMessage];
      setMessageHistory(updated);
      localStorage.setItem("tcp_messageHistory", JSON.stringify(updated));
      console.log(`Message sent to ${selectedMember.name}: ${messageText}`);
      setMessageText("");
      setShowMessageModal(false);
      setSelectedMember(null);
    }
  };

  const handleToggleProfessionalStatus = (type: "mentor" | "coach" | "investor", idx: number) => {
    const key = `${type}-${idx}`;
    const updated = { ...disabledProfessionals, [key]: !disabledProfessionals[key] };
    setDisabledProfessionals(updated);
    localStorage.setItem("tcp_disabledProfessionals", JSON.stringify(updated));
  };

  const handleApproveEntrepreneur = (index: number) => {
    const updated = [...entrepreneurApplications];
    updated[index].status = "approved";
    setEntrepreneurApplications(updated);
    localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(updated));
  };

  const handleRejectEntrepreneur = (index: number) => {
    const updated = [...entrepreneurApplications];
    updated[index].status = "rejected";
    setEntrepreneurApplications(updated);
    localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(updated));
  };

  const handleAssignPortfolio = () => {
    if (portfolioAssignment && selectedMember) {
      console.log(`Assigned ${selectedMember.name} to portfolio ${portfolioAssignment}`);
      setPortfolioAssignment("");
      setShowPortfolioModal(false);
      setSelectedMember(null);
    }
  };

  const pendingEntrepreneurApplications = entrepreneurApplications.filter(app => app.status === "pending");
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
            {/* Entrepreneur Approvals */}
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
                            <Badge className="bg-emerald-600">Pending</Badge>
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

                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveEntrepreneur(actualIdx)}
                              data-testid={`button-admin-approve-entrepreneur-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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

            {/* Mentor Approvals */}
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
                            <Badge className="bg-amber-600">Pending</Badge>
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
                              <p className="text-slate-900 dark:text-white text-xs">{new Date(app.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bio</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.bio}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveMentor(actualIdx)}
                              data-testid={`button-admin-approve-mentor-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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

            {/* Coach Approvals */}
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
                            <Badge className="bg-cyan-600">Pending</Badge>
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
                              <p className="text-slate-900 dark:text-white text-xs">{new Date(app.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Focus Areas</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.focusAreas}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveCoach(actualIdx)}
                              data-testid={`button-admin-approve-coach-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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

            {/* Investor Approvals */}
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
                            <Badge className="bg-amber-600">Pending</Badge>
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
                              <p className="text-slate-900 dark:text-white text-xs">{new Date(app.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Investment Focus</p>
                            <p className="text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-800/30 p-3 rounded">{app.investmentFocus}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveInvestor(actualIdx)}
                              data-testid={`button-admin-approve-investor-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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

            {/* Rejected Applications */}
            {(rejectedMentorApplications.length > 0 || rejectedCoachApplications.length > 0 || rejectedInvestorApplications.length > 0) && (
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Rejected Applications</h2>
                
                {rejectedMentorApplications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Rejected Mentors ({rejectedMentorApplications.length})</h3>
                    <div className="space-y-3">
                      {rejectedMentorApplications.map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-semibold text-slate-900 dark:text-white">{app.fullName}</p>
                                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {rejectedCoachApplications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Rejected Coaches ({rejectedCoachApplications.length})</h3>
                    <div className="space-y-3">
                      {rejectedCoachApplications.map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-semibold text-slate-900 dark:text-white">{app.fullName}</p>
                                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {rejectedInvestorApplications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Rejected Investors ({rejectedInvestorApplications.length})</h3>
                    <div className="space-y-3">
                      {rejectedInvestorApplications.map((app, idx) => (
                        <Card key={idx} className="border-l-4 border-l-red-500 opacity-75">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-semibold text-slate-900 dark:text-white">{app.fullName}</p>
                                  <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{app.email}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
              
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button 
                  variant={activeMembersSubTab === "portfolio" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("portfolio")}
                  className={activeMembersSubTab === "portfolio" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  size="sm"
                  data-testid="button-members-subtab-portfolio"
                >
                  Portfolio Assignment
                </Button>
                <Button 
                  variant={activeMembersSubTab === "messaging" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("messaging")}
                  className={activeMembersSubTab === "messaging" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                  size="sm"
                  data-testid="button-members-subtab-messaging"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Send Messages
                </Button>
                <Button 
                  variant={activeMembersSubTab === "management" ? "default" : "outline"}
                  onClick={() => setActiveMembersSubTab("management")}
                  className={activeMembersSubTab === "management" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
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
              {/* Entrepreneurs */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">👨‍💼</span> Entrepreneurs (Approved)
                  <Badge className="bg-emerald-100 text-emerald-800">{members.length + approvedEntrepreneurs.length}</Badge>
                </h3>
                {members.length === 0 && approvedEntrepreneurs.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                      No entrepreneurs yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const combinedEntrepreneurs = [
                        ...members.map(m => ({ ...m, displayName: m.name, isApproved: false })),
                        ...approvedEntrepreneurs.map(a => ({ ...a, displayName: a.fullName, isApproved: true }))
                      ];
                      const searchLower = searchTerm.toLowerCase();
                      const filtered = combinedEntrepreneurs.filter(item => item.displayName?.toLowerCase().includes(searchLower));
                      const sorted = [...filtered].sort((a, b) => {
                        const nameA = (a.displayName || "").toString().toLowerCase();
                        const nameB = (b.displayName || "").toString().toLowerCase();
                        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                      });
                      return sorted.map((item, idx) => {
                        if (item.isApproved) {
                          const entrepreneur = item as any;
                          return (
                            <Card key={`approved-${entrepreneur.id}`} className="border-l-4 border-l-emerald-500">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="font-semibold text-slate-900 dark:text-white">{entrepreneur.fullName}</p>
                                      <Badge className="bg-emerald-600">Active</Badge>
                                      <Badge className="bg-cyan-100 text-cyan-800">{entrepreneur.ideaName}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{entrepreneur.email}</p>
                                    <p className="text-xs text-slate-500 mt-2">{entrepreneur.linkedin || "—"} • {entrepreneur.country || "—"}{entrepreneur.state ? `, ${entrepreneur.state}` : ""}</p>
                                    <p className="text-xs text-slate-500 mt-1">{entrepreneur.portfolio || "Unassigned"}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMember({
                                        id: entrepreneur.id,
                                        name: entrepreneur.fullName,
                                        email: entrepreneur.email,
                                        type: "entrepreneur" as const,
                                        status: "active" as const
                                      });
                                      setShowPortfolioModal(true);
                                    }}
                                    data-testid={`button-assign-portfolio-entrepreneur-${idx}`}
                                  >
                                    Assign to Portfolio
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } else {
                          const member = item as any;
                          return (
                            <Card key={member.id} className="border-l-4 border-l-emerald-500">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                      <Badge className={member.status === "active" ? "bg-emerald-600" : "bg-slate-500"}>
                                        {member.status === "active" ? "Active" : "Disabled"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setShowPortfolioModal(true);
                                    }}
                                    data-testid={`button-assign-portfolio-${member.id}`}
                                  >
                                    Assign to Portfolio
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Mentors */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-600">🎓</span> Mentors (Approved)
                  <Badge className="bg-amber-100 text-amber-800">{approvedMentors.length}</Badge>
                </h3>
                {approvedMentors.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                      No approved mentors yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filterAndSort(approvedMentors, "fullName").map((mentor, idx) => (
                      <Card key={idx} className="border-l-4 border-l-amber-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-slate-900 dark:text-white">{mentor.fullName}</p>
                                <Badge className="bg-amber-100 text-amber-800">Mentor</Badge>
                                <Badge className="bg-emerald-600">Approved</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{mentor.email}</p>
                              <p className="text-xs text-slate-500">Expertise: {mentor.expertise}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Coaches */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-cyan-600">💪</span> Coaches (Approved)
                  <Badge className="bg-cyan-100 text-cyan-800">{approvedCoaches.length}</Badge>
                </h3>
                {approvedCoaches.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                      No approved coaches yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filterAndSort(approvedCoaches, "fullName").map((coach, idx) => (
                      <Card key={idx} className="border-l-4 border-l-cyan-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-slate-900 dark:text-white">{coach.fullName}</p>
                                <Badge className="bg-cyan-100 text-cyan-800">Coach</Badge>
                                <Badge className="bg-emerald-600">Approved</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{coach.email}</p>
                              <p className="text-xs text-slate-500">Hourly Rate: ${coach.hourlyRate} • Expertise: {coach.expertise}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Investors */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-blue-600">💰</span> Investors (Approved)
                  <Badge className="bg-blue-100 text-blue-800">{approvedInvestors.length}</Badge>
                </h3>
                {approvedInvestors.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                      No approved investors yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filterAndSort(approvedInvestors, "fullName").map((investor, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-semibold text-slate-900 dark:text-white">{investor.fullName}</p>
                                <Badge className="bg-blue-100 text-blue-800">Investor</Badge>
                                <Badge className="bg-emerald-600">Approved</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{investor.email}</p>
                              <p className="text-xs text-slate-500">Fund: {investor.fundName} • Investment: {investor.investmentAmount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
              )}

              {/* Messaging Sub-tab */}
              {activeMembersSubTab === "messaging" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Send Messages to Members</h3>
                <div className="space-y-6">
                  {/* Entrepreneurs */}
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">👨‍💼 Entrepreneurs ({members.length + approvedEntrepreneurs.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(members, "name").map((member) => (
                        <Card key={member.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                              <Button onClick={() => {setSelectedMember(member); setShowMessageModal(true);}} data-testid={`button-message-member-${member.id}`} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filterAndSort(approvedEntrepreneurs, "fullName").map((entrepreneur, idx) => (
                        <Card key={`approved-msg-${entrepreneur.id}`}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{entrepreneur.fullName}</p>
                                <p className="text-sm text-muted-foreground">{entrepreneur.email}</p>
                              </div>
                              <Button onClick={() => {setSelectedMember({id: entrepreneur.id, name: entrepreneur.fullName, email: entrepreneur.email, type: "mentor", status: "active"}); setShowMessageModal(true);}} data-testid={`button-message-entrepreneur-${idx}`} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {/* Mentors */}
                  {approvedMentors.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">🎓 Mentors ({approvedMentors.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedMentors, "fullName").map((mentor, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{mentor.fullName}</p>
                                <p className="text-sm text-muted-foreground">{mentor.email}</p>
                              </div>
                              <Button onClick={() => {setSelectedMember({id: `mentor-${idx}`, name: mentor.fullName, email: mentor.email, type: "mentor", status: "active"}); setShowMessageModal(true);}} data-testid={`button-message-mentor-${idx}`} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  )}
                  {/* Coaches */}
                  {approvedCoaches.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💪 Coaches ({approvedCoaches.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedCoaches, "fullName").map((coach, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{coach.fullName}</p>
                                <p className="text-sm text-muted-foreground">{coach.email}</p>
                              </div>
                              <Button onClick={() => {setSelectedMember({id: `coach-${idx}`, name: coach.fullName, email: coach.email, type: "coach", status: "active"}); setShowMessageModal(true);}} data-testid={`button-message-coach-${idx}`} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  )}
                  {/* Investors */}
                  {approvedInvestors.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💰 Investors ({approvedInvestors.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedInvestors, "fullName").map((investor, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{investor.fullName}</p>
                                <p className="text-sm text-muted-foreground">{investor.email}</p>
                              </div>
                              <Button onClick={() => {setSelectedMember({id: `investor-${idx}`, name: investor.fullName, email: investor.email, type: "investor", status: "active"}); setShowMessageModal(true);}} data-testid={`button-message-investor-${idx}`} size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </div>
              )}

              {/* User Management Sub-tab */}
              {activeMembersSubTab === "management" && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Manage User Status</h3>
                <div className="space-y-6">
                  {/* Entrepreneurs */}
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">👨‍💼 Entrepreneurs ({members.length + approvedEntrepreneurs.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(members, "name").map((member) => (
                        <Card key={member.id} className={member.status === "disabled" ? "opacity-60" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant={member.status === "active" ? "destructive" : "default"} onClick={() => handleToggleMemberStatus(member.id)} data-testid={`button-toggle-user-${member.id}`} size="sm">
                                  {member.status === "active" ? "Disable" : "Enable"}
                                </Button>
                                <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-user-${member.id}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filterAndSort(approvedEntrepreneurs, "fullName").map((entrepreneur, idx) => {
                        const isDisabled = disabledProfessionals[`entrepreneur-${idx}`];
                        return (
                        <Card key={`approved-mgmt-${entrepreneur.id}`} className={isDisabled ? "opacity-60" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{entrepreneur.fullName}</p>
                                <p className="text-sm text-muted-foreground">{entrepreneur.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant={isDisabled ? "default" : "destructive"} onClick={() => handleToggleProfessionalStatus("mentor", idx)} data-testid={`button-toggle-entrepreneur-${idx}`} size="sm">{isDisabled ? "Enable" : "Disable"}</Button>
                                <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" data-testid={`button-delete-entrepreneur-${idx}`} size="sm"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  </div>
                  {/* Mentors */}
                  {approvedMentors.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">🎓 Mentors ({approvedMentors.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedMentors, "fullName").map((mentor, idx) => {
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
                      })}
                    </div>
                  </div>
                  )}
                  {/* Coaches */}
                  {approvedCoaches.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💪 Coaches ({approvedCoaches.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedCoaches, "fullName").map((coach, idx) => {
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
                      })}
                    </div>
                  </div>
                  )}
                  {/* Investors */}
                  {approvedInvestors.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-3">💰 Investors ({approvedInvestors.length})</h4>
                    <div className="space-y-3">
                      {filterAndSort(approvedInvestors, "fullName").map((investor, idx) => {
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
                      })}
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
              <CardTitle>Assign {selectedMember.name} to Portfolio</CardTitle>
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
                  <option value="mentor-1">Sarah Chen</option>
                  <option value="mentor-2">John Smith</option>
                  <option value="mentor-3">Emma Wilson</option>
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
                  <option value="1">Portfolio 1</option>
                  <option value="2">Portfolio 2</option>
                  <option value="3">Portfolio 3</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPortfolioModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleAssignPortfolio} data-testid="button-assign">Assign</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messaging Modal */}
      {showMessageModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle>Send Message to {selectedMember.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messageHistory.filter(m => m.toEmail === selectedMember.email).length > 0 && (
              <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Message History</h4>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {messageHistory.filter(m => m.toEmail === selectedMember.email).map(msg => (
                    <div key={msg.id} className="text-xs bg-white dark:bg-slate-700 p-2 rounded">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{msg.from} → {msg.to}</p>
                      <p className="text-slate-600 dark:text-slate-400">{msg.message}</p>
                      <p className="text-slate-500 text-xs">{new Date(msg.timestamp).toLocaleString()}</p>
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
