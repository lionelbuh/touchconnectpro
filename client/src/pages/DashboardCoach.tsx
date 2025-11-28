import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, BookOpen, DollarSign, Users, Settings, Star, TrendingUp } from "lucide-react";

export default function DashboardCoach() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
              <AvatarFallback className="text-white">CO</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Coach</div>
              <div className="text-xs text-muted-foreground">New Account</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <BookOpen className="mr-2 h-4 w-4" /> My Courses
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <DollarSign className="mr-2 h-4 w-4" /> Earnings
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Users className="mr-2 h-4 w-4" /> Students
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
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome, Coach!</h1>
            <p className="text-muted-foreground mt-2">Set up your coaching profile and start helping entrepreneurs. Let's get started!</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expertise Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-cyan-600" />
                  Your Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What do you specialize in?</p>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20" data-testid="select-coach-expertise">
                  <option>Select your expertise...</option>
                  <option>Product Development</option>
                  <option>Marketing & Growth</option>
                  <option>Finance & Fundraising</option>
                  <option>Operations & Management</option>
                  <option>Sales Strategy</option>
                  <option>Other</option>
                </select>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Next</Button>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan-600" />
                  Set Your Price
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">You keep 80%, we keep 20%</p>
                <div className="flex gap-2">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center">$</span>
                  <input 
                    type="number" 
                    placeholder="100"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-coach-price"
                  />
                  <span className="text-slate-600 dark:text-slate-400 flex items-center">/hour</span>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Bio Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Your Bio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Tell entrepreneurs why they should learn from you</p>
                <textarea 
                  placeholder="Share your background, achievements, and teaching style..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-coach-bio"
                />
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Complete Setup</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30 rounded-lg">
            <h3 className="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Revenue Share Model</h3>
            <p className="text-sm text-cyan-800 dark:text-cyan-200">You set your hourly rate. We handle payments and take 20%. You keep 80% of every session.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
