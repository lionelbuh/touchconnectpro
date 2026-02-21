import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LayoutDashboard, Lightbulb, Target, Users, MessageSquare, Settings, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, CheckCircle, AlertCircle, User, LogOut, GraduationCap, Calendar, Send, ExternalLink, ClipboardList, BookOpen, RefreshCw, Star, Loader2, Paperclip, Download, FileText, Reply, ShoppingCart, CreditCard, X, Rocket, BarChart3, HelpCircle, Circle } from "lucide-react";
import { DashboardMobileNav, NavTab } from "@/components/DashboardNav";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import { ENTREPRENEUR_CONTRACT, ENTREPRENEUR_CONTRACT_VERSION } from "@/lib/contracts";
import { BLOCKER_INFO, type Category } from "@/lib/founderFocusData";

// Helper to format UTC timestamps from database to PST
const formatToPST = (timestamp: string | Date) => {
 if (!timestamp) return "—";
 let dateStr = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
 // If timestamp doesn't have timezone info, treat it as UTC
 if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
  dateStr = dateStr.replace(' ', 'T') + 'Z';
 }
 return new Date(dateStr).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) + " PST";
};

export default function DashboardEntrepreneur() {
 const [, navigate] = useLocation();
 const [currentStep, setCurrentStep] = useState(0);
 const [showReview, setShowReview] = useState(false);
 const [showAIReview, setShowAIReview] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [showSuccessPage, setShowSuccessPage] = useState(false);
 const [validationError, setValidationError] = useState("");
 const [aiEnhancedData, setAiEnhancedData] = useState<any>(null);
 const [activeTab, setActiveTab] = useState<"overview" | "coaches" | "idea" | "plan" | "profile" | "notes" | "messages" | "meetings" | "purchases" | "ask-mentor">("overview");
 
 // Read tab from URL query params on mount (preserve other params like payment=success)
 useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");
  if (tabParam && ["overview", "coaches", "idea", "plan", "profile", "notes", "messages", "meetings", "purchases", "ask-mentor"].includes(tabParam)) {
   setActiveTab(tabParam as any);
   // Remove only the tab param, preserve others (like payment=success)
   urlParams.delete("tab");
   const newSearch = urlParams.toString();
   window.history.replaceState({}, '', window.location.pathname + (newSearch ? '?' + newSearch : ''));
  }
 }, []);
 
 const [approvedCoaches, setApprovedCoaches] = useState<any[]>([]);
 const [shuffledCoaches, setShuffledCoaches] = useState<any[]>([]);
 const [coachPurchases, setCoachPurchases] = useState<any[]>([]);
 const [loadingPurchases, setLoadingPurchases] = useState(false);
 const [coachRatings, setCoachRatings] = useState<Record<string, { averageRating: number; totalRatings: number }>>({});
 const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
 
 // Shuffle coaches when they are loaded to show different order each session
 useEffect(() => {
  if (approvedCoaches.length > 0) {
   const shuffled = [...approvedCoaches].sort(() => Math.random() - 0.5);
   setShuffledCoaches(shuffled);
  }
 }, [approvedCoaches]);
 const [showReviewsModal, setShowReviewsModal] = useState(false);
 const [selectedCoachForReviews, setSelectedCoachForReviews] = useState<any>(null);
 const [coachReviews, setCoachReviews] = useState<any[]>([]);
 const [mentorData, setMentorData] = useState<any>(null);
 const [mentorNotes, setMentorNotes] = useState<any[]>([]);
 const [messages, setMessages] = useState<any[]>([]);
 const [newMessage, setNewMessage] = useState("");
 const [mentorQuestions, setMentorQuestions] = useState<any[]>([]);
 const [newMentorQuestion, setNewMentorQuestion] = useState("");
 const [sendingMentorQuestion, setSendingMentorQuestion] = useState(false);
 const [showUpgradeAgreement, setShowUpgradeAgreement] = useState(false);
 const [agreedToUpgradeContract, setAgreedToUpgradeContract] = useState(false);
 const [showUpgradeContractText, setShowUpgradeContractText] = useState(false);
 const [adminMessageText, setAdminMessageText] = useState("");
 const [entrepreneurReadMessageIds, setEntrepreneurReadMessageIds] = useState<number[]>([]);
 const [meetings, setMeetings] = useState<any[]>([]);
 const [entrepreneurData, setEntrepreneurData] = useState<any>(null);
 const [isLoadingData, setIsLoadingData] = useState(true);
 const [userEmail, setUserEmail] = useState<string>("");
 const [isAccountDisabled, setIsAccountDisabled] = useState(false);
 const [isPreApproved, setIsPreApproved] = useState(false);
 const [hasPaid, setHasPaid] = useState(false);
 const [savingProfile, setSavingProfile] = useState(false);
 const [isSubscribing, setIsSubscribing] = useState(false);
 const [isGeneratingAI, setIsGeneratingAI] = useState(false);
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [isCancelling, setIsCancelling] = useState(false);
 const [hasPendingCancellation, setHasPendingCancellation] = useState(false);
 const [hasProcessedCancellation, setHasProcessedCancellation] = useState(false);
 const [needsIntakeData, setNeedsIntakeData] = useState<{ needs: string[]; message: string; completedAt?: string } | null>(null);
 const [needsSelected, setNeedsSelected] = useState<string[]>([]);
 const [needsMessage, setNeedsMessage] = useState("");
 const [needsOtherText, setNeedsOtherText] = useState("");
 const [savingNeeds, setSavingNeeds] = useState(false);
 const [founderSnapshot, setFounderSnapshot] = useState<any>(null);
 const [snapshotSummary, setSnapshotSummary] = useState<any>(null);
 const [showSnapshotForm, setShowSnapshotForm] = useState(false);
 const [snapshotAnswers, setSnapshotAnswers] = useState({
  building: "",
  stage: "",
  targetCustomer: "",
  biggestBlocker: "",
  blockerOther: "",
  traction: "",
  ninetyDayGoal: ""
 });
 const [savingSnapshot, setSavingSnapshot] = useState(false);
 const [businessPlanData, setBusinessPlanData] = useState<any>({
  executiveSummary: "",
  problemStatement: "",
  solution: "",
  targetMarket: "",
  marketSize: "",
  revenue: "",
  competitiveAdvantage: "",
  roadmap: "",
  fundingNeeds: "",
  risks: "",
  success: ""
 });
 const [profileData, setProfileData] = useState({
  email: "entrepreneur@touchconnectpro.com",
  fullName: "John Entrepreneur",
  country: "United States",
  bio: "",
  linkedIn: "",
  website: "",
  profileImage: null as string | null
 });
 const [isEditingProfile, setIsEditingProfile] = useState(false);
 const [isEditingPlan, setIsEditingPlan] = useState(false);
 const [showAllOverviewNotes, setShowAllOverviewNotes] = useState(false);
 const [showAllOverviewMessages, setShowAllOverviewMessages] = useState(false);
 const [noteResponses, setNoteResponses] = useState<Record<string, string>>({});
 const [noteAttachments, setNoteAttachments] = useState<Record<string, File | null>>({});
 const [submittingNoteId, setSubmittingNoteId] = useState<string | null>(null);
 const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
 const [mentorAssignmentId, setMentorAssignmentId] = useState<string | null>(null);
 const [purchasingCoach, setPurchasingCoach] = useState<{ coachId: string; serviceType: string } | null>(null);
 
 // Message threads state (threaded conversations with mentor)
 const [messageThreads, setMessageThreads] = useState<any[]>([]);
 const [expandedThreadId, setExpandedThreadId] = useState<number | null>(null);
 const [newThreadSubject, setNewThreadSubject] = useState("");
 const [newThreadMessage, setNewThreadMessage] = useState("");
 const [threadReplyText, setThreadReplyText] = useState<Record<number, string>>({});
 const [showNewThreadForm, setShowNewThreadForm] = useState(false);
 const [newThreadAttachments, setNewThreadAttachments] = useState<{name: string; type: string; url: string}[]>([]);
 const [threadReplyAttachments, setThreadReplyAttachments] = useState<Record<number, {name: string; type: string; url: string}[]>>({});
 const [uploadingFile, setUploadingFile] = useState(false);
 const [readThreadEntryCounts, setReadThreadEntryCounts] = useState<Record<string, number>>({});
 
 // One-time contact request state
 const [showContactModal, setShowContactModal] = useState(false);
 const [selectedCoachForContact, setSelectedCoachForContact] = useState<any>(null);
 const [contactMessage, setContactMessage] = useState("");
 const [sendingContact, setSendingContact] = useState(false);
 const [contactedCoaches, setContactedCoaches] = useState<Record<string, { status: string; reply?: string }>>({});
 const [myContactRequests, setMyContactRequests] = useState<any[]>([]);
 
 // Debug: Log when contact modal state changes
 useEffect(() => {
  console.log("[Contact Modal] State changed - showContactModal:", showContactModal, "selectedCoach:", selectedCoachForContact?.id);
 }, [showContactModal, selectedCoachForContact]);

 // Load contact requests for the entrepreneur
 const loadContactRequests = async () => {
  if (!userEmail) return;
  try {
   const response = await fetch(`${API_BASE_URL}/api/entrepreneurs/${encodeURIComponent(userEmail)}/contact-requests`);
   if (response.ok) {
    const data = await response.json();
    setMyContactRequests(data.requests || []);
    // Build a map of contacted coaches for quick lookup
    const contactMap: Record<string, { status: string; reply?: string }> = {};
    (data.requests || []).forEach((req: any) => {
     contactMap[req.coach_id] = { status: req.status, reply: req.reply };
    });
    setContactedCoaches(contactMap);
   }
  } catch (err) {
   console.error("Error loading contact requests:", err);
  }
 };

 const handleSendContactRequest = async () => {
  if (!selectedCoachForContact || !contactMessage.trim()) return;
  
  setSendingContact(true);
  try {
   const response = await fetch(`${API_BASE_URL}/api/coach-contact-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     coachId: selectedCoachForContact.id,
     coachName: selectedCoachForContact.full_name,
     coachEmail: selectedCoachForContact.email,
     entrepreneurEmail: userEmail,
     entrepreneurName: profileData.fullName,
     message: contactMessage.trim()
    })
   });
   
   if (response.ok) {
    toast.success("Message sent! The coach will receive your contact request.");
    setShowContactModal(false);
    setContactMessage("");
    setSelectedCoachForContact(null);
    // Reload contact requests to update UI
    loadContactRequests();
   } else {
    const data = await response.json();
    toast.error(data.error || "Failed to send message");
   }
  } catch (err) {
   console.error("Error sending contact request:", err);
   toast.error("Failed to send message");
  } finally {
   setSendingContact(false);
  }
 };
 
 const handleCoachPurchase = async (coachId: string, serviceType: 'intro' | 'session' | 'monthly', coachName: string) => {
  if (!userEmail) {
   toast.error("Please log in to purchase coaching services");
   return;
  }
  
  setPurchasingCoach({ coachId, serviceType });
  try {
   const response = await fetch(`${API_BASE_URL}/api/stripe/connect/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     coachId,
     serviceType,
     entrepreneurEmail: userEmail,
     entrepreneurName: profileData.fullName
    })
   });
   
   if (response.ok) {
    const data = await response.json();
    if (data.url) {
     window.location.href = data.url;
    } else {
     toast.error("Could not get checkout link");
    }
   } else {
    const error = await response.json();
    if (error.message?.includes("not completed Stripe onboarding")) {
     toast.error(`${coachName} hasn't set up payment processing yet. Please try another coach.`);
    } else {
     toast.error(error.error || "Failed to start checkout");
    }
   }
  } catch (error) {
   console.error("Checkout error:", error);
   toast.error("Error starting checkout");
  } finally {
   setPurchasingCoach(null);
  }
 };
 
 const [formData, setFormData] = useState({
  // Questions 1-4: Problem & Idea
  problem: "",
  whoExperiences: "",
  problemImportance: "",
  currentSolutions: "",
  // Questions 5-7: Your Solution
  ideaName: "",
  ideaDescription: "",
  valueProposition: "",
  // Questions 8-11: Market & Customer
  idealCustomer: "",
  targetMarket: "",
  marketSize: "",
  customerReach: "",
  // Questions 12-17: Traction & Validation
  hasCustomers: "",
  customerCount: "",
  hasRevenue: "",
  revenueAmount: "",
  revenueRecurring: "",
  productUsage: "",
  // Questions 18-21: Business Model
  monetization: "",
  pricing: "",
  mainCosts: "",
  successIn12Months: "",
  // Questions 22-24: Competition
  directCompetitors: "",
  competitorStrengths: "",
  competitorWeakness: "",
  // Questions 25-28: Development Stage
  currentStage: "",
  hasDemo: "",
  existingFeatures: "",
  featuresToBuild: "",
  // Questions 29-33: Founder Profile (LinkedIn collected in Step 0)
  foundedBefore: "",
  soloOrCoFounders: "",
  personalSkills: "",
  missingSkills: "",
  timePerWeek: "",
  // Questions 34-38: Funding
  personalInvestment: "",
  externalFunding: "",
  fundingNeeded: "",
  fundingUseCase: "",
  investorType: "",
  // Questions 39-42: Next Steps & Help Needed
  nextSteps: "",
  currentObstacle: "",
  mentorHelp: "",
  technicalExpertHelp: ""
 });

 useEffect(() => {
  const savedUserEmail = localStorage.getItem("tcp_userEmail");
  const savedReadMessageIds = localStorage.getItem("tcp_entrepreneurReadMessageIds");
  const savedThreadCounts = localStorage.getItem("tcp_entrepreneurReadThreadEntryCounts");

  if (savedReadMessageIds) setEntrepreneurReadMessageIds(JSON.parse(savedReadMessageIds));
  if (savedThreadCounts) setReadThreadEntryCounts(JSON.parse(savedThreadCounts));

  if (savedUserEmail) {
   const savedFormData = localStorage.getItem("tcp_formData");
   const savedBusinessPlan = localStorage.getItem("tcp_businessPlan");
   const savedProfile = localStorage.getItem("tcp_profileData");
   const savedSubmitted = localStorage.getItem("tcp_submitted");
   if (savedFormData) setFormData(JSON.parse(savedFormData));
   if (savedBusinessPlan) setBusinessPlanData(JSON.parse(savedBusinessPlan));
   if (savedProfile) setProfileData(JSON.parse(savedProfile));
   if (savedSubmitted) setSubmitted(JSON.parse(savedSubmitted));
  }
  
  // Messages will be loaded from database after user email is available
  
  const params = new URLSearchParams(window.location.search);
  if (params.get("submitted") === "true") {
   setSubmitted(true);
   localStorage.setItem("tcp_submitted", "true");
   window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  if (params.get("payment") === "success") {
   const pendingEmail = localStorage.getItem("tcp_pendingPaymentEmail");
   if (pendingEmail) {
    console.log("[DASHBOARD] Payment success with pending email:", pendingEmail);
    fetch(`${API_BASE_URL}/api/stripe/confirm-payment`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ entrepreneurEmail: pendingEmail })
    })
     .then(res => res.json())
     .then(data => {
      console.log("[DASHBOARD] Payment confirmation result:", data);
      if (data.success) {
       toast.success("Payment successful! Your membership is now active.");
       localStorage.removeItem("tcp_pendingPaymentEmail");
       window.location.reload();
      }
     })
     .catch(err => console.error("[DASHBOARD] Payment confirmation error:", err));
   }
   window.history.replaceState({}, document.title, window.location.pathname);
  } else if (params.get("payment") === "cancelled") {
   localStorage.removeItem("tcp_pendingPaymentEmail");
   toast.info("Payment was cancelled. You can try again anytime.");
   window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Get user email from Supabase auth
  const fetchUserData = async () => {
   setIsLoadingData(true);
   try {
    // Debug: Check if auth tokens exist in localStorage
    const authKeys = Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'));
    console.log("[DASHBOARD] Auth keys in localStorage:", authKeys);
    
    const supabase = await getSupabase();
    if (!supabase) {
     console.error("[DASHBOARD] Supabase client not available");
     setIsLoadingData(false);
     return;
    }
    
    console.log("[DASHBOARD] Supabase client ready, checking session...");
    
    // First try to get session from localStorage (faster, more reliable)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("[DASHBOARD] getSession result:", { 
     hasSession: !!session, 
     hasUser: !!session?.user,
     userEmail: session?.user?.email,
     accessTokenLength: session?.access_token?.length,
     expiresAt: session?.expires_at,
     error: sessionError?.message 
    });
    
    let user = session?.user || null;
    
    // If no session, try getUser() as fallback (network call to validate)
    if (!user) {
     console.log("[DASHBOARD] No user from session, trying getUser()...");
     const { data: userData, error: userError } = await supabase.auth.getUser();
     console.log("[DASHBOARD] getUser result:", { 
      hasUser: !!userData.user, 
      userEmail: userData.user?.email,
      error: userError?.message 
     });
     user = userData.user || null;
    }
    
    if (user?.email) {
     console.log("[DASHBOARD] User found:", user.email);
     setUserEmail(user.email);
     
     // Check if returning from successful payment
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.get("payment") === "success") {
      console.log("[DASHBOARD] Payment success detected, confirming payment...");
      try {
       const confirmResponse = await fetch(`${API_BASE_URL}/api/stripe/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entrepreneurEmail: user.email })
       });
       const confirmData = await confirmResponse.json();
       console.log("[DASHBOARD] Payment confirmation result:", confirmData);
       if (confirmData.success) {
        toast.success("Payment successful! Your membership is now active.");
       }
      } catch (error) {
       console.error("[DASHBOARD] Error confirming payment:", error);
      }
     }
     
     // Fetch entrepreneur data from API
     const response = await fetch(`${API_BASE_URL}/api/entrepreneur/${encodeURIComponent(user.email)}`);
     if (response.ok) {
      const data = await response.json();
      console.log("[DASHBOARD] Entrepreneur data received:", {
       linkedin_profile: data.linkedin_profile,
       data_linkedinWebsite: data.data?.linkedinWebsite,
       data_website: data.data?.website,
       hasData: !!data.data
      });
      setEntrepreneurData(data);
      
      // Check if account is disabled
      setIsAccountDisabled(data.is_disabled === true);
      setIsPreApproved(data.status === "pre-approved");
      setHasPaid(data.payment_status === "paid");

      // Clear stale localStorage if different user
      const previousUser = localStorage.getItem("tcp_userEmail");
      if (previousUser && previousUser !== user.email) {
       localStorage.removeItem("tcp_formData");
       localStorage.removeItem("tcp_businessPlan");
       localStorage.removeItem("tcp_profileData");
       localStorage.removeItem("tcp_submitted");
      }
      localStorage.setItem("tcp_userEmail", user.email);
      
      // Set form data from application - fully replace to avoid stale data
      if (data.data && Object.keys(data.data).length > 0) {
       setFormData(prev => {
        const reset = Object.fromEntries(Object.keys(prev).map(k => [k, ""]));
        return { ...reset, ...data.data };
       });
      } else {
       setFormData(prev => Object.fromEntries(Object.keys(prev).map(k => [k, ""])) as typeof prev);
      }
      
      // Set business plan from application
      if (data.business_plan && Object.keys(data.business_plan).length > 0) {
       setBusinessPlanData(data.business_plan);
      } else {
       setBusinessPlanData({});
      }
      
      // Set profile data (including bio from application fullBio)
      // Note: LinkedIn can be in linkedin_profile column OR data.linkedin field
      setProfileData(prev => ({
       ...prev,
       fullName: data.entrepreneur_name || prev.fullName,
       email: data.entrepreneur_email || prev.email,
       linkedIn: data.data?.linkedin || prev.linkedIn,
       website: data.data?.website || prev.website,
       bio: data.data?.fullBio || data.data?.bio || prev.bio,
       country: data.data?.country || prev.country,
       profileImage: data.data?.profileImage || prev.profileImage
      }));
      
      // Load needs intake data
      if (data.data?.needsIntake) {
       setNeedsIntakeData(data.data.needsIntake);
      }
      // Load founder snapshot data
      if (data.data?.founderSnapshot) {
       setFounderSnapshot(data.data.founderSnapshot);
      }
      // Load snapshot summary
      if (data.data?.snapshotSummary) {
       setSnapshotSummary(data.data.snapshotSummary);
      }

      // Set mentor data if assigned
      if (data.mentorAssignment) {
       setMentorData(data.mentorAssignment);
       setMentorAssignmentId(data.mentorAssignment.id || null);
      }
      
      // Set mentor notes
      if (data.mentorNotes) {
       setMentorNotes(data.mentorNotes);
      }
      
      // Mark as submitted if we have data
      if (data.id) {
       setSubmitted(true);
       
       // Fetch messages using the entrepreneur's email
       const entrepreneurEmail = data.entrepreneur_email || user.email;
       if (entrepreneurEmail) {
        const messagesResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(entrepreneurEmail)}`);
        if (messagesResponse.ok) {
         const messagesData = await messagesResponse.json();
         setMessages(messagesData.messages || []);
        }
       }
      }
     }
    } else {
     console.log("[DASHBOARD] No user found, checking localStorage fallback");
     // Fallback to localStorage for profile data
     const storedProfile = localStorage.getItem("tcp_profileData");
     if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserEmail(profile.email);
      
      // Also fetch entrepreneur data from API using the stored email
      if (profile.email) {
       const response = await fetch(`${API_BASE_URL}/api/entrepreneur/${encodeURIComponent(profile.email)}`);
       if (response.ok) {
        const data = await response.json();
        console.log("[DASHBOARD] Entrepreneur data received (localStorage fallback):", {
         linkedin_profile: data.linkedin_profile,
         data_linkedinWebsite: data.data?.linkedinWebsite,
         data_website: data.data?.website,
         hasData: !!data.data
        });
        setEntrepreneurData(data);
        
        // Check if account is disabled
        setIsAccountDisabled(data.is_disabled === true);
        setIsPreApproved(data.status === "pre-approved");
        setHasPaid(data.payment_status === "paid");

        // Clear stale localStorage if different user
        const prevUser = localStorage.getItem("tcp_userEmail");
        if (prevUser && prevUser !== profile.email) {
         localStorage.removeItem("tcp_formData");
         localStorage.removeItem("tcp_businessPlan");
         localStorage.removeItem("tcp_profileData");
         localStorage.removeItem("tcp_submitted");
        }
        localStorage.setItem("tcp_userEmail", profile.email);
        
        // Set form data from application - fully replace to avoid stale data
        if (data.data && Object.keys(data.data).length > 0) {
         setFormData(prev => {
          const reset = Object.fromEntries(Object.keys(prev).map(k => [k, ""]));
          return { ...reset, ...data.data };
         });
        } else {
         setFormData(prev => Object.fromEntries(Object.keys(prev).map(k => [k, ""])) as typeof prev);
        }
        
        // Set business plan from application
        if (data.business_plan && Object.keys(data.business_plan).length > 0) {
         setBusinessPlanData(data.business_plan);
        } else {
         setBusinessPlanData({});
        }
        
        // Update profile data with fresh API data
        // Note: LinkedIn can be in linkedin_profile column OR data.linkedin field
        setProfileData(prev => ({
         ...prev,
         fullName: data.entrepreneur_name || prev.fullName,
         email: data.entrepreneur_email || prev.email,
         linkedIn: data.data?.linkedin || prev.linkedIn,
         website: data.data?.website || prev.website,
         bio: data.data?.fullBio || data.data?.bio || prev.bio,
         country: data.data?.country || prev.country,
         profileImage: data.data?.profileImage || prev.profileImage
        }));
        
        // Set mentor data if assigned
        if (data.mentorAssignment) {
         setMentorData(data.mentorAssignment);
         setMentorAssignmentId(data.mentorAssignment.id || null);
        }
        
        // Set mentor notes
        if (data.mentorNotes) {
         setMentorNotes(data.mentorNotes);
        }
        
        // Mark as submitted if we have data
        if (data.id) {
         setSubmitted(true);
         
         // Fetch messages using the entrepreneur's email
         const entrepreneurEmail = data.entrepreneur_email || profile.email;
         if (entrepreneurEmail) {
          const messagesResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(entrepreneurEmail)}`);
          if (messagesResponse.ok) {
           const messagesData = await messagesResponse.json();
           setMessages(messagesData.messages || []);
          }
         }
        }
       }
      }
     }
    }
    
    // Fetch approved coaches
    console.log("[DashboardEntrepreneur] Fetching approved coaches...");
    const coachesResponse = await fetch(`${API_BASE_URL}/api/coaches/approved`);
    console.log("[DashboardEntrepreneur] Coaches response status:", coachesResponse.status);
    if (coachesResponse.ok) {
     const coachesData = await coachesResponse.json();
     console.log("[DashboardEntrepreneur] Coaches data received:", coachesData.length, "coaches");
     setApprovedCoaches(coachesData);
    } else {
     console.error("[DashboardEntrepreneur] Failed to fetch coaches:", coachesResponse.status);
    }
    
    // Fetch coach ratings
    const ratingsResponse = await fetch(`${API_BASE_URL}/api/coach-ratings`);
    if (ratingsResponse.ok) {
     const ratingsData = await ratingsResponse.json();
     setCoachRatings(ratingsData);
    }
   } catch (error) {
    console.error("Error fetching user data:", error);
   } finally {
    setIsLoadingData(false);
   }
  };

  fetchUserData();
 }, []);

 // Load meetings for entrepreneur
 useEffect(() => {
  if (!userEmail) {
   console.log("[DashboardEntrepreneur] No userEmail yet, skipping meetings load");
   return;
  }
  async function loadMeetings() {
   console.log("[DashboardEntrepreneur] Loading meetings for:", userEmail);
   try {
    const response = await fetch(`${API_BASE_URL}/api/entrepreneur/meetings/${encodeURIComponent(userEmail)}`);
    console.log("[DashboardEntrepreneur] Meetings API response status:", response.status);
    if (response.ok) {
     const data = await response.json();
     console.log("[DashboardEntrepreneur] Meetings data received:", data);
     setMeetings(data.meetings || []);
    } else {
     console.error("[DashboardEntrepreneur] Meetings API failed:", response.status);
    }
   } catch (error) {
    console.error("Error loading meetings:", error);
   }
  }
  loadMeetings();
 }, [userEmail]);

 // Check if entrepreneur has a pending cancellation request
 useEffect(() => {
  async function checkCancellation() {
   if (!userEmail) return;
   try {
    const response = await fetch(`${API_BASE_URL}/api/cancellation-status/${encodeURIComponent(userEmail)}`);
    if (response.ok) {
     const data = await response.json();
     setHasPendingCancellation(data.hasPendingCancellation);
     setHasProcessedCancellation(data.hasProcessedCancellation);
    }
   } catch (error) {
    console.error("Error checking cancellation status:", error);
   }
  }
  checkCancellation();
 }, [userEmail]);

 // Load coach contact requests
 useEffect(() => {
  if (userEmail) {
   loadContactRequests();
  }
 }, [userEmail]);

 // Debug: Log coaches state when it changes
 useEffect(() => {
  console.log("[COACHES STATE] approvedCoaches:", approvedCoaches.length, "isAccountDisabled:", isAccountDisabled, "isPreApproved:", isPreApproved);
 }, [approvedCoaches, isAccountDisabled, isPreApproved]);

 // Load coach purchases
 useEffect(() => {
  async function loadPurchases() {
   if (!userEmail) return;
   setLoadingPurchases(true);
   try {
    const response = await fetch(`${API_BASE_URL}/api/entrepreneurs/${encodeURIComponent(userEmail)}/coach-purchases`);
    if (response.ok) {
     const data = await response.json();
     setCoachPurchases(data.purchases || []);
    }
   } catch (error) {
    console.error("Error loading purchases:", error);
   } finally {
    setLoadingPurchases(false);
   }
  }
  loadPurchases();
 }, [userEmail]);

 useEffect(() => {
  try {
   localStorage.setItem("tcp_formData", JSON.stringify(formData));
  } catch (e) {
   console.warn("Could not save form data to localStorage - storage may be full");
  }
 }, [formData]);

 useEffect(() => {
  try {
   localStorage.setItem("tcp_businessPlan", JSON.stringify(businessPlanData));
  } catch (e) {
   console.warn("Could not save business plan to localStorage - storage may be full");
  }
 }, [businessPlanData]);

 useEffect(() => {
  try {
   const dataToSave = { ...profileData };
   if (dataToSave.profileImage && dataToSave.profileImage.length > 100000) {
    dataToSave.profileImage = null;
   }
   localStorage.setItem("tcp_profileData", JSON.stringify(dataToSave));
  } catch (e) {
   console.warn("Could not save profile data to localStorage - storage may be full");
  }
 }, [profileData]);

 // Load messages from database
 useEffect(() => {
  async function loadMessages() {
   if (!userEmail) return;
   try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
    if (response.ok) {
     const data = await response.json();
     setMessages(data.messages || []);
    }
   } catch (error) {
    console.error("Error loading messages:", error);
   }
  }
  loadMessages();

  async function loadMentorQuestions() {
   if (!userEmail) return;
   try {
    const response = await fetch(`${API_BASE_URL}/api/mentor-questions/entrepreneur/${encodeURIComponent(userEmail)}`);
    if (response.ok) {
     const data = await response.json();
     setMentorQuestions(data.questions || []);
    }
   } catch (error) {
    console.error("Error loading mentor questions:", error);
   }
  }
  loadMentorQuestions();
 }, [userEmail]);

 const unreadMentorAnswers = mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length;
 useEffect(() => {
  if (activeTab === "ask-mentor" && userEmail && unreadMentorAnswers > 0) {
   fetch(`${API_BASE_URL}/api/mentor-questions/mark-read-entrepreneur/${encodeURIComponent(userEmail)}`, { method: "PATCH" })
    .then(() => {
     setMentorQuestions(prev => prev.map(q => q.status === "answered" ? { ...q, is_read_by_entrepreneur: true } : q));
    })
    .catch(err => console.error("Error marking questions as read:", err));
  }
 }, [activeTab, userEmail, unreadMentorAnswers]);

 // Load message threads (threaded conversations with mentor)
 useEffect(() => {
  async function loadMessageThreads() {
   if (!userEmail) return;
   try {
    const response = await fetch(`${API_BASE_URL}/api/message-threads/${encodeURIComponent(userEmail)}`);
    if (response.ok) {
     const data = await response.json();
     setMessageThreads(data.threads || []);
    }
   } catch (error) {
    console.error("Error loading message threads:", error);
   }
  }
  loadMessageThreads();
 }, [userEmail]);

 // Helper: Upload file attachment
 const uploadAttachment = async (file: File): Promise<{name: string; type: string; url: string} | null> => {
  try {
   setUploadingFile(true);
   const reader = new FileReader();
   return new Promise((resolve, reject) => {
    reader.onload = async () => {
     try {
      const base64 = (reader.result as string).split(',')[1];
      const response = await fetch(`${API_BASE_URL}/api/message-threads/upload`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
        userEmail: userEmail
       })
      });
      if (response.ok) {
       const data = await response.json();
       resolve(data.attachment);
      } else {
       toast.error("Failed to upload file");
       resolve(null);
      }
     } catch (err) {
      reject(err);
     } finally {
      setUploadingFile(false);
     }
    };
    reader.onerror = () => {
     setUploadingFile(false);
     reject(reader.error);
    };
    reader.readAsDataURL(file);
   });
  } catch (error) {
   console.error("Error uploading file:", error);
   setUploadingFile(false);
   toast.error("Error uploading file");
   return null;
  }
 };

 // Helper: Handle file selection for new thread
 const handleNewThreadFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  for (const file of Array.from(files)) {
   const attachment = await uploadAttachment(file);
   if (attachment) {
    setNewThreadAttachments(prev => [...prev, attachment]);
    toast.success(`${file.name} uploaded!`);
   }
  }
  e.target.value = ''; // Reset input
 };

 // Helper: Handle file selection for reply
 const handleReplyFileSelect = async (threadId: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  for (const file of Array.from(files)) {
   const attachment = await uploadAttachment(file);
   if (attachment) {
    setThreadReplyAttachments(prev => ({
     ...prev,
     [threadId]: [...(prev[threadId] || []), attachment]
    }));
    toast.success(`${file.name} uploaded!`);
   }
  }
  e.target.value = ''; // Reset input
 };

 // Helper: Create new message thread
 const createNewThread = async () => {
  if (!mentorData?.mentor?.email || !newThreadMessage.trim()) return;
  try {
   const response = await fetch(`${API_BASE_URL}/api/message-threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     entrepreneurEmail: userEmail,
     mentorEmail: mentorData.mentor.email,
     subject: newThreadSubject.trim() || "New Conversation",
     message: newThreadMessage.trim(),
     senderRole: "entrepreneur",
     senderName: profileData.fullName || "Entrepreneur",
     attachments: newThreadAttachments
    })
   });
   if (response.ok) {
    const data = await response.json();
    setMessageThreads(prev => [data.thread, ...prev]);
    setNewThreadSubject("");
    setNewThreadMessage("");
    setNewThreadAttachments([]);
    setShowNewThreadForm(false);
    toast.success("Conversation started!");
   } else {
    toast.error("Failed to start conversation");
   }
  } catch (error) {
   console.error("Error creating thread:", error);
   toast.error("Error starting conversation");
  }
 };

 // Helper: Add reply to thread
 const addThreadReply = async (threadId: number) => {
  const replyText = threadReplyText[threadId];
  if (!replyText?.trim()) return;
  try {
   const response = await fetch(`${API_BASE_URL}/api/message-threads/${threadId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     message: replyText.trim(),
     senderRole: "entrepreneur",
     senderName: profileData.fullName || "Entrepreneur",
     attachments: threadReplyAttachments[threadId] || []
    })
   });
   if (response.ok) {
    const data = await response.json();
    setMessageThreads(prev => prev.map(t => t.id === threadId ? data.thread : t));
    setThreadReplyText(prev => ({ ...prev, [threadId]: "" }));
    setThreadReplyAttachments(prev => ({ ...prev, [threadId]: [] }));
    toast.success("Reply sent!");
   } else {
    toast.error("Failed to send reply");
   }
  } catch (error) {
   console.error("Error adding reply:", error);
   toast.error("Error sending reply");
  }
 };

 // Helper: Refresh threads
 const refreshThreads = async () => {
  if (!userEmail) return;
  try {
   const response = await fetch(`${API_BASE_URL}/api/message-threads/${encodeURIComponent(userEmail)}`);
   if (response.ok) {
    const data = await response.json();
    setMessageThreads(data.threads || []);
    toast.success("Conversations refreshed!");
   }
  } catch (error) {
   console.error("Error refreshing threads:", error);
  }
 };

 // Calculate unread legacy messages (from mentor/admin to entrepreneur)
 const unreadLegacyMessages = messages.filter((m: any) => m.to_email === userEmail && !m.is_read).length;

 // Count unread thread messages (threads with new entries since last read, from mentor)
 const unreadThreadMessages = messageThreads.filter((thread: any) => {
  const entries = thread.entries || [];
  if (entries.length === 0) return false;
  const threadKey = String(thread.id);
  const lastReadCount = readThreadEntryCounts[threadKey] || 0;
  // Unread if there are new entries AND the last entry is from mentor
  if (entries.length > lastReadCount) {
   const lastEntry = entries[entries.length - 1];
   // Check both senderRole (camelCase from backend) and sender_role (snake_case)
   const role = (lastEntry.senderRole || lastEntry.sender_role || '').toLowerCase();
   return role === 'mentor';
  }
  return false;
 }).length;

 // Total unread count (legacy + threads)
 const unreadMessageCount = unreadLegacyMessages + unreadThreadMessages;

 useEffect(() => {
  if (activeTab === "messages" && userEmail) {
   // Include all admin email aliases
   const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
   const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());
   
   // Mark legacy admin messages as read
   const adminMessagesToMark = messages
    .filter((m: any) => m.to_email === userEmail && isAdminEmail(m.from_email) && !entrepreneurReadMessageIds.includes(m.id))
    .map((m: any) => m.id);
   if (adminMessagesToMark.length > 0) {
    const combined = [...entrepreneurReadMessageIds, ...adminMessagesToMark];
    const updatedReadIds = combined.filter((id, index) => combined.indexOf(id) === index);
    setEntrepreneurReadMessageIds(updatedReadIds);
    localStorage.setItem("tcp_entrepreneurReadMessageIds", JSON.stringify(updatedReadIds));
   }

   // Mark threads as read by storing current entry counts
   const newReadCounts: Record<string, number> = { ...readThreadEntryCounts };
   let hasChanges = false;
   messageThreads.forEach((thread: any) => {
    const entryCount = (thread.entries || []).length;
    const threadKey = String(thread.id);
    if (newReadCounts[threadKey] !== entryCount) {
     newReadCounts[threadKey] = entryCount;
     hasChanges = true;
    }
   });
   if (hasChanges) {
    setReadThreadEntryCounts(newReadCounts);
    localStorage.setItem("tcp_entrepreneurReadThreadEntryCounts", JSON.stringify(newReadCounts));
   }
  }
 }, [activeTab, userEmail, messages, entrepreneurReadMessageIds, messageThreads, readThreadEntryCounts]);

 const steps = [
  {
   title: "1. Problem & Idea",
   description: "Let's start with the core of your business",
   icon: Lightbulb,
   fields: [
    { key: "problem", label: "1. What problem are you solving?" },
    { key: "whoExperiences", label: "2. Who experiences this problem?" },
    { key: "problemImportance", label: "3. Why is this problem important to solve now?" },
    { key: "currentSolutions", label: "4. How are people solving it today?" }
   ]
  },
  {
   title: "Your Solution",
   description: "Tell us about your idea",
   icon: Target,
   fields: [
    { key: "ideaName", label: "5. Project/Company name?" },
    { key: "ideaDescription", label: "6. What is your idea/solution in simple words?" },
    { key: "valueProposition", label: "7. What is the unique benefit/value proposition?" }
   ]
  },
  {
   title: "2. Market & Customer Definition",
   description: "Help us understand your market",
   icon: Users,
   fields: [
    { key: "idealCustomer", label: "8. Who is your ideal customer?" },
    { key: "targetMarket", label: "9. What market/industry does your solution target?" },
    { key: "marketSize", label: "10. How large is your potential market?" },
    { key: "customerReach", label: "11. Where or how will you reach your customers?" }
   ]
  },
  {
   title: "3. Traction & Validation (Part 1)",
   description: "Do you have early traction?",
   icon: Target,
   fields: [
    { key: "hasCustomers", label: "12. Do you already have customers/users?" },
    { key: "customerCount", label: "13. How many customers/users do you currently have?" },
    { key: "hasRevenue", label: "14. Do you already generate revenue?" }
   ]
  },
  {
   title: "3. Traction & Validation (Part 2)",
   description: "Tell us about your validation",
   icon: Target,
   fields: [
    { key: "revenueAmount", label: "15. How much revenue so far?" },
    { key: "revenueRecurring", label: "16. Is revenue recurring or one-time?" },
    { key: "productUsage", label: "17. Do customers actively use the product?" }
   ]
  },
  {
   title: "4. Business Model & Monetization",
   description: "How will you make money?",
   icon: Target,
   fields: [
    { key: "monetization", label: "18. How will you make money?" },
    { key: "pricing", label: "19. What do you plan to charge?" },
    { key: "mainCosts", label: "20. What are your main costs?" },
    { key: "successIn12Months", label: "21. What does success look like in 12 months?" }
   ]
  },
  {
   title: "5. Competition & Positioning",
   description: "Tell us about your competitive advantage",
   icon: Target,
   fields: [
    { key: "directCompetitors", label: "22. Who are your direct competitors?" },
    { key: "competitorStrengths", label: "23. What do competitors do well?" },
    { key: "competitorWeakness", label: "24. Where can you outperform them?" }
   ]
  },
  {
   title: "6. Product Development Stage",
   description: "What stage are you at?",
   icon: Target,
   fields: [
    { key: "currentStage", label: "25. What stage are you currently in?" },
    { key: "hasDemo", label: "26. Do you have a demo/prototype?" },
    { key: "existingFeatures", label: "27. Which key features already exist?" },
    { key: "featuresToBuild", label: "28. Which features still need to be built?" }
   ]
  },
  {
   title: "7. Founder Profile & Readiness",
   description: "Tell us about yourself",
   icon: Users,
   fields: [
    { key: "foundedBefore", label: "29. Have you founded or launched a startup before?" },
    { key: "soloOrCoFounders", label: "30. Solo or with co-founders?" },
    { key: "personalSkills", label: "31. What skills do you personally bring?" }
   ]
  },
  {
   title: "7. Founder Profile (Continued)",
   description: "More about your team",
   icon: Users,
   fields: [
    { key: "missingSkills", label: "32. What skills are missing from your team?" },
    { key: "timePerWeek", label: "33. How much time per week can you dedicate?" }
   ]
  },
  {
   title: "8. Investment & Funding Needs",
   description: "Tell us about funding",
   icon: Target,
   fields: [
    { key: "personalInvestment", label: "34. Have you invested personal money?" },
    { key: "externalFunding", label: "35. Have you received any external funding?" },
    { key: "fundingNeeded", label: "36. How much funding do you think you need now?" },
    { key: "fundingUseCase", label: "37. What would funding be used for?" },
    { key: "investorType", label: "38. What type of investors are you looking for?" }
   ]
  },
  {
   title: "9. Short-Term Execution Plan",
   description: "What's next for you?",
   icon: Target,
   fields: [
    { key: "nextSteps", label: "39. What are the next 3 steps you plan to take?" },
    { key: "currentObstacle", label: "40. What is your biggest current obstacle?" },
    { key: "mentorHelp", label: "41. What help do you need from mentors?" },
    { key: "technicalExpertHelp", label: "42. What help do you need from technical experts?" }
   ]
  }
 ];

 const CurrentStepIcon = steps[currentStep]?.icon || Lightbulb;
 const step = steps[currentStep];
 const progressPercent = ((currentStep + 1) / steps.length) * 100;

 const handleInputChange = (key: string, value: string) => {
  setFormData(prev => ({ ...prev, [key]: value }));
  setValidationError("");
 };

 const validateCurrentStep = () => {
  const requiredFields = step.fields.filter((f: any) => f.required);
  const missingFields = requiredFields.filter((f: any) => {
   const value = formData[f.key as keyof typeof formData];
   // For select fields, check if value is empty or still the placeholder
   if (f.type === "select") {
    return !value || value === "" || value === "Select...";
   }
   // For other field types, check if empty
   return !value || value.trim() === "";
  });
  
  if (missingFields.length > 0) {
   const missingLabels = missingFields.map((f: any) => f.label.replace(" *", "")).join(", ");
   setValidationError(`Please answer the following mandatory questions: ${missingLabels}`);
   return false;
  }
  return true;
 };

 const handleNext = () => {
  if (!validateCurrentStep()) {
   return;
  }
  
  if (currentStep < steps.length - 1) {
   setCurrentStep(currentStep + 1);
   window.scrollTo(0, 0);
  } else {
   setShowReview(true);
   window.scrollTo(0, 0);
  }
 };

 const handlePrevious = () => {
  if (currentStep > 0) {
   setCurrentStep(currentStep - 1);
   window.scrollTo(0, 0);
  }
 };

 const handleEditStep = (stepIndex: number) => {
  setCurrentStep(stepIndex);
  setShowReview(false);
 };

 const generateAIEnhancedAnswers = async () => {
  console.log("[AI ENHANCE] Button clicked, starting AI enhancement...");
  setIsGeneratingAI(true);
  try {
   const answers: Record<string, string> = {};
   steps.forEach((sec) => {
    sec.fields.forEach((field: any) => {
     const answer = formData[field.key as keyof typeof formData];
     if (answer && answer.trim()) {
      answers[field.key] = answer;
     }
    });
   });

   console.log("[AI ENHANCE] Sending", Object.keys(answers).length, "answers to API");
   console.log("[AI ENHANCE] API URL:", `${API_BASE_URL}/api/ai/rephrase`);
   
   const response = await fetch(`${API_BASE_URL}/api/ai/rephrase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers })
   });

   console.log("[AI ENHANCE] Response status:", response.status);

   if (!response.ok) {
    const errorData = await response.text();
    console.error("[AI ENHANCE] Error response:", errorData);
    throw new Error("Failed to enhance answers");
   }

   const data = await response.json();
   console.log("[AI ENHANCE] Received enhanced data for", Object.keys(data.answers || {}).length, "answers");
   
   const enhanced: any = {};
   Object.keys(data.answers).forEach((key) => {
    enhanced[key] = {
     original: data.answers[key].original,
     aiEnhanced: data.answers[key].aiEnhanced,
     isEdited: false
    };
   });

   setAiEnhancedData(enhanced);
   setShowAIReview(true);
   window.scrollTo(0, 0);
   console.log("[AI ENHANCE] Success! Showing AI review page");
  } catch (error: any) {
   console.error("[AI ENHANCE] Error:", error);
   toast.error("Failed to enhance answers with AI. Please try again.");
  } finally {
   setIsGeneratingAI(false);
  }
 };

 const handleSubmit = () => {
  setSubmitted(true);
 };

 const handleAcceptAIEnhancements = () => {
  const updatedFormData = { ...formData };
  Object.keys(aiEnhancedData).forEach((key) => {
   updatedFormData[key as keyof typeof formData] = aiEnhancedData[key].aiEnhanced;
  });
  setFormData(updatedFormData);
  setShowAIReview(false);
  setShowSuccessPage(true);
  window.scrollTo(0, 0);
 };

 const handleCreateBusinessPlan = () => {
  const ideaName = formData.ideaName || "My Idea";
  window.location.href = `/business-plan?ideaName=${encodeURIComponent(ideaName)}`;
 };

 const handleBusinessPlanSubmitted = (plan: any) => {
  setBusinessPlanData(plan);
  setActiveTab("plan");
 };

 const handleEditAIAnswer = (key: string, value: string) => {
  setAiEnhancedData((prev: any) => ({
   ...prev,
   [key]: {
    ...prev[key],
    aiEnhanced: value,
    isEdited: true
   }
  }));
 };

 const generateSnapshotSummary = (answers: typeof snapshotAnswers) => {
  const stageLabels: Record<string, string> = {
   "just-an-idea": "Just an Idea",
   "mvp-or-prototype": "MVP / Prototype",
   "website-live": "Website Live",
   "paying-clients": "Paying Clients",
   "recurring-revenue": "Generating Recurring Revenue"
  };
  const blockerLabels: Record<string, string> = {
   "clarity-positioning": "Clarity on Positioning",
   "get-customers": "Customer Acquisition",
   "structure-offer": "Structuring the Offer",
   "focus-execution": "Focus & Execution",
   "funding-finance": "Funding / Financial Structure",
   "overwhelmed": "Feeling Overwhelmed",
   "other": "Other"
  };
  const tractionLabels: Record<string, string> = {
   "no-validation": "No Validation Yet",
   "early-feedback": "Early Feedback from Potential Users",
   "beta-users": "Beta Users",
   "first-paying": "First Paying Clients",
   "growing-revenue": "Growing Revenue"
  };
  const stage = stageLabels[answers.stage] || answers.stage;
  const blocker = answers.biggestBlocker === "other" ? (answers.blockerOther || "Other") : (blockerLabels[answers.biggestBlocker] || answers.biggestBlocker);
  const traction = tractionLabels[answers.traction] || answers.traction;

  const focusSteps: string[] = [];
  if (answers.traction === "no-validation" || answers.traction === "early-feedback") {
   focusSteps.push("Validate your problem with real conversations.");
  }
  if (answers.biggestBlocker === "clarity-positioning" || answers.biggestBlocker === "structure-offer") {
   focusSteps.push("Narrow down your target niche and refine your positioning.");
  }
  if (answers.biggestBlocker === "get-customers") {
   focusSteps.push("Define a simple offer and test it with your target audience.");
  }
  if (answers.stage === "just-an-idea" || answers.stage === "mvp-or-prototype") {
   focusSteps.push("Focus on building a minimum viable product before adding features.");
  }
  if (answers.biggestBlocker === "focus-execution" || answers.biggestBlocker === "overwhelmed") {
   focusSteps.push("Set one clear weekly priority and track your progress.");
  }
  if (answers.biggestBlocker === "funding-finance") {
   focusSteps.push("Create a basic financial model before approaching investors.");
  }
  if (answers.traction === "first-paying" || answers.traction === "growing-revenue") {
   focusSteps.push("Double down on what's working and optimize your conversion funnel.");
  }
  if (focusSteps.length === 0) {
   focusSteps.push("Define your next milestone and work backward to create an action plan.");
   focusSteps.push("Talk to 5 potential customers this week to gather real insights.");
  }

  return {
   stage,
   mainChallenge: blocker,
   traction,
   ninetyDayGoal: answers.ninetyDayGoal,
   focusSteps: focusSteps.slice(0, 3),
   completedAt: new Date().toISOString()
  };
 };

 const handleSaveNeedsIntake = async () => {
  if (needsSelected.length === 0) {
   toast.error("Please select at least one option.");
   return;
  }
  if (!profileData.email) {
   toast.error("Profile not loaded yet. Please wait a moment and try again.");
   return;
  }
  setSavingNeeds(true);
  try {
   const finalNeeds = needsSelected.includes("Other") && needsOtherText
    ? [...needsSelected.filter(n => n !== "Other"), `Other: ${needsOtherText}`]
    : needsSelected;
   const intake = { needs: finalNeeds, message: needsMessage, completedAt: new Date().toISOString() };
   const response = await fetch(`${API_BASE_URL}/api/entrepreneurs/intake/${encodeURIComponent(profileData.email)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ needsIntake: intake })
   });
   if (response.ok) {
    setNeedsIntakeData(intake);
    toast.success("Thank you! Our team will review this and guide you with next steps.");
   } else {
    toast.error("Failed to save. Please try again.");
   }
  } catch (err) {
   console.error("Error saving needs intake:", err);
   toast.error("Failed to save. Please try again.");
  } finally {
   setSavingNeeds(false);
  }
 };

 const handleSaveSnapshot = async () => {
  if (!snapshotAnswers.building || !snapshotAnswers.stage || !snapshotAnswers.targetCustomer || !snapshotAnswers.biggestBlocker || !snapshotAnswers.traction || !snapshotAnswers.ninetyDayGoal) {
   toast.error("Please fill in all required fields.");
   return;
  }
  if (!profileData.email) {
   toast.error("Profile not loaded yet. Please wait a moment and try again.");
   return;
  }
  setSavingSnapshot(true);
  try {
   const snapshot = { ...snapshotAnswers, completedAt: new Date().toISOString() };
   const summary = generateSnapshotSummary(snapshotAnswers);
   const response = await fetch(`${API_BASE_URL}/api/entrepreneurs/intake/${encodeURIComponent(profileData.email)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ founderSnapshot: snapshot, snapshotSummary: summary })
   });
   if (response.ok) {
    setFounderSnapshot(snapshot);
    setSnapshotSummary(summary);
    setShowSnapshotForm(false);
    toast.success("Your Founder Snapshot has been saved!");
   } else {
    toast.error("Failed to save. Please try again.");
   }
  } catch (err) {
   console.error("Error saving snapshot:", err);
   toast.error("Failed to save. Please try again.");
  } finally {
   setSavingSnapshot(false);
  }
 };

 const handleLogout = async () => {
  try {
   const supabase = await getSupabase();
   if (supabase) {
    await supabase.auth.signOut();
   }
  } catch (error) {
   console.error("Error signing out:", error);
  }
  localStorage.removeItem("tcp_formData");
  localStorage.removeItem("tcp_businessPlan");
  localStorage.removeItem("tcp_profileData");
  localStorage.removeItem("tcp_submitted");
  localStorage.removeItem("tcp_userEmail");
  window.location.href = "/";
 };

 const handleUpgradeClick = () => {
  console.log("[UPGRADE] Button clicked!");
  setAgreedToUpgradeContract(false);
  setShowUpgradeContractText(false);
  setShowUpgradeAgreement(true);
  
  setTimeout(() => {
   const modal = document.getElementById('upgrade-modal-root');
   console.log("[UPGRADE] After setState, modal in DOM:", !!modal);
   if (!modal) {
    console.log("[UPGRADE] Modal NOT found - forcing DOM creation");
    const overlay = document.createElement('div');
    overlay.id = 'upgrade-modal-fallback';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
     <div style="background:white;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;position:relative;z-index:100000;" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
       <h2 style="font-size:20px;font-weight:bold;color:#1e293b;">Upgrade to Founders Circle — $9.99/mo</h2>
       <button id="upgrade-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:#94a3b8;">✕</button>
      </div>
      <p style="color:#64748b;font-size:14px;margin-bottom:16px;">Please review and accept the agreement before proceeding to payment.</p>
      <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;padding:16px;margin-bottom:16px;">
       <h4 style="font-weight:600;color:#312e81;margin-bottom:8px;">Founders Circle includes:</h4>
       <ul style="list-style:none;padding:0;margin:0;font-size:14px;color:#3730a3;">
        <li style="margin-bottom:4px;">✓ Dedicated mentor assigned to your project</li>
        <li style="margin-bottom:4px;">✓ Structured feedback and personalized guidance</li>
        <li style="margin-bottom:4px;">✓ AI-powered business planning tools</li>
        <li style="margin-bottom:4px;">✓ Access to expert coaches</li>
        <li>✓ Cancel anytime from your dashboard</li>
       </ul>
      </div>
      <div id="upgrade-contract-section" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;">
       <button id="upgrade-toggle-contract" style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px;font-size:14px;font-weight:500;color:#475569;background:none;border:none;cursor:pointer;">
        <span>📄 Entrepreneur Membership Agreement</span>
        <span id="upgrade-contract-arrow">▼</span>
       </button>
       <div id="upgrade-contract-text" style="display:none;padding:0 16px 16px;max-height:240px;overflow-y:auto;"></div>
      </div>
      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:16px;">
       <input type="checkbox" id="upgrade-agree-checkbox" style="margin-top:2px;" />
       <span style="font-size:14px;color:#475569;">I have read and agree to the <a id="upgrade-agreement-link" href="#" style="color:#4f46e5;text-decoration:underline;font-weight:600;">Entrepreneur Membership Agreement</a>. I understand this constitutes my legal electronic signature.</span>
      </label>
      <div style="display:flex;gap:12px;">
       <button id="upgrade-cancel-btn" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:white;cursor:pointer;font-size:14px;">Cancel</button>
       <button id="upgrade-proceed-btn" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(to right,#4f46e5,#9333ea);color:white;cursor:pointer;font-size:14px;opacity:0.5;" disabled>Proceed to Payment</button>
      </div>
     </div>
    `;
    overlay.addEventListener('click', (e) => {
     if (e.target === overlay) {
      overlay.remove();
      setShowUpgradeAgreement(false);
     }
    });
    document.body.appendChild(overlay);
    
    const closeBtn = document.getElementById('upgrade-modal-close');
    const cancelBtn = document.getElementById('upgrade-cancel-btn');
    const proceedBtn = document.getElementById('upgrade-proceed-btn');
    const agreeCheckbox = document.getElementById('upgrade-agree-checkbox') as HTMLInputElement;
    
    if (closeBtn) closeBtn.addEventListener('click', () => { overlay.remove(); setShowUpgradeAgreement(false); });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { overlay.remove(); setShowUpgradeAgreement(false); });
    
    const contractTextDiv = document.getElementById('upgrade-contract-text');
    const contractArrow = document.getElementById('upgrade-contract-arrow');
    const toggleContractBtn = document.getElementById('upgrade-toggle-contract');
    const agreementLink = document.getElementById('upgrade-agreement-link');
    
    if (contractTextDiv) {
     const pre = document.createElement('pre');
     pre.style.cssText = 'white-space:pre-wrap;font-size:12px;color:#64748b;font-family:inherit;line-height:1.6;margin:0;';
     pre.textContent = ENTREPRENEUR_CONTRACT;
     contractTextDiv.appendChild(pre);
    }
    
    const toggleContract = () => {
     if (contractTextDiv) {
      const isVisible = contractTextDiv.style.display !== 'none';
      contractTextDiv.style.display = isVisible ? 'none' : 'block';
      if (contractArrow) contractArrow.textContent = isVisible ? '▼' : '▲';
     }
    };
    
    if (toggleContractBtn) toggleContractBtn.addEventListener('click', toggleContract);
    if (agreementLink) agreementLink.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleContract(); });
    
    if (agreeCheckbox && proceedBtn) {
     agreeCheckbox.addEventListener('change', () => {
      (proceedBtn as HTMLButtonElement).disabled = !agreeCheckbox.checked;
      proceedBtn.style.opacity = agreeCheckbox.checked ? '1' : '0.5';
     });
    }
    if (proceedBtn) {
     proceedBtn.addEventListener('click', () => {
      if (agreeCheckbox?.checked) {
       overlay.remove();
       setShowUpgradeAgreement(false);
       handleSubscribe();
      }
     });
    }
   }
  }, 100);
 };

 const handleSubscribe = async () => {
  setShowUpgradeAgreement(false);
  setIsSubscribing(true);
  try {
   try {
    await fetch(`${API_BASE_URL}/api/contract-acceptances`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
      email: userEmail.toLowerCase().trim(),
      role: "entrepreneur",
      contractVersion: ENTREPRENEUR_CONTRACT_VERSION,
      contractText: ENTREPRENEUR_CONTRACT,
      userAgent: navigator.userAgent,
     }),
    });
    console.log("[SUBSCRIBE] Contract acceptance saved");
   } catch (contractErr) {
    console.error("[SUBSCRIBE] Contract acceptance save error (non-blocking):", contractErr);
   }

   localStorage.setItem("tcp_pendingPaymentEmail", userEmail);
   
   console.log("[SUBSCRIBE] Creating checkout session for:", userEmail);
   console.log("[SUBSCRIBE] API_BASE_URL:", API_BASE_URL);
   
   const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     email: userEmail,
     entrepreneurId: entrepreneurData?.id,
     successUrl: `${window.location.origin}/login?payment=success&session_id={CHECKOUT_SESSION_ID}`,
     cancelUrl: `${window.location.origin}/login?payment=cancelled`
    })
   });
   
   console.log("[SUBSCRIBE] Response status:", response.status);
   
   // Check response.ok BEFORE parsing JSON to handle HTML error pages
   if (!response.ok) {
    const text = await response.text();
    console.error("[SUBSCRIBE] Server error (raw):", text.substring(0, 200));
    // Check if HTML was returned (wrong endpoint hit)
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
     toast.error("Payment service unavailable. Please try again later.");
    } else {
     // Try to parse as JSON error
     try {
      const errorData = JSON.parse(text);
      toast.error(errorData.error || "Could not create payment session");
     } catch {
      toast.error("Could not create payment session");
     }
    }
    localStorage.removeItem("tcp_pendingPaymentEmail");
    setIsSubscribing(false);
    return;
   }
   
   const data = await response.json();
   console.log("[SUBSCRIBE] Response data:", data);
   
   if (data.url) {
    console.log("[SUBSCRIBE] Redirecting to Stripe checkout...");
    window.location.href = data.url;
   } else {
    toast.error("Could not create payment session. Please try again.");
    localStorage.removeItem("tcp_pendingPaymentEmail");
    setIsSubscribing(false);
   }
  } catch (error: any) {
   console.error("[SUBSCRIBE] Error:", error);
   toast.error(error.message || "Payment error. Please try again later.");
   localStorage.removeItem("tcp_pendingPaymentEmail");
   setIsSubscribing(false);
  }
 };

 // Submit response to a mentor note
 const handleSubmitNoteResponse = async (noteId: string) => {
  const responseText = noteResponses[noteId] || "";
  const file = noteAttachments[noteId];
  
  if (!responseText.trim() && !file) {
   toast.error("Please enter a response or attach a file");
   return;
  }
  
  if (!mentorAssignmentId) {
   toast.error("Unable to find your mentor assignment");
   return;
  }
  
  // Validate file if present
  if (file) {
   const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
   ];
   if (!allowedTypes.includes(file.type)) {
    toast.error("File type not allowed. Please use PDF, Word, Excel, CSV, TXT, or images.");
    return;
   }
   if (file.size > 10 * 1024 * 1024) {
    toast.error("File too large. Maximum size is 10MB.");
    return;
   }
  }
  
  setSubmittingNoteId(noteId);
  
  try {
   let attachmentUrl = null;
   let attachmentName = null;
   let attachmentSize = null;
   let attachmentType = null;
   
   // Upload file first if present
   if (file) {
    const reader = new FileReader();
    const fileData = await new Promise<string>((resolve, reject) => {
     reader.onload = () => resolve(reader.result as string);
     reader.onerror = reject;
     reader.readAsDataURL(file);
    });
    
    const uploadResponse = await fetch(`${API_BASE_URL}/api/upload-note-attachment`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
      fileName: file.name,
      fileData,
      fileType: file.type,
      assignmentId: mentorAssignmentId
     })
    });
    
    if (!uploadResponse.ok) {
     const errorData = await uploadResponse.json();
     throw new Error(errorData.error || "Failed to upload file");
    }
    
    const uploadResult = await uploadResponse.json();
    attachmentUrl = uploadResult.url;
    attachmentName = file.name;
    attachmentSize = file.size;
    attachmentType = file.type;
   }
   
   // Submit response
   const response = await fetch(`${API_BASE_URL}/api/mentor-assignments/${mentorAssignmentId}/notes/${noteId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     responseText: responseText.trim(),
     attachmentUrl,
     attachmentName,
     attachmentSize,
     attachmentType
    })
   });
   
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit response");
   }
   
   const result = await response.json();
   
   // Update local state with new notes
   if (result.notes) {
    setMentorNotes(result.notes);
   }
   
   // Clear form
   setNoteResponses(prev => ({ ...prev, [noteId]: "" }));
   setNoteAttachments(prev => ({ ...prev, [noteId]: null }));
   setExpandedNoteId(null);
   
   toast.success("Response submitted successfully!");
  } catch (error: any) {
   console.error("Error submitting note response:", error);
   toast.error(error.message || "Failed to submit response");
  } finally {
   setSubmittingNoteId(null);
  }
 };

 const handleSendMessage = async () => {
  if (!newMessage.trim() || !entrepreneurData?.id) return;
  
  try {
   const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     entrepreneurId: entrepreneurData.id,
     senderId: entrepreneurData.id,
     senderType: "entrepreneur",
     content: newMessage
    })
   });
   
   if (response.ok) {
    const data = await response.json();
    setMessages(prev => [...prev, data.message]);
    setNewMessage("");
    toast.success("Message sent!");
   } else {
    toast.error("Failed to send message");
   }
  } catch (error) {
   console.error("Error sending message:", error);
   toast.error("Failed to send message");
  }
 };

 // Show loading screen while fetching data
 if (isLoadingData) {
  return (
   <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF9F7] items-center justify-center">
    <div className="text-center">
     <div className="h-16 w-16 border-4 border-[#FF6B5C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
     <p className="text-[#8A8A8A]">Loading your dashboard...</p>
    </div>
   </div>
  );
 }

 if (showSuccessPage && !submitted) {
  return (
   <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF9F7]">
    <aside className="w-64 border-r border-[#E8E8E8] bg-white hidden md:flex flex-col">
     <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
       <Avatar className="h-10 w-10 border border-[#E8E8E8] bg-[#FF6B5C]">
        <AvatarFallback className="text-white">EN</AvatarFallback>
       </Avatar>
       <div>
        <div className="font-bold text-sm">Entrepreneur</div>
        <div className="text-xs text-[#8A8A8A]">Creating Business Plan</div>
       </div>
      </div>
     </div>
    </aside>

    <main className="flex-1 p-4 md:p-8 overflow-y-auto flex items-center justify-center">
     <div className="max-w-md text-center">
      <div className="flex justify-center mb-6">
       <div className="h-16 w-16 bg-[#FF6B5C] rounded-full flex items-center justify-center">
        <Check className="h-8 w-8 text-white" />
       </div>
      </div>
      <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-3">Thank You!</h1>
      <p className="text-[#8A8A8A] mb-4">Your idea has been submitted and enhanced by our AI.</p>
      <p className="text-[#8A8A8A] mb-8">Let's create your professional business plan that will impress mentors and investors.</p>
      <Button className="w-full bg-[#FF6B5C] hover:bg-[#e55a4d] mb-3" onClick={handleCreateBusinessPlan} data-testid="button-create-business-plan">Let's create your AI Draft Business Plan</Button>
      <Button variant="outline" className="w-full border-[#E8E8E8]" onClick={() => setShowSuccessPage(false)} data-testid="button-back-from-success">Back to Dashboard</Button>
     </div>
    </main>
   </div>
  );
 }

 if (submitted) {
  const hasActiveMentor = mentorData && mentorData.status === "active";
  const entrepreneurStatus = entrepreneurData?.status || "pending";
  const ideaSubmitted = !!(formData.ideaName || entrepreneurData?.data?.ideaName);
  const focusScoreData = entrepreneurData?.data?.focusScore;
  const statusDisplay = isAccountDisabled 
   ? "Disabled" 
   : hasPaid
    ? "Founders Circle"
    : isPreApproved
     ? (ideaSubmitted ? "Community Member" : "Community Free")
     : (entrepreneurStatus === "approved" ? (hasActiveMentor ? "Active Member" : "Approved - Awaiting Mentor") : "On Waiting List");
  const statusColor = isAccountDisabled 
   ? "text-red-600" 
   : hasPaid
    ? "text-emerald-600"
    : isPreApproved
     ? "text-[#FF6B5C]"
     : (entrepreneurStatus === "approved" ? "text-emerald-600" : "text-amber-600");
  const avatarColor = isAccountDisabled 
   ? "bg-red-500" 
   : isPreApproved
    ? "bg-[#FF6B5C]"
    : (entrepreneurStatus === "approved" ? "bg-emerald-500" : "bg-amber-500");

  const entrepreneurNavTabs: NavTab[] = [
   { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
   { id: "idea", label: "My Idea", icon: <Lightbulb className="h-4 w-4" /> },
   { id: "plan", label: "Business Plan", icon: <Target className="h-4 w-4" /> },
   { id: "coaches", label: "Available Coaches", icon: <GraduationCap className="h-4 w-4" /> },
   { id: "purchases", label: "My Purchases", icon: <ShoppingCart className="h-4 w-4" />, badge: coachPurchases.length > 0 ? <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">{coachPurchases.length}</span> : undefined },
   { id: "notes", label: "Mentor Notes", icon: <ClipboardList className="h-4 w-4" />, badge: mentorNotes.length > 0 ? <span className="bg-[#F3F3F3] text-[#FF6B5C] text-xs px-2 py-0.5 rounded-full">{mentorNotes.length}</span> : undefined },
   { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, badge: unreadMessageCount > 0 ? <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadMessageCount}</span> : undefined },
   ...(ideaSubmitted ? [{ id: "ask-mentor", label: "Ask a Mentor", icon: <HelpCircle className="h-4 w-4" />, badge: mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length > 0 ? <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length}</span> : undefined }] : []),
   { id: "profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
   <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#FAF9F7] overflow-x-hidden">
    <DashboardMobileNav
     tabs={entrepreneurNavTabs}
     activeTab={activeTab}
     onTabChange={(tabId) => setActiveTab(tabId as any)}
     title="Entrepreneur Dashboard"
     userName={profileData.fullName || "Entrepreneur"}
     userRole={statusDisplay}
     onLogout={handleLogout}
    />
    <div className="flex flex-1 overflow-hidden">
    <aside className="w-64 border-r border-[#E8E8E8] bg-white hidden md:flex flex-col justify-between">
     <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
       <Avatar className={`h-10 w-10 border border-[#E8E8E8] ${avatarColor}`}>
        <AvatarFallback className="text-white">{profileData.fullName?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
       </Avatar>
       <div>
        <div className="font-bold text-sm">{profileData.fullName || "Entrepreneur"}</div>
        <div className={`text-xs font-semibold ${statusColor}`}>{statusDisplay}</div>
       </div>
      </div>
      <nav className="space-y-1">
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "overview" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("overview")}
        data-testid="button-overview-tab"
       >
        <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "idea" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("idea")}
        data-testid="button-idea-tab"
       >
        <Lightbulb className="mr-2 h-4 w-4" /> My Idea
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "plan" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("plan")}
        data-testid="button-plan-tab"
       >
        <Target className="mr-2 h-4 w-4" /> Business Plan
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "coaches" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("coaches")}
        data-testid="button-coaches-tab"
       >
        <GraduationCap className="mr-2 h-4 w-4" /> Available Coaches
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "purchases" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("purchases")}
        data-testid="button-purchases-tab"
       >
        <ShoppingCart className="mr-2 h-4 w-4" /> My Purchases
        {coachPurchases.length > 0 && (
         <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">{coachPurchases.length}</span>
        )}
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "notes" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("notes")}
        data-testid="button-notes-tab"
       >
        <ClipboardList className="mr-2 h-4 w-4" /> Mentor Notes
        {mentorNotes.length > 0 && (
         <span className="ml-auto bg-[#F3F3F3] text-[#FF6B5C] text-xs px-2 py-0.5 rounded-full">{mentorNotes.length}</span>
        )}
       </Button>
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium relative"
        style={activeTab === "messages" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("messages")}
        data-testid="button-messages-tab"
       >
        <MessageSquare className="mr-2 h-4 w-4" /> Messages
        {unreadMessageCount > 0 && (
         <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{unreadMessageCount}</span>
        )}
       </Button>
       {ideaSubmitted && (
        <Button 
         variant="ghost"
         className="w-full justify-start font-medium text-[#8A8A8A] relative"
         onClick={() => setActiveTab("ask-mentor")}
         data-testid="button-ask-mentor-tab"
        >
         <HelpCircle className="mr-2 h-4 w-4" /> Ask a Mentor
         {mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length > 0 && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length}</span>
         )}
        </Button>
       )}
       {/* Hidden for now - keep for future use
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "meetings" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("meetings")}
        data-testid="button-meetings-tab"
       >
        <Calendar className="mr-2 h-4 w-4" /> Meetings
        {meetings.length > 0 && (
         <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{meetings.length}</span>
        )}
       </Button>
       */}
       <Button 
        variant="ghost"
        className="w-full justify-start font-medium"
        style={activeTab === "profile" ? { backgroundColor: "rgba(255,107,92,0.1)", color: "#FF6B5C" } : { color: "#8A8A8A" }}
        onClick={() => setActiveTab("profile")}
        data-testid="button-profile-tab"
       >
        <User className="mr-2 h-4 w-4" /> Profile
       </Button>
      </nav>
     </div>
     <div className="p-6 border-t border-[#E8E8E8]">
      <Button 
       variant="destructive"
       className="w-full justify-start font-medium bg-red-600 hover:bg-red-700 text-white"
       onClick={handleLogout}
       data-testid="button-logout"
      >
       <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
     </div>
    </aside>

    <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
     <div className="max-w-4xl w-full">
      {/* Overview Tab */}
      {activeTab === "overview" && (
       <div>
        {hasPendingCancellation && (
         <Card className="mb-6 border-orange-300 bg-orange-50">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <ClipboardList className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
             <h3 className="text-lg font-semibold text-orange-800 mb-1">Cancellation Request Pending</h3>
             <p className="text-orange-700">Your cancellation request has been received and is being processed. You can still change your mind – just email us at <a href="mailto:hello@touchconnectpro.com" className="underline hover:text-orange-600">hello@touchconnectpro.com</a>.</p>
            </div>
           </div>
          </CardContent>
         </Card>
        )}

        {hasProcessedCancellation && (
         <Card className="mb-6 border-green-300 bg-green-50">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
             <h3 className="text-lg font-semibold text-green-800 mb-1">Cancellation Approved</h3>
             <p className="text-green-700">Your cancellation request has been received and approved. Thank you for being part of TouchConnectPro. If you ever wish to return, you're always welcome back!</p>
            </div>
           </div>
          </CardContent>
         </Card>
        )}
        {isPreApproved && !hasPaid && !ideaSubmitted && !founderSnapshot && (
         <Card className="mb-6 border-[#E8E8E8] bg-[#F3F3F3]">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <Rocket className="h-6 w-6 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
             <h3 className="text-lg font-semibold text-[#0D566C] mb-1" data-testid="text-community-welcome">Welcome to the Community!</h3>
             <p className="text-[#0D566C] mb-4">You're part of the TouchConnectPro Community Free plan. Complete your Founder Snapshot to unlock your full dashboard, explore coaches, and get personalized guidance.</p>
             <Button 
              className="bg-[#FF6B5C] hover:bg-[#e55a4d] text-white"
              onClick={() => setShowSnapshotForm(true)}
              data-testid="link-submit-idea"
             >
              <Rocket className="mr-2 h-4 w-4" />
              Start Your Founder Snapshot
             </Button>
            </div>
           </div>
          </CardContent>
         </Card>
        )}
        {isPreApproved && !hasPaid && founderSnapshot && !ideaSubmitted && (
         <Card className="mb-6 border-[#E8E8E8] bg-[#F3F3F3]">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-[#0D566C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
             <h3 className="text-lg font-semibold text-[#0D566C] mb-1">Snapshot Complete - Explore Your Dashboard</h3>
             <p className="text-[#0D566C] mb-3">Great start! You can now explore coaches and get guidance. When you're ready, complete your full Founder Blueprint for deeper insights.</p>
             <a 
              href={`/become-entrepreneur?name=${encodeURIComponent(profileData.fullName || "")}&email=${encodeURIComponent(profileData.email || "")}`}
              data-testid="link-full-blueprint"
             >
              <Button className="bg-[#0D566C] hover:bg-[#0a4557] text-white rounded-full">
               <Target className="mr-2 h-4 w-4" />
               Complete Your Full Founder Blueprint
              </Button>
             </a>
            </div>
           </div>
          </CardContent>
         </Card>
        )}
        {isPreApproved && !hasPaid && ideaSubmitted && (
         <Card className="mb-6 border-[#E8E8E8] bg-[#F3F3F3]">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
             <h3 className="text-lg font-semibold text-[#0D566C] mb-1">Idea Submitted - Explore Your Dashboard</h3>
             <p className="text-[#0D566C]">Your idea has been submitted! You can now explore coaches, refine your business plan, and connect with the community. Upgrade to a paid plan for dedicated mentor access.</p>
             <div className="mt-3">
              <Button
               type="button"
               onClick={() => handleUpgradeClick()}
               disabled={isSubscribing}
               className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
               data-testid="button-upgrade-founders-circle-overview"
              >
               <Rocket className="mr-2 h-4 w-4" />
               {isSubscribing ? "Redirecting to payment..." : "Upgrade to Founders Circle — $9.99/mo"}
              </Button>
             </div>
            </div>
           </div>
          </CardContent>
         </Card>
        )}
        
        {isPreApproved && hasPaid && (
         <Card className="mb-6 border-emerald-300 bg-emerald-50">
          <CardContent className="pt-6 pb-6">
           <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
             <h3 className="text-lg font-semibold text-emerald-800 mb-1">Payment Received - Awaiting Mentor Assignment</h3>
             <p className="text-emerald-700">Thank you for your payment! Your membership is now active. Our team will review your business plan and add your idea to a mentor's portfolio. You will be notified once a mentor has been assigned to guide you on your entrepreneurial journey.</p>
            </div>
           </div>
          </CardContent>
         </Card>
        )}

        <div className="flex justify-between items-start mb-8">
         <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FF6B5C] flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0 shadow-lg">
           {profileData.profileImage ? (
            <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
           ) : (
            profileData.fullName?.substring(0, 2).toUpperCase() || "EN"
           )}
          </div>
          <div>
           <h1 className="text-xl sm:text-3xl font-display font-bold text-[#0D566C] mb-2">Welcome, {profileData.fullName?.split(" ")[0] || "Entrepreneur"}!</h1>
           <p className="text-[#8A8A8A]">Here's what's happening with <span className="font-semibold text-[#0D566C]">{formData.ideaName || entrepreneurData?.data?.ideaName || "Your Idea"}</span>.</p>
          </div>
         </div>
         <Button 
          variant="outline" 
          className="text-red-600 border-red-200 hover:bg-red-50 md:hidden"
          onClick={handleLogout}
          data-testid="button-logout-mobile"
         >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
         </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className={`border-l-4 ${isAccountDisabled ? "border-l-red-500" : isPreApproved ? "border-l-[#FF6B5C]" : "border-l-[#FF6B5C]"} shadow-sm`}>
          <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium text-[#8A8A8A]">Current Stage</CardTitle>
          </CardHeader>
          <CardContent>
           <div className={`text-2xl font-bold ${isAccountDisabled ? "text-red-600" : (isPreApproved && !ideaSubmitted && !founderSnapshot) ? "text-[#FF6B5C]" : (isPreApproved && founderSnapshot && !ideaSubmitted) ? "text-[#4B3F72]" : (isPreApproved && ideaSubmitted && !hasPaid) ? "text-[#FF6B5C]" : (isPreApproved && hasPaid) ? "text-emerald-600" : ""}`}>
            {isAccountDisabled ? "Disabled Member" : (isPreApproved && !ideaSubmitted && !founderSnapshot) ? "Getting Started" : (isPreApproved && founderSnapshot && !ideaSubmitted) ? "Snapshot Done" : (isPreApproved && ideaSubmitted && !hasPaid) ? "Idea Submitted" : (isPreApproved && hasPaid) ? "Payment Received" : (entrepreneurStatus === "approved" ? "Active Member" : "Business Plan Complete")}
           </div>
           <p className="text-xs text-[#8A8A8A] mt-1">
            {isAccountDisabled ? "Contact admin to reactivate" : (isPreApproved && !ideaSubmitted && !founderSnapshot) ? "Complete snapshot to unlock features" : (isPreApproved && founderSnapshot && !ideaSubmitted) ? "Exploring community features" : (isPreApproved && ideaSubmitted && !hasPaid) ? "Community Free - explore coaches & build plans" : (isPreApproved && hasPaid) ? "Awaiting mentor assignment" : (entrepreneurStatus === "approved" ? "Working with mentor" : "Awaiting mentor approval")}
           </p>
          </CardContent>
         </Card>
         
         <Card className={`border-l-4 ${entrepreneurStatus === "approved" ? "border-l-emerald-500" : "border-l-amber-500"} shadow-sm`}>
          <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium text-[#8A8A8A]">Status</CardTitle>
          </CardHeader>
          <CardContent>
           <div className={`text-2xl font-bold ${statusColor}`}>{statusDisplay}</div>
          </CardContent>
         </Card>

         <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2">
           <CardTitle className="text-sm font-medium text-[#8A8A8A]">Mentor Notes</CardTitle>
          </CardHeader>
          <CardContent>
           <div className="text-2xl font-bold">{mentorNotes.length}</div>
           <p className="text-xs text-[#8A8A8A] mt-1">{mentorNotes.length === 1 ? "recommendation" : "recommendations"} from your mentor</p>
          </CardContent>
         </Card>
        </div>

        {/* Tell Us What You Need - Interactive Intake */}
        {isPreApproved && !needsIntakeData && (
         <Card className="mb-6 border-l-4 border-l-[#F5C542]" data-testid="card-needs-intake">
          <CardHeader>
           <CardTitle className="flex items-center gap-2 text-[#0D566C]">
            <Lightbulb className="h-5 w-5 text-[#F5C542]" />
            Tell Us What You Need
           </CardTitle>
           <CardDescription>Help us understand where you are so we can guide you better. Select all that apply.</CardDescription>
          </CardHeader>
          <CardContent>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
             "I need help clarifying my idea",
             "I want to find a co-founder",
             "I need funding guidance",
             "I want coaching or mentorship",
             "I need help with my pitch deck",
             "I want to connect with other founders",
             "I need help with product development",
             "Other"
            ].map((option) => (
             <button
              key={option}
              onClick={() => setNeedsSelected(prev => prev.includes(option) ? prev.filter(n => n !== option) : [...prev, option])}
              className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
               needsSelected.includes(option)
                ? "border-[#FF6B5C] bg-[#FFF5F4] text-[#0D566C]"
                : "border-[#E8E8E8] bg-white text-[#0D566C] hover:border-[#FF6B5C]/50"
              }`}
              data-testid={`button-need-${option.toLowerCase().replace(/\s+/g, "-")}`}
             >
              <span className="flex items-center gap-2">
               {needsSelected.includes(option) ? <CheckCircle className="h-4 w-4 text-[#FF6B5C]" /> : <Circle className="h-4 w-4 text-[#C0C0C0]" />}
               {option}
              </span>
             </button>
            ))}
           </div>
           {needsSelected.includes("Other") && (
            <input
             type="text"
             placeholder="Please specify..."
             value={needsOtherText}
             onChange={(e) => setNeedsOtherText(e.target.value)}
             className="w-full mb-4 p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B5C]/30"
             data-testid="input-need-other"
            />
           )}
           <textarea
            placeholder="Anything else you'd like to share? (optional)"
            value={needsMessage}
            onChange={(e) => setNeedsMessage(e.target.value)}
            rows={2}
            className="w-full mb-4 p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#FF6B5C]/30 resize-none"
            data-testid="input-needs-message"
           />
           <Button 
            onClick={handleSaveNeedsIntake} 
            disabled={savingNeeds || needsSelected.length === 0} 
            className="bg-[#FF6B5C] hover:bg-[#e55a4d] text-white rounded-full"
            data-testid="button-save-needs"
           >
            {savingNeeds ? "Saving..." : "Submit"}
           </Button>
          </CardContent>
         </Card>
        )}
        {needsIntakeData && (
         <Card className="mb-6 border-l-4 border-l-[#F5C542]" data-testid="card-needs-complete">
          <CardContent className="pt-6 pb-4">
           <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-[#F5C542]" />
            <span className="text-sm font-semibold text-[#0D566C]">Needs Submitted</span>
           </div>
           <div className="flex flex-wrap gap-2">
            {needsIntakeData.needs.map((need, i) => (
             <span key={i} className="text-xs bg-[#FFF8E5] text-[#0D566C] px-3 py-1 rounded-full border border-[#F5C542]/30">{need}</span>
            ))}
           </div>
          </CardContent>
         </Card>
        )}

        {/* Smart Founder Snapshot Form */}
        {showSnapshotForm && !founderSnapshot && (
         <Card className="mb-6 border-l-4 border-l-[#4B3F72]" data-testid="card-snapshot-form">
          <CardHeader>
           <CardTitle className="flex items-center gap-2 text-[#0D566C]">
            <Target className="h-5 w-5 text-[#4B3F72]" />
            Smart Founder Snapshot
           </CardTitle>
           <CardDescription>Answer 6 quick questions so we can tailor your experience. This takes about 2 minutes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">1. What are you building? *</label>
            <input
             type="text"
             placeholder="e.g. A platform that helps freelancers manage their invoices"
             value={snapshotAnswers.building}
             onChange={(e) => setSnapshotAnswers(prev => ({ ...prev, building: e.target.value }))}
             className="w-full p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#4B3F72]/30"
             data-testid="input-snapshot-building"
            />
           </div>
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">2. What stage are you at? *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {[
              { value: "just-an-idea", label: "Just an Idea" },
              { value: "mvp-or-prototype", label: "MVP / Prototype" },
              { value: "website-live", label: "Website Live" },
              { value: "paying-clients", label: "Paying Clients" },
              { value: "recurring-revenue", label: "Generating Recurring Revenue" }
             ].map((opt) => (
              <button
               key={opt.value}
               onClick={() => setSnapshotAnswers(prev => ({ ...prev, stage: opt.value }))}
               className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                snapshotAnswers.stage === opt.value
                 ? "border-[#4B3F72] bg-[#F3F0FA] text-[#0D566C]"
                 : "border-[#E8E8E8] bg-white text-[#0D566C] hover:border-[#4B3F72]/50"
               }`}
               data-testid={`button-stage-${opt.value}`}
              >
               {snapshotAnswers.stage === opt.value ? <CheckCircle className="inline h-4 w-4 mr-2 text-[#4B3F72]" /> : <Circle className="inline h-4 w-4 mr-2 text-[#C0C0C0]" />}
               {opt.label}
              </button>
             ))}
            </div>
           </div>
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">3. Who is your target customer? *</label>
            <input
             type="text"
             placeholder="e.g. Small business owners, college students, busy parents"
             value={snapshotAnswers.targetCustomer}
             onChange={(e) => setSnapshotAnswers(prev => ({ ...prev, targetCustomer: e.target.value }))}
             className="w-full p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#4B3F72]/30"
             data-testid="input-snapshot-customer"
            />
           </div>
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">4. What's your biggest blocker right now? *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {[
              { value: "clarity-positioning", label: "Clarity on Positioning" },
              { value: "get-customers", label: "Getting Customers" },
              { value: "structure-offer", label: "Structuring My Offer" },
              { value: "focus-execution", label: "Focus & Execution" },
              { value: "funding-finance", label: "Funding / Financial Structure" },
              { value: "overwhelmed", label: "Feeling Overwhelmed" },
              { value: "other", label: "Other" }
             ].map((opt) => (
              <button
               key={opt.value}
               onClick={() => setSnapshotAnswers(prev => ({ ...prev, biggestBlocker: opt.value }))}
               className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                snapshotAnswers.biggestBlocker === opt.value
                 ? "border-[#4B3F72] bg-[#F3F0FA] text-[#0D566C]"
                 : "border-[#E8E8E8] bg-white text-[#0D566C] hover:border-[#4B3F72]/50"
               }`}
               data-testid={`button-blocker-${opt.value}`}
              >
               {snapshotAnswers.biggestBlocker === opt.value ? <CheckCircle className="inline h-4 w-4 mr-2 text-[#4B3F72]" /> : <Circle className="inline h-4 w-4 mr-2 text-[#C0C0C0]" />}
               {opt.label}
              </button>
             ))}
            </div>
            {snapshotAnswers.biggestBlocker === "other" && (
             <input
              type="text"
              placeholder="Please describe..."
              value={snapshotAnswers.blockerOther}
              onChange={(e) => setSnapshotAnswers(prev => ({ ...prev, blockerOther: e.target.value }))}
              className="w-full mt-2 p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#4B3F72]/30"
              data-testid="input-blocker-other"
             />
            )}
           </div>
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">5. Where are you in terms of traction? *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {[
              { value: "no-validation", label: "No Validation Yet" },
              { value: "early-feedback", label: "Early Feedback from Potential Users" },
              { value: "beta-users", label: "Beta Users" },
              { value: "first-paying", label: "First Paying Clients" },
              { value: "growing-revenue", label: "Growing Revenue" }
             ].map((opt) => (
              <button
               key={opt.value}
               onClick={() => setSnapshotAnswers(prev => ({ ...prev, traction: opt.value }))}
               className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                snapshotAnswers.traction === opt.value
                 ? "border-[#4B3F72] bg-[#F3F0FA] text-[#0D566C]"
                 : "border-[#E8E8E8] bg-white text-[#0D566C] hover:border-[#4B3F72]/50"
               }`}
               data-testid={`button-traction-${opt.value}`}
              >
               {snapshotAnswers.traction === opt.value ? <CheckCircle className="inline h-4 w-4 mr-2 text-[#4B3F72]" /> : <Circle className="inline h-4 w-4 mr-2 text-[#C0C0C0]" />}
               {opt.label}
              </button>
             ))}
            </div>
           </div>
           <div>
            <label className="block text-sm font-semibold text-[#0D566C] mb-2">6. What's your #1 goal for the next 90 days? *</label>
            <textarea
             placeholder="e.g. Launch my MVP, get my first 10 customers, raise a pre-seed round..."
             value={snapshotAnswers.ninetyDayGoal}
             onChange={(e) => setSnapshotAnswers(prev => ({ ...prev, ninetyDayGoal: e.target.value }))}
             rows={3}
             className="w-full p-3 border border-[#E8E8E8] rounded-xl bg-white text-[#0D566C] placeholder:text-[#C0C0C0] focus:outline-none focus:ring-2 focus:ring-[#4B3F72]/30 resize-none"
             data-testid="input-snapshot-goal"
            />
           </div>
           <div className="flex gap-3">
            <Button 
             onClick={handleSaveSnapshot} 
             disabled={savingSnapshot} 
             className="bg-[#4B3F72] hover:bg-[#3d3360] text-white rounded-full"
             data-testid="button-save-snapshot"
            >
             {savingSnapshot ? "Saving..." : "Complete Snapshot"}
            </Button>
            <Button 
             variant="outline" 
             onClick={() => setShowSnapshotForm(false)} 
             className="border-[#E8E8E8] text-[#8A8A8A] rounded-full"
             data-testid="button-cancel-snapshot"
            >
             Cancel
            </Button>
           </div>
          </CardContent>
         </Card>
        )}

        {/* Snapshot Summary */}
        {snapshotSummary && (
         <Card className="mb-6 border-l-4 border-l-[#4B3F72]" data-testid="card-snapshot-summary">
          <CardHeader>
           <CardTitle className="flex items-center gap-2 text-[#0D566C]">
            <Target className="h-5 w-5 text-[#4B3F72]" />
            Your Founder Snapshot
           </CardTitle>
          </CardHeader>
          <CardContent>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#F3F0FA] rounded-xl p-4">
             <p className="text-xs text-[#8A8A8A] mb-1">Stage</p>
             <p className="text-sm font-semibold text-[#0D566C]" data-testid="text-snapshot-stage">{snapshotSummary.stage}</p>
            </div>
            <div className="bg-[#FFF5F4] rounded-xl p-4">
             <p className="text-xs text-[#8A8A8A] mb-1">Main Challenge</p>
             <p className="text-sm font-semibold text-[#0D566C]" data-testid="text-snapshot-challenge">{snapshotSummary.mainChallenge}</p>
            </div>
            <div className="bg-[#FFF8E5] rounded-xl p-4">
             <p className="text-xs text-[#8A8A8A] mb-1">Traction</p>
             <p className="text-sm font-semibold text-[#0D566C]" data-testid="text-snapshot-traction">{snapshotSummary.traction}</p>
            </div>
           </div>
           {snapshotSummary.ninetyDayGoal && (
            <div className="bg-[#F5F9FA] rounded-xl p-4 mb-4">
             <p className="text-xs text-[#8A8A8A] mb-1">90-Day Goal</p>
             <p className="text-sm text-[#0D566C]" data-testid="text-snapshot-goal">{snapshotSummary.ninetyDayGoal}</p>
            </div>
           )}
           {snapshotSummary.focusSteps && snapshotSummary.focusSteps.length > 0 && (
            <div>
             <p className="text-xs font-semibold text-[#8A8A8A] mb-2 uppercase tracking-wide">Recommended Next Steps</p>
             <div className="space-y-2">
              {snapshotSummary.focusSteps.map((step: string, i: number) => (
               <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#4B3F72] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-[#0D566C]">{step}</p>
               </div>
              ))}
             </div>
            </div>
           )}
          </CardContent>
         </Card>
        )}

        {isPreApproved && focusScoreData && (() => {
         const score = focusScoreData.totalScore || focusScoreData.overallScore || 0;
         const blocker = focusScoreData.primaryBlocker as Category;
         const blockerInfo = blocker ? BLOCKER_INFO[blocker] : null;
         const scoreLabel = score >= 80 ? "Strong foundation" : score >= 60 ? "Solid but blocked" : "High friction";
         const scoreColor = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600";
         const scoreBg = score >= 80 ? "bg-emerald-100" : score >= 60 ? "bg-amber-100" : "bg-red-100";
         const categoryColors: Record<string, string> = {
          Strategy: "from-indigo-500 to-indigo-600",
          Sales: "from-emerald-500 to-emerald-600",
          Operations: "from-amber-500 to-amber-600",
          Execution: "from-[#FF6B5C] to-[#e55a4d]",
         };
         const categoryTextColors: Record<string, string> = {
          Strategy: "text-indigo-600",
          Sales: "text-emerald-600",
          Operations: "text-amber-600",
          Execution: "text-[#FF6B5C]",
         };

         return (
         <Card className="mb-6 border-l-4 border-l-purple-500" data-testid="card-focus-score">
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Your Founder Focus Score
           </CardTitle>
          </CardHeader>
          <CardContent>
           <div className="flex items-center gap-4 mb-5">
            <div className="relative w-20 h-20 flex-shrink-0">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#C0C0C0]" />
              <circle
               cx="50" cy="50" r="42" fill="none"
               stroke="url(#dashScoreGradient)" strokeWidth="8"
               strokeLinecap="round"
               strokeDasharray={`${(score / 100) * 264} 264`}
              />
              <defs>
               <linearGradient id="dashScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
               </linearGradient>
              </defs>
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600" data-testid="text-focus-score-value">{score}</span>
             </div>
            </div>
            <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBg} ${scoreColor}`}>{scoreLabel}</span>
             </div>
             <p className="text-sm font-medium text-[#0D566C]" data-testid="text-primary-focus">
              {blocker ? `Primary Focus: ${blocker}` : "Focus Score Complete"}
             </p>
             <p className="text-xs text-[#8A8A8A]">Based on your diagnostic quiz responses</p>
            </div>
           </div>

           {focusScoreData.categoryResults && focusScoreData.categoryResults.length > 0 && (
            <div className="space-y-3 mb-5">
             <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">Score Breakdown</p>
             {focusScoreData.categoryResults.map((cat: any) => (
              <div key={cat.category} data-testid={`score-breakdown-${cat.category}`}>
               <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${categoryTextColors[cat.category] || "text-[#0D566C]"}`}>{cat.category}</span>
                <span className="text-xs text-[#8A8A8A]">{cat.score} pts ({cat.percentage}%)</span>
               </div>
               <div className="w-full bg-[#E8E8E8] rounded-full h-2">
                <div
                 className={`h-2 rounded-full bg-gradient-to-r ${categoryColors[cat.category] || "from-purple-500 to-purple-600"}`}
                 style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                />
               </div>
              </div>
             ))}
            </div>
           )}

           {!focusScoreData.categoryResults && focusScoreData.categories && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
             {Object.entries(focusScoreData.categories).map(([category, data]: [string, any]) => (
              <div key={category} className="bg-purple-50 rounded-lg p-3 text-center">
               <p className="text-xs text-[#8A8A8A] mb-1">{category}</p>
               <p className="text-lg font-bold text-purple-600">{data.score || data}</p>
              </div>
             ))}
            </div>
           )}

           {blockerInfo && (
            <div className="space-y-3">
             <div className="bg-[#FAF9F7] rounded-lg p-4">
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">What This Means</p>
              <p className="text-sm text-[#8A8A8A] leading-relaxed" data-testid="text-blocker-explanation">{blockerInfo.explanation}</p>
             </div>
             <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
               <Target className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
               <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Your Next Action</p>
                <p className="text-sm text-purple-600" data-testid="text-next-action">{blockerInfo.action}</p>
               </div>
              </div>
             </div>
            </div>
           )}
          </CardContent>
         </Card>
         );
        })()}

        {mentorNotes && mentorNotes.length > 0 && (() => {
         // Sort notes oldest first
         const sortedNotes = [...mentorNotes].sort((a: any, b: any) => {
          const timeA = typeof a === 'string' ? 0 : new Date(a.timestamp || 0).getTime();
          const timeB = typeof b === 'string' ? 0 : new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
         });
         const displayNotes = showAllOverviewNotes ? sortedNotes : sortedNotes.slice(0, 2);
         
         return (
          <Card className="mb-6 border-l-4 border-l-emerald-500">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
             <BookOpen className="h-5 w-5 text-emerald-600" />
             Your Mentor's Guidance ({mentorNotes.length})
            </CardTitle>
           </CardHeader>
           <CardContent>
            <div className="space-y-3">
             {displayNotes.map((note: any, idx: number) => {
              const noteText = typeof note === 'string' ? note : note.text;
              const noteTime = typeof note === 'string' ? null : note.timestamp;
              const isCompleted = typeof note === 'string' ? false : note.completed;
              return (
               <div key={idx} className={`p-3 rounded-lg ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-start gap-3">
                 <div className={`text-lg font-bold min-w-fit ${isCompleted ? 'text-green-600' : 'text-emerald-600'}`}>{idx + 1}.</div>
                 <div className="flex-1">
                  <p className={`text-sm ${isCompleted ? 'text-green-900 line-through' : 'text-emerald-900'}`}>{noteText}</p>
                  {noteTime && <p className={`text-xs mt-2 ${isCompleted ? 'text-green-700' : 'text-emerald-700'}`}>{new Date(noteTime).toLocaleDateString()}</p>}
                 </div>
                 {isCompleted && <div className="text-green-600 text-lg font-bold min-w-fit">✓ Well done</div>}
                </div>
               </div>
              );
             })}
            </div>
            {mentorNotes.length > 2 && (
             <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowAllOverviewNotes(!showAllOverviewNotes)}
              data-testid="button-toggle-overview-notes"
             >
              <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAllOverviewNotes ? 'rotate-180' : ''}`} />
              {showAllOverviewNotes ? 'Show Less' : `Show ${mentorNotes.length - 2} More`}
             </Button>
            )}
           </CardContent>
          </Card>
         );
        })()}

        {/* My Mentor Section */}
        <Card className="mb-6 border-l-4 border-l-[#FF6B5C]">
         <CardHeader>
          <CardTitle className="flex items-center gap-2">
           <Users className="h-5 w-5 text-[#FF6B5C]" />
           My Mentor
          </CardTitle>
         </CardHeader>
         <CardContent>
          {hasActiveMentor ? (
           <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
             <Avatar className="h-20 w-20 border-2 border-[#E8E8E8]">
              {mentorData.mentor?.photo_url ? (
               <AvatarImage src={mentorData.mentor.photo_url} alt={mentorData.mentor?.full_name || "Mentor"} />
              ) : null}
              <AvatarFallback className="bg-[#FF6B5C] text-white text-xl">
               {mentorData.mentor?.full_name?.substring(0, 2).toUpperCase() || "MT"}
              </AvatarFallback>
             </Avatar>
             <div>
              <h3 className="font-bold text-lg text-[#0D566C]">{mentorData.mentor?.full_name || "Your Mentor"}</h3>
              <p className="text-sm text-[#8A8A8A]">{mentorData.mentor?.expertise || "Business & Strategy"}</p>
              {mentorData.mentor?.experience && (
               <p className="text-sm text-[#8A8A8A] mt-1">{mentorData.mentor.experience} years of experience</p>
              )}
             </div>
            </div>
            <div className="flex-1 space-y-3">
             {mentorData.meeting_link && (
              <a href={mentorData.meeting_link} target="_blank" rel="noopener noreferrer" className="block">
               <Button className="w-full bg-[#FF6B5C] hover:bg-[#e55a4d]" data-testid="button-join-meeting">
                <Calendar className="mr-2 h-4 w-4" /> Join Monthly Meeting
               </Button>
              </a>
             )}
             <Button 
              variant="outline" 
              className="w-full border-[#E8E8E8] text-[#FF6B5C] hover:bg-[#F3F3F3]"
              onClick={() => setActiveTab("notes")}
              data-testid="button-view-notes"
             >
              <ClipboardList className="mr-2 h-4 w-4" /> View Mentor Notes ({mentorNotes.length})
             </Button>
             {/* Hidden for now - keep for future use
             <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => setActiveTab("meetings")}
              data-testid="button-view-meetings"
             >
              <Calendar className="mr-2 h-4 w-4" /> View Meetings with my Mentor ({meetings.length})
             </Button>
             */}
            </div>
           </div>
          ) : (
           <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-[#F3F3F3] flex items-center justify-center mx-auto mb-4">
             <Users className="h-8 w-8 text-[#FF6B5C]" />
            </div>
            <p className="text-[#8A8A8A] mb-2">Once you upgrade to the Founders Circle plan and your project is reviewed, a dedicated mentor will be assigned to you.</p>
            <div className="mt-3 mb-4">
             <Button
              type="button"
              onClick={() => handleUpgradeClick()}
              disabled={isSubscribing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              data-testid="button-upgrade-founders-circle-mentor"
             >
              <Rocket className="mr-2 h-4 w-4" />
              {isSubscribing ? "Redirecting to payment..." : "Upgrade to Founders Circle — $9.99/mo"}
             </Button>
            </div>
            {ideaSubmitted && !hasPaid && (
             <Button
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
              onClick={() => setActiveTab("ask-mentor")}
              data-testid="button-ask-mentor-from-overview"
             >
              <HelpCircle className="mr-2 h-4 w-4" /> Ask a Mentor a Question
              {mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length > 0 && (
               <Badge className="ml-2 bg-emerald-500 text-white">{mentorQuestions.filter((q: any) => q.status === "answered" && !q.is_read_by_entrepreneur).length} new</Badge>
              )}
             </Button>
            )}
           </div>
          )}
         </CardContent>
        </Card>

        {/* Messages with Mentor Section (only show if mentor assigned and account not disabled) */}
        {hasActiveMentor && mentorData && mentorData.mentor && !isAccountDisabled && (
         <Card className="mb-6 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("messages")}>
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            Messages with {mentorData.mentor?.full_name || "Your Mentor"}
           </CardTitle>
           <CardDescription>Start or continue conversations with your mentor</CardDescription>
          </CardHeader>
          <CardContent>
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
             <span className="text-2xl font-bold text-emerald-600">
              {messageThreads.filter(t => t.mentor_email?.toLowerCase() === mentorData.mentor?.email?.toLowerCase()).length}
             </span>
             <span className="text-sm text-[#8A8A8A]">conversation{messageThreads.filter(t => t.mentor_email?.toLowerCase() === mentorData.mentor?.email?.toLowerCase()).length !== 1 ? 's' : ''}</span>
            </div>
            <Button 
             variant="outline" 
             className="border-emerald-200 text-emerald-600 hover:bg-emerald-50" 
             onClick={(e) => { e.stopPropagation(); setActiveTab("messages"); }}
             data-testid="button-go-to-messages"
            >
             Open Messages <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
           </div>
          </CardContent>
         </Card>
        )}

        {/* Meetings Section */}
        {hasActiveMentor && meetings.length > 0 && (
         <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Scheduled Meetings
           </CardTitle>
          </CardHeader>
          <CardContent>
           <div className="space-y-3">
            {meetings.slice(0, 2).map((meeting) => (
             <div key={meeting.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
               <p className="font-semibold text-blue-900">{meeting.topic}</p>
               <Badge className="bg-blue-100 text-blue-800">{meeting.status}</Badge>
              </div>
              {meeting.start_time && <p className="text-sm text-blue-700">📅 {formatToPST(meeting.start_time)}</p>}
              <p className="text-sm text-blue-700">⏱ {meeting.duration} minutes</p>
              {meeting.join_url && (
               <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> Join Meeting
               </a>
              )}
             </div>
            ))}
           </div>
          </CardContent>
         </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("coaches")}>
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Available Coaches
           </CardTitle>
           <CardDescription className="text-xs leading-relaxed">Coach specializations are suggested by your mentor based on your project stage, but you are free to choose any coach. All are freelance professionals ready to help.</CardDescription>
          </CardHeader>
          <CardContent>
           <div className="flex items-center justify-end">
            <Button variant="outline" className="border-purple-200 text-purple-600" data-testid="button-view-coaches">
             See some Coaches Profiles <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
           </div>
          </CardContent>
         </Card>

         <Card className="border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("idea")}>
          <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            My Idea & Business Plan
           </CardTitle>
           <CardDescription>Review your submitted idea and business plan</CardDescription>
          </CardHeader>
          <CardContent>
           <Button variant="outline" className="w-full border-amber-200 text-amber-600" data-testid="button-view-idea">
            View Submission <ChevronRight className="ml-1 h-4 w-4" />
           </Button>
          </CardContent>
         </Card>
        </div>
       </div>
      )}

      {/* Coaches Tab */}
      {activeTab === "coaches" && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Available Coaches</h1>
        <p className="text-[#8A8A8A] mb-4">Browse our approved coaches who can help accelerate your startup journey with specialized expertise.</p>

        {/* Areas of Expertise Filter */}
        {shuffledCoaches.length > 0 && !isAccountDisabled && !(isPreApproved && !ideaSubmitted && !founderSnapshot) && (() => {
         const allExpertiseAreas = Array.from(new Set(shuffledCoaches.flatMap(c => {
          const areas = c.focus_areas || "";
          return areas.split(",").map((a: string) => a.trim()).filter((a: string) => a);
         })));
         if (allExpertiseAreas.length === 0) return null;
         return (
          <div className="mb-6">
           <p className="text-sm font-semibold text-[#4A4A4A] mb-2">Filter by Areas of Expertise:</p>
           <div className="flex flex-wrap gap-2">
            {allExpertiseAreas.map((area: string) => (
             <Badge
              key={area}
              variant={selectedSpecializations.includes(area) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
               selectedSpecializations.includes(area) 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "hover:bg-purple-100"
              }`}
              onClick={() => {
               if (selectedSpecializations.includes(area)) {
                setSelectedSpecializations(selectedSpecializations.filter(s => s !== area));
               } else {
                setSelectedSpecializations([...selectedSpecializations, area]);
               }
              }}
              data-testid={`filter-expertise-${area}`}
             >
              {area}
             </Badge>
            ))}
            {selectedSpecializations.length > 0 && (
             <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setSelectedSpecializations([])}
              data-testid="button-clear-filters"
             >
              Clear filters
             </Button>
            )}
           </div>
          </div>
         );
        })()}

        {isAccountDisabled ? (
         <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6 pb-6 text-center">
           <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
           <p className="text-red-700">Your account is currently disabled. Please contact the Admin team via the Messages tab to reactivate your membership and access the coaches list.</p>
          </CardContent>
         </Card>
        ) : (isPreApproved && !ideaSubmitted && !founderSnapshot) ? (
         <Card className="border-[#E8E8E8] bg-[#F3F3F3]">
          <CardContent className="pt-6 pb-6 text-center">
           <Target className="h-12 w-12 text-[#4B3F72] mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-[#0D566C] mb-2">Complete Your Founder Snapshot to Unlock Coaches</h3>
           <p className="text-[#0D566C] mb-4">Answer 6 quick questions in your Founder Snapshot to browse coaches, get feedback, and access community features.</p>
           <Button 
            className="bg-[#4B3F72] hover:bg-[#3d3360] text-white rounded-full" 
            onClick={() => { setActiveTab("overview"); setShowSnapshotForm(true); }}
            data-testid="button-submit-idea-coaches"
           >
            <Target className="mr-2 h-4 w-4" />
            Start Founder Snapshot
           </Button>
          </CardContent>
         </Card>
        ) : shuffledCoaches.length > 0 ? (
         <div className="grid grid-cols-1 gap-6">
          {shuffledCoaches
           .filter((coach) => {
            if (selectedSpecializations.length === 0) return true;
            const coachAreas = (coach.focus_areas || "").split(",").map((a: string) => a.trim()).filter((a: string) => a);
            return selectedSpecializations.some(area => coachAreas.includes(area));
           })
           .map((coach) => {
           const rating = coachRatings[coach.id];
           return (
           <Card key={coach.id} className={`border-l-4 ${!coach.stripe_account_id ? 'border-l-gray-400 opacity-80' : 'border-l-purple-500'} overflow-hidden`} data-testid={`card-coach-${coach.id}`}>
            <div className="flex flex-col md:flex-row">
             <div className="md:w-48 lg:w-56 flex-shrink-0 bg-gradient-to-br from-purple-100 to-indigo-100 p-6 flex flex-col items-center justify-center">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-lg">
               {coach.profile_image && (
                <AvatarImage src={coach.profile_image} alt={coach.full_name} className="object-cover" />
               )}
               <AvatarFallback className="bg-purple-500 text-white text-2xl md:text-3xl">
                {coach.full_name?.substring(0, 2).toUpperCase() || "CO"}
               </AvatarFallback>
              </Avatar>
              <button
               className="mt-3 flex items-center gap-1 hover:bg-yellow-100 px-3 py-1.5 rounded-full cursor-pointer transition-colors bg-white/80"
               onClick={async () => {
                setSelectedCoachForReviews(coach);
                try {
                 const response = await fetch(`${API_BASE_URL}/api/coach-ratings/${coach.id}/reviews`);
                 if (response.ok) {
                  const data = await response.json();
                  setCoachReviews(data.reviews || []);
                 }
                } catch (error) {
                 console.error("Error fetching reviews:", error);
                }
                setShowReviewsModal(true);
               }}
               data-testid={`rating-coach-${coach.id}`}
              >
               {rating ? (
                <>
                 <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                 <span className="text-sm font-semibold">{rating.averageRating}</span>
                 <span className="text-xs text-[#8A8A8A]">({rating.totalRatings})</span>
                </>
               ) : (
                <span className="text-xs text-[#8A8A8A]">No ratings yet</span>
               )}
              </button>
             </div>
             <div className="flex-1">
            <CardHeader className="pb-2">
             <div className="flex items-start justify-between">
              <div>
               <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{coach.full_name}</CardTitle>
                {!coach.stripe_account_id && (
                 <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5">
                  Coming Soon
                 </Badge>
                )}
               </div>
               <p className="text-sm text-[#8A8A8A] mt-1">{coach.expertise}</p>
              </div>
              <Button
               variant="outline"
               size="sm"
               className="hidden md:flex border-purple-300 text-purple-700 hover:bg-purple-50"
               onClick={() => window.open(`/coach/${coach.id}`, '_blank')}
               data-testid={`button-view-profile-${coach.id}`}
              >
               <ExternalLink className="h-3 w-3 mr-1" />
               View Profile
              </Button>
             </div>
            </CardHeader>
            <CardContent className="space-y-3">
             {coach.bio && (
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">About</p>
               <p className="text-sm text-[#4A4A4A]">{coach.bio}</p>
              </div>
             )}
             
             {/* External Reputation Display */}
             {coach.external_reputation && coach.external_reputation.verified && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
               <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                  <Star
                   key={i}
                   className={`h-4 w-4 ${
                    i < Math.floor(coach.external_reputation.average_rating)
                     ? "fill-amber-400 text-amber-400"
                     : i < coach.external_reputation.average_rating
                     ? "fill-amber-200 text-amber-400"
                     : "fill-[#E8E8E8] text-[#C0C0C0]"
                   }`}
                  />
                 ))}
                 <span className="ml-1 font-bold text-sm">{coach.external_reputation.average_rating}</span>
                 <span className="text-xs text-[#8A8A8A]">({coach.external_reputation.review_count} reviews)</span>
                </div>
               </div>
               <p className="text-xs text-[#8A8A8A] mt-1">
                Based on ratings from {coach.external_reputation.platform_name}
               </p>
               <div className="flex items-center gap-1 mt-1">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Verified by TouchConnectPro</span>
               </div>
              </div>
             )}
             
             <div>
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">Areas of Expertise</p>
              <p className="text-sm text-[#4A4A4A]">{coach.focus_areas}</p>
             </div>
             <div className="pt-2">
              {(() => {
               try {
                const rates = JSON.parse(coach.hourly_rate);
                if (rates.introCallRate && rates.sessionRate && rates.monthlyRate) {
                 const isPurchasing = purchasingCoach?.coachId === coach.id;
                 const canPurchase = !!coach.stripe_account_id;
                 return (
                  <div className="space-y-3">
                   <div className="grid grid-cols-3 gap-2">
                    <Button
                     size="sm"
                     variant="outline"
                     className={`flex flex-col h-auto py-2 ${canPurchase ? 'border-purple-300 text-purple-700 hover:bg-purple-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                     onClick={() => canPurchase && handleCoachPurchase(coach.id, 'intro', coach.full_name)}
                     disabled={isPurchasing || !canPurchase}
                     data-testid={`button-purchase-intro-${coach.id}`}
                    >
                     {isPurchasing && purchasingCoach?.serviceType === 'intro' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                     ) : (
                      <>
                       <span className="text-xs">Intro Call</span>
                       <span className="font-bold">${rates.introCallRate}</span>
                      </>
                     )}
                    </Button>
                    <Button
                     size="sm"
                     variant="outline"
                     className={`flex flex-col h-auto py-2 ${canPurchase ? 'border-purple-300 text-purple-700 hover:bg-purple-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                     onClick={() => canPurchase && handleCoachPurchase(coach.id, 'session', coach.full_name)}
                     disabled={isPurchasing || !canPurchase}
                     data-testid={`button-purchase-session-${coach.id}`}
                    >
                     {isPurchasing && purchasingCoach?.serviceType === 'session' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                     ) : (
                      <>
                       <span className="text-xs">Session</span>
                       <span className="font-bold">${rates.sessionRate}</span>
                      </>
                     )}
                    </Button>
                    <Button
                     size="sm"
                     variant="outline"
                     className={`flex flex-col h-auto py-2 ${canPurchase ? 'border-purple-300 text-purple-700 hover:bg-purple-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                     onClick={() => canPurchase && handleCoachPurchase(coach.id, 'monthly', coach.full_name)}
                     disabled={isPurchasing || !canPurchase}
                     data-testid={`button-purchase-monthly-${coach.id}`}
                    >
                     {isPurchasing && purchasingCoach?.serviceType === 'monthly' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                     ) : (
                      <>
                       <span className="text-xs">Monthly Retainer</span>
                       <span className="font-bold">${rates.monthlyRate}</span>
                      </>
                     )}
                    </Button>
                   </div>
                   {rates.monthlyRetainerDescription && (
                    <p className="text-xs text-[#8A8A8A] bg-purple-50 p-2 rounded">
                     <span className="font-medium">Monthly Retainer includes:</span> {rates.monthlyRetainerDescription}
                    </p>
                   )}
                   <p className="text-xs text-[#8A8A8A] text-center">
                    {canPurchase ? (
                     <>
                      <CreditCard className="inline h-3 w-3 mr-1" />
                      Secure checkout via Stripe
                     </>
                    ) : (
                     <span className="text-amber-600">Coach is setting up payments</span>
                    )}
                   </p>
                  </div>
                 );
                }
               } catch {}
               return <span className="text-lg font-bold text-purple-600">${coach.hourly_rate}/hr</span>;
              })()}
             </div>
             
             {/* One-time contact button */}
             <div className="pt-3 border-t mt-3">
              {contactedCoaches[coach.id] ? (
               <div className="space-y-2">
                {contactedCoaches[coach.id].status === 'closed' && contactedCoaches[coach.id].reply ? (
                 <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                   <Check className="h-3 w-3" /> Coach replied:
                  </p>
                  <p className="text-sm text-green-800">{contactedCoaches[coach.id].reply}</p>
                 </div>
                ) : (
                 <div className="bg-amber-50 p-2 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-center gap-1">
                   <Send className="h-3 w-3" /> Message sent - awaiting reply
                  </p>
                 </div>
                )}
               </div>
              ) : (
               <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full border-[#E8E8E8] text-[#0D566C] hover:bg-[#F3F3F3]"
                onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 console.log("[Contact] Navigating to contact page for coach:", coach.id);
                 navigate(`/contact-coach/${coach.id}`);
                }}
                data-testid={`button-contact-coach-${coach.id}`}
               >
                <Send className="h-3 w-3 mr-2" />
                Get in Touch (One-time message)
               </Button>
              )}
             </div>
             {/* Mobile view profile button */}
             <Button
              variant="outline"
              size="sm"
              className="w-full md:hidden border-purple-300 text-purple-700 hover:bg-purple-50 mt-2"
              onClick={() => navigate(`/coach/${coach.id}`)}
              data-testid={`button-view-profile-mobile-${coach.id}`}
             >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Profile
             </Button>
            </CardContent>
             </div>
            </div>
           </Card>
          )})}
         </div>
        ) : (
         <Card className="text-center py-12">
          <CardContent>
           <GraduationCap className="h-16 w-16 text-[#C0C0C0] mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-[#4A4A4A] mb-2">No Coaches Available Yet</h3>
           <p className="text-[#8A8A8A]">Coaches are being approved and will appear here soon.</p>
          </CardContent>
         </Card>
        )}
       </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (() => {
       // Include system messages in admin section if no mentor assigned
       const hasNoMentor = !mentorData?.mentor?.email;
       // Include all admin email aliases for proper message filtering
       const adminEmails = ["admin@touchconnectpro.com", "buhler.lionel+admin@gmail.com"];
       const isAdminEmail = (email: string) => adminEmails.some(ae => ae.toLowerCase() === email?.toLowerCase());
       
       const adminMsgs = messages.filter((m: any) => 
        isAdminEmail(m.from_email) || 
        isAdminEmail(m.to_email) ||
        (hasNoMentor && m.from_email === "system@touchconnectpro.com")
       );
       const adminUnread = adminMsgs.filter((m: any) => 
        m.to_email === userEmail && !m.is_read
       ).length;
       
       const mentorEmail = mentorData?.mentor?.email;
       // Include system messages (meeting invites) in mentor section
       const mentorMsgs = mentorEmail ? messages.filter((m: any) => 
        m.from_email?.toLowerCase() === mentorEmail.toLowerCase() || 
        m.to_email?.toLowerCase() === mentorEmail.toLowerCase() ||
        m.from_email === "system@touchconnectpro.com"
       ) : messages.filter((m: any) => m.from_email === "system@touchconnectpro.com");
       const mentorUnread = mentorMsgs.filter((m: any) => 
        m.to_email === userEmail && !m.is_read
       ).length;
       
       return (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Messages</h1>
        <p className="text-[#8A8A8A] mb-4">Communicate with your mentor and the TouchConnectPro admin team.</p>

        {/* Account Disabled Warning */}
        {isAccountDisabled && (
         <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="pt-4 pb-4">
           <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
             <p className="font-semibold text-red-800">Account Inactive</p>
             <p className="text-sm text-red-700">Your account is currently inactive. You can only contact the Admin team. To reactivate your membership, please reach out to Admin.</p>
            </div>
           </div>
          </CardContent>
         </Card>
        )}

        {/* Mentor Conversations Section (Threaded) - hidden when account is disabled */}
        {hasActiveMentor && mentorData && mentorData.mentor && !isAccountDisabled && (
         <Card className="mb-6 border-emerald-200">
          <CardHeader className="bg-emerald-50/50">
           <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
             <GraduationCap className="h-5 w-5 text-emerald-600" />
             Mentor: {mentorData.mentor?.full_name || "Your Mentor"}
            </div>
            <div className="flex gap-2">
             <Button 
              onClick={() => setShowNewThreadForm(!showNewThreadForm)}
              size="sm"
              className="bg-[#FF6B5C] hover:bg-[#e55a4d]"
              data-testid="button-new-conversation"
             >
              <Send className="mr-2 h-4 w-4" /> New Conversation
             </Button>
             <Button 
              onClick={refreshThreads}
              variant="outline"
              size="sm"
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              data-testid="button-refresh-threads"
             >
              <RefreshCw className="h-4 w-4" />
             </Button>
            </div>
           </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
           {/* New Thread Form */}
           {showNewThreadForm && (
            <div className="p-4 rounded-lg border border-emerald-300 bg-emerald-50/50 space-y-3">
             <Input
              value={newThreadSubject}
              onChange={(e) => setNewThreadSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="border-emerald-300"
              data-testid="input-thread-subject"
             />
             <textarea
              value={newThreadMessage}
              onChange={(e) => setNewThreadMessage(e.target.value)}
              placeholder={`Type your message to ${mentorData.mentor?.full_name || "your mentor"}...`}
              className="w-full min-h-20 p-3 rounded-lg border border-emerald-300 bg-white text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              data-testid="textarea-new-thread-message"
             />
             
             {/* Attachments Display */}
             {newThreadAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
               {newThreadAttachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded text-xs">
                 <Paperclip className="h-3 w-3" />
                 <span className="max-w-[100px] truncate">{att.name}</span>
                 <button 
                  onClick={() => setNewThreadAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                 >
                  <X className="h-3 w-3" />
                 </button>
                </div>
               ))}
              </div>
             )}
             
             <div className="flex gap-2 items-center">
              <Button 
               onClick={createNewThread}
               disabled={!newThreadMessage.trim() || uploadingFile}
               size="sm"
               className="bg-[#FF6B5C] hover:bg-[#e55a4d]"
               data-testid="button-send-new-thread"
              >
               <Send className="mr-2 h-4 w-4" /> Send
              </Button>
              <label className="cursor-pointer">
               <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleNewThreadFileSelect}
                className="hidden"
                data-testid="input-new-thread-attachment"
               />
               <div className={`flex items-center gap-1 px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-sm ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                <Paperclip className="h-4 w-4" />
                {uploadingFile ? 'Uploading...' : 'Attach'}
               </div>
              </label>
              <Button 
               onClick={() => {
                setShowNewThreadForm(false);
                setNewThreadSubject("");
                setNewThreadMessage("");
                setNewThreadAttachments([]);
               }}
               variant="outline"
               size="sm"
               data-testid="button-cancel-new-thread"
              >
               Cancel
              </Button>
             </div>
            </div>
           )}

           {/* Conversation Threads */}
           <div className="space-y-3">
            <p className="text-sm font-semibold text-[#8A8A8A]">Conversations</p>
            {messageThreads.filter(t => t.mentor_email?.toLowerCase() === mentorData.mentor?.email?.toLowerCase()).length > 0 ? (
             <div className="space-y-3 max-h-96 overflow-y-auto">
              {messageThreads
               .filter(t => t.mentor_email?.toLowerCase() === mentorData.mentor?.email?.toLowerCase())
               .map((thread: any) => {
                const isExpanded = expandedThreadId === thread.id;
                const isClosed = thread.status === "closed";
                const entries = thread.entries || [];
                const lastEntry = entries[entries.length - 1];
                
                return (
                 <div 
                  key={thread.id} 
                  className={`rounded-lg border ${isClosed ? 'bg-[#FAF9F7] border-[#E8E8E8]' : 'bg-white border-emerald-200'}`}
                  data-testid={`thread-${thread.id}`}
                 >
                  <div 
                   className="p-3 cursor-pointer flex items-start justify-between"
                   onClick={() => setExpandedThreadId(isExpanded ? null : thread.id)}
                  >
                   <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                     <p className={`font-semibold text-sm ${isClosed ? 'text-[#8A8A8A]' : 'text-emerald-700'}`}>
                      {thread.subject || "Conversation"}
                     </p>
                     {isClosed && (
                      <Badge variant="secondary" className="text-xs bg-[#E8E8E8]">Closed</Badge>
                     )}
                    </div>
                    <p className="text-xs text-[#8A8A8A]">
                     {entries.length} {entries.length === 1 ? 'message' : 'messages'} • Last: {lastEntry ? new Date(lastEntry.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                   </div>
                   {isExpanded ? <ChevronUp className="h-4 w-4 text-[#8A8A8A]" /> : <ChevronDown className="h-4 w-4 text-[#8A8A8A]" />}
                  </div>
                  
                  {isExpanded && (
                   <div className="border-t border-[#E8E8E8] p-3 space-y-3">
                    {/* Thread Entries */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                     {entries.map((entry: any) => {
                      const isFromMe = entry.senderRole === "entrepreneur";
                      return (
                       <div 
                        key={entry.id} 
                        className={`p-2 rounded-lg text-sm ${isFromMe ? 'bg-[#F3F3F3]' : 'bg-emerald-50'}`}
                       >
                        <div className="flex justify-between items-start mb-1">
                         <span className={`text-xs font-semibold ${isFromMe ? 'text-[#8A8A8A]' : 'text-emerald-600'}`}>
                          {isFromMe ? 'You' : (entry.senderName || mentorData.mentor?.full_name || 'Mentor')}
                         </span>
                         <span className="text-xs text-[#8A8A8A]">{formatToPST(entry.createdAt)}</span>
                        </div>
                        <p className="text-[#4A4A4A] whitespace-pre-wrap">{entry.message}</p>
                        {entry.attachments && entry.attachments.length > 0 && (
                         <div className="mt-2 flex flex-wrap gap-2">
                          {entry.attachments.map((att: any, idx: number) => (
                           <a 
                            key={idx}
                            href={att.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                           >
                            <Paperclip className="h-3 w-3" />
                            {att.name || 'Attachment'}
                           </a>
                          ))}
                         </div>
                        )}
                       </div>
                      );
                     })}
                    </div>
                    
                    {/* Reply Form (only if not closed) */}
                    {!isClosed && (
                     <div className="pt-2 border-t border-[#E8E8E8] space-y-2">
                      {/* Reply attachments display */}
                      {(threadReplyAttachments[thread.id]?.length || 0) > 0 && (
                       <div className="flex flex-wrap gap-2">
                        {threadReplyAttachments[thread.id].map((att, idx) => (
                         <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded text-xs">
                          <Paperclip className="h-3 w-3" />
                          <span className="max-w-[100px] truncate">{att.name}</span>
                          <button 
                           onClick={() => setThreadReplyAttachments(prev => ({
                            ...prev,
                            [thread.id]: prev[thread.id]?.filter((_, i) => i !== idx) || []
                           }))}
                           className="text-red-500 hover:text-red-700"
                          >
                           <X className="h-3 w-3" />
                          </button>
                         </div>
                        ))}
                       </div>
                      )}
                      <div className="flex gap-2 items-center">
                       <Input
                        value={threadReplyText[thread.id] || ""}
                        onChange={(e) => setThreadReplyText(prev => ({ ...prev, [thread.id]: e.target.value }))}
                        placeholder="Type your reply..."
                        className="flex-1 text-sm"
                        data-testid={`input-reply-${thread.id}`}
                        onKeyDown={(e) => {
                         if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addThreadReply(thread.id);
                         }
                        }}
                       />
                       <label className="cursor-pointer">
                        <input
                         type="file"
                         multiple
                         accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                         onChange={(e) => handleReplyFileSelect(thread.id, e)}
                         className="hidden"
                         data-testid={`input-reply-attachment-${thread.id}`}
                        />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                         <Paperclip className="h-4 w-4" />
                        </div>
                       </label>
                       <Button
                        onClick={() => addThreadReply(thread.id)}
                        disabled={!threadReplyText[thread.id]?.trim() || uploadingFile}
                        size="sm"
                        className="bg-[#FF6B5C] hover:bg-[#e55a4d]"
                        data-testid={`button-reply-${thread.id}`}
                       >
                        <Reply className="h-4 w-4" />
                       </Button>
                      </div>
                     </div>
                    )}
                    
                    {isClosed && (
                     <p className="text-xs text-center text-[#8A8A8A] py-2">This conversation has been closed by your mentor.</p>
                    )}
                   </div>
                  )}
                 </div>
                );
               })}
             </div>
            ) : (
             <p className="text-sm text-[#8A8A8A] text-center py-4">No conversations yet. Click "New Conversation" to start one!</p>
            )}
           </div>
          </CardContent>
         </Card>
        )}

        {/* Admin Section - SECOND */}
        <Card className="mb-6 border-[#E8E8E8]">
         <CardHeader className="bg-[#F3F3F3] cursor-pointer" onClick={async () => {
          const el = document.getElementById('admin-messages-section');
          if (el) el.classList.toggle('hidden');
          // Mark all admin messages as read
          const unreadAdminMsgs = adminMsgs.filter((m: any) => m.to_email === userEmail && !m.is_read);
          if (unreadAdminMsgs.length > 0) {
           try {
            await Promise.all(unreadAdminMsgs.map((m: any) => 
             fetch(`${API_BASE_URL}/api/messages/${m.id}/read`, { method: "PATCH" })
            ));
            const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
            if (loadResponse.ok) {
             const data = await loadResponse.json();
             setMessages(data.messages || []);
            }
           } catch (e) { console.error("Error marking as read:", e); }
          }
         }}>
          <CardTitle className="text-lg flex items-center justify-between">
           <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#FF6B5C]" />
            Admin
            {adminUnread > 0 && (
             <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" data-testid="badge-admin-unread">
              {adminUnread} new
             </span>
            )}
           </div>
           <ChevronDown className="h-5 w-5 text-[#8A8A8A]" />
          </CardTitle>
         </CardHeader>
         <CardContent id="admin-messages-section" className="space-y-4 pt-4">
          <textarea
           value={adminMessageText}
           onChange={(e) => setAdminMessageText(e.target.value)}
           placeholder="Type your message to the admin team..."
           className="w-full min-h-20 p-3 rounded-lg border border-[#E8E8E8] bg-white text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B5C]"
           data-testid="textarea-admin-message"
          />
          <Button 
           onClick={async () => {
            if (adminMessageText.trim() && userEmail) {
             try {
              const response = await fetch(`${API_BASE_URL}/api/messages`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                fromName: profileData.fullName,
                fromEmail: userEmail,
                toName: "Admin",
                toEmail: "admin@touchconnectpro.com",
                message: adminMessageText
               })
              });
              if (response.ok) {
               const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
               if (loadResponse.ok) {
                const data = await loadResponse.json();
                setMessages(data.messages || []);
               }
               setAdminMessageText("");
               toast.success("Message sent to admin!");
              } else {
               toast.error("Failed to send message");
              }
             } catch (error) {
              toast.error("Error sending message");
             }
            }
           }}
           disabled={!adminMessageText.trim()}
           size="sm"
           className="bg-[#FF6B5C] hover:bg-[#e55a4d]"
           data-testid="button-send-admin-message"
          >
           <Send className="mr-2 h-4 w-4" /> Send
          </Button>
          
          {adminMsgs.length > 0 && (
           <div className="border-t pt-4 mt-4">
            <p className="text-sm font-semibold text-[#8A8A8A] mb-3">Conversation History</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
             {[...adminMsgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => {
              const isFromMe = msg.from_email === userEmail;
              return (
               <div key={msg.id} onClick={async () => {
                if (!isFromMe && !msg.is_read) {
                 try {
                  await fetch(`${API_BASE_URL}/api/messages/${msg.id}/read`, { method: "PATCH" });
                  const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
                  if (loadResponse.ok) {
                   const data = await loadResponse.json();
                   setMessages(data.messages || []);
                  }
                 } catch (e) {
                  console.error("Error marking as read:", e);
                 }
                }
               }} className={`p-3 rounded-lg ${isFromMe ? 'bg-[#F3F3F3]' : 'bg-[#F3F3F3]'} ${!isFromMe && !msg.is_read ? 'cursor-pointer opacity-70 hover:opacity-100' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                 <span className={`text-sm font-semibold ${isFromMe ? 'text-[#4A4A4A]' : 'text-[#0D566C]'}`}>
                  {isFromMe ? 'You' : 'Admin'}
                 </span>
                 <span className="text-xs text-[#8A8A8A]">{formatToPST(msg.created_at)}</span>
                </div>
                <p className="text-sm text-[#4A4A4A] whitespace-pre-wrap">{msg.message}</p>
               </div>
              );
             })}
            </div>
           </div>
          )}
         </CardContent>
        </Card>
        
        {/* No Mentor Assigned Message */}
        {!hasActiveMentor && (
         <Card className="border-[#E8E8E8]">
          <CardContent className="text-center py-8">
           <GraduationCap className="h-12 w-12 text-[#C0C0C0] mx-auto mb-4" />
           <p className="text-[#8A8A8A]">You haven't been assigned a mentor yet. Once assigned, you'll be able to message them here.</p>
          </CardContent>
         </Card>
        )}
       </div>
      );
      })()}

      {/* My Idea Tab */}
      {activeTab === "idea" && isPreApproved && !ideaSubmitted && !founderSnapshot && (
       <div className="text-center py-16">
        <Target className="h-16 w-16 text-[#4B3F72] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0D566C] mb-3">Complete Your Founder Snapshot First</h2>
        <p className="text-[#8A8A8A] mb-6 max-w-md mx-auto">Answer 6 quick questions in your Founder Snapshot to view and manage your idea details here.</p>
        <Button 
         className="bg-[#4B3F72] hover:bg-[#3d3360] text-white rounded-full" 
         onClick={() => { setActiveTab("overview"); setShowSnapshotForm(true); }}
         data-testid="button-submit-idea-tab"
        >
         <Target className="mr-2 h-4 w-4" />
         Start Founder Snapshot
        </Button>
       </div>
      )}

      {activeTab === "idea" && !(isPreApproved && !ideaSubmitted && !founderSnapshot) && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Your Idea Submission</h1>
        <p className="text-[#8A8A8A] mb-8">Here's a complete summary of your business idea that was submitted to our mentors.</p>

        <div className="space-y-6">
         {steps.map((sec, secIdx) => (
          <Card key={secIdx} className="border-[#E8E8E8]">
           <CardHeader className="pb-3 bg-[#F3F3F3]">
            <CardTitle className="text-lg flex items-center gap-2">
             <sec.icon className="h-5 w-5 text-[#FF6B5C]" />
             {sec.title}
            </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4 pt-6">
            {sec.fields.map((field: any) => (
             <div key={field.key}>
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-2">{field.label}</p>
              <p className="text-[#0D566C] bg-[#FAF9F7] p-3 rounded-lg">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
             </div>
            ))}
           </CardContent>
          </Card>
         ))}
        </div>
       </div>
      )}

      {/* Business Plan Tab */}
      {activeTab === "plan" && isPreApproved && !ideaSubmitted && !founderSnapshot && (
       <div className="text-center py-16">
        <Target className="h-16 w-16 text-[#4B3F72] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0D566C] mb-3">Complete Your Founder Snapshot First</h2>
        <p className="text-[#8A8A8A] mb-6 max-w-md mx-auto">Your business plan will be available after completing your Founder Snapshot and full Blueprint.</p>
        <Button 
         className="bg-[#4B3F72] hover:bg-[#3d3360] text-white rounded-full" 
         onClick={() => { setActiveTab("overview"); setShowSnapshotForm(true); }}
         data-testid="button-submit-idea-plan-tab"
        >
         <Target className="mr-2 h-4 w-4" />
         Start Founder Snapshot
        </Button>
       </div>
      )}

      {activeTab === "plan" && !(isPreApproved && !ideaSubmitted && !founderSnapshot) && (
       <div>
        <div className="flex justify-between items-center mb-8">
         <div>
          <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Your Business Plan</h1>
          <p className="text-[#8A8A8A]">Here's the business plan that was submitted to our mentors for review.</p>
         </div>
         {!submitted && (
          <Button 
           onClick={() => setIsEditingPlan(!isEditingPlan)}
           variant={isEditingPlan ? "destructive" : "default"}
           className={isEditingPlan ? "bg-red-600 hover:bg-red-700" : "bg-[#FF6B5C] hover:bg-[#e55a4d]"}
           data-testid="button-edit-plan"
          >
           {isEditingPlan ? "Cancel" : "Edit Plan"}
          </Button>
         )}
        </div>

        <div className="space-y-6">
         {[
          { key: "executiveSummary", label: "Executive Summary" },
          { key: "problemStatement", label: "Problem Statement" },
          { key: "solution", label: "Solution" },
          { key: "targetMarket", label: "Target Market" },
          { key: "marketSize", label: "Market Size & Opportunity" },
          { key: "revenueModel", label: "Revenue Model & Pricing" },
          { key: "competitiveAdvantage", label: "Competitive Advantage" },
          { key: "roadmap12Month", label: "Month Roadmap" },
          { key: "fundingRequirements", label: "Funding Requirements" },
          { key: "risksAndMitigation", label: "Risks & Mitigation" },
          { key: "successMetrics", label: "Success Metrics" }
         ].map((section) => (
          <Card key={section.key} className="border-[#E8E8E8]">
           <CardHeader className="pb-3 bg-[#F3F3F3]">
            <CardTitle className="text-lg">{section.label}</CardTitle>
           </CardHeader>
           <CardContent className="pt-6">
            {isEditingPlan && !submitted ? (
             <textarea
              value={businessPlanData?.[section.key] || ""}
              onChange={(e) => setBusinessPlanData({ ...businessPlanData, [section.key]: e.target.value })}
              className="w-full min-h-32 p-4 rounded-lg border border-[#E8E8E8] bg-white text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B5C]"
              data-testid={`textarea-plan-${section.key}`}
             />
            ) : (
             <p className="text-[#0D566C] bg-[#FAF9F7] p-4 rounded-lg whitespace-pre-wrap">
              {businessPlanData?.[section.key] || "Business plan not yet submitted"}
             </p>
            )}
           </CardContent>
          </Card>
         ))}
        </div>
       </div>
      )}

      {/* Purchases Tab */}
      {activeTab === "purchases" && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">My Purchases</h1>
        <p className="text-[#8A8A8A] mb-8">View your coaching service purchases and transaction history.</p>

        {loadingPurchases ? (
         <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B5C]" />
         </div>
        ) : coachPurchases.length > 0 ? (
         <div className="space-y-4">
          {coachPurchases.map((purchase) => (
           <Card key={purchase.id} className="border-l-4 border-l-green-500" data-testid={`card-purchase-${purchase.id}`}>
            <CardContent className="pt-6">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
               <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
               </div>
               <div className="min-w-0">
                <p className="font-semibold text-[#0D566C] truncate">{purchase.serviceName}</p>
                <p className="text-sm text-[#8A8A8A] truncate">Coach: {purchase.coachName}</p>
               </div>
              </div>
              <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 pl-13 sm:pl-0">
               <p className="text-lg font-bold text-green-600">${purchase.amount.toFixed(2)}</p>
               <p className="text-xs text-[#8A8A8A]">{new Date(purchase.date).toLocaleDateString()}</p>
               <Badge className={purchase.status === "completed" ? "bg-green-600" : "bg-amber-500"}>
                {purchase.status}
               </Badge>
              </div>
             </div>
            </CardContent>
           </Card>
          ))}
         </div>
        ) : (
         <Card className="text-center py-12">
          <CardContent>
           <ShoppingCart className="h-16 w-16 text-[#C0C0C0] mx-auto mb-4" />
           <h3 className="text-lg font-semibold text-[#4A4A4A] mb-2">No Purchases Yet</h3>
           <p className="text-[#8A8A8A] mb-4">When you purchase coaching services, they will appear here.</p>
           <Button onClick={() => setActiveTab("coaches")} className="bg-[#FF6B5C] hover:bg-[#e55a4d]">
            Browse Available Coaches
           </Button>
          </CardContent>
         </Card>
        )}
       </div>
      )}

      {/* Mentor Notes Tab */}
      {activeTab === "notes" && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Mentor Notes</h1>
        <p className="text-[#8A8A8A] mb-8">Respond to each task from your mentor. You can add text responses and attach files.</p>

        {mentorNotes && mentorNotes.length > 0 ? (() => {
         const sortedNotes = [...mentorNotes].sort((a: any, b: any) => {
          const timeA = typeof a === 'string' ? 0 : new Date(a.timestamp || 0).getTime();
          const timeB = typeof b === 'string' ? 0 : new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
         });
         
         return (
          <div className="space-y-4">
           {sortedNotes.map((note: any, idx: number) => {
            const noteText = typeof note === 'string' ? note : note.text;
            const noteTime = typeof note === 'string' ? null : note.timestamp;
            const isCompleted = typeof note === 'string' ? false : note.completed;
            const noteId = note.id || `note_idx_${idx}`;
            const noteResponses_list = note.responses || [];
            const isExpanded = expandedNoteId === noteId;
            const isSubmitting = submittingNoteId === noteId;
            
            return (
             <Card key={noteId} className={`border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50' : 'border-l-emerald-500'} border-[#E8E8E8]`} data-testid={`card-note-${noteId}`}>
              <CardContent className="pt-6">
               <div className="flex gap-4">
                <div className={`text-3xl font-bold min-w-12 ${isCompleted ? 'text-green-500' : 'text-emerald-500'}`}>{idx + 1}.</div>
                <div className="flex-1">
                 <p className={`leading-relaxed ${isCompleted ? 'text-green-900 line-through' : 'text-[#0D566C]'}`}>{noteText}</p>
                 {noteTime && <p className={`text-xs mt-3 ${isCompleted ? 'text-green-700' : 'text-[#8A8A8A]'}`}>Added on {new Date(noteTime).toLocaleDateString()}</p>}
                 
                 {/* Existing Responses */}
                 {noteResponses_list.length > 0 && (
                  <div className="mt-4 space-y-3">
                   <p className="text-sm font-medium text-[#8A8A8A] flex items-center gap-2">
                    <Reply className="h-4 w-4" /> Your Responses ({noteResponses_list.length})
                   </p>
                   {noteResponses_list.map((resp: any, respIdx: number) => (
                    <div key={resp.id || respIdx} className="bg-[#F3F3F3] rounded-lg p-3 border border-[#E8E8E8]" data-testid={`response-${resp.id || respIdx}`}>
                     {resp.text && <p className="text-sm text-[#4A4A4A]">{resp.text}</p>}
                     {resp.attachmentUrl && (
                      <a 
                       href={resp.attachmentUrl} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 mt-2 text-sm text-[#FF6B5C] hover:text-[#e55a4d]"
                       data-testid={`button-download-attachment-${resp.id || respIdx}`}
                      >
                       <Download className="h-4 w-4" />
                       {resp.attachmentName || "Download Attachment"}
                      </a>
                     )}
                     <p className="text-xs text-[#8A8A8A] mt-1">{formatToPST(resp.timestamp)}</p>
                    </div>
                   ))}
                  </div>
                 )}
                 
                 {/* Response Form Toggle */}
                 <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setExpandedNoteId(isExpanded ? null : noteId)}
                  data-testid={`button-respond-${noteId}`}
                 >
                  {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <Reply className="h-4 w-4 mr-2" />}
                  {isExpanded ? "Cancel" : "Respond"}
                 </Button>
                 
                 {/* Response Form */}
                 {isExpanded && (
                  <div className="mt-4 p-4 bg-[#FAF9F7] rounded-lg border border-[#E8E8E8]">
                   <textarea
                    value={noteResponses[noteId] || ""}
                    onChange={(e) => setNoteResponses(prev => ({ ...prev, [noteId]: e.target.value }))}
                    placeholder="Type your response here..."
                    className="w-full min-h-24 p-3 rounded-lg border border-[#E8E8E8] bg-white text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B5C] resize-y"
                    disabled={isSubmitting}
                    data-testid={`textarea-response-${noteId}`}
                   />
                   
                   {/* File Attachment */}
                   <div className="mt-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-[#8A8A8A] hover:text-[#FF6B5C]">
                     <Paperclip className="h-4 w-4" />
                     <span>{noteAttachments[noteId] ? noteAttachments[noteId]!.name : "Attach a file (PDF, Word, Excel, CSV, Images)"}</span>
                     <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => {
                       const file = e.target.files?.[0] || null;
                       setNoteAttachments(prev => ({ ...prev, [noteId]: file }));
                      }}
                      disabled={isSubmitting}
                      data-testid={`input-file-${noteId}`}
                     />
                    </label>
                    {noteAttachments[noteId] && (
                     <div className="flex items-center gap-2 mt-2 text-sm text-[#8A8A8A]">
                      <FileText className="h-4 w-4" />
                      <span>{noteAttachments[noteId]!.name}</span>
                      <span className="text-xs">({(noteAttachments[noteId]!.size / 1024).toFixed(1)} KB)</span>
                      <button
                       onClick={() => setNoteAttachments(prev => ({ ...prev, [noteId]: null }))}
                       className="text-red-500 hover:text-red-600 ml-2"
                       data-testid={`button-remove-file-${noteId}`}
                      >
                       ✕
                      </button>
                     </div>
                    )}
                   </div>
                   
                   <div className="flex gap-2 mt-4">
                    <Button
                     onClick={() => handleSubmitNoteResponse(noteId)}
                     disabled={isSubmitting || (!noteResponses[noteId]?.trim() && !noteAttachments[noteId])}
                     className="bg-[#FF6B5C] hover:bg-[#e55a4d]"
                     data-testid={`button-submit-response-${noteId}`}
                    >
                     {isSubmitting ? (
                      <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Submitting...
                      </>
                     ) : (
                      <>
                       <Send className="h-4 w-4 mr-2" />
                       Submit Response
                      </>
                     )}
                    </Button>
                    <Button
                     variant="outline"
                     onClick={() => {
                      setExpandedNoteId(null);
                      setNoteResponses(prev => ({ ...prev, [noteId]: "" }));
                      setNoteAttachments(prev => ({ ...prev, [noteId]: null }));
                     }}
                     disabled={isSubmitting}
                     data-testid={`button-cancel-response-${noteId}`}
                    >
                     Cancel
                    </Button>
                   </div>
                  </div>
                 )}
                </div>
                {isCompleted && <div className="text-green-600 text-2xl font-bold min-w-fit">✓</div>}
               </div>
              </CardContent>
             </Card>
            );
           })}
          </div>
         );
        })() : (
         <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-8 pb-8 text-center">
           <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
           <p className="text-[#8A8A8A]">No mentor notes yet. Check back soon for guidance from your mentor!</p>
          </CardContent>
         </Card>
        )}
       </div>
      )}

      {/* Meetings Tab */}
      {activeTab === "meetings" && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Scheduled Meetings</h1>
        <p className="text-[#8A8A8A] mb-8">View all meetings scheduled by your mentor</p>
        
        <div className="space-y-4">
         {meetings.length > 0 ? meetings.map((meeting) => (
          <Card key={meeting.id} className="border-l-4 border-l-blue-500">
           <CardContent className="pt-6">
            <div className="flex justify-between items-start">
             <div className="flex-1">
              <p className="font-semibold text-[#0D566C] mb-2">{meeting.topic}</p>
              <p className="text-sm text-[#8A8A8A] mb-1">Status: {meeting.status}</p>
              {meeting.start_time && <p className="text-sm text-[#8A8A8A]">{formatToPST(meeting.start_time)}</p>}
              <p className="text-sm text-[#8A8A8A]">Duration: {meeting.duration} minutes</p>
              <a href={meeting.join_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
               <ExternalLink className="h-3 w-3" /> Join Meeting
              </a>
             </div>
            </div>
           </CardContent>
          </Card>
         )) : (
          <Card>
           <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-[#C0C0C0] mx-auto mb-4" />
            <p className="text-[#8A8A8A]">No meetings scheduled yet. Your mentor will schedule one soon!</p>
           </CardContent>
          </Card>
         )}
        </div>
       </div>
      )}

      {/* Ask a Mentor Tab */}
      {activeTab === "ask-mentor" && (
       <div>
        <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Ask a Mentor</h1>
        <p className="text-[#8A8A8A] mb-6">
         {hasPaid 
          ? "Your previous community questions and answers are shown below. Since you now have a paid membership, you can message your dedicated mentor directly through the Messages tab."
          : "Have a question about your business? Ask our mentor community and get expert guidance. While you don't have a dedicated mentor with your current plan, our team will review your question and provide a helpful answer."
         }
        </p>
        
        {!hasPaid && (
         <Card className="mb-6 border-purple-200">
          <CardHeader className="bg-purple-50/50">
           <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            Submit a Question
           </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
           <textarea
            value={newMentorQuestion}
            onChange={(e) => setNewMentorQuestion(e.target.value)}
            placeholder="What would you like to ask a mentor? Be specific about your challenge or question..."
            className="w-full min-h-32 p-3 rounded-lg border border-purple-300 bg-white text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-purple-500"
            data-testid="textarea-mentor-question"
           />
           <div className="flex justify-between items-center">
            <p className="text-xs text-[#8A8A8A]">Our team will review your question and provide guidance as soon as possible.</p>
            <Button
             onClick={async () => {
              if (!newMentorQuestion.trim()) return;
              setSendingMentorQuestion(true);
              try {
               const response = await fetch(`${API_BASE_URL}/api/mentor-questions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                 entrepreneurEmail: userEmail,
                 entrepreneurName: profileData.fullName || "Entrepreneur",
                 question: newMentorQuestion.trim(),
                 ideaId: entrepreneurData?.id || null
                })
               });
               if (response.ok) {
                toast.success("Your question has been submitted! We'll get back to you soon.");
                setNewMentorQuestion("");
                const refreshResponse = await fetch(`${API_BASE_URL}/api/mentor-questions/entrepreneur/${encodeURIComponent(userEmail)}`);
                if (refreshResponse.ok) {
                 const data = await refreshResponse.json();
                 setMentorQuestions(data.questions || []);
                }
               } else {
                const error = await response.json();
                toast.error(error.error || "Failed to submit question");
               }
              } catch (error) {
               console.error("Error submitting mentor question:", error);
               toast.error("Failed to submit question. Please try again.");
              } finally {
               setSendingMentorQuestion(false);
              }
             }}
             disabled={!newMentorQuestion.trim() || sendingMentorQuestion}
             className="bg-purple-600 hover:bg-purple-700"
             data-testid="button-submit-mentor-question"
            >
             {sendingMentorQuestion ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
             ) : (
              <><Send className="mr-2 h-4 w-4" /> Submit Question</>
             )}
            </Button>
           </div>
          </CardContent>
         </Card>
        )}

        <h2 className="text-xl font-display font-bold text-[#0D566C] mb-4">{hasPaid ? "Previous Questions" : "Your Questions"}</h2>
        {mentorQuestions.length === 0 ? (
         <Card>
          <CardContent className="pt-12 pb-12 text-center">
           <HelpCircle className="h-12 w-12 mx-auto text-[#C0C0C0] mb-4" />
           <p className="text-[#8A8A8A]">{hasPaid ? "No previous community questions to display." : "You haven't asked any questions yet. Use the form above to get started!"}</p>
          </CardContent>
         </Card>
        ) : (
         <div className="space-y-4">
          {mentorQuestions.map((q: any, idx: number) => (
           <Card key={q.id || idx} className={`border-l-4 ${q.status === "answered" ? "border-l-emerald-500" : "border-l-purple-500"}`}>
            <CardContent className="pt-6 space-y-4">
             <div className="flex justify-between items-start">
              <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                <Badge className={q.status === "answered" ? "bg-emerald-600" : "bg-purple-600"}>
                 {q.status === "answered" ? "Answered" : "Pending"}
                </Badge>
                <span className="text-xs text-[#8A8A8A]">
                 {q.created_at ? new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
               </div>
               <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Your Question</p>
                <p className="text-[#0D566C] whitespace-pre-wrap">{q.question}</p>
               </div>
              </div>
             </div>
             {q.admin_reply && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
               <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Mentor Response</p>
               <p className="text-[#0D566C] whitespace-pre-wrap">{q.admin_reply}</p>
               {q.replied_at && (
                <p className="text-xs text-[#8A8A8A] mt-2">
                 Replied {new Date(q.replied_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
               )}
              </div>
             )}
            </CardContent>
           </Card>
          ))}
         </div>
        )}
       </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && isPreApproved && !ideaSubmitted && !founderSnapshot && (
       <div className="text-center py-16">
        <User className="h-16 w-16 text-[#4B3F72] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#0D566C] mb-3">Complete Your Founder Snapshot First</h2>
        <p className="text-[#8A8A8A] mb-6 max-w-md mx-auto">Your profile will become available after completing your Founder Snapshot.</p>
        <Button 
         className="bg-[#4B3F72] hover:bg-[#3d3360] text-white rounded-full" 
         onClick={() => { setActiveTab("overview"); setShowSnapshotForm(true); }}
         data-testid="button-submit-idea-profile-tab"
        >
         <Target className="mr-2 h-4 w-4" />
         Start Founder Snapshot
        </Button>
       </div>
      )}

      {activeTab === "profile" && !(isPreApproved && !ideaSubmitted && !founderSnapshot) && (
       <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
         <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0D566C] mb-1 sm:mb-2">Entrepreneur Profile</h1>
          <p className="text-sm sm:text-base text-[#8A8A8A]">Your profile is visible to mentors and admins on our platform.</p>
         </div>
         <Button 
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          variant={isEditingProfile ? "destructive" : "default"}
          className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-[#FF6B5C] hover:bg-[#e55a4d]"}
          data-testid="button-edit-profile"
         >
          {isEditingProfile ? "Cancel" : "Edit Profile"}
         </Button>
        </div>

        {isEditingProfile ? (
         <Card className="border-[#E8E8E8] max-w-2xl">
          <CardHeader className="bg-white rounded-xl">
           <CardTitle>Edit Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
           <div>
            <label className="text-sm font-semibold text-[#0D566C] mb-2 block">Profile Picture</label>
            <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-[#F3F3F3] flex items-center justify-center text-2xl overflow-hidden">
              {profileData.profileImage ? (
               <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : "👤"}
             </div>
             <div className="flex flex-col gap-2">
              <input
               type="file"
               accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
               id="profile-upload"
               className="hidden"
               onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                 // Check file size (max 5MB)
                 if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image is too large. Please use an image under 5MB.");
                  return;
                 }
                 
                 // Always use base64 for reliability
                 const reader = new FileReader();
                 reader.onloadend = () => {
                  setProfileData({ ...profileData, profileImage: reader.result as string });
                  toast.success("Image added! Click 'Save Changes' to keep it.");
                 };
                 reader.onerror = () => {
                  toast.error("Failed to read image file.");
                 };
                 reader.readAsDataURL(file);
                }
               }}
               data-testid="input-profile-image"
              />
              <Button 
               variant="outline" 
               className="border-[#E8E8E8]"
               onClick={() => document.getElementById("profile-upload")?.click()}
               data-testid="button-upload-photo"
              >
               Upload Photo
              </Button>
              {profileData.profileImage && (
               <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => setProfileData({ ...profileData, profileImage: null })}
                data-testid="button-remove-photo"
               >
                Remove
               </Button>
              )}
             </div>
            </div>
           </div>

           <div>
            <label className="text-sm font-semibold text-[#0D566C] mb-2 block">Full Name *</label>
            <Input
             value={profileData.fullName}
             onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
             className="bg-[#FAF9F7]"
             data-testid="input-profile-name"
            />
           </div>

           <div>
            <label className="text-sm font-semibold text-[#0D566C] mb-2 block">Email Address</label>
            <Input
             type="email"
             value={profileData.email}
             disabled
             className="bg-[#F3F3F3] text-[#8A8A8A] cursor-not-allowed rounded-xl"
             data-testid="input-profile-email"
            />
            <p className="text-xs text-[#8A8A8A] mt-1">Email cannot be changed</p>
           </div>

           <div>
            <label className="text-sm font-semibold text-[#0D566C] mb-2 block">Country</label>
            <Input
             value={profileData.country}
             disabled
             className="bg-[#F3F3F3] text-[#8A8A8A] cursor-not-allowed rounded-xl"
             data-testid="input-profile-country"
            />
            <p className="text-xs text-[#8A8A8A] mt-1">Contact admin to change your country</p>
           </div>

           <div>
            <label className="text-sm font-semibold text-[#0D566C] mb-2 block">About the entrepreneur</label>
            <textarea
             value={profileData.bio}
             onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
             placeholder="Tell us about yourself..."
             className="w-full min-h-[100px] p-3 rounded-lg border border-[#E8E8E8] bg-[#FAF9F7] text-[#4A4A4A] resize-y"
             data-testid="input-profile-bio"
            />
           </div>

           <div className="flex gap-4 pt-4">
            <Button 
             variant="outline" 
             className="flex-1 border-[#E8E8E8]"
             onClick={() => setIsEditingProfile(false)}
             data-testid="button-cancel-profile"
            >
             Cancel
            </Button>
            <Button 
             className="flex-1 bg-[#FF6B5C] hover:bg-[#e55a4d]"
             disabled={savingProfile}
             onClick={async () => {
              setSavingProfile(true);
              toast.loading("Updating your profile...", { id: "saving-profile" });
              try {
               const response = await fetch(`${API_BASE_URL}/api/entrepreneurs/profile/${encodeURIComponent(profileData.email)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                 fullName: profileData.fullName,
                 country: profileData.country,
                 bio: profileData.bio,
                 profileImage: profileData.profileImage
                })
               });
               if (response.ok) {
                toast.success("Profile updated successfully!", { id: "saving-profile" });
                setIsEditingProfile(false);
               } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to update profile", { id: "saving-profile" });
               }
              } catch (err) {
               console.error("Error updating profile:", err);
               toast.error("Failed to update profile", { id: "saving-profile" });
              } finally {
               setSavingProfile(false);
              }
             }}
             data-testid="button-save-profile"
            >
             {savingProfile ? (
              <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Saving...
              </>
             ) : (
              "Save Changes"
             )}
            </Button>
           </div>
          </CardContent>
         </Card>
        ) : (
         <div className="space-y-6">
          <Card className="border-[#E8E8E8]">
           <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F3F3F3] flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
              {profileData.profileImage ? (
               <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : "👤"}
             </div>
             <div className="flex-1 space-y-3">
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">Full Name</p>
               <p className="text-lg font-semibold text-[#0D566C]">{profileData.fullName}</p>
              </div>
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">Email</p>
               <p className="text-[#0D566C]">{profileData.email}</p>
              </div>
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">Country</p>
               <p className="text-[#0D566C]">{profileData.country}</p>
              </div>
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">LinkedIn</p>
               {profileData.linkedIn ? (
                <a href={profileData.linkedIn.startsWith('http') ? profileData.linkedIn : `https://${profileData.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-[#FF6B5C] hover:text-[#e55a4d]">
                 {profileData.linkedIn}
                </a>
               ) : (
                <p className="text-[#0D566C]">—</p>
               )}
              </div>
              <div>
               <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">Website</p>
               {profileData.website ? (
                <a href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="text-[#FF6B5C] hover:text-[#e55a4d]">
                 {profileData.website}
                </a>
               ) : (
                <p className="text-[#0D566C]">—</p>
               )}
              </div>
             </div>
            </div>
           </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
           <CardContent className="pt-6">
            <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-2">About the entrepreneur</p>
            <p className="text-[#0D566C]">{profileData.bio || "—"}</p>
           </CardContent>
          </Card>

          {/* Subtle membership management - at the very bottom */}
          <div className="mt-12 pt-6 border-t border-[#E8E8E8]">
           <p className="text-xs text-[#8A8A8A] text-center">
            Need to manage your subscription?{" "}
            <button 
             onClick={() => setShowCancelModal(true)}
             className="text-[#8A8A8A] hover:text-[#4A4A4A] underline"
             data-testid="link-cancel-membership"
            >
             Membership settings
            </button>
           </p>
          </div>

         </div>
        )}
       </div>
      )}

      {/* Membership Cancellation Modal */}
      {showCancelModal && (
       <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md">
         <DialogHeader>
          <DialogTitle>Cancel Membership</DialogTitle>
          <DialogDescription>
           We're sorry to see you go. Before you cancel, please note:
          </DialogDescription>
         </DialogHeader>
         <div className="space-y-4 py-4">
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#8A8A8A]">
           <li>Your access will remain active until the end of your current billing cycle</li>
           <li>No future charges will be made to your card</li>
           <li>You can rejoin anytime in the future</li>
          </ul>
          <div className="bg-amber-50 p-4 rounded-lg">
           <p className="text-sm text-amber-800">
            <strong>Note:</strong> If you're having issues or need help, please reach out to us via Messages before cancelling. We'd love to help!
           </p>
          </div>
         </div>
         <div className="flex gap-3 justify-end">
          <Button 
           variant="outline" 
           onClick={() => setShowCancelModal(false)}
           data-testid="button-cancel-modal-close"
          >
           Keep My Membership
          </Button>
          <Button 
           variant="destructive"
           disabled={isCancelling}
           onClick={async () => {
            setIsCancelling(true);
            try {
             // First cancel Stripe subscription
             const response = await fetch(`${API_BASE_URL}/api/stripe/cancel-subscription`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail })
             });
             if (response.ok) {
              // Also record cancellation for admin notification and tracking
              try {
               await fetch(`${API_BASE_URL}/api/cancellation-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                 userType: 'entrepreneur',
                 userName: profileData.fullName || 'Entrepreneur',
                 userEmail: userEmail,
                 reason: 'Membership cancelled via dashboard'
                })
               });
              } catch (err) {
               console.error("Error recording cancellation:", err);
              }
              toast.success("Your membership has been cancelled. You'll retain access until the end of your billing period.");
              setShowCancelModal(false);
              setHasPendingCancellation(true);
             } else {
              const data = await response.json();
              toast.error(data.error || "Failed to cancel membership");
             }
            } catch (error) {
             console.error("Cancellation error:", error);
             toast.error("Failed to cancel membership. Please contact support.");
            } finally {
             setIsCancelling(false);
            }
           }}
           data-testid="button-confirm-cancel"
          >
           {isCancelling ? (
            <>
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Cancelling...
            </>
           ) : (
            "Cancel My Membership"
           )}
          </Button>
         </div>
        </DialogContent>
       </Dialog>
      )}
     </div>
    </main>

    {/* Reviews Modal for Submitted View */}
    {showReviewsModal && selectedCoachForReviews && (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
       <CardHeader className="border-b">
        <div className="flex items-center justify-between">
         <div>
          <CardTitle className="text-lg">Reviews for {selectedCoachForReviews.full_name}</CardTitle>
          <p className="text-sm text-[#8A8A8A] mt-1">
           {coachRatings[selectedCoachForReviews.id]?.averageRating} avg rating • {coachRatings[selectedCoachForReviews.id]?.totalRatings} reviews
          </p>
         </div>
         <Button
          variant="ghost"
          size="sm"
          onClick={() => {
           setShowReviewsModal(false);
           setSelectedCoachForReviews(null);
           setCoachReviews([]);
          }}
          data-testid="button-close-reviews-submitted"
         >
          ✕
         </Button>
        </div>
       </CardHeader>
       <CardContent className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
        {coachReviews.length === 0 ? (
         <p className="text-[#8A8A8A] text-center py-8">No reviews yet</p>
        ) : (
         coachReviews.map((review: any) => (
          <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
           <div className="flex items-center gap-2 mb-2">
            <div className="flex">
             {[1, 2, 3, 4, 5].map((star) => (
              <Star
               key={star}
               className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#C0C0C0]'}`}
              />
             ))}
            </div>
            <span className="text-xs text-[#8A8A8A]">
             {new Date(review.created_at).toLocaleDateString()}
            </span>
           </div>
           {review.review ? (
            <p className="text-sm text-[#4A4A4A]">{review.review}</p>
           ) : (
            <p className="text-sm text-[#8A8A8A] italic">No written review</p>
           )}
          </div>
         ))
        )}
       </CardContent>
      </Card>
     </div>
    )}
    </div>
   </div>
  );
 }

 if (showAIReview && aiEnhancedData) {
  return (
   <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF9F7]">
    <aside className="w-64 border-r border-[#E8E8E8] bg-white hidden md:flex flex-col">
     <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
       <Avatar className="h-10 w-10 border border-[#E8E8E8] bg-[#FF6B5C]">
        <AvatarFallback className="text-white">EN</AvatarFallback>
       </Avatar>
       <div>
        <div className="font-bold text-sm">Entrepreneur</div>
        <div className="text-xs text-[#8A8A8A]">AI Review</div>
       </div>
      </div>
     </div>
    </aside>

    <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
     <div className="max-w-3xl mx-auto">
      <button 
       onClick={() => setShowAIReview(false)} 
       className="flex items-center gap-2 text-[#FF6B5C] hover:text-[#e55a4d] mb-6 font-medium"
       data-testid="button-back-to-review"
      >
       <ChevronLeft className="h-4 w-4" /> Back to Review
      </button>
      
      <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">AI Enhancement Review</h1>
      <p className="text-[#8A8A8A] mb-8">Our AI has rewritten your answers to make them clearer and more compelling for investors. Review and accept the enhancements, or edit any answer as needed.</p>

      <div className="space-y-6">
       {steps.map((sec, secIdx) => {
        const sectionAnswers = sec.fields.filter((f: any) => aiEnhancedData[f.key]);
        if (sectionAnswers.length === 0) return null;
        
        return (
         <Card key={secIdx} className="border-[#E8E8E8]">
          <CardHeader className="pb-3 bg-[#F3F3F3]">
           <CardTitle className="text-lg flex items-center gap-2">
            <sec.icon className="h-5 w-5 text-[#FF6B5C]" />
            {sec.title}
           </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
           {sectionAnswers.map((field: any) => (
            <div key={field.key} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
             <p className="text-xs font-semibold text-[#8A8A8A] uppercase">{field.label}</p>
             
             {/* Original Answer */}
             <div className="bg-[#FAF9F7] p-4 rounded-lg">
              <p className="text-xs font-medium text-[#8A8A8A] mb-2">Your Original Answer:</p>
              <p className="text-sm text-[#4A4A4A]">{aiEnhancedData[field.key].original}</p>
             </div>

             {/* AI Enhanced Answer (Editable) */}
             <div className="space-y-2">
              <p className="text-xs font-medium text-[#FF6B5C]">AI Enhanced Answer:</p>
              <textarea
               value={aiEnhancedData[field.key].aiEnhanced}
               onChange={(e) => handleEditAIAnswer(field.key, e.target.value)}
               rows={3}
               className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg bg-[#F3F3F3] text-[#0D566C] placeholder:text-[#8A8A8A] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20 focus:outline-none"
               data-testid={`textarea-ai-${field.key}`}
              />
              {aiEnhancedData[field.key].isEdited && (
               <p className="text-xs text-amber-600">✓ You've edited this answer</p>
              )}
             </div>
            </div>
           ))}
          </CardContent>
         </Card>
        );
       })}
      </div>

      <div className="mt-8 flex gap-4">
       <Button 
        variant="outline" 
        className="flex-1 border-[#E8E8E8]"
        onClick={() => setShowAIReview(false)}
        data-testid="button-back-from-ai"
       >
        Back to Review
       </Button>
       <Button 
        className="flex-1 bg-[#FF6B5C] hover:bg-[#e55a4d]"
        onClick={handleAcceptAIEnhancements}
        data-testid="button-accept-ai-enhancement"
       >
        Accept & Continue
       </Button>
      </div>
     </div>
    </main>
   </div>
  );
 }

 if (showReview) {
  return (
   <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF9F7]">
    <aside className="w-64 border-r border-[#E8E8E8] bg-white hidden md:flex flex-col">
     <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
       <Avatar className="h-10 w-10 border border-[#E8E8E8] bg-[#FF6B5C]">
        <AvatarFallback className="text-white">EN</AvatarFallback>
       </Avatar>
       <div>
        <div className="font-bold text-sm">Entrepreneur</div>
        <div className="text-xs text-[#8A8A8A]">Reviewing Idea</div>
       </div>
      </div>
     </div>
    </aside>

    <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
     <div className="max-w-2xl mx-auto">
      <button 
       onClick={() => setShowReview(false)} 
       className="flex items-center gap-2 text-[#FF6B5C] hover:text-[#e55a4d] mb-6 font-medium"
       data-testid="button-back-to-steps"
      >
       <ChevronLeft className="h-4 w-4" /> Back to Edit
      </button>
      
      <h1 className="text-3xl font-display font-bold text-[#0D566C] mb-2">Review Your Idea</h1>
      <p className="text-[#8A8A8A] mb-8">Check all your answers before submitting. You can edit any section by clicking "Edit".</p>

      <div className="space-y-6">
       {steps.map((sec, idx) => (
        <Card key={idx} className="border-[#E8E8E8]">
         <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
           <CardTitle className="text-lg flex items-center gap-2">
            <sec.icon className="h-5 w-5 text-[#FF6B5C]" />
            {sec.title}
           </CardTitle>
           <button onClick={() => handleEditStep(idx)} className="text-sm text-[#FF6B5C] hover:text-[#e55a4d] font-medium">Edit</button>
          </div>
         </CardHeader>
         <CardContent className="space-y-4">
          {sec.fields.map((field) => (
           <div key={field.key}>
            <p className="text-xs font-semibold text-[#8A8A8A] uppercase mb-1">{field.label}</p>
            <p className="text-[#0D566C]">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
           </div>
          ))}
         </CardContent>
        </Card>
       ))}
      </div>

      <div className="mt-8 flex gap-4">
       <Button 
        variant="outline" 
        className="flex-1 border-[#E8E8E8]"
        onClick={() => setShowReview(false)}
        data-testid="button-go-back"
       >
        Go Back
       </Button>
       <Button 
        className="flex-1 bg-[#FF6B5C] hover:bg-[#e55a4d]"
        onClick={generateAIEnhancedAnswers}
        disabled={isGeneratingAI}
        data-testid="button-submit-to-ai"
       >
        {isGeneratingAI ? (
         <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          AI is enhancing your answers...
         </>
        ) : (
         "Submit to AI for Enhancement"
        )}
       </Button>
      </div>
     </div>
    </main>
   </div>
  );
 }

 return (
  <div className="flex min-h-[calc(100vh-4rem)] bg-[#FAF9F7]">
   <aside className="w-64 border-r border-[#E8E8E8] bg-white hidden md:flex flex-col">
    <div className="p-6">
     <div className="flex items-center gap-3 mb-6">
      <Avatar className="h-10 w-10 border border-[#E8E8E8] bg-[#FF6B5C]">
       <AvatarFallback className="text-white">EN</AvatarFallback>
      </Avatar>
      <div>
       <div className="font-bold text-sm">Entrepreneur</div>
       <div className="text-xs text-[#8A8A8A]">Setting up your idea</div>
      </div>
     </div>
     <nav className="space-y-1">
      <Button variant="secondary" className="w-full justify-start font-medium">
       <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
      </Button>
      <Button variant="ghost" className="w-full justify-start font-medium text-[#8A8A8A]">
       <Lightbulb className="mr-2 h-4 w-4" /> My Idea
      </Button>
     </nav>
    </div>
   </aside>

   <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden flex items-center justify-center">
    <div className="w-full max-w-lg">
     {/* Progress */}
     <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
       <span className="text-sm font-medium text-[#8A8A8A]">Step {currentStep + 1} of {steps.length}</span>
       <span className="text-sm font-medium text-[#8A8A8A]">{Math.round(progressPercent)}%</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
     </div>

     {/* Validation Error */}
     {validationError && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
       <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
       <p className="text-sm text-red-700">{validationError}</p>
      </div>
     )}

     {/* Question Card */}
     <Card className="border-[#E8E8E8] bg-white shadow-lg">
      <CardHeader>
       <div className="flex items-start justify-between gap-4 mb-4">
        <div className="h-12 w-12 bg-[#F3F3F3] rounded-lg flex items-center justify-center">
         <CurrentStepIcon className="h-6 w-6 text-[#FF6B5C]" />
        </div>
       </div>
       <CardTitle className="text-2xl font-display font-bold text-[#0D566C]">
        {step.title}
       </CardTitle>
       <p className="text-[#8A8A8A] mt-2">{step.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
       {step.fields.map((field: any) => (
        <div key={field.key} className="space-y-2">
         <label className="text-sm font-medium text-[#0D566C]">
          {field.label}
         </label>
         {field.type === "textarea" ? (
          <textarea
           rows={field.rows || 3}
           placeholder={field.placeholder}
           value={formData[field.key as keyof typeof formData]}
           onChange={(e) => handleInputChange(field.key, e.target.value)}
           className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#4A4A4A] placeholder:text-[#8A8A8A] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20 focus:outline-none"
           data-testid={`input-${field.key}`}
          />
         ) : field.type === "select" ? (
          <select
           value={formData[field.key as keyof typeof formData]}
           onChange={(e) => handleInputChange(field.key, e.target.value)}
           className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#4A4A4A] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20 focus:outline-none"
           data-testid={`select-${field.key}`}
          >
           <option value="">Select {field.label.toLowerCase()}...</option>
           {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
           ))}
          </select>
         ) : (
          <input
           type="text"
           placeholder={field.placeholder}
           value={formData[field.key as keyof typeof formData]}
           onChange={(e) => handleInputChange(field.key, e.target.value)}
           className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#4A4A4A] placeholder:text-[#8A8A8A] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20 focus:outline-none"
           data-testid={`input-${field.key}`}
          />
         )}
        </div>
       ))}

       {/* Navigation Buttons */}
       <div className="flex gap-3 pt-6">
        {currentStep > 0 && (
         <Button
          variant="outline"
          className="flex-1"
          onClick={handlePrevious}
          data-testid="button-previous"
         >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
         </Button>
        )}
        <Button
         className={`flex-1 ${currentStep === 0 ? "w-full" : ""} bg-[#FF6B5C] hover:bg-[#e55a4d] disabled:opacity-50 disabled:cursor-not-allowed`}
         onClick={handleNext}
         data-testid="button-next"
         disabled={validationError ? false : false}
        >
         {currentStep === steps.length - 1 ? (
          <>Review & Submit</>
         ) : (
          <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
         )}
        </Button>
       </div>
      </CardContent>
     </Card>
    </div>
   </main>

   {/* Reviews Modal */}
   {showReviewsModal && selectedCoachForReviews && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
      <CardHeader className="border-b">
       <div className="flex items-center justify-between">
        <div>
         <CardTitle className="text-lg">Reviews for {selectedCoachForReviews.full_name}</CardTitle>
         <p className="text-sm text-[#8A8A8A] mt-1">
          {coachRatings[selectedCoachForReviews.id]?.averageRating} avg rating • {coachRatings[selectedCoachForReviews.id]?.totalRatings} reviews
         </p>
        </div>
        <Button
         variant="ghost"
         size="sm"
         onClick={() => {
          setShowReviewsModal(false);
          setSelectedCoachForReviews(null);
          setCoachReviews([]);
         }}
         data-testid="button-close-reviews"
        >
         ✕
        </Button>
       </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
       {coachReviews.length === 0 ? (
        <p className="text-[#8A8A8A] text-center py-8">No reviews yet</p>
       ) : (
        coachReviews.map((review: any) => (
         <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
          <div className="flex items-center gap-2 mb-2">
           <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
             <Star
              key={star}
              className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#C0C0C0]'}`}
             />
            ))}
           </div>
           <span className="text-xs text-[#8A8A8A]">
            {new Date(review.created_at).toLocaleDateString()}
           </span>
          </div>
          {review.review ? (
           <p className="text-sm text-[#4A4A4A]">{review.review}</p>
          ) : (
           <p className="text-sm text-[#8A8A8A] italic">No written review</p>
          )}
         </div>
        ))
       )}
      </CardContent>
     </Card>
    </div>
   )}

   {/* One-Time Contact Modal - Using createPortal for guaranteed rendering */}
   {showContactModal && selectedCoachForContact && createPortal(
    <div 
     className="fixed inset-0 flex items-center justify-center"
     style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)' }}
     data-testid="modal-contact-coach"
    >
     {/* Backdrop */}
     <div 
      className="absolute inset-0"
      onClick={() => {
       setShowContactModal(false);
       setSelectedCoachForContact(null);
       setContactMessage("");
      }}
     />
     
     {/* Modal Content */}
     <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
       <Send className="h-5 w-5 text-[#FF6B5C]" />
       <h2 className="text-lg font-semibold text-[#0D566C]">
        Contact {selectedCoachForContact?.full_name}
       </h2>
      </div>
      <p className="text-sm text-[#8A8A8A] mb-4">
       Send a one-time message to introduce yourself
      </p>
      
      <div className="space-y-4">
       <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
        <p className="text-sm text-amber-800">
         <strong>One-time messaging:</strong> You can send one initial message to this coach. 
         The coach may send one reply. After that, the conversation closes. 
         To continue working together, book their services through the platform.
        </p>
       </div>
       
       <div>
        <label className="text-sm font-medium text-[#0D566C] block mb-2">
         Your Message
        </label>
        <textarea
         rows={5}
         placeholder="Introduce yourself and explain what you'd like to discuss with this coach..."
         value={contactMessage}
         onChange={(e) => setContactMessage(e.target.value)}
         className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg bg-white text-[#4A4A4A] placeholder:text-[#8A8A8A] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20 focus:outline-none"
         data-testid="input-contact-message"
        />
       </div>
       
       <div className="flex gap-3 pt-2">
        <Button
         variant="outline"
         className="flex-1"
         onClick={() => {
          setShowContactModal(false);
          setSelectedCoachForContact(null);
          setContactMessage("");
         }}
         data-testid="button-cancel-contact"
        >
         Cancel
        </Button>
        <Button
         className="flex-1 bg-[#FF6B5C] hover:bg-[#e55a4d]"
         onClick={handleSendContactRequest}
         disabled={sendingContact || !contactMessage.trim()}
         data-testid="button-send-contact"
        >
         {sendingContact ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
         ) : (
          <Send className="h-4 w-4 mr-2" />
         )}
         Send Message
        </Button>
       </div>
      </div>
     </div>
    </div>,
    document.body
   )}

   {showUpgradeAgreement && createPortal(
    <div
     id="upgrade-modal-root"
     className="fixed inset-0 flex items-center justify-center"
     style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.5)' }}
     onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeAgreement(false); }}
     data-testid="upgrade-modal-overlay"
    >
     <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-6"
      style={{ position: 'relative', zIndex: 100000 }}
      onClick={(e) => e.stopPropagation()}
     >
      <div className="flex items-center justify-between mb-4">
       <h2 className="text-xl font-bold flex items-center gap-2 text-[#0D566C]">
        <Rocket className="h-5 w-5 text-indigo-600" />
        Upgrade to Founders Circle — $9.99/mo
       </h2>
       <button
        onClick={() => setShowUpgradeAgreement(false)}
        className="text-[#8A8A8A] hover:text-[#4A4A4A]"
        data-testid="button-close-upgrade-modal"
       >
        <X className="h-5 w-5" />
       </button>
      </div>
      <p className="text-sm text-[#8A8A8A] mb-4">
       Please review and accept the Entrepreneur Membership Agreement before proceeding to payment.
      </p>

      <div className="space-y-4">
       <div className="bg-[rgba(75,63,114,0.08)] border border-[rgba(75,63,114,0.15)] rounded-lg p-4">
        <h4 className="font-semibold text-indigo-900 mb-2">Founders Circle includes:</h4>
        <ul className="space-y-1 text-sm text-indigo-800">
         <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> Dedicated mentor assigned to your project</li>
         <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> Structured feedback and personalized guidance</li>
         <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> AI-powered business planning tools</li>
         <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> Access to expert coaches</li>
         <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /> Cancel anytime from your dashboard</li>
        </ul>
       </div>

       <div className="border border-[#E8E8E8] rounded-lg">
        <button
         type="button"
         onClick={() => setShowUpgradeContractText(!showUpgradeContractText)}
         className="w-full flex items-center justify-between p-3 text-sm font-medium text-[#4A4A4A] hover:bg-[#F3F3F3] rounded-lg transition-colors"
         data-testid="button-toggle-agreement-text"
        >
         <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Entrepreneur Membership Agreement
         </span>
         {showUpgradeContractText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showUpgradeContractText && (
         <div className="px-4 pb-4 max-h-60 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-xs text-[#8A8A8A] font-sans leading-relaxed">{ENTREPRENEUR_CONTRACT}</pre>
         </div>
        )}
       </div>

       <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-[#E8E8E8] hover:bg-[#F3F3F3] transition-colors">
        <input
         type="checkbox"
         checked={agreedToUpgradeContract}
         onChange={(e) => setAgreedToUpgradeContract(e.target.checked)}
         className="mt-0.5 h-4 w-4 rounded border-[#E8E8E8] text-indigo-600 focus:ring-indigo-500"
         data-testid="checkbox-agree-upgrade-contract"
        />
        <span className="text-sm text-[#4A4A4A]">
         I have read and agree to the <strong>Entrepreneur Membership Agreement</strong>. I understand this constitutes my legal electronic signature.
        </span>
       </label>

       <div className="flex gap-3 pt-2">
        <Button
         variant="outline"
         onClick={() => setShowUpgradeAgreement(false)}
         className="flex-1"
         data-testid="button-cancel-upgrade"
        >
         Cancel
        </Button>
        <Button
         onClick={handleSubscribe}
         disabled={!agreedToUpgradeContract || isSubscribing}
         className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
         data-testid="button-proceed-to-payment"
        >
         {isSubscribing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
         ) : (
          <><CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment</>
         )}
        </Button>
       </div>
      </div>
     </div>
    </div>,
    document.body
   )}
  </div>
 );
}
