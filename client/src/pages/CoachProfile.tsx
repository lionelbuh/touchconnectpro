import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  GraduationCap, Star, ChevronLeft, Send, CreditCard, Loader2, 
  Share2, Copy, Check, ExternalLink, Calendar, MessageCircle, UserPlus, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

interface CoachData {
  id: string;
  full_name: string;
  email: string;
  expertise: string;
  bio: string;
  focus_areas: string;
  hourly_rate: string;
  profile_image: string | null;
  stripe_account_id: string | null;
  external_reputation?: {
    platform_name: string;
    average_rating: number;
    review_count: number;
    verified: boolean;
    verified_at?: string | null;
  } | null;
}

interface CoachRating {
  averageRating: number;
  totalRatings: number;
}

interface Review {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export default function CoachProfile() {
  const { coachId } = useParams<{ coachId: string }>();
  const [, navigate] = useLocation();
  const [coach, setCoach] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<CoachRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [copied, setCopied] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const profileData = localStorage.getItem("tcp_profileData");
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        if (profile.email) {
          setIsLoggedIn(true);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coaches/${coachId}`);
        if (response.ok) {
          const data = await response.json();
          setCoach(data);
        }
      } catch (error) {
        console.error("Error fetching coach:", error);
      }
      setLoading(false);
    };

    const fetchRating = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coach-ratings/${coachId}`);
        if (response.ok) {
          const data = await response.json();
          setRating(data);
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coach-ratings/${coachId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    if (coachId) {
      fetchCoach();
      fetchRating();
      fetchReviews();
    }
  }, [coachId]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: coach?.full_name ? `${coach.full_name} - Coach at TouchConnectPro` : "Coach Profile",
          text: coach?.bio || "Check out this amazing coach!",
          url: url,
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF9F7" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF6B5C" }} />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
        <div className="container mx-auto px-4 py-12 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-4" style={{ color: "#E8E8E8" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#0D566C" }}>Coach Not Found</h1>
          <p className="mb-6" style={{ color: "#8A8A8A" }}>This coach profile doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="rounded-full" style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canPurchase = !!coach.stripe_account_id;
  let rates = null;
  try {
    rates = JSON.parse(coach.hourly_rate);
  } catch {}

  const focusAreas = coach.focus_areas?.split(",").map(a => a.trim()).filter(a => a) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl"
            style={{ color: "#4A4A4A" }}
            data-testid="button-back-home"
            onClick={() => {
              const profileData = localStorage.getItem("tcp_profileData");
              if (profileData) {
                try {
                  const profile = JSON.parse(profileData);
                  if (profile.role === "entrepreneur") {
                    navigate("/dashboard-entrepreneur?tab=coaches");
                    return;
                  }
                } catch {}
              }
              navigate("/");
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-xl"
            style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
            data-testid="button-share-profile"
          >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Share Profile"}
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
          <div className="pt-8 pb-20 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0D566C 0%, #0a4557 100%)" }}>
            <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white/30 shadow-xl">
              {coach.profile_image && (
                <AvatarImage src={coach.profile_image} alt={coach.full_name} className="object-cover" />
              )}
              <AvatarFallback className="text-white text-3xl md:text-4xl" style={{ backgroundColor: "#FF6B5C" }}>
                {coach.full_name?.substring(0, 2).toUpperCase() || "CO"}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="px-6 md:px-8 py-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center justify-center gap-2" style={{ color: "#0D566C" }}>
                {coach.full_name}
                {!canPurchase && (
                  <Badge variant="secondary" style={{ backgroundColor: "rgba(245,197,66,0.15)", color: "#b8860b", borderColor: "rgba(245,197,66,0.3)" }}>
                    Coming Soon
                  </Badge>
                )}
              </h1>
              <p className="text-lg mt-1" style={{ color: "#8A8A8A" }}>{coach.expertise}</p>
              
              {rating && rating.totalRatings > 0 && (
                <button
                  onClick={() => {
                    const reviewsSection = document.getElementById('reviews-section');
                    if (reviewsSection) {
                      reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer mt-3"
                  style={{ backgroundColor: "rgba(245,197,66,0.1)" }}
                  data-testid="button-scroll-to-reviews"
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg" style={{ color: "#4A4A4A" }}>{rating.averageRating}</span>
                  <span className="text-sm underline" style={{ color: "#8A8A8A" }}>({rating.totalRatings} reviews)</span>
                </button>
              )}
            </div>
          </div>

          <CardContent className="px-6 md:px-8 py-6 space-y-6">
            {coach.bio && (
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "#0D566C" }}>About</h2>
                <p className="whitespace-pre-line" style={{ color: "#4A4A4A" }}>{coach.bio}</p>
              </div>
            )}

            {coach.external_reputation && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(245,197,66,0.08)", border: "1px solid rgba(245,197,66,0.25)" }}>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(coach.external_reputation!.average_rating)
                            ? "fill-amber-400 text-amber-400"
                            : i < coach.external_reputation!.average_rating
                            ? "fill-amber-200 text-amber-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg" style={{ color: "#4A4A4A" }}>{coach.external_reputation.average_rating}</span>
                    <span style={{ color: "#8A8A8A" }}>({coach.external_reputation.review_count} reviews)</span>
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: "#8A8A8A" }}>
                  Based on self-reported ratings from {coach.external_reputation.platform_name}
                </p>
                {coach.external_reputation.verified && (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Externally verified by TouchConnectPro
                    </span>
                  </div>
                )}
              </div>
            )}

            {focusAreas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: "#0D566C" }}>Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(13,86,108,0.1)", color: "#0D566C", borderColor: "rgba(13,86,108,0.2)" }}>
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {rates && rates.introCallRate && (
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: "#0D566C" }}>Coaching Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <a href="https://www.touchconnectpro.com/founder-focus" className="block">
                    <Card className="rounded-2xl hover:shadow-lg transition-all cursor-pointer" style={{ borderColor: "#E8E8E8", backgroundColor: "#FFFFFF" }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: "#0D566C" }}>
                          <MessageCircle className="h-4 w-4" style={{ color: "#FF6B5C" }} />
                          Intro Call
                        </CardTitle>
                        <CardDescription style={{ color: "#8A8A8A" }}>30-minute discovery session</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-3" style={{ color: "#FF6B5C" }}>${rates.introCallRate}</p>
                        <Button 
                          className="w-full rounded-full"
                          style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                          data-testid="button-book-intro"
                          asChild
                        >
                          <span>Get Started</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </a>

                  <a href="https://www.touchconnectpro.com/founder-focus" className="block">
                    <Card className="rounded-2xl hover:shadow-lg transition-all cursor-pointer" style={{ borderColor: "#E8E8E8", backgroundColor: "#FFFFFF" }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2" style={{ color: "#0D566C" }}>
                          <Calendar className="h-4 w-4" style={{ color: "#FF6B5C" }} />
                          Single Session
                        </CardTitle>
                        <CardDescription style={{ color: "#8A8A8A" }}>1-hour coaching session</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-3" style={{ color: "#FF6B5C" }}>${rates.sessionRate}</p>
                        <Button 
                          className="w-full rounded-full"
                          style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                          data-testid="button-book-session"
                          asChild
                        >
                          <span>Get Started</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </a>

                  <a href="https://www.touchconnectpro.com/founder-focus" className="block">
                    <Card className="rounded-2xl hover:shadow-lg transition-all cursor-pointer" style={{ borderColor: "#0D566C", backgroundColor: "#FFFFFF", boxShadow: "0 0 0 2px rgba(13,86,108,0.15)" }}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2" style={{ color: "#0D566C" }}>
                            <GraduationCap className="h-4 w-4" style={{ color: "#FF6B5C" }} />
                            Monthly Coaching Retainer
                          </CardTitle>
                          <Badge className="rounded-full" style={{ backgroundColor: "#0D566C", color: "#FFFFFF" }}>Best Value</Badge>
                        </div>
                        <CardDescription style={{ color: "#8A8A8A" }}>Monthly fee for ongoing coaching across multiple sessions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold mb-2" style={{ color: "#FF6B5C" }}>${rates.monthlyRate}<span className="text-sm font-normal" style={{ color: "#8A8A8A" }}>/mo</span></p>
                        {rates.monthlyRetainerDescription && (
                          <p className="text-sm mb-3 p-2 rounded-lg" style={{ color: "#4A4A4A", backgroundColor: "rgba(13,86,108,0.05)" }}>{rates.monthlyRetainerDescription}</p>
                        )}
                        <Button 
                          className="w-full rounded-full"
                          style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                          data-testid="button-book-monthly"
                          asChild
                        >
                          <span>Get Started</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </a>
                </div>
                
                <p className="text-sm text-center mt-4" style={{ color: "#8A8A8A" }}>
                  <ArrowRight className="inline h-4 w-4 mr-1" />
                  <a href="https://www.touchconnectpro.com/founder-focus" className="hover:underline" style={{ color: "#FF6B5C" }}>Take the free Founder Focus Score</a> to get started and unlock coaching sessions.
                </p>
              </div>
            )}

            <div className="pt-4" style={{ borderTop: "1px solid #E8E8E8" }}>
              <a href="https://www.touchconnectpro.com/founder-focus">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto rounded-full"
                  style={{ borderColor: "#0D566C", color: "#0D566C" }}
                  data-testid="button-contact-coach"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send a Message
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" style={{ color: "#0D566C" }}>
                <UserPlus className="h-5 w-5" style={{ color: "#FF6B5C" }} />
                Join TouchConnectPro
              </DialogTitle>
              <DialogDescription style={{ color: "#8A8A8A" }}>
                To contact this coach, you need to register as an entrepreneur on TouchConnectPro. It's free to join and takes just a minute.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm" style={{ color: "#8A8A8A" }}>
                As a registered entrepreneur, you can:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "#4A4A4A" }}>
                <li>Connect with expert coaches like {coach.full_name}</li>
                <li>Get matched with mentors for your startup</li>
                <li>Access AI-powered business planning tools</li>
                <li>Book coaching sessions and receive guidance</li>
              </ul>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                style={{ borderColor: "#E8E8E8", color: "#4A4A4A" }}
                onClick={() => setShowRegisterDialog(false)}
              >
                Maybe Later
              </Button>
              <Button 
                className="rounded-full"
                style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }}
                onClick={() => navigate("/become-entrepreneur")}
                data-testid="button-register-entrepreneur"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register as Entrepreneur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {reviews.length > 0 && (
          <Card className="mt-6 rounded-2xl" id="reviews-section" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E8E8", boxShadow: "0 2px 12px rgba(224,224,224,0.6)" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: "#0D566C" }}>
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="last:border-0 pb-4 last:pb-0" style={{ borderBottom: "1px solid #E8E8E8" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: "#8A8A8A" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review && (
                    <p className="text-sm" style={{ color: "#4A4A4A" }}>{review.review}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center space-y-6">
          <div>
            <p className="mb-4" style={{ color: "#8A8A8A" }}>Want to grow your startup with a personal mentor and expert coaches?</p>
            <Link href="/become-entrepreneur">
              <Button className="rounded-full" style={{ backgroundColor: "#FF6B5C", color: "#FFFFFF", border: "none" }} data-testid="button-become-entrepreneur">
                <UserPlus className="mr-2 h-4 w-4" />
                Join as an Entrepreneur
              </Button>
            </Link>
          </div>
          <div className="pt-6" style={{ borderTop: "1px solid #E8E8E8" }}>
            <p className="mb-4" style={{ color: "#8A8A8A" }}>Want to become a coach on TouchConnectPro?</p>
            <Link href="/become-coach">
              <Button variant="outline" className="rounded-xl" style={{ borderColor: "#0D566C", color: "#0D566C" }} data-testid="button-become-coach">
                <GraduationCap className="mr-2 h-4 w-4" />
                Apply to Become a Coach
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
