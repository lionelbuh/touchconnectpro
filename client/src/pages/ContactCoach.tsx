import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { getSupabase } from "@/lib/supabase";

export default function ContactCoach() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/contact-coach/:coachId");
  const coachId = params?.coachId;
  
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [alreadyContacted, setAlreadyContacted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const supabase = await getSupabase();
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "");
          // Get user's name from entrepreneur_applications
          const { data: appData } = await supabase!
            .from("entrepreneur_applications")
            .select("full_name")
            .eq("email", user.email)
            .single();
          if (appData) {
            setUserName(appData.full_name);
          }
        }

        // Load coach data
        const coachRes = await fetch(`${API_BASE_URL}/api/coaches/approved`);
        if (coachRes.ok) {
          const coaches = await coachRes.json();
          const foundCoach = coaches.find((c: any) => c.id === coachId);
          setCoach(foundCoach);
        }

        // Check if already contacted
        if (user?.email && coachId) {
          const checkRes = await fetch(
            `${API_BASE_URL}/api/coach-contact-requests/check?entrepreneurEmail=${encodeURIComponent(user.email)}&coachId=${encodeURIComponent(coachId)}`
          );
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            setAlreadyContacted(checkData.hasContacted);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (coachId) {
      loadData();
    }
  }, [coachId]);

  const handleSend = async () => {
    if (!message.trim() || !coach || !userEmail) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-contact-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coach.id,
          coachName: coach.full_name,
          coachEmail: coach.email,
          entrepreneurEmail: userEmail,
          entrepreneurName: userName || userEmail,
          message: message.trim()
        })
      });

      if (response.ok) {
        setSent(true);
        toast.success("Message sent successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Coach Not Found</h2>
            <p className="text-muted-foreground mb-4">The coach you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => navigate("/dashboard/entrepreneur")} data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyContacted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Contacted</h2>
            <p className="text-muted-foreground mb-4">
              You have already sent a message to {coach.full_name}. 
              One-time messaging allows only one initial contact per coach.
            </p>
            <Button onClick={() => navigate("/dashboard/entrepreneur")} data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
            <p className="text-muted-foreground mb-4">
              Your message has been sent to {coach.full_name}. 
              They may send you one reply. You can view any responses in your dashboard.
            </p>
            <Button onClick={() => navigate("/dashboard/entrepreneur")} data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/entrepreneur")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan-600" />
              Contact {coach.full_name}
            </CardTitle>
            <CardDescription>
              Send a one-time message to introduce yourself
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>One-time messaging:</strong> You can send one initial message to this coach. 
                The coach may send one reply. After that, the conversation closes. 
                To continue working together, book their services through the platform.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Coach Info</h3>
              <p className="text-sm text-muted-foreground"><strong>Name:</strong> {coach.full_name}</p>
              <p className="text-sm text-muted-foreground"><strong>Focus:</strong> {coach.focus_areas}</p>
              {coach.bio && <p className="text-sm text-muted-foreground mt-2">{coach.bio}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 dark:text-white block mb-2">
                Your Message
              </label>
              <textarea
                rows={6}
                placeholder="Introduce yourself and explain what you'd like to discuss with this coach..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                data-testid="input-contact-message"
              />
            </div>

            {!userEmail && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Login Required:</strong> You need to be logged in as an entrepreneur to send a message.
                </p>
                <Button 
                  className="mt-2" 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                  data-testid="button-login"
                >
                  Go to Login
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/entrepreneur")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={handleSend}
                disabled={sending || !message.trim() || !userEmail}
                data-testid="button-send"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
