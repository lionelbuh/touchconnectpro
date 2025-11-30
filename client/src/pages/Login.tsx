import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  const handleSignup = () => {
    navigate("/dashboard-entrepreneur");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        {!isRecovery && isLogin && (
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-display font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to your TouchConnectPro account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-email"
                  />
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
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsRecovery(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  data-testid="button-forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/50"
                data-testid="button-login"
              >
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-slate-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      window.scrollTo(0, 0);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    data-testid="button-signup-link"
                  >
                    Create one now
                  </button>
                </p>
              </div>

              {/* Back to Home */}
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800/50">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Signup Card */}
        {!isRecovery && !isLogin && (
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-display font-bold text-white">Get Started</CardTitle>
              <CardDescription className="text-slate-400">
                Create your TouchConnectPro account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Account Type Label */}
              <div className="space-y-2">
                <p className="text-slate-300 font-medium">You are an Entrepreneur with an idea</p>
              </div>

              {/* Full Name Input */}
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-200">Full Name</Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  data-testid="input-fullname"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-signup-email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-signup-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Country Input */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-slate-200">Country</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-country"
                  />
                </div>
              </div>

              {/* State Input - Show if USA */}
              {country.toLowerCase().includes("united states") && (
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-slate-200">State *</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="California"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-state"
                  />
                </div>
              )}

              {/* Terms Agreement */}
              <p className="text-xs text-slate-400">
                By signing up, you agree to our{" "}
                <Link href="/terms-of-service" className="text-cyan-400 hover:text-cyan-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300">
                  Privacy Policy
                </Link>
              </p>

              {/* Sign Up Button */}
              <Button
                onClick={handleSignup}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/50"
                data-testid="button-signup"
              >
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-slate-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      window.scrollTo(0, 0);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    data-testid="button-login-link"
                  >
                    Sign in
                  </button>
                </p>
              </div>

              {/* Back to Home */}
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800/50">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Password Recovery Card */}
        {isRecovery && (
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-display font-bold text-white">Recover Password</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your email to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="recovery-email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                    data-testid="input-recovery-email"
                  />
                </div>
              </div>

              {/* Recovery Message */}
              <p className="text-sm text-slate-400 bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                We'll send you a link to reset your password. Check your email for instructions.
              </p>

              {/* Send Link Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/50"
                data-testid="button-send-recovery"
              >
                Send Recovery Link <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Back to Login */}
              <button
                onClick={() => setIsRecovery(false)}
                className="w-full text-center py-3 text-slate-400 hover:text-slate-300 transition-colors font-medium"
                data-testid="button-back-to-login"
              >
                Back to Sign In
              </button>

              {/* Back to Home */}
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800/50">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
