import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, Zap, Briefcase, TrendingUp, Settings, DollarSign, Target, Save, Loader2, Building2, Link as LinkIcon, LogOut } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardFooter } from "@/components/DashboardFooter";

interface InvestorProfile {
  id: string;
  full_name: string;
  email: string;
  linkedin: string | null;
  fund_name: string;
  investment_focus: string;
  investment_preference: string;
  investment_amount: string;
  country: string;
  state: string | null;
}

export default function DashboardInvestor() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [fundName, setFundName] = useState("");
  const [investmentFocus, setInvestmentFocus] = useState("");
  const [investmentPreference, setInvestmentPreference] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const handleLogout = async () => {
    try {
      const supabase = await getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = await getSupabase();
        if (!supabase) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setLoading(false);
          return;
        }

        setUserEmail(user.email);

        const response = await fetch(`${API_BASE_URL}/api/investors/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setFundName(data.fund_name || "");
          setInvestmentFocus(data.investment_focus || "");
          setInvestmentPreference(data.investment_preference || "");
          setInvestmentAmount(data.investment_amount || "");
          setLinkedin(data.linkedin || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/investors/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundName,
          investmentFocus,
          investmentPreference,
          investmentAmount,
          linkedin
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader userName={profile?.full_name || "Investor"} />
      <div className="flex flex-1 bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-amber-500">
              <AvatarFallback className="text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "IN"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{profile?.full_name || "Investor"}</div>
              <div className="text-xs text-muted-foreground">{fundName || "Investment Fund"}</div>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                Welcome, {profile?.full_name?.split(" ")[0] || "Investor"}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your investment profile and access pre-vetted startups.
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-save-profile"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  Fund / Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your investment fund or organization name</p>
                <input
                  type="text"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  placeholder="Enter fund name..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                  data-testid="input-fund-name"
                />
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Investment Preference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What type of investments interest you?</p>
                <select 
                  value={investmentPreference}
                  onChange={(e) => setInvestmentPreference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20" 
                  data-testid="select-investment-preference"
                >
                  <option value="">Select investment type...</option>
                  <option value="platform">TouchConnectPro as a whole</option>
                  <option value="projects">Individual Projects</option>
                  <option value="both">Both</option>
                </select>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Investment Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What's your typical check size?</p>
                <select 
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20" 
                  data-testid="select-investment-amount"
                >
                  <option value="">Select investment amount...</option>
                  <option value="5000-10000">$5,000 - $10,000</option>
                  <option value="20000-50000">$20,000 - $50,000</option>
                  <option value="50000-100000">$50,000 - $100,000</option>
                  <option value="100000-500000">$100,000 - $500,000</option>
                  <option value="500000-1000000">$500,000 - $1,000,000</option>
                  <option value="1000000plus">$1,000,000+</option>
                </select>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-amber-600" />
                  LinkedIn Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your LinkedIn profile URL</p>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                  data-testid="input-linkedin"
                />
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Investment Focus & Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What industries or sectors do you focus on?</p>
                <textarea 
                  value={investmentFocus}
                  onChange={(e) => setInvestmentFocus(e.target.value)}
                  placeholder="e.g., SaaS, AI/ML, healthtech, fintech, climate tech..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-amber-500/20"
                  data-testid="input-investment-focus"
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Investment Opportunities</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">Get access to pre-vetted startups that have been through our AI refinement and mentor evaluation process. Connect directly with founders ready for investment.</p>
          </div>
        </div>
      </main>
      <DashboardFooter />
      </div>
    </div>
  );
}
