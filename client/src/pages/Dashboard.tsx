import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LayoutDashboard, FileText, Users, MessageSquare, Settings, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]" style={{ backgroundColor: "#FAF9F7" }}>
      <aside className="w-64 border-r hidden md:flex flex-col" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8" }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10" style={{ borderColor: "#E8E8E8" }}>
              <AvatarFallback style={{ backgroundColor: "#0D566C", color: "#FFFFFF" }}>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm" style={{ color: "#0D566C" }}>John Doe</div>
              <div className="text-xs" style={{ color: "#8A8A8A" }}>Entrepreneur</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start font-semibold rounded-xl" style={{ backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" }}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium rounded-xl" style={{ color: "#4A4A4A" }}>
              <FileText className="mr-2 h-4 w-4" /> My Business Plan
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium rounded-xl" style={{ color: "#4A4A4A" }}>
              <Users className="mr-2 h-4 w-4" /> Coaches
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium rounded-xl" style={{ color: "#4A4A4A" }}>
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium rounded-xl" style={{ color: "#4A4A4A" }}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>
        </div>
        <div className="mt-auto p-6" style={{ borderTop: "1px solid #E8E8E8" }}>
           <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(75,63,114,0.08)", border: "1px solid rgba(75,63,114,0.15)" }}>
             <div className="text-xs font-semibold mb-1" style={{ color: "#4B3F72" }}>Plan: Explorer</div>
             <div className="text-xs mb-3" style={{ color: "#8A8A8A" }}>Upgrade for mentor access</div>
             <Link href="/become-entrepreneur">
               <Button size="sm" className="w-full h-7 text-xs rounded-full font-semibold" style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}>Upgrade</Button>
             </Link>
           </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold" style={{ color: "#0D566C" }}>Project Dashboard</h1>
            <p style={{ color: "#8A8A8A" }}>Welcome back! Here's what's happening with <span className="font-semibold" style={{ color: "#0D566C" }}>PetFeast AI</span>.</p>
          </div>
          <Button className="rounded-xl font-semibold" style={{ backgroundColor: "#0D566C", color: "#FFFFFF", border: "none" }}>
            <TrendingUp className="mr-2 h-4 w-4" /> Update Progress
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 rounded-2xl" style={{ borderLeftColor: "#0D566C", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderTop: "1px solid #E8E8E8", borderRight: "1px solid #E8E8E8", borderBottom: "1px solid #E8E8E8" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Current Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#0D566C" }}>Idea Validation</div>
              <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>Next: Business Model Canvas</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 rounded-2xl" style={{ borderLeftColor: "#4B3F72", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderTop: "1px solid #E8E8E8", borderRight: "1px solid #E8E8E8", borderBottom: "1px solid #E8E8E8" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Coach Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#4B3F72" }}>Pending</div>
              <Link href="/mentors">
                <Button variant="link" className="p-0 h-auto text-xs mt-1" style={{ color: "#FF6B5C" }}>Find a Coach &rarr;</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-4 rounded-2xl" style={{ borderLeftColor: "#F5C542", backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderTop: "1px solid #E8E8E8", borderRight: "1px solid #E8E8E8", borderBottom: "1px solid #E8E8E8" }}>
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: "#8A8A8A" }}>Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: "#0D566C" }}>2/10</div>
              <Progress value={20} className="h-2 mt-2" style={{ backgroundColor: "rgba(245,197,66,0.2)" }} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderColor: "#E8E8E8" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D566C" }}>Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-8 py-2" style={{ borderLeft: "2px solid #E8E8E8" }}>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0D566C", border: "4px solid #FFFFFF" }}>
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold" style={{ color: "#0D566C" }}>Idea Submitted</h3>
                    <p className="text-sm" style={{ color: "#8A8A8A" }}>Nov 24, 2025</p>
                    <div className="mt-2 p-3 rounded-xl text-sm" style={{ backgroundColor: "#F3F3F3", border: "1px solid #E8E8E8", color: "#4A4A4A" }}>
                      "A platform that democratizes startup success..."
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full" style={{ backgroundColor: "#FFFFFF", border: "4px solid #FF6B5C" }}></div>
                    <h3 className="font-semibold" style={{ color: "#0D566C" }}>Business Plan Generation</h3>
                    <p className="text-sm" style={{ color: "#8A8A8A" }}>In Progress</p>
                    <Button size="sm" className="mt-3 rounded-xl" variant="outline" style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}>Continue Draft</Button>
                  </div>

                  <div className="relative opacity-50">
                     <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full" style={{ backgroundColor: "#E8E8E8", border: "4px solid #FFFFFF" }}></div>
                    <h3 className="font-semibold" style={{ color: "#0D566C" }}>Mentor Review</h3>
                    <p className="text-sm" style={{ color: "#8A8A8A" }}>Locked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderColor: "#E8E8E8" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D566C" }}>Your Mentor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex flex-col items-center text-center p-4 rounded-xl" style={{ backgroundColor: "#F3F3F3", border: "1px solid #E8E8E8" }}>
                    <Avatar className="h-24 w-24 mb-4 border-4 shadow-md" style={{ borderColor: "#FFFFFF" }}>
                      <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
                      <AvatarFallback style={{ backgroundColor: "#4B3F72", color: "#FFFFFF" }}>SM</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg" style={{ color: "#0D566C" }}>Sarah Miller</h3>
                    <p className="text-sm mb-4" style={{ color: "#8A8A8A" }}>Lead Mentor & Strategist</p>
                    <div className="flex gap-2 w-full">
                      <Button size="sm" className="flex-1 rounded-xl" variant="outline" style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}>Message</Button>
                      <Button size="sm" className="flex-1 rounded-xl" style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}>Schedule</Button>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 2px 12px rgba(224,224,224,0.6)", borderColor: "#E8E8E8" }}>
              <CardHeader>
                <CardTitle style={{ color: "#0D566C" }}>Recommended Coaches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer" style={{ border: "1px solid transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F3F3"; e.currentTarget.style.borderColor = "#E8E8E8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                  >
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                      <AvatarFallback style={{ backgroundColor: "#F5C542", color: "#FFFFFF" }}>C{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: "#0D566C" }}>David Chen</div>
                      <div className="text-xs" style={{ color: "#8A8A8A" }}>Product Coach</div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8"><ArrowRight className="h-4 w-4" style={{ color: "#FF6B5C" }} /></Button>
                  </div>
                ))}
                <Link href="/mentors">
                  <Button variant="outline" className="w-full text-xs rounded-xl" style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}>View All Coaches</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
