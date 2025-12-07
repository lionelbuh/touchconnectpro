import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, MessageSquare, Calendar, Settings, ChevronRight, Plus, LogOut, Briefcase, AlertCircle, Save, Loader2, ExternalLink } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";

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
}

export default function DashboardMentor() {
  const [mentorStatus, setMentorStatus] = useState<"notApplied" | "pending" | "approved">("approved");
  const [activeTab, setActiveTab] = useState<"overview" | "investors" | "portfolio" | "messages" | "meetings" | "profile">("overview");
  const [approvedInvestors, setApprovedInvestors] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      photoUrl?: string;
    }>;
    lastMeeting: string;
  }>>([]);

  const [messages, setMessages] = useState([
    { id: 1, from: "Alex Johnson", text: "Thanks for the feedback on our pitch deck!", timestamp: "Today 2:30 PM" },
    { id: 2, from: "Maria Garcia", text: "Can we schedule a call next week?", timestamp: "Yesterday 10:15 AM" },
    { id: 3, from: "James Wilson", text: "Your advice on GTM was really helpful", timestamp: "2 days ago" }
  ]);

  const [meetings, setMeetings] = useState([
    { id: 1, portfolio: 1, date: "2024-12-01", time: "10:00 AM", attendees: 9, topic: "Q4 Planning & Strategy" },
    { id: 2, portfolio: 1, date: "2024-11-24", time: "2:00 PM", attendees: 9, topic: "Product Roadmap Review" }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [newMeeting, setNewMeeting] = useState({ date: "", time: "", topic: "" });
  const [adminMessage, setAdminMessage] = useState("");
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [mentorReadMessageIds, setMentorReadMessageIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/mentors/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data: MentorProfileData = await response.json();
          setProfileId(data.id);
          setMentorProfile({
            fullName: data.full_name || "",
            email: data.email || "",
            linkedin: data.linkedin || "",
            bio: data.bio || "",
            expertise: data.expertise || "",
            yearsExperience: data.experience || "",
            profileImage: null,
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
  }, []);

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

  // Mark admin messages as read when viewing messages tab
  useEffect(() => {
    if (activeTab === "messages" && mentorProfile.email) {
      const adminMessagesToMark = adminMessages
        .filter((m: any) => m.to_email === mentorProfile.email && m.from_email === "admin@touchconnectpro.com" && !mentorReadMessageIds.includes(m.id))
        .map((m: any) => m.id);
      
      if (adminMessagesToMark.length > 0) {
        const updatedReadIds = [...mentorReadMessageIds, ...adminMessagesToMark];
        setMentorReadMessageIds(updatedReadIds);
        localStorage.setItem("tcp_mentorReadMessageIds", JSON.stringify(updatedReadIds));
      }
    }
  }, [activeTab, adminMessages, mentorProfile.email, mentorReadMessageIds]);

  // Calculate unread message count
  const unreadMessageCount = adminMessages.filter(
    (m: any) => m.to_email === mentorProfile.email && m.from_email === "admin@touchconnectpro.com" && !mentorReadMessageIds.includes(m.id)
  ).length;

  // Fetch assigned entrepreneurs when profileId changes
  useEffect(() => {
    async function fetchAssignedEntrepreneurs() {
      if (!profileId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/mentor-assignments/mentor/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          
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
            members: members.map((m: any) => ({
              id: m.entrepreneur?.id || "",
              name: m.entrepreneur?.full_name || "Unknown",
              email: m.entrepreneur?.email || "",
              linkedin: m.entrepreneur?.linkedin,
              businessIdea: m.entrepreneur?.business_idea,
              photoUrl: m.entrepreneur?.photo_url
            })),
            lastMeeting: ""
          }));
          
          setPortfolios(portfoliosArray.length > 0 ? portfoliosArray : []);
        }
      } catch (error) {
        console.error("Error fetching assigned entrepreneurs:", error);
      }
    }
    
    fetchAssignedEntrepreneurs();
  }, [profileId]);

  const handleSaveProfile = async () => {
    if (!profileId) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentors/profile/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: mentorProfile.bio,
          expertise: mentorProfile.expertise,
          experience: mentorProfile.yearsExperience,
          linkedin: mentorProfile.linkedin
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
            <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
              <AvatarFallback className="text-white">SC</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{mentorProfile.fullName}</div>
              <div className="text-xs text-muted-foreground">Mentor</div>
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
              variant={activeTab === "meetings" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("meetings")}
              data-testid="button-meetings-tab"
            >
              <Calendar className="mr-2 h-4 w-4" /> Meetings
            </Button>
            <Button 
              variant={activeTab === "profile" ? "secondary" : "ghost"}
              className="w-full justify-start font-medium text-slate-600"
              onClick={() => setActiveTab("profile")}
              data-testid="button-profile-tab"
            >
              <Settings className="mr-2 h-4 w-4" /> Profile
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
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Mentor Dashboard</h1>
              <p className="text-muted-foreground mb-8">Welcome back, {mentorProfile.fullName}! Manage your portfolios and mentees here.</p>

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

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{messages.length}</div>
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
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("meetings")}>
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Meeting
                  </Button>
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
                {portfolios.length < 20 && (
                  <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleAddPortfolio} data-testid="button-add-portfolio">
                    <Plus className="mr-2 h-4 w-4" /> Add Portfolio
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolios.map((portfolio, idx) => (
                  <Card key={portfolio.id} className="cursor-pointer hover:shadow-lg transition-shadow border-cyan-200 dark:border-cyan-900/30">
                    <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle>{portfolio.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-3">Members: {portfolio.memberCount}/10</p>
                        {portfolio.members.length > 0 ? (
                          <div className="space-y-3">
                            {portfolio.members.map((member) => (
                              <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <Avatar className="h-12 w-12 border border-cyan-200">
                                  {member.photoUrl ? (
                                    <AvatarImage src={member.photoUrl} alt={member.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-cyan-500 text-white">
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{member.name}</h4>
                                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                  {member.linkedin && (
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 text-xs flex items-center gap-1 mt-1">
                                      <ExternalLink className="h-3 w-3" /> LinkedIn
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No members added yet</p>
                        )}
                      </div>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
                      {adminMessages.map((msg: any) => (
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
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-2">{meeting.topic}</p>
                          <p className="text-sm text-muted-foreground mb-1">Portfolio {meeting.portfolio}</p>
                          <p className="text-sm text-muted-foreground">{meeting.date} at {meeting.time} • {meeting.attendees} attendees</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Mentor Profile</h1>
                  <p className="text-muted-foreground">Your professional profile visible to mentees and admins</p>
                </div>
                <Button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  variant={isEditingProfile ? "destructive" : "default"}
                  className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}
                  data-testid="button-edit-profile"
                >
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {isEditingProfile ? (
                <Card className="border-cyan-200 dark:border-cyan-900/30 max-w-2xl">
                  <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                    <CardTitle>Edit Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
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
                      <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Email Address *</label>
                      <Input
                        type="email"
                        value={mentorProfile.email}
                        onChange={(e) => setMentorProfile({ ...mentorProfile, email: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50"
                        data-testid="input-mentor-email"
                      />
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

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-md">
            <CardHeader>
              <CardTitle>Schedule Monthly Meeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Date</label>
                <Input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800/50"
                  data-testid="input-meeting-date"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Time</label>
                <Input
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800/50"
                  data-testid="input-meeting-time"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Monthly Check-in"
                  value={newMeeting.topic}
                  onChange={(e) => setNewMeeting({ ...newMeeting, topic: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800/50"
                  data-testid="input-meeting-topic"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={handleScheduleMeeting} data-testid="button-schedule">Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
