import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoFull from "@assets/Logo_TouchConnectPro-removebg-preview_1764217788734.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location]);

  const links = [
    { href: "/", label: "Home", testId: "nav-home" },
    { href: "/how-it-works", label: "How it works", testId: "nav-how-it-works" },
    { href: "/pricing", label: "Pricing", testId: "nav-pricing" },
    { href: "/insights", label: "Startup Radar", testId: "nav-insights" },
    { href: "/founder-focus", label: "Focus Score", testId: "nav-founder-focus" },
    { href: "/qa", label: "Q&A", testId: "nav-qa" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-logo">
            <img 
              src={logoFull} 
              alt="TouchConnectPro" 
              className="h-40 w-auto object-contain dark:invert dark:hue-rotate-180"
              width={612}
              height={408}
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                data-testid={`link-${link.testId}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary" data-testid="link-login">
              Log in
            </Link>
            <Link href="/founder-focus" data-testid="link-get-started">
              <Button className="font-medium" data-testid="button-get-started">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-mobile-${link.testId}`}
                  className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                    location === link.href 
                      ? "bg-primary/20 text-primary" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="block px-4 py-2 rounded-lg font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground" data-testid="link-mobile-login">
                Log in
              </Link>
              <Link href="/founder-focus" data-testid="link-mobile-get-started">
                <Button className="w-full font-medium" data-testid="button-mobile-get-started">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12" data-testid="footer">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={logoFull} 
                alt="TouchConnectPro" 
                className="h-32 w-auto object-contain dark:invert dark:hue-rotate-180"
                width={612}
                height={408}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold">Connecting Ideas, Mentors, and Entrepreneurs</span>
              <br/>
              AI helps you get ready.
              <br/>
              <span className="font-bold">People help you win.</span>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-it-works" data-testid="link-footer-how-it-works">How it works</Link></li>
              <li><Link href="/pricing" data-testid="link-footer-pricing">Pricing</Link></li>
              <li><Link href="/insights" data-testid="link-footer-insights">Startup Radar</Link></li>
              <li><Link href="/founder-focus" data-testid="link-footer-founder-focus">Focus Score</Link></li>
              <li><Link href="/qa" data-testid="link-footer-qa">Q&A</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/founder-focus" data-testid="link-footer-entrepreneur">Entrepreneur: Submit your Idea</Link></li>
              <li><Link href="/become-mentor" data-testid="link-footer-mentor">Become a Mentor</Link></li>
              <li><Link href="/become-coach" data-testid="link-footer-coach">Become a Coach</Link></li>
              <li><Link href="/investors" data-testid="link-footer-investors">For Investors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-foreground transition-colors" data-testid="link-footer-cookies">Cookie Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Service</Link></li>
              <li><button onClick={() => window.openCookieSettings?.()} className="hover:text-foreground transition-colors text-left" data-testid="button-cookie-settings">Cookie Settings</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Touch Equity Partners LLC. All rights reserved.
          <br />
          <span className="text-xs">TouchConnectPro is a brand and online service operated by Touch Equity Partners LLC.</span>
        </div>
      </footer>
    </div>
  );
}
