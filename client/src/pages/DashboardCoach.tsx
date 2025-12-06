import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, BookOpen, DollarSign, Users, Settings, Star, Save, Loader2, Link as LinkIcon, Target, LogOut, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { useLocation } from "wouter";

const EXPERTISE_OPTIONS = [
  "Business Planning",
  "Pitch Preparation",
  "Market Research",
  "Product Development",
  "Marketing Strategy",
  "Sales & Go-to-Market",
  "Fundraising & Investor Relations",
  "Financial Planning",
  "Operations & Scaling",
  "Tech & Engineering",
  "Legal & Compliance",
  "HR & Team Building",
  "Customer Discovery",
  "Brand Strategy",
  "Digital Marketing",
  "Content Marketing",
  "Social Media Strategy",
  "Customer Support",
  "Growth Hacking",
  "Data Analysis"
];

interface CoachProfile {
  id: string;
  full_name: string;
  email: string;
  linkedin: string | null;
  expertise: string;
  focus_areas: string;
  hourly_rate: string;
  country: string;
  state: string | null;
}

export default function DashboardCoach() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expertise, setExpertise] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
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

        const response = await fetch(`${API_BASE_URL}/api/coaches/profile/${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Parse comma-separated expertise string into array
          setExpertise(data.expertise ? data.expertise.split(", ").map((e: string) => e.trim()).filter((e: string) => e) : []);
          setFocusAreas(data.focus_areas || "");
          setHourlyRate(data.hourly_rate || "");
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

  const handleExpertiseChange = (selectedOptions: HTMLCollection) => {
    const selected = Array.from(selectedOptions).map((option: any) => option.value);
    setExpertise(selected as string[]);
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    if (expertise.length === 0) {
      toast.error("Please select at least one area of expertise");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coaches/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertise: expertise.join(", "),
          focusAreas,
          hourlyRate,
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
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
              <AvatarFallback className="text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "CO"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">{profile?.full_name || "Coach"}</div>
              <div className="text-xs text-muted-foreground">${hourlyRate || "0"}/hour</div>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
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
                Welcome, {profile?.full_name?.split(" ")[0] || "Coach"}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your coaching profile and start helping entrepreneurs.
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-save-profile"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-cyan-600" />
                  Your Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">What do you specialize in?</p>
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map(item => (
                      <Badge key={item} variant="secondary" className="bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 flex items-center gap-2 pr-1">
                        {item}
                        <button
                          onClick={() => removeExpertise(item)}
                          className="hover:text-cyan-700 dark:hover:text-cyan-300"
                          data-testid={`button-remove-expertise-${item}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <select 
                  multiple
                  value={expertise}
                  onChange={(e) => handleExpertiseChange(e.target.selectedOptions)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="select-coach-expertise"
                  style={{ minHeight: "120px" }}
                >
                  {EXPERTISE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hold Ctrl/Cmd to select multiple options</p>
              </CardContent>
            </Card>

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
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="100"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-coach-price"
                  />
                  <span className="text-slate-600 dark:text-slate-400 flex items-center">/hour</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-cyan-600" />
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-linkedin"
                />
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900/30 bg-cyan-50 dark:bg-cyan-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-cyan-600" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">Topics you help entrepreneurs with</p>
                <textarea 
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  placeholder="e.g., Business planning, pitch preparation, market research..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-focus-areas"
                />
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
