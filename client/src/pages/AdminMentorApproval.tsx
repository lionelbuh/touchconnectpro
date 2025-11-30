import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, ExternalLink } from "lucide-react";

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

export default function AdminMentorApproval() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);

  useEffect(() => {
    const savedApplications = localStorage.getItem("tcp_mentorApplications");
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    }
  }, []);

  const handleApprove = (index: number) => {
    const updated = [...applications];
    updated[index].status = "approved";
    setApplications(updated);
    localStorage.setItem("tcp_mentorApplications", JSON.stringify(updated));

    // Also save to mentor profile so they can access dashboard
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

  const handleReject = (index: number) => {
    const updated = [...applications];
    updated[index].status = "rejected";
    setApplications(updated);
    localStorage.setItem("tcp_mentorApplications", JSON.stringify(updated));
  };

  const pendingApplications = applications.filter(app => app.status === "pending");
  const approvedApplications = applications.filter(app => app.status === "approved");
  const rejectedApplications = applications.filter(app => app.status === "rejected");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Admin: Mentor Applications</h1>
          <p className="text-muted-foreground">Review and approve mentor applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{pendingApplications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{approvedApplications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{rejectedApplications.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Pending Applications</h2>
            <div className="space-y-4">
              {pendingApplications.map((app, idx) => {
                const actualIndex = applications.findIndex(a => a === app);
                return (
                  <Card key={actualIndex} className="border-l-4 border-l-cyan-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{app.fullName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">LinkedIn</p>
                        <a href={`https://${app.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                          {app.linkedin} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Professional Bio</p>
                        <p className="text-slate-900 dark:text-white">{app.bio}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Expertise</p>
                          <p className="text-slate-900 dark:text-white">{app.expertise}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Experience</p>
                          <p className="text-slate-900 dark:text-white">{app.experience}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(app.submittedAt).toLocaleDateString()}</p>
                      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(actualIndex)}
                          data-testid={`button-approve-mentor-${actualIndex}`}
                        >
                          <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleReject(actualIndex)}
                          data-testid={`button-reject-mentor-${actualIndex}`}
                        >
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Approved Applications */}
        {approvedApplications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Approved Mentors</h2>
            <div className="space-y-4">
              {approvedApplications.map((app, idx) => {
                const actualIndex = applications.findIndex(a => a === app);
                return (
                  <Card key={actualIndex} className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">{app.fullName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                        </div>
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Approved</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Approved on: {new Date(app.submittedAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected Applications */}
        {rejectedApplications.length > 0 && (
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">Rejected Applications</h2>
            <div className="space-y-4">
              {rejectedApplications.map((app, idx) => {
                const actualIndex = applications.findIndex(a => a === app);
                return (
                  <Card key={actualIndex} className="border-l-4 border-l-red-500 opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-red-700 dark:text-red-300">{app.fullName}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">{app.email}</p>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Rejected on: {new Date(app.submittedAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">No mentor applications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
