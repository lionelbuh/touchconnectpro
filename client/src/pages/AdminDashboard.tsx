import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, Users, Settings, Trash2, Power, Mail, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MentorApplication {
  fullName: string;
  email: string;
  linkedin: string;
  bio: string;
  expertise: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: "entrepreneur" | "mentor" | "coach" | "investor";
  status: "active" | "disabled";
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"approvals" | "members" | "messaging" | "users">("approvals");
  const [mentorApplications, setMentorApplications] = useState<MentorApplication[]>([]);
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

  useEffect(() => {
    const savedApplications = localStorage.getItem("tcp_mentorApplications");
    if (savedApplications) {
      setMentorApplications(JSON.parse(savedApplications));
    }
  }, []);

  const handleApproveMentor = (index: number) => {
    const updated = [...mentorApplications];
    updated[index].status = "approved";
    setMentorApplications(updated);
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
    localStorage.setItem("tcp_mentorApplications", JSON.stringify(updated));
  };

  const handleToggleMemberStatus = (id: string) => {
    const updated = members.map(m => 
      m.id === id ? { ...m, status: m.status === "active" ? "disabled" : "active" } : m
    );
    setMembers(updated);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedMember) {
      console.log(`Message sent to ${selectedMember.name}: ${messageText}`);
      setMessageText("");
      setShowMessageModal(false);
      setSelectedMember(null);
    }
  };

  const handleAssignPortfolio = () => {
    if (portfolioAssignment && selectedMember) {
      console.log(`Assigned ${selectedMember.name} to portfolio ${portfolioAssignment}`);
      setPortfolioAssignment("");
      setShowPortfolioModal(false);
      setSelectedMember(null);
    }
  };

  const pendingApplications = mentorApplications.filter(app => app.status === "pending");

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
          <Button 
            variant={activeTab === "messaging" ? "default" : "outline"}
            onClick={() => setActiveTab("messaging")}
            className={activeTab === "messaging" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
            data-testid="button-messaging-tab"
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Messaging
          </Button>
          <Button 
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "bg-cyan-600 hover:bg-cyan-700" : ""}
            data-testid="button-users-tab"
          >
            <Power className="mr-2 h-4 w-4" /> User Management
          </Button>
        </div>

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Mentor Approvals</h2>
              {pendingApplications.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">No pending approvals</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingApplications.map((app, idx) => {
                    const actualIdx = mentorApplications.findIndex(a => a === app);
                    return (
                      <Card key={actualIdx} className="border-l-4 border-l-amber-500">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{app.fullName}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                            </div>
                            <Badge className="bg-amber-600">Pending</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Expertise</p>
                              <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Experience</p>
                              <p className="text-slate-900 dark:text-white">{app.experience}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Bio</p>
                            <p className="text-slate-900 dark:text-white text-sm">{app.bio}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveMentor(actualIdx)}
                              data-testid={`button-admin-approve-${actualIdx}`}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              onClick={() => handleRejectMentor(actualIdx)}
                              data-testid={`button-admin-reject-${actualIdx}`}
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
          </div>
        )}

        {/* Members & Portfolios Tab */}
        {activeTab === "members" && (
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Members & Portfolio Assignment</h2>
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id} className="border-l-4 border-l-cyan-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                          <Badge variant="secondary">{member.type}</Badge>
                          <Badge className={member.status === "active" ? "bg-emerald-600" : "bg-slate-500"}>
                            {member.status === "active" ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {member.type === "entrepreneur" && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Messaging Tab */}
        {activeTab === "messaging" && (
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Send Messages</h2>
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email} • {member.type}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMessageModal(true);
                        }}
                        data-testid={`button-message-member-${member.id}`}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">User Management</h2>
            <div className="space-y-4">
              {members.map((member) => (
                <Card key={member.id} className={member.status === "disabled" ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email} • {member.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={member.status === "active" ? "destructive" : "default"}
                          onClick={() => handleToggleMemberStatus(member.id)}
                          data-testid={`button-toggle-user-${member.id}`}
                        >
                          {member.status === "active" ? (
                            <>
                              <Power className="mr-2 h-4 w-4" /> Disable
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" /> Enable
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          data-testid={`button-delete-user-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Message to {selectedMember.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
