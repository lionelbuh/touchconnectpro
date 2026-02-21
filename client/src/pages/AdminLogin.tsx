import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "@/config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("tcp_adminToken", data.token);
        localStorage.setItem("tcp_adminData", JSON.stringify(data.admin));
        
        const returnTo = localStorage.getItem("tcp_adminReturnTo") || "/admin-dashboard";
        localStorage.removeItem("tcp_adminReturnTo");
        setLocation(returnTo);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#FAF9F7" }}>
      <Card className="w-full max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#0D566C" }}>
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{ color: "#0D566C" }}>Admin Login</CardTitle>
          <p className="mt-2" style={{ color: "#8A8A8A" }}>Access restricted to authorized administrators</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#4A4A4A" }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#8A8A8A" }} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-10 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A" }}
                  required
                  data-testid="input-admin-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#4A4A4A" }}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "#8A8A8A" }} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", color: "#4A4A4A" }}
                  required
                  data-testid="input-admin-password"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full rounded-full"
              style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
              disabled={loading}
              data-testid="button-admin-login"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
            <p className="text-center text-sm" style={{ color: "#8A8A8A" }}>
              This area is for TouchConnectPro administrators only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
