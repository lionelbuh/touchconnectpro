import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Heart, Mail, Bell, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

export default function MentorWaitlist() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor-waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, fullName }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
      setEmail("");
      setFullName("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Users className="h-16 w-16 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Thank You for Your Interest!
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            We're grateful for the incredible response from experienced mentors like you. Right now, we have all the mentors we need to support our current entrepreneurs.
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Heart className="h-6 w-6 text-pink-400 mt-1 shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">A Heartfelt Thank You</h3>
                <p className="text-slate-200 leading-relaxed">
                  Your willingness to guide entrepreneurs means the world to us. We're building something special here, and mentors like you are at the heart of it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!submitted ? (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">Join Our Mentor Waiting List</h2>
            </div>
            <p className="text-slate-300 mb-8 text-lg">
              As we grow and welcome more entrepreneurs, we'll need more mentors. Leave your details below, and we'll reach out when a spot opens up.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                data-testid="input-fullname"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  data-testid="input-email"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 h-auto py-3 rounded-lg whitespace-nowrap disabled:opacity-50"
                  data-testid="button-join-waitlist"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Waiting List"
                  )}
                </Button>
              </div>
              {error && (
                <div className="text-red-400 font-medium" data-testid="text-error-message">
                  {error}
                </div>
              )}
            </form>

            <p className="text-slate-400 text-sm mt-4">
              No commitment required — we'll only contact you when there's an opening.
            </p>
          </div>
        ) : (
          <Card className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-indigo-500/30 mb-12">
            <CardContent className="p-8 text-center">
              <Bell className="h-10 w-10 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You're on the List!</h3>
              <p className="text-slate-200">
                Thank you for joining our mentor waiting list. We'll be in touch as soon as a spot becomes available.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-indigo-400 mt-1 shrink-0" />
              <p className="text-slate-200">
                <strong>We value quality over quantity.</strong> Each mentor in our network receives dedicated support and meaningful connections with entrepreneurs who are ready to grow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
