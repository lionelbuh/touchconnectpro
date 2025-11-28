import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Heart, Users, MessageSquare, Settings, Briefcase, Award } from "lucide-react";

export default function DashboardMentor() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-indigo-500">
              <AvatarFallback className="text-white">ME</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Mentor</div>
              <div className="text-xs text-muted-foreground">New Account</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Users className="mr-2 h-4 w-4" /> My Entrepreneurs
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Heart className="mr-2 h-4 w-4" /> My Impact
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome, Mentor!</h1>
            <p className="text-muted-foreground mt-2">Join our network of experienced mentors. Let's help shape the next generation of entrepreneurs!</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background Card */}
            <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Your Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What's your professional background?</p>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500/20" data-testid="select-mentor-background">
                  <option>Select your background...</option>
                  <option>Startup Founder</option>
                  <option>Corporate Executive</option>
                  <option>Venture Capitalist</option>
                  <option>Industry Expert</option>
                  <option>Other</option>
                </select>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Next</Button>
              </CardContent>
            </Card>

            {/* Commitment Card */}
            <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  Your Commitment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">1 hour/month + 30 min per new member</p>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 rounded p-3">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Commitment Summary</p>
                  <ul className="text-xs text-indigo-800 dark:text-indigo-200 mt-2 space-y-1">
                    <li>• Group: 10 entrepreneurs max</li>
                    <li>• 1 hour monthly group session</li>
                    <li>• 30 min per new member</li>
                  </ul>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Expertise Card */}
            <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Your Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What areas can you mentor in?</p>
                <textarea 
                  placeholder="e.g., Product strategy, fundraising, market validation, team building..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                  data-testid="input-mentor-expertise"
                />
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Complete Setup</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 rounded-lg">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Mentor Network</h3>
            <p className="text-sm text-indigo-800 dark:text-indigo-200">You'll be matched with a group of 10 pre-vetted entrepreneurs. Help them avoid pitfalls, accelerate growth, and connect with resources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
