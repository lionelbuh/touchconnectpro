import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { API_BASE_URL } from "@/config";

export default function SetPassword() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      const stored = localStorage.getItem("tcp_setPasswordPending");
      if (stored) {
        const { email, userType } = JSON.parse(stored);
        setEmail(email);
        setUserType(userType);
        setTokenValid(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setTokenValid(false);
        setError("No token provided. Please use the link from your email.");
      }
    }
  }, []);

  const validateToken = async (tokenValue: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/password-token/${tokenValue}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
        setEmail(data.email);
        setUserType(data.userType);
      } else {
        setTokenValid(false);
        setError(data.error || "Invalid or expired token. Please request a new password setup link.");
      }
    } catch (err) {
      setTokenValid(false);
      setError("Unable to validate token. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async () => {
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

    setIsSubmitting(true);

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/set-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess(true);
        } else {
          setError(data.error || "Failed to set password. Please try again.");
        }
      } catch (err) {
        setError("An error occurred. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (userType === "coach") {
        const coaches = JSON.parse(localStorage.getItem("tcp_coachApplications") || "[]");
        const coach = coaches.find((c: any) => c.email === email);
        if (coach) {
          coach.password = password;
          coach.hasPassword = true;
          localStorage.setItem("tcp_coachApplications", JSON.stringify(coaches));
          localStorage.removeItem("tcp_setPasswordPending");
          window.scrollTo(0, 0);
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
          window.scrollTo(0, 0);
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
          window.scrollTo(0, 0);
          navigate("/dashboard-investor");
        }
      } else if (userType === "entrepreneur") {
        const entrepreneurs = JSON.parse(localStorage.getItem("tcp_entrepreneurApplications") || "[]");
        const entrepreneur = entrepreneurs.find((e: any) => e.email === email);
        if (entrepreneur) {
          entrepreneur.password = password;
          entrepreneur.hasPassword = true;
          localStorage.setItem("tcp_entrepreneurApplications", JSON.stringify(entrepreneurs));
          localStorage.removeItem("tcp_setPasswordPending");
          window.scrollTo(0, 0);
          navigate("/dashboard-entrepreneur");
        }
      }
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
        <Card className="border-0 shadow-xl w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#0D566C" }} />
            <p style={{ color: "#8A8A8A" }}>Validating your link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
        <Card className="border-0 shadow-xl w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(13,86,108,0.1)" }}>
              <CheckCircle className="h-10 w-10" style={{ color: "#0D566C" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Password Set Successfully!</h2>
            <p className="mb-6" style={{ color: "#8A8A8A" }}>
              Your account is now ready. You can log in with your email and new password.
            </p>
            <Button 
              className="w-full rounded-full font-semibold"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              onClick={() => navigate("/login")}
              data-testid="button-go-to-login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
        <Card className="border-0 shadow-xl w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(255,107,92,0.1)" }}>
              <AlertCircle className="h-10 w-10" style={{ color: "#FF6B5C" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Invalid Link</h2>
            <p className="mb-6" style={{ color: "#8A8A8A" }}>
              {error || "This password setup link is invalid or has expired."}
            </p>
            <Button 
              variant="outline"
              className="rounded-full"
              style={{ borderColor: "#0D566C", color: "#0D566C" }}
              onClick={() => navigate("/")}
              data-testid="button-go-home"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-display font-bold" style={{ color: "#1A1A1A" }}>Set Your Password</CardTitle>
            <CardDescription style={{ color: "#8A8A8A" }}>
              {userType ? `Welcome! Create a password for your ${userType} account.` : "Welcome! Create a password for your account."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label style={{ color: "#4A4A4A" }}>Email</Label>
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#FAF9F7", border: "1px solid #E8E8E8", color: "#4A4A4A" }}>
                {email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#4A4A4A" }}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", color: "#1A1A1A" }}
                  data-testid="input-set-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 transition-colors"
                  style={{ color: "#8A8A8A" }}
                  data-testid="button-toggle-set-password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs" style={{ color: "#8A8A8A" }}>At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" style={{ color: "#4A4A4A" }}>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", color: "#1A1A1A" }}
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 transition-colors"
                  style={{ color: "#8A8A8A" }}
                  data-testid="button-toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl" style={{ backgroundColor: "rgba(255,107,92,0.08)", border: "1px solid rgba(255,107,92,0.2)" }}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription style={{ color: "#FF6B5C" }}>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSetPassword}
              disabled={isSubmitting}
              className="w-full h-12 rounded-full font-semibold transition-all"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              data-testid="button-set-password"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                <>
                  Create Password <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Link href="/login" className="block">
              <Button variant="outline" className="w-full rounded-full" style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}>
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
