import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SetPassword() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Get user info from localStorage or session
  useEffect(() => {
    const stored = localStorage.getItem("tcp_setPasswordPending");
    if (stored) {
      const { email, userType } = JSON.parse(stored);
      setEmail(email);
      setUserType(userType);
    }
  }, []);

  const handleSetPassword = () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Store password based on user type
    if (userType === "coach") {
      const coaches = JSON.parse(localStorage.getItem("tcp_coachApplications") || "[]");
      const coach = coaches.find((c: any) => c.email === email);
      if (coach) {
        coach.password = password;
        coach.hasPassword = true;
        localStorage.setItem("tcp_coachApplications", JSON.stringify(coaches));
        localStorage.removeItem("tcp_setPasswordPending");
        navigate("/dashboard-coach");
      }
    } else if (userType === "mentor") {
      const mentors = JSON.parse(localStorage.getItem("tcp_mentorApplications") || "[]");
      const mentor = mentors.find((m: any) => m.email === email);
      if (mentor) {
        mentor.password = password;
        mentor.hasPassword = true;
        localStorage.setItem("tcp_mentorApplications", JSON.stringify(mentors));
        localStorage.removeItem("tcp_setPasswordPending");
        navigate("/dashboard-mentor");
      }
    } else if (userType === "investor") {
      const investors = JSON.parse(localStorage.getItem("tcp_investorApplications") || "[]");
      const investor = investors.find((i: any) => i.email === email);
      if (investor) {
        investor.password = password;
        investor.hasPassword = true;
        localStorage.setItem("tcp_investorApplications", JSON.stringify(investors));
        localStorage.removeItem("tcp_setPasswordPending");
        navigate("/dashboard-investor");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-display font-bold text-white">Set Your Password</CardTitle>
            <CardDescription className="text-slate-400">
              Welcome! Create a password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="space-y-2">
              <Label className="text-slate-200">Email</Label>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600 text-slate-300">
                {email}
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-set-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                  data-testid="button-toggle-set-password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">At least 8 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" data-testid="error-message">
                {error}
              </div>
            )}

            {/* Set Password Button */}
            <Button
              onClick={handleSetPassword}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              data-testid="button-set-password"
            >
              Create Password <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Back to Login */}
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800/50">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
