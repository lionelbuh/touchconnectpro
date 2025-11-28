import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, FileText, Users, MessageSquare, Settings, TrendingUp, Lightbulb, Target } from "lucide-react";

export default function DashboardEntrepreneur() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Entrepreneur</div>
              <div className="text-xs text-muted-foreground">New Account</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Lightbulb className="mr-2 h-4 w-4" /> My Idea
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Target className="mr-2 h-4 w-4" /> Business Plan
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Users className="mr-2 h-4 w-4" /> Find a Mentor
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
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome, Entrepreneur!</h1>
              <p className="text-muted-foreground mt-2">Let's turn your idea into a fundable venture. Answer a few questions to get started.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Idea Title Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-cyan-600" />
                  What's Your Idea?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Give your startup a name and brief description</p>
                <input 
                  type="text" 
                  placeholder="e.g., AI-powered fitness coach"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-idea-title"
                />
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Problem/Solution Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-600" />
                  Problem & Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What problem does your idea solve?</p>
                <textarea 
                  placeholder="Describe the problem and your solution..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-problem-solution"
                />
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Target Market Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg">Who's Your Target Market?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Describe your ideal customer</p>
                <input 
                  type="text" 
                  placeholder="e.g., Health-conscious professionals aged 25-40"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-target-market"
                />
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Continue</Button>
              </CardContent>
            </Card>

            {/* Revenue Model Card */}
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg">How Will You Make Money?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What's your business model?</p>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20" data-testid="select-revenue-model">
                  <option>Select revenue model...</option>
                  <option>Subscription</option>
                  <option>One-time purchase</option>
                  <option>Commission/Marketplace</option>
                  <option>Freemium</option>
                  <option>Other</option>
                </select>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Continue</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Next Steps</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">After you complete these questions, our AI will help you refine your business plan. Then you can connect with a mentor!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
