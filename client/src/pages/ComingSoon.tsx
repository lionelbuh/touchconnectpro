import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Lightbulb, Mail, Bell } from "lucide-react";
import { useState } from "react";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Rocket className="h-16 w-16 text-cyan-400 animate-bounce" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            We're Building Something Powerful for You
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Our team is currently working hard to finalize the AI guidance system that will support entrepreneurs and connect them with mentors through TouchConnectPro.
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 mb-8 overflow-hidden">
          <CardContent className="p-8">
            <p className="text-slate-200 leading-relaxed">
              We're preparing the platform carefully to ensure it's reliable, helpful, and ready to welcome ambitious founders like you.
            </p>
          </CardContent>
        </Card>

        {/* Early Access Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold">Want Early Access?</h2>
          </div>
          <p className="text-slate-300 mb-8 text-lg">
            You can pre-register for free today. Enter your email below, and we'll notify you as soon as the AI system is ready for you to join, explore, and start working with mentors.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="📩 Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              <Button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 h-auto py-3 rounded-lg whitespace-nowrap"
              >
                Notify Me
              </Button>
            </div>
            {submitted && (
              <div className="text-green-400 font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Thanks! We'll be in touch soon.
              </div>
            )}
          </form>

          <p className="text-slate-400 text-sm mt-4">
            Be first in line — no cost, no commitment.
          </p>
        </div>

        {/* Status Message */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-cyan-400 mt-1 shrink-0" />
              <p className="text-slate-200">
                <strong>🔔 You'll be the first to know</strong> when we go live and the full TouchConnectPro platform is ready for you to start your journey.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
