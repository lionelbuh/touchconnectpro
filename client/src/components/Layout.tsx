import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logoFull from "@assets/Logo_TouchConnectPro-removebg-preview_1764217788734.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src={logoFull} 
              alt="TouchConnectPro" 
              className="h-40 w-auto object-contain dark:invert dark:hue-rotate-180" 
            />
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
            <div className="flex items-center gap-2">
              <img 
                src={logoFull} 
                alt="TouchConnectPro" 
                className="h-32 w-auto object-contain dark:invert dark:hue-rotate-180" 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting Ideas, Mentors, and Entrepreneurs
              <br/>
              AI helps you get ready.
              <br/>
              People help you win.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
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
