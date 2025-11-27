import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logoIcon from "@assets/generated_images/touchconnectpro_minimalist_logo_icon.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/mentors", label: "Find a Mentor" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <img src={logoIcon} alt="TouchConnectPro" className="h-8 w-8 object-contain" />
            <span>TouchConnectPro</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:block">
              Log in
            </Link>
            <Link href="/dashboard">
              <Button className="font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <img src={logoIcon} alt="TouchConnectPro" className="h-6 w-6 object-contain" />
              <span>TouchConnectPro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering entrepreneurs with AI-driven business planning and world-class mentorship.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/mentors">Browse Mentors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/become-mentor">Become a Mentor</Link></li>
              <li><Link href="/become-coach">Become a Coach</Link></li>
              <li><Link href="/investors">For Investors</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TouchConnectPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
