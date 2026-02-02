import { Button } from "@/components/ui/button";
import { Home, BookOpen, BarChart3, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";

export function DashboardFooter() {
  const [, navigate] = useLocation();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/how-it-works", label: "How It Works", icon: BookOpen },
    { href: "/pricing", label: "Pricing", icon: BarChart3 },
    { href: "/qa", label: "Q&A", icon: HelpCircle }
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex items-center justify-center gap-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                data-testid={`footer-button-${link.label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </button>
            );
          })}
        </div>
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-center gap-4 mb-2 flex-wrap">
            <a href="/privacy-policy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/cookie-policy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Cookie Policy</a>
            <span>•</span>
            <a href="/terms-of-service" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <button onClick={() => (window as any).openCookieSettings?.()} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Cookie Settings</button>
          </div>
          © {new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.
          <br />
          <span className="text-xs">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span>
        </div>
      </div>
    </footer>
  );
}
