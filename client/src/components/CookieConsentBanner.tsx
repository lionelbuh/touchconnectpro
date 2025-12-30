import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "wouter";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    openCookieSettings: () => void;
  }
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("tcp_cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
    
    // Expose function to reopen cookie settings
    window.openCookieSettings = () => {
      setShowBanner(true);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem("tcp_cookieConsent", "accepted");
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted"
      });
    }
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("tcp_cookieConsent", "rejected");
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied"
      });
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg" data-testid="cookie-consent-banner">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-6 w-6 text-cyan-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium mb-1">We value your privacy</p>
            <p className="text-slate-600 dark:text-slate-400">
              We use essential cookies for site functionality. Analytics cookies help us improve your experience but are optional.{" "}
              <Link href="/cookie-policy" className="text-cyan-600 hover:underline">Cookie Policy</Link>
              {" • "}
              <Link href="/privacy-policy" className="text-cyan-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="flex-1 sm:flex-none"
            data-testid="button-reject-cookies"
          >
            Reject analytics
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-accept-cookies"
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
