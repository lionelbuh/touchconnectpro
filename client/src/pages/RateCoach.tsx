import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

export default function RateCoach() {
  const [coachId, setCoachId] = useState("");
  const [coachName, setCoachName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("coachId");
    const name = params.get("coachName");
    const emailParam = params.get("email");
    
    if (id) setCoachId(id);
    if (name) setCoachName(decodeURIComponent(name));
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !coachId) {
      toast.error("Missing required information");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: coachId,
          raterEmail: email,
          rating: rating,
          review: review || null
        })
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Thank you! Your rating has been submitted.");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit rating");
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error("Error submitting rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {submitted ? (
          <Card className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
              <h2 className="text-2xl font-display font-bold text-emerald-900 dark:text-emerald-100 mb-3">
                Thank You!
              </h2>
              <p className="text-emerald-800 dark:text-emerald-300 mb-2">
                Your rating for {coachName} has been successfully submitted.
              </p>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                Your feedback helps us maintain quality coaching standards.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-cyan-200 dark:border-cyan-900/30">
            <CardHeader>
              <CardTitle className="text-3xl font-display text-center">Rate Your Coach</CardTitle>
            </CardHeader>
            <CardContent>
              {coachName && (
                <p className="text-center text-lg text-slate-600 dark:text-slate-400 mb-8">
                  How would you rate your experience with <span className="font-semibold text-slate-900 dark:text-white">{coachName}</span>?
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-4 block">Rating (1-5 stars) *</label>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                        data-testid={`button-rate-${star}`}
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Review */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Review (Optional)</label>
                  <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your feedback about this coach's expertise, communication, and value delivered..."
                    className="bg-slate-50 dark:bg-slate-800/50 min-h-[120px]"
                    data-testid="textarea-review"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Your feedback helps us maintain high quality standards</p>
                </div>

                {/* Email Confirmation */}
                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Rating submitted from:</span> {email || "Loading..."}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !coachId}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold h-10"
                  data-testid="button-submit-rating"
                >
                  {loading ? "Submitting..." : "Submit Rating"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
