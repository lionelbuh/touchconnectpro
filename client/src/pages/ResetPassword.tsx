import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    const handleRecovery = async () => {
      console.log("[RESET] Starting recovery flow...");
      console.log("[RESET] URL hash:", window.location.hash);
      
      const supabase = await getSupabase();
      
      if (!supabase) {
        console.error("[RESET] Supabase client not available");
        setError("Unable to connect to authentication service.");
        setIsLoading(false);
        return;
      }
      
      console.log("[RESET] Supabase client ready");

      const hash = window.location.hash;
      
      if (hash && hash.includes("access_token") && hash.includes("type=recovery")) {
        console.log("[RESET] Found recovery token in URL hash");
        
        const params = new URLSearchParams(hash.substring(1));
        const tokenHash = params.get("access_token");
        const type = params.get("type");
        
        console.log("[RESET] Token hash (first 10 chars):", tokenHash?.substring(0, 10) + "...");
        console.log("[RESET] Type:", type);
        
        if (tokenHash && type === "recovery") {
          try {
            console.log("[RESET] Calling verifyOtp...");
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery"
            });
            
            console.log("[RESET] verifyOtp result:", { 
              hasData: !!data, 
              hasSession: !!data?.session,
              error: verifyError?.message 
            });
            
            if (verifyError) {
              console.error("[RESET] Verify error:", verifyError);
              setError("Invalid or expired recovery link. Please request a new one.");
              setSessionValid(false);
            } else if (data?.session) {
              console.log("[RESET] Session established successfully!");
              setSessionValid(true);
              window.history.replaceState(null, "", window.location.pathname);
            } else {
              console.error("[RESET] No session in response");
              setError("Could not establish session. Please try again.");
              setSessionValid(false);
            }
          } catch (err: any) {
            console.error("[RESET] Exception:", err);
            setError("An error occurred. Please request a new reset link.");
            setSessionValid(false);
          }
        } else {
          console.error("[RESET] Invalid token format");
          setError("Invalid recovery link format.");
          setSessionValid(false);
        }
      } else {
        console.log("[RESET] No recovery token in hash, checking existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("[RESET] Found existing session");
          setSessionValid(true);
        } else {
          console.log("[RESET] No session found");
          setError("No recovery session found. Please use the link from your email.");
          setSessionValid(false);
        }
      }
      
      setIsLoading(false);
    };

    handleRecovery();
  }, []);

  const handleResetPassword = async () => {
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

    try {
      const supabase = await getSupabase();
      
      if (!supabase) {
        setError("Unable to connect to authentication service.");
        setIsSubmitting(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Session expired. Please request a new reset link.");
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
        <Card className="border-0 shadow-xl w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#0D566C" }} />
            <p style={{ color: "#8A8A8A" }}>Validating your recovery link...</p>
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Password Reset Successfully!</h2>
            <p className="mb-6" style={{ color: "#8A8A8A" }}>
              Your password has been updated. You can now log in with your new password.
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

  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: "#FAF9F7" }}>
        <Card className="border-0 shadow-xl w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 24px rgba(224,224,224,0.5)" }}>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(255,107,92,0.1)" }}>
              <AlertCircle className="h-10 w-10" style={{ color: "#FF6B5C" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Invalid Link</h2>
            <p className="mb-6" style={{ color: "#8A8A8A" }}>
              {error || "This password reset link is invalid or has expired."}
            </p>
            <Button 
              variant="outline"
              className="rounded-full"
              style={{ borderColor: "#0D566C", color: "#0D566C" }}
              onClick={() => navigate("/login")}
              data-testid="button-go-login"
            >
              Back to Login
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
            <CardTitle className="text-3xl font-display font-bold" style={{ color: "#1A1A1A" }}>Reset Your Password</CardTitle>
            <CardDescription style={{ color: "#8A8A8A" }}>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#4A4A4A" }}>New Password</Label>
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
                  data-testid="input-new-password"
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
              <p className="text-xs" style={{ color: "#8A8A8A" }}>At least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" style={{ color: "#4A4A4A" }}>Confirm New Password</Label>
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
              <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,107,92,0.08)", border: "1px solid rgba(255,107,92,0.2)" }}>
                <p className="text-sm" style={{ color: "#FF6B5C" }}>{error}</p>
              </div>
            )}

            <Button 
              className="w-full h-12 rounded-full font-semibold transition-all"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              onClick={handleResetPassword}
              disabled={isSubmitting}
              data-testid="button-reset-password"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
