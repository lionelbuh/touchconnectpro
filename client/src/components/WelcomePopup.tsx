import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Users, Sparkles } from "lucide-react";

const POPUP_STORAGE_KEY = "tcp_welcome_popup_last_shown";

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(POPUP_STORAGE_KEY, new Date().toDateString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md relative overflow-hidden border-2 border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500"></div>
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full"
          onClick={handleClose}
          data-testid="button-close-welcome-popup"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-8 pt-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
            Welcome to TouchConnectPro!
          </h2>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            We're actively looking for our <span className="font-semibold text-cyan-600 dark:text-cyan-400">first coaches</span> to join our growing community. If you have experience guiding entrepreneurs, we'd love to hear from you!
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              data-testid="button-continue-browsing"
            >
              Continue Browsing
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white"
              onClick={() => {
                handleClose();
                window.location.href = "/become-coach";
              }}
              data-testid="button-become-coach"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Become a Coach
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Or <a href="/become-mentor" className="text-cyan-600 hover:underline" onClick={handleClose}>become a mentor</a> for our volunteer program
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
