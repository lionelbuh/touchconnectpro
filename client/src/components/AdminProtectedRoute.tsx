import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    verifyAdmin();
  }, []);

  const verifyAdmin = async () => {
    const token = localStorage.getItem("tcp_adminToken");
    
    if (!token) {
      localStorage.setItem("tcp_adminReturnTo", window.location.pathname);
      setLocation("/admin-login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthorized(true);
      } else {
        localStorage.removeItem("tcp_adminToken");
        localStorage.removeItem("tcp_adminData");
        localStorage.setItem("tcp_adminReturnTo", window.location.pathname);
        setLocation("/admin-login");
      }
    } catch (error) {
      console.error("Admin verification error:", error);
      localStorage.setItem("tcp_adminReturnTo", window.location.pathname);
      setLocation("/admin-login");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
