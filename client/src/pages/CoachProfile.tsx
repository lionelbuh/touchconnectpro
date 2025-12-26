import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  GraduationCap, Star, ChevronLeft, Send, CreditCard, Loader2, 
  Share2, Copy, Check, ExternalLink, Calendar, MessageCircle, UserPlus
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
}

interface CoachRating {
  averageRating: number;
  totalRatings: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  entrepreneur_name: string;
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-12 text-center">
          <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Coach Not Found</h1>
          <p className="text-muted-foreground mb-6">This coach profile doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share-profile">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Share Profile"}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-32 md:h-40" />
          
          <div className="px-6 md:px-8 -mt-16 md:-mt-20 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-slate-900 shadow-xl">
                {coach.profile_image && (
                  <AvatarImage src={coach.profile_image} alt={coach.full_name} className="object-cover" />
                )}
                <AvatarFallback className="bg-purple-500 text-white text-3xl md:text-4xl">
                  {coach.full_name?.substring(0, 2).toUpperCase() || "CO"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pb-4 md:pb-6">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {coach.full_name}
                      {!canPurchase && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          Coming Soon
                        </Badge>
                      )}
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">{coach.expertise}</p>
                  </div>
                  
                  {rating && (
                    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{rating.averageRating}</span>
                      <span className="text-sm text-muted-foreground">({rating.totalRatings} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="px-6 md:px-8 py-6 space-y-6">
            {coach.bio && (
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{coach.bio}</p>
              </div>
            )}

            {focusAreas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {rates && rates.introCallRate && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Coaching Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className={`${canPurchase ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 opacity-75'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                        Intro Call
                      </CardTitle>
                      <CardDescription>30-minute discovery session</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600 mb-3">${rates.introCallRate}</p>
                      <Button 
                        className={`w-full ${canPurchase ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'}`}
                        disabled={!canPurchase}
                        data-testid="button-book-intro"
                      >
                        {canPurchase ? "Book Now" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className={`${canPurchase ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 opacity-75'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        Single Session
                      </CardTitle>
                      <CardDescription>1-hour coaching session</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600 mb-3">${rates.sessionRate}</p>
                      <Button 
                        className={`w-full ${canPurchase ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'}`}
                        disabled={!canPurchase}
                        data-testid="button-book-session"
                      >
                        {canPurchase ? "Book Now" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className={`${canPurchase ? 'border-purple-200 dark:border-purple-800 ring-2 ring-purple-200' : 'border-gray-200 opacity-75'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                          Monthly Package
                        </CardTitle>
                        {canPurchase && <Badge className="bg-purple-600">Best Value</Badge>}
                      </div>
                      <CardDescription>Full month of coaching</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-purple-600 mb-3">${rates.monthlyRate}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      <Button 
                        className={`w-full ${canPurchase ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'}`}
                        disabled={!canPurchase}
                        data-testid="button-book-monthly"
                      >
                        {canPurchase ? "Get Started" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  {canPurchase ? (
                    <>
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Secure checkout via Stripe. Book a session to get started.
                    </>
                  ) : (
                    <span className="text-amber-600">This coach is currently setting up their payment system. Check back soon!</span>
                  )}
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              {isLoggedIn ? (
                <Link href={`/contact-coach/${coach.id}`}>
                  <Button variant="outline" size="lg" className="w-full md:w-auto border-cyan-300 text-cyan-700 hover:bg-cyan-50" data-testid="button-contact-coach">
                    <Send className="mr-2 h-4 w-4" />
                    Send a Message
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full md:w-auto border-cyan-300 text-cyan-700 hover:bg-cyan-50" 
                  onClick={() => setShowRegisterDialog(true)}
                  data-testid="button-contact-coach"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send a Message
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                Join TouchConnectPro
              </DialogTitle>
              <DialogDescription>
                To contact this coach, you need to register as an entrepreneur on TouchConnectPro. It's free to join and takes just a minute.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                As a registered entrepreneur, you can:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-300">
                <li>Connect with expert coaches like {coach.full_name}</li>
                <li>Get matched with mentors for your startup</li>
                <li>Access AI-powered business planning tools</li>
                <li>Book coaching sessions and receive guidance</li>
              </ul>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                Maybe Later
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
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
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.entrepreneur_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">{review.comment}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">Want to grow your startup with a personal mentor and expert coaches?</p>
            <Link href="/become-entrepreneur">
              <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-become-entrepreneur">
                <UserPlus className="mr-2 h-4 w-4" />
                Join as an Entrepreneur
              </Button>
            </Link>
          </div>
          <div className="border-t pt-6">
            <p className="text-muted-foreground mb-4">Want to become a coach on TouchConnectPro?</p>
            <Link href="/become-coach">
              <Button variant="outline" data-testid="button-become-coach">
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
