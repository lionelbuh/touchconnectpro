import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FileText, Users, MessageSquare, Settings, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">John Doe</div>
              <div className="text-xs text-muted-foreground">Entrepreneur</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <FileText className="mr-2 h-4 w-4" /> My Business Plan
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Users className="mr-2 h-4 w-4" /> Coaches
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-100">
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
             <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Plan: Explorer</div>
             <div className="text-xs text-indigo-600/80 mb-3">Upgrade for mentor access</div>
             <Link href="/become-entrepreneur">
               <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 h-7 text-xs">Upgrade</Button>
             </Link>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Project Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with <span className="font-semibold text-foreground">PetFeast AI</span>.</p>
          </div>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" /> Update Progress
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
          <Card className="border-l-4 border-l-cyan-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Idea Validation</div>
              <p className="text-xs text-muted-foreground mt-1">Next: Business Model Canvas</p>
            </CardContent>
          </Card>
          
          {/* Mentor Status */}
          <Card className="border-l-4 border-l-indigo-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coach Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Pending</div>
              <Link href="/mentors">
                <Button variant="link" className="p-0 h-auto text-xs text-indigo-600 mt-1">Find a Coach &rarr;</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2/10</div>
              <Progress value={20} className="h-2 mt-2 bg-emerald-100 [&>div]:bg-emerald-500" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-8 py-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-cyan-500 border-4 border-white dark:border-slate-900 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Idea Submitted</h3>
                    <p className="text-sm text-muted-foreground">Nov 24, 2025</p>
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 text-sm">
                      "A platform that democratizes startup success..."
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-white border-4 border-cyan-500 dark:bg-slate-900"></div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Business Plan Generation</h3>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <Button size="sm" className="mt-3" variant="outline">Continue Draft</Button>
                  </div>

                  <div className="relative opacity-50">
                     <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-slate-200 border-4 border-white dark:border-slate-900 dark:bg-slate-700"></div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Mentor Review</h3>
                    <p className="text-sm text-muted-foreground">Locked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Mentor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-white shadow-md">
                      <AvatarImage src="https://i.pravatar.cc/150?u=sarah" />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">Sarah Miller</h3>
                    <p className="text-sm text-muted-foreground mb-4">Lead Mentor & Strategist</p>
                    <div className="flex gap-2 w-full">
                      <Button size="sm" className="flex-1" variant="outline">Message</Button>
                      <Button size="sm" className="flex-1">Schedule</Button>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Coaches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                    <Avatar>
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                      <AvatarFallback>C{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">David Chen</div>
                      <div className="text-xs text-muted-foreground">Product Coach</div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600"><ArrowRight className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Link href="/mentors">
                  <Button variant="outline" className="w-full text-xs">View All Coaches</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
