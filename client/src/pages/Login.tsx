import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Lightbulb, Star, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getSupabase, clearSupabaseSession } from "@/lib/supabase";
import { toast } from "sonner";

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", 
  "India", "Japan", "Brazil", "Mexico", "Singapore", "Netherlands", "Switzerland",
  "Sweden", "Ireland", "Israel", "South Korea", "New Zealand", "Spain", "Italy",
  "Portugal", "China", "Argentina", "Colombia", "Chile", "Peru", "Thailand", "Philippines",
  "Vietnam", "Indonesia", "Malaysia", "Hong Kong", "Pakistan", "Bangladesh"
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia"
];

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 10) {
    errors.push("At least 10 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one capital letter");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least one special character (!@#$%^&*...)");
  }
  return { valid: errors.length === 0, errors };
};

const cardStyle: React.CSSProperties = {
  boxShadow: "0 4px 24px rgba(224,224,224,0.5)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderColor: "#E0E0E0",
  color: "#4A4A4A",
};

const inputFocusClass = "focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20";

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("entrepreneur");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          setCheckingAuth(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData.user;
        }
        
        if (user && user.email) {
          const email = user.email.toLowerCase();
          setUserEmail(email);
          
          let role: string | null = null;
          
          const { data: entrepreneurApp } = await supabase
            .from("ideas")
            .select("status")
            .ilike("entrepreneur_email", email)
            .in("status", ["approved", "pre-approved"])
            .limit(1);
          
          if (entrepreneurApp && entrepreneurApp.length > 0) {
            role = "entrepreneur";
          }
          
          if (!role) {
            const { data: mentorApp } = await supabase
              .from("mentor_applications")
              .select("status")
              .ilike("email", email)
              .eq("status", "approved")
              .limit(1);
            
            if (mentorApp && mentorApp.length > 0) {
              role = "mentor";
            }
          }
          
          if (!role) {
            const { data: coachApp } = await supabase
              .from("coach_applications")
              .select("status")
              .ilike("email", email)
              .eq("status", "approved")
              .limit(1);
            
            if (coachApp && coachApp.length > 0) {
              role = "coach";
            }
          }
          
          if (!role) {
            const { data: investorApp } = await supabase
              .from("investor_applications")
              .select("status")
              .ilike("email", email)
              .eq("status", "approved")
              .limit(1);
            
            if (investorApp && investorApp.length > 0) {
              role = "investor";
            }
          }

          if (!role) {
            const { data: trialUser } = await supabase
              .from("trial_users")
              .select("status")
              .ilike("email", email)
              .in("status", ["trial_active", "trial_expired"])
              .limit(1);
            
            if (trialUser && trialUser.length > 0) {
              role = "trial_entrepreneur";
            }
          }
          
          if (role) {
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkUser();
  }, []);

  const handleGoToDashboard = () => {
    if (userRole === "trial_entrepreneur") navigate("/trial-dashboard");
    else if (userRole === "entrepreneur") navigate("/dashboard-entrepreneur");
    else if (userRole === "mentor") navigate("/dashboard-mentor");
    else if (userRole === "coach") navigate("/dashboard-coach");
    else if (userRole === "investor") navigate("/dashboard-investor");
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in email and password");
      return;
    }
    setLoading(true);
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error("Supabase client not initialized. Check environment variables.");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      if (data.session) {
        console.log("[LOGIN] Session received, access_token length:", data.session.access_token?.length);
        console.log("[LOGIN] Session received, refresh_token length:", data.session.refresh_token?.length);
        
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        
        const authKeys = Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase') || k.includes('tcp-'));
        console.log("[LOGIN] Auth keys in localStorage after setSession:", authKeys);
        authKeys.forEach(key => {
          const value = localStorage.getItem(key);
          console.log(`[LOGIN] Key ${key}: length=${value?.length}, preview=${value?.substring(0, 50)}...`);
        });
        
        console.log("[LOGIN] Session explicitly persisted to localStorage");
      } else {
        console.log("[LOGIN] WARNING: No session received from signInWithPassword!");
      }
      
      if (data.user) {
        const userEmail = data.user.email?.toLowerCase();
        console.log("[LOGIN] User email:", userEmail);
        
        let applicationRole: string | null = null;
        
        if (userEmail) {
          console.log("[LOGIN] Checking application tables for email:", userEmail);
          
          const { data: entrepreneurApp } = await supabase
            .from("ideas")
            .select("status, entrepreneur_email")
            .ilike("entrepreneur_email", userEmail)
            .in("status", ["approved", "pre-approved"])
            .limit(1);
          
          if (entrepreneurApp && entrepreneurApp.length > 0) {
            applicationRole = "entrepreneur";
            console.log("[LOGIN] Found approved/pre-approved entrepreneur application, status:", entrepreneurApp[0].status);
          }
          
          if (!applicationRole) {
            const { data: mentorApp } = await supabase
              .from("mentor_applications")
              .select("status, email")
              .ilike("email", userEmail)
              .eq("status", "approved")
              .limit(1);
            
            if (mentorApp && mentorApp.length > 0) {
              applicationRole = "mentor";
              console.log("[LOGIN] Found approved mentor application");
            }
          }
          
          if (!applicationRole) {
            const { data: coachApp } = await supabase
              .from("coach_applications")
              .select("status, email")
              .ilike("email", userEmail)
              .eq("status", "approved")
              .limit(1);
            
            if (coachApp && coachApp.length > 0) {
              applicationRole = "coach";
              console.log("[LOGIN] Found approved coach application");
            }
          }
          
          if (!applicationRole) {
            const { data: investorApp } = await supabase
              .from("investor_applications")
              .select("status, email")
              .ilike("email", userEmail)
              .eq("status", "approved")
              .limit(1);
            
            if (investorApp && investorApp.length > 0) {
              applicationRole = "investor";
              console.log("[LOGIN] Found approved investor application");
            }
          }

          if (!applicationRole) {
            const { data: trialUser } = await supabase
              .from("trial_users")
              .select("status, email")
              .ilike("email", userEmail)
              .in("status", ["trial_active", "trial_expired"])
              .limit(1);
            
            if (trialUser && trialUser.length > 0) {
              applicationRole = "trial_entrepreneur";
              console.log("[LOGIN] Found trial user, status:", trialUser[0].status);
            }
          }
        }
        
        let userRole = applicationRole;
        
        if (!userRole) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id);
          
          userRole = profile?.[0]?.role;
          console.log("[LOGIN] Role from users table:", userRole);
        }
        
        if (!userRole) {
          userRole = data.user.user_metadata?.user_type || "entrepreneur";
          console.log("[LOGIN] Using fallback role from metadata:", userRole);
        }
        
        console.log("[LOGIN] Final role:", userRole);
        
        let dashboardPath = "/dashboard-entrepreneur";
        
        if (userRole === "trial_entrepreneur") dashboardPath = "/trial-dashboard";
        else if (userRole === "mentor") dashboardPath = "/dashboard-mentor";
        else if (userRole === "coach") dashboardPath = "/dashboard-coach";
        else if (userRole === "investor") dashboardPath = "/dashboard-investor";
        
        const currentParams = new URLSearchParams(window.location.search);
        const paymentStatus = currentParams.get("payment");
        const sessionId = currentParams.get("session_id");
        if (paymentStatus && dashboardPath === "/dashboard-entrepreneur") {
          const params = new URLSearchParams();
          params.set("payment", paymentStatus);
          if (sessionId) params.set("session_id", sessionId);
          dashboardPath = `${dashboardPath}?${params.toString()}`;
        }
        
        toast.success("Logged in successfully!");
        navigate(dashboardPath);
      }
    } catch (error: any) {
      console.log("[LOGIN ERROR]", error.message, error);
      const errorMsg = (error.message || "").toLowerCase();
      if (errorMsg.includes("invalid") || 
          errorMsg.includes("credentials") ||
          errorMsg.includes("password") ||
          errorMsg.includes("wrong") ||
          errorMsg.includes("incorrect") ||
          errorMsg.includes("login")) {
        toast.error("Wrong password. Please try again.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupFullName || !signupEmail || !signupPassword || !country) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (country === "United States" && !state) {
      toast.error("Please select your state");
      return;
    }
    const passwordValidation = validatePassword(signupPassword);
    if (!passwordValidation.valid) {
      toast.error("Password requirements not met: " + passwordValidation.errors.join(", "));
      return;
    }
    setLoading(true);
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      });
      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: signupEmail,
            full_name: signupFullName,
            country,
            state: state || null,
            role: selectedRole,
          });
        if (profileError) throw profileError;
      }
      
      toast.success("Account created! Redirecting to application form...");
      if (selectedRole === "entrepreneur") navigate("/founder-focus");
      else if (selectedRole === "mentor") navigate("/become-mentor");
      else if (selectedRole === "coach") navigate("/become-coach");
      else if (selectedRole === "investor") navigate("/investors");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    if (role === "entrepreneur") navigate("/founder-focus");
    else if (role === "mentor") navigate("/become-mentor");
    else if (role === "coach") navigate("/become-coach");
    else if (role === "investor") navigate("/investors");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: "#FF6B5C" }} />
          <p className="mt-4" style={{ color: "#8A8A8A" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole) {
    return (
      <div className="min-h-screen flex" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-12" style={{ backgroundColor: "#0D566C" }}>
          <div className="max-w-sm text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Welcome back to TouchConnectPro</h2>
            <p style={{ color: "rgba(255,255,255,0.75)" }}>Your dashboard is ready. Pick up where you left off.</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10" style={cardStyle}>
            <h2 className="text-2xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Welcome Back!</h2>
            <p className="mb-8 text-sm" style={{ color: "#8A8A8A" }}>You're already signed in as {userEmail}</p>
            <div className="space-y-3">
              <Button
                onClick={handleGoToDashboard}
                className="w-full h-12 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                data-testid="button-go-to-dashboard"
              >
                Go to My Dashboard
              </Button>
              <Button
                onClick={async () => {
                  const supabase = await getSupabase();
                  if (supabase) {
                    await supabase.auth.signOut();
                  }
                  setUserRole(null);
                  setUserEmail(null);
                  toast.success("Logged out successfully");
                }}
                variant="outline"
                className="w-full h-12 rounded-full font-semibold"
                style={{ borderColor: "#E0E0E0", color: "#4A4A4A" }}
                data-testid="button-logout-login"
              >
                Sign Out
              </Button>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full font-medium" style={{ color: "#8A8A8A" }}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FAF9F7" }}>
      {/* Left Brand Panel - Desktop only */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12" style={{ backgroundColor: "#0D566C" }}>
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(245,197,66,0.2)" }}>
            <Lightbulb className="h-7 w-7" style={{ color: "#F5C542" }} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Where ideas become real businesses
          </h2>
          <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            AI helps organize your thoughts. Mentors help you make them real. Sign in to continue your journey.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Login Card */}
          {!isRecovery && isLogin && (
            <div className="bg-white rounded-2xl p-8 md:p-10" style={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Welcome Back</h2>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Sign in to your TouchConnectPro account</p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium" style={{ color: "#0D566C" }}>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`pl-10 h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                      style={inputStyle}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium" style={{ color: "#0D566C" }}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`pl-10 pr-10 h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                      style={inputStyle}
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 transition-colors"
                      style={{ color: "#8A8A8A" }}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsRecovery(true)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "#FF6B5C" }}
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-12 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer relative z-10"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-login"
                >
                  {loading ? "Signing in..." : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>

                <div className="text-center pt-2">
                  <p style={{ color: "#8A8A8A" }}>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        setShowRoles(true);
                        window.scrollTo(0, 0);
                      }}
                      className="font-semibold transition-colors"
                      style={{ color: "#FF6B5C" }}
                      data-testid="button-signup-link"
                    >
                      Create one now
                    </button>
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      clearSupabaseSession();
                      toast.success("Session cleared. Please log in again.");
                      window.location.reload();
                    }}
                    className="text-xs underline transition-colors"
                    style={{ color: "#C0C0C0" }}
                    data-testid="button-clear-session"
                  >
                    Having trouble logging in? Clear session
                  </button>
                </div>

                <Link href="/" className="block">
                  <Button variant="ghost" className="w-full font-medium" style={{ color: "#8A8A8A" }}>
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6" style={{ borderTop: "1px solid #F3F3F3" }}>
                <p className="text-center text-sm" style={{ color: "#8A8A8A" }}>
                  New here?{" "}
                  <Link href="/founder-focus">
                    <span className="font-semibold cursor-pointer transition-colors" style={{ color: "#0D566C" }}>
                      Join the Community for free.
                    </span>
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Role Selection Card */}
          {!isRecovery && !isLogin && showRoles && (
            <div className="bg-white rounded-2xl p-8 md:p-10" style={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Join TouchConnectPro</h2>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Select your role to get started</p>
              <div className="space-y-3 mb-6">
                {[
                  { role: "entrepreneur", icon: Lightbulb, color: "#F5C542", label: "I'm an Entrepreneur", desc: "Submit your idea and get guidance", testId: "button-role-entrepreneur" },
                  { role: "mentor", icon: Star, color: "#4B3F72", label: "I'm a Mentor", desc: "Guide and support entrepreneurs", testId: "button-role-mentor" },
                  { role: "coach", icon: Briefcase, color: "#0D566C", label: "I'm a Coach", desc: "Offer coaching services hourly", testId: "button-role-coach" },
                  { role: "investor", icon: TrendingUp, color: "#FF6B5C", label: "I'm an Investor", desc: "Invest in startups and founders", testId: "button-role-investor" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelection(item.role)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      style={{ borderColor: "#E8E8E8", backgroundColor: "#FFFFFF" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF6B5C"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E8E8"; }}
                      data-testid={item.testId}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                        <Icon className="h-5 w-5" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "#0D566C" }}>{item.label}</p>
                        <p className="text-sm" style={{ color: "#8A8A8A" }}>{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowRoles(false);
                  setIsLogin(true);
                }}
                className="w-full text-center py-3 font-medium transition-colors"
                style={{ color: "#8A8A8A" }}
                data-testid="button-back-to-login-roles"
              >
                Back to Sign In
              </button>

              <Link href="/" className="block mt-2">
                <Button variant="ghost" className="w-full font-medium" style={{ color: "#8A8A8A" }}>
                  Back to Home
                </Button>
              </Link>
            </div>
          )}

          {/* Signup Card */}
          {!isRecovery && !isLogin && !showRoles && (
            <div className="bg-white rounded-2xl p-8 md:p-10" style={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Get Started</h2>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Create your TouchConnectPro account</p>
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="font-medium" style={{ color: "#4B3F72" }}>You are an Entrepreneur with an idea</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname" className="font-medium" style={{ color: "#0D566C" }}>Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className={`h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                    style={inputStyle}
                    data-testid="input-fullname"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-medium" style={{ color: "#0D566C" }}>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`pl-10 h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                      style={inputStyle}
                      data-testid="input-signup-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-medium" style={{ color: "#0D566C" }}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className={`pl-10 pr-10 h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                      style={inputStyle}
                      data-testid="input-signup-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 transition-colors"
                      style={{ color: "#8A8A8A" }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs flex items-center gap-1 ${signupPassword.length >= 10 ? 'text-green-500' : ''}`} style={signupPassword.length >= 10 ? {} : { color: "#C0C0C0" }}>
                      {signupPassword.length >= 10 ? '✓' : '○'} At least 10 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(signupPassword) ? 'text-green-500' : ''}`} style={/[A-Z]/.test(signupPassword) ? {} : { color: "#C0C0C0" }}>
                      {/[A-Z]/.test(signupPassword) ? '✓' : '○'} At least one capital letter
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? 'text-green-500' : ''}`} style={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? {} : { color: "#C0C0C0" }}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signupPassword) ? '✓' : '○'} At least one special character
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium" style={{ color: "#0D566C" }}>Country</Label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setState("");
                    }}
                    className={`w-full h-12 px-3 rounded-xl border ${inputFocusClass}`}
                    style={{ ...inputStyle, appearance: "auto" as any }}
                    data-testid="select-country"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {country === "United States" && (
                  <div className="space-y-2">
                    <Label htmlFor="state" className="font-medium" style={{ color: "#0D566C" }}>State *</Label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={`w-full h-12 px-3 rounded-xl border ${inputFocusClass}`}
                      style={{ ...inputStyle, appearance: "auto" as any }}
                      data-testid="select-state"
                    >
                      <option value="">Select your state</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="text-xs" style={{ color: "#8A8A8A" }}>
                  By signing up, you agree to our{" "}
                  <Link href="/terms-of-service" className="underline" style={{ color: "#FF6B5C" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="underline" style={{ color: "#FF6B5C" }}>
                    Privacy Policy
                  </Link>
                </p>

                <Button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full h-12 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-signup"
                >
                  {loading ? "Creating account..." : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ borderTop: "1px solid #F3F3F3" }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3" style={{ backgroundColor: "#FFFFFF", color: "#C0C0C0" }}>or</span>
                  </div>
                </div>

                <div className="text-center">
                  <p style={{ color: "#8A8A8A" }}>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        window.scrollTo(0, 0);
                      }}
                      className="font-semibold transition-colors"
                      style={{ color: "#FF6B5C" }}
                      data-testid="button-login-link"
                    >
                      Sign in
                    </button>
                  </p>
                </div>

                <Link href="/" className="block">
                  <Button variant="ghost" className="w-full font-medium" style={{ color: "#8A8A8A" }}>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Password Recovery Card */}
          {isRecovery && (
            <div className="bg-white rounded-2xl p-8 md:p-10" style={cardStyle}>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2" style={{ color: "#0D566C" }}>Recover Password</h2>
              <p className="mb-8" style={{ color: "#8A8A8A" }}>Enter your email to reset your password</p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="font-medium" style={{ color: "#0D566C" }}>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: "#8A8A8A" }} />
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="you@example.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className={`pl-10 h-12 rounded-xl placeholder:text-[#C0C0C0] ${inputFocusClass}`}
                      style={inputStyle}
                      data-testid="input-recovery-email"
                    />
                  </div>
                </div>

                <p className="text-sm p-4 rounded-xl" style={{ backgroundColor: "rgba(245,197,66,0.1)", color: "#4A4A4A", border: "1px solid rgba(245,197,66,0.3)" }}>
                  We'll send you a link to reset your password. Check your email for instructions.
                </p>

                <Button
                  onClick={async () => {
                    if (!recoveryEmail) {
                      toast.error("Please enter your email");
                      return;
                    }
                    setLoading(true);
                    try {
                      const supabase = await getSupabase();
                      if (!supabase) throw new Error("Unable to connect");
                      await supabase.auth.resetPasswordForEmail(recoveryEmail, {
                        redirectTo: `${window.location.origin}/reset-password`
                      });
                      toast.success("Recovery email sent! Check your inbox.");
                      setRecoveryEmail("");
                    } catch (error: any) {
                      toast.error(error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full h-12 font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                  data-testid="button-send-recovery"
                >
                  {loading ? "Sending..." : <>Send Recovery Link <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>

                <button
                  onClick={() => setIsRecovery(false)}
                  className="w-full text-center py-3 font-medium transition-colors"
                  style={{ color: "#8A8A8A" }}
                  data-testid="button-back-to-login"
                >
                  Back to Sign In
                </button>

                <Link href="/" className="block">
                  <Button variant="ghost" className="w-full font-medium" style={{ color: "#8A8A8A" }}>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
