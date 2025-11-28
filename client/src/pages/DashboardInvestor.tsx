import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Zap, Briefcase, TrendingUp, Settings, DollarSign, Target } from "lucide-react";

export default function DashboardInvestor() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-amber-500">
              <AvatarFallback className="text-white">IN</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Angel Investor</div>
              <div className="text-xs text-muted-foreground">New Account</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <TrendingUp className="mr-2 h-4 w-4" /> My Investments
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Briefcase className="mr-2 h-4 w-4" /> Portfolio
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Zap className="mr-2 h-4 w-4" /> Deal Flow
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
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome, Angel Investor!</h1>
            <p className="text-muted-foreground mt-2">Access pre-vetted startups and investment opportunities. Let's get you started!</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investment Type Card */}
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Investment Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Which investment type interests you?</p>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20" data-testid="select-investment-type">
                  <option>Select investment type...</option>
                  <option>Platform Investment (TouchConnectPro)</option>
                  <option>Direct Startup Investment</option>
                  <option>Both</option>
                </select>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">Next</Button>
              </CardContent>
            </Card>

            {/* Investment Amount Card */}
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Investment Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What's your typical check size?</p>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20" data-testid="select-check-size">
                  <option>Select check size...</option>
                  <option>$10K - $50K</option>
                  <option>$50K - $250K</option>
                  <option>$250K - $1M</option>
                  <option>$1M+</option>
                </select>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Focus Areas Card */}
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Industries & Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What industries or sectors do you focus on?</p>
                <textarea 
                  placeholder="e.g., SaaS, AI/ML, healthtech, fintech, climate tech..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                  data-testid="input-investor-focus"
                />
                <Button className="w-full bg-amber-600 hover:bg-amber-700">Complete Setup</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Investment Opportunities</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">Get access to pre-vetted startups that have been through our AI refinement and mentor evaluation process. Connect directly with founders ready for investment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
