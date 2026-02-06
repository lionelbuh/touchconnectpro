import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Home, BookOpen, BarChart3, HelpCircle, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/how-it-works", label: "How It Works", icon: BookOpen },
    { href: "/pricing", label: "Pricing", icon: BarChart3 },
    { href: "/qa", label: "Q&A", icon: HelpCircle }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Branding */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              data-testid="button-home-logo"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-display font-bold text-slate-900 dark:text-white hidden sm:inline">
                TouchConnectPro
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  data-testid={`button-nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 bg-cyan-500">
                <AvatarFallback className="text-white text-xs font-bold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{userName.split(" ")[0]}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Logged in</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              data-testid="button-logout-header"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 py-2 space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => {
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  data-testid={`button-mobile-nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
