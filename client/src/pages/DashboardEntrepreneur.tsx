import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LayoutDashboard, Lightbulb, Target, Users, MessageSquare, Settings, ChevronLeft, ChevronRight, ChevronDown, Check, AlertCircle, User, LogOut, GraduationCap, Calendar, Send, ExternalLink, ClipboardList, BookOpen, RefreshCw, Star, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

export default function DashboardEntrepreneur() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [aiEnhancedData, setAiEnhancedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "coaches" | "idea" | "plan" | "profile" | "notes" | "messages" | "meetings">("overview");
  const [approvedCoaches, setApprovedCoaches] = useState<any[]>([]);
  const [coachRatings, setCoachRatings] = useState<Record<string, { averageRating: number; totalRatings: number }>>({});
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCoachForReviews, setSelectedCoachForReviews] = useState<any>(null);
  const [coachReviews, setCoachReviews] = useState<any[]>([]);
  const [mentorData, setMentorData] = useState<any>(null);
  const [mentorNotes, setMentorNotes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminMessageText, setAdminMessageText] = useState("");
  const [entrepreneurReadMessageIds, setEntrepreneurReadMessageIds] = useState<number[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [entrepreneurData, setEntrepreneurData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);
  const [isPreApproved, setIsPreApproved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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
    // Questions 29-34: Founder Profile
    linkedinWebsite: "",
    foundedBefore: "",
    soloOrCoFounders: "",
    personalSkills: "",
    missingSkills: "",
    timePerWeek: "",
    // Questions 35-39: Funding
    personalInvestment: "",
    externalFunding: "",
    fundingNeeded: "",
    fundingUseCase: "",
    investorType: "",
    // Questions 40-43: Next Steps & Help Needed
    nextSteps: "",
    currentObstacle: "",
    mentorHelp: "",
    technicalExpertHelp: ""
  });

  useEffect(() => {
    const savedFormData = localStorage.getItem("tcp_formData");
    const savedBusinessPlan = localStorage.getItem("tcp_businessPlan");
    const savedProfile = localStorage.getItem("tcp_profileData");
    const savedSubmitted = localStorage.getItem("tcp_submitted");
    const savedReadMessageIds = localStorage.getItem("tcp_entrepreneurReadMessageIds");
    
    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedBusinessPlan) setBusinessPlanData(JSON.parse(savedBusinessPlan));
    if (savedProfile) setProfileData(JSON.parse(savedProfile));
    if (savedSubmitted) setSubmitted(JSON.parse(savedSubmitted));
    if (savedReadMessageIds) setEntrepreneurReadMessageIds(JSON.parse(savedReadMessageIds));
    
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
            
            // Set form data from application
            if (data.data) {
              setFormData(prev => ({ ...prev, ...data.data }));
            }
            
            // Set business plan from application
            if (data.business_plan) {
              setBusinessPlanData(data.business_plan);
            }
            
            // Set profile data (including bio from application fullBio)
            // Note: LinkedIn can be in linkedin_profile column OR data.linkedin field
            setProfileData(prev => ({
              ...prev,
              fullName: data.entrepreneur_name || prev.fullName,
              email: data.entrepreneur_email || prev.email,
              linkedIn: data.linkedin_profile || data.data?.linkedin || prev.linkedIn,
              website: data.data?.website || prev.website,
              bio: data.data?.fullBio || data.data?.bio || prev.bio,
              country: data.data?.country || prev.country,
              profileImage: data.data?.profileImage || prev.profileImage
            }));
            
            // Set mentor data if assigned
            if (data.mentorAssignment) {
              setMentorData(data.mentorAssignment);
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
                
                // Set form data from application
                if (data.data) {
                  setFormData(prev => ({ ...prev, ...data.data }));
                }
                
                // Set business plan from application
                if (data.business_plan) {
                  setBusinessPlanData(data.business_plan);
                }
                
                // Update profile data with fresh API data
                // Note: LinkedIn can be in linkedin_profile column OR data.linkedin field
                setProfileData(prev => ({
                  ...prev,
                  fullName: data.entrepreneur_name || prev.fullName,
                  email: data.entrepreneur_email || prev.email,
                  linkedIn: data.linkedin_profile || data.data?.linkedin || prev.linkedIn,
                  website: data.data?.website || prev.website,
                  bio: data.data?.fullBio || data.data?.bio || prev.bio,
                  country: data.data?.country || prev.country,
                  profileImage: data.data?.profileImage || prev.profileImage
                }));
                
                // Set mentor data if assigned
                if (data.mentorAssignment) {
                  setMentorData(data.mentorAssignment);
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
        const coachesResponse = await fetch(`${API_BASE_URL}/api/coaches/approved`);
        if (coachesResponse.ok) {
          const coachesData = await coachesResponse.json();
          setApprovedCoaches(coachesData);
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
  }, [userEmail]);

  useEffect(() => {
    if (activeTab === "messages" && userEmail) {
      const adminMessagesToMark = messages
        .filter((m: any) => m.to_email === userEmail && m.from_email === "admin@touchconnectpro.com" && !entrepreneurReadMessageIds.includes(m.id))
        .map((m: any) => m.id);
      if (adminMessagesToMark.length > 0) {
        const combined = [...entrepreneurReadMessageIds, ...adminMessagesToMark];
        const updatedReadIds = combined.filter((id, index) => combined.indexOf(id) === index);
        setEntrepreneurReadMessageIds(updatedReadIds);
        localStorage.setItem("tcp_entrepreneurReadMessageIds", JSON.stringify(updatedReadIds));
      }
    }
  }, [activeTab, userEmail, messages, entrepreneurReadMessageIds]);

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
        { key: "linkedinWebsite", label: "29. LinkedIn profile or website?" },
        { key: "foundedBefore", label: "30. Have you founded or launched a startup before?" },
        { key: "soloOrCoFounders", label: "31. Solo or with co-founders?" },
        { key: "personalSkills", label: "32. What skills do you personally bring?" }
      ]
    },
    {
      title: "7. Founder Profile (Continued)",
      description: "More about your team",
      icon: Users,
      fields: [
        { key: "missingSkills", label: "33. What skills are missing from your team?" },
        { key: "timePerWeek", label: "34. How much time per week can you dedicate?" }
      ]
    },
    {
      title: "8. Investment & Funding Needs",
      description: "Tell us about funding",
      icon: Target,
      fields: [
        { key: "personalInvestment", label: "35. Have you invested personal money?" },
        { key: "externalFunding", label: "36. Have you received any external funding?" },
        { key: "fundingNeeded", label: "37. How much funding do you think you need now?" },
        { key: "fundingUseCase", label: "38. What would funding be used for?" },
        { key: "investorType", label: "39. What type of investors are you looking for?" }
      ]
    },
    {
      title: "9. Short-Term Execution Plan",
      description: "What's next for you?",
      icon: Target,
      fields: [
        { key: "nextSteps", label: "40. What are the next 3 steps you plan to take?" },
        { key: "currentObstacle", label: "41. What is your biggest current obstacle?" },
        { key: "mentorHelp", label: "42. What help do you need from mentors?" },
        { key: "technicalExpertHelp", label: "43. What help do you need from technical experts?" }
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
    window.location.href = "/";
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // Save email to localStorage before redirecting (session may be lost after Stripe)
      localStorage.setItem("tcp_pendingPaymentEmail", userEmail);
      
      console.log("[SUBSCRIBE] Creating checkout session for:", userEmail);
      console.log("[SUBSCRIBE] API_BASE_URL:", API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          entrepreneurId: entrepreneurData?.id,
          cancelUrl: "https://touchconnectpro.com/login"
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
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showSuccessPage && !submitted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">Creating Business Plan</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">Thank You!</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Your idea has been submitted and enhanced by our AI.</p>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Let's create your professional business plan that will impress mentors and investors.</p>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mb-3" onClick={handleCreateBusinessPlan} data-testid="button-create-business-plan">Let's create your AI Draft Business Plan</Button>
            <Button variant="outline" className="w-full border-slate-300" onClick={() => setShowSuccessPage(false)} data-testid="button-back-from-success">Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    const hasActiveMentor = mentorData && mentorData.status === "active";
    const entrepreneurStatus = entrepreneurData?.status || "pending";
    const statusDisplay = isAccountDisabled 
      ? "Disabled" 
      : isPreApproved
        ? "Pre-Approved"
        : (entrepreneurStatus === "approved" ? (hasActiveMentor ? "Active Member" : "Approved - Awaiting Mentor") : "On Waiting List");
    const statusColor = isAccountDisabled 
      ? "text-red-600 dark:text-red-400" 
      : isPreApproved
        ? "text-amber-600 dark:text-amber-400"
        : (entrepreneurStatus === "approved" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400");
    const avatarColor = isAccountDisabled 
      ? "bg-red-500" 
      : isPreApproved
        ? "bg-amber-500"
        : (entrepreneurStatus === "approved" ? "bg-emerald-500" : "bg-amber-500");

    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col justify-between">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className={`h-10 w-10 border border-slate-200 ${avatarColor}`}>
                <AvatarFallback className="text-white">{profileData.fullName?.substring(0, 2).toUpperCase() || "EN"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">{profileData.fullName || "Entrepreneur"}</div>
                <div className={`text-xs font-semibold ${statusColor}`}>{statusDisplay}</div>
              </div>
            </div>
            <nav className="space-y-1">
              <Button 
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium"
                onClick={() => setActiveTab("overview")}
                data-testid="button-overview-tab"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
              </Button>
              <Button 
                variant={activeTab === "idea" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("idea")}
                data-testid="button-idea-tab"
              >
                <Lightbulb className="mr-2 h-4 w-4" /> My Idea
              </Button>
              <Button 
                variant={activeTab === "plan" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("plan")}
                data-testid="button-plan-tab"
              >
                <Target className="mr-2 h-4 w-4" /> Business Plan
              </Button>
              <Button 
                variant={activeTab === "coaches" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("coaches")}
                data-testid="button-coaches-tab"
              >
                <GraduationCap className="mr-2 h-4 w-4" /> Available Coaches
              </Button>
              <Button 
                variant={activeTab === "notes" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("notes")}
                data-testid="button-notes-tab"
              >
                <ClipboardList className="mr-2 h-4 w-4" /> Mentor Notes
                {mentorNotes.length > 0 && (
                  <span className="ml-auto bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 text-xs px-2 py-0.5 rounded-full">{mentorNotes.length}</span>
                )}
              </Button>
              <Button 
                variant={activeTab === "messages" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600 relative"
                onClick={() => setActiveTab("messages")}
                data-testid="button-messages-tab"
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Messages
                {messages.filter((m: any) => m.to_email === userEmail && !m.is_read).length > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{messages.filter((m: any) => m.to_email === userEmail && !m.is_read).length}</span>
                )}
              </Button>
              <Button 
                variant={activeTab === "meetings" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("meetings")}
                data-testid="button-meetings-tab"
              >
                <Calendar className="mr-2 h-4 w-4" /> Meetings
                {meetings.length > 0 && (
                  <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">{meetings.length}</span>
                )}
              </Button>
              <Button 
                variant={activeTab === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium text-slate-600"
                onClick={() => setActiveTab("profile")}
                data-testid="button-profile-tab"
              >
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
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

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                {isPreApproved && (
                  <Card className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-start gap-4">
                        <ClipboardList className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-1">Pre-Approved - Payment Required</h3>
                          <p className="text-amber-700 dark:text-amber-400 mb-4">Congratulations! Your application has been pre-approved. To activate your full membership and access all features including coaches, mentor assignment, and more, please complete your $49/month membership payment.</p>
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            data-testid="button-subscribe"
                          >
                            {isSubscribing ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting to payment...
                              </>
                            ) : (
                              <>
                                Subscribe $49/month
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0 shadow-lg">
                      {profileData.profileImage ? (
                        <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profileData.fullName?.substring(0, 2).toUpperCase() || "EN"
                      )}
                    </div>
                    <div>
                      <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Welcome, {profileData.fullName?.split(" ")[0] || "Entrepreneur"}!</h1>
                      <p className="text-muted-foreground">Here's what's happening with <span className="font-semibold text-foreground">{formData.ideaName || entrepreneurData?.data?.ideaName || "Your Idea"}</span>.</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 md:hidden"
                    onClick={handleLogout}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className={`border-l-4 ${isAccountDisabled ? "border-l-red-500" : isPreApproved ? "border-l-amber-500" : "border-l-cyan-500"} shadow-sm`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${isAccountDisabled ? "text-red-600" : isPreApproved ? "text-amber-600" : ""}`}>
                        {isAccountDisabled ? "Disabled Member" : isPreApproved ? "Pre-Approved" : (entrepreneurStatus === "approved" ? "Active Member" : "Business Plan Complete")}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isAccountDisabled ? "Contact admin to reactivate" : isPreApproved ? "Awaiting membership payment" : (entrepreneurStatus === "approved" ? "Working with mentor" : "Awaiting mentor approval")}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className={`border-l-4 ${entrepreneurStatus === "approved" ? "border-l-emerald-500" : "border-l-amber-500"} shadow-sm`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${entrepreneurStatus === "approved" ? "text-emerald-600" : ""}`}>{statusDisplay}</div>
                      <p className="text-xs text-muted-foreground mt-1">{entrepreneurStatus === "approved" ? "Full platform access" : "Pending mentor selection"}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mentorNotes.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">{mentorNotes.length === 1 ? "recommendation" : "recommendations"} from your mentor</p>
                    </CardContent>
                  </Card>
                </div>

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
                              <div key={idx} className={`p-3 rounded-lg ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'}`}>
                                <div className="flex items-start gap-3">
                                  <div className={`text-lg font-bold min-w-fit ${isCompleted ? 'text-green-600' : 'text-emerald-600'}`}>{idx + 1}.</div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${isCompleted ? 'text-green-900 dark:text-green-100 line-through' : 'text-emerald-900 dark:text-emerald-100'}`}>{noteText}</p>
                                    {noteTime && <p className={`text-xs mt-2 ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{new Date(noteTime).toLocaleDateString()}</p>}
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
                <Card className="mb-6 border-l-4 border-l-cyan-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-cyan-600" />
                      My Mentor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasActiveMentor ? (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20 border-2 border-cyan-200">
                            {mentorData.mentor?.photo_url ? (
                              <AvatarImage src={mentorData.mentor.photo_url} alt={mentorData.mentor?.full_name || "Mentor"} />
                            ) : null}
                            <AvatarFallback className="bg-cyan-500 text-white text-xl">
                              {mentorData.mentor?.full_name?.substring(0, 2).toUpperCase() || "MT"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{mentorData.mentor?.full_name || "Your Mentor"}</h3>
                            <p className="text-sm text-muted-foreground">{mentorData.mentor?.expertise || "Business & Strategy"}</p>
                            {mentorData.mentor?.experience && (
                              <p className="text-sm text-muted-foreground mt-1">{mentorData.mentor.experience} years of experience</p>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          {mentorData.meeting_link && (
                            <a href={mentorData.meeting_link} target="_blank" rel="noopener noreferrer" className="block">
                              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" data-testid="button-join-meeting">
                                <Calendar className="mr-2 h-4 w-4" /> Join Monthly Meeting
                              </Button>
                            </a>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full border-cyan-200 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/20"
                            onClick={() => setActiveTab("notes")}
                            data-testid="button-view-notes"
                          >
                            <ClipboardList className="mr-2 h-4 w-4" /> View Mentor Notes ({mentorNotes.length})
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            onClick={() => setActiveTab("meetings")}
                            data-testid="button-view-meetings"
                          >
                            <Calendar className="mr-2 h-4 w-4" /> View Meetings with my Mentor ({meetings.length})
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-cyan-600" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">Once your project is approved and a mentor accepts you, their profile will appear here.</p>
                        <p className="text-sm text-muted-foreground">You'll be able to schedule meetings and receive personalized guidance.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Messages with Mentor Section (only show if mentor assigned and account not disabled) */}
                {hasActiveMentor && mentorData && mentorData.mentor && !isAccountDisabled && (() => {
                  const mentorEmail = mentorData?.mentor?.email;
                  // Include system messages (meeting invites) in the overview
                  const overviewMentorMsgs = mentorEmail ? messages.filter((m: any) => 
                    m.from_email?.toLowerCase() === mentorEmail.toLowerCase() || 
                    m.to_email?.toLowerCase() === mentorEmail.toLowerCase() ||
                    m.from_email === "system@touchconnectpro.com"
                  ) : messages.filter((m: any) => m.from_email === "system@touchconnectpro.com");
                  
                  return (
                    <Card className="mb-6 border-l-4 border-l-emerald-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-emerald-600" />
                          Messages with {mentorData.mentor?.full_name || "Your Mentor"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={`Type your message to ${mentorData.mentor?.full_name || "your mentor"}...`}
                          className="w-full min-h-20 p-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
                          data-testid="textarea-overview-mentor-message"
                        />
                        <div className="flex gap-2 mb-4">
                          <Button 
                            onClick={async () => {
                              if (newMessage.trim() && userEmail && mentorData.mentor?.email) {
                                try {
                                  const response = await fetch(`${API_BASE_URL}/api/messages`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      fromName: profileData.fullName,
                                      fromEmail: userEmail,
                                      toName: mentorData.mentor?.full_name || "Mentor",
                                      toEmail: mentorData.mentor?.email,
                                      message: newMessage
                                    })
                                  });
                                  if (response.ok) {
                                    const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
                                    if (loadResponse.ok) {
                                      const data = await loadResponse.json();
                                      setMessages(data.messages || []);
                                    }
                                    setNewMessage("");
                                    toast.success(`Message sent to ${mentorData.mentor?.full_name || "your mentor"}!`);
                                  } else {
                                    toast.error("Failed to send message");
                                  }
                                } catch (error) {
                                  toast.error("Error sending message");
                                }
                              }
                            }}
                            disabled={!newMessage.trim() || !mentorData.mentor?.email}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            data-testid="button-overview-send-mentor-message"
                          >
                            <Send className="mr-2 h-4 w-4" /> Send
                          </Button>
                          <Button 
                            onClick={async () => {
                              try {
                                const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
                                if (loadResponse.ok) {
                                  const data = await loadResponse.json();
                                  setMessages(data.messages || []);
                                  toast.success("Messages refreshed!");
                                }
                              } catch (error) {
                                toast.error("Error refreshing messages");
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            data-testid="button-overview-refresh-mentor-messages"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                          </Button>
                        </div>
                        
                        <div className="border-t pt-4">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Conversation History</p>
                          {overviewMentorMsgs.length > 0 ? (() => {
                            const sortedMsgs = [...overviewMentorMsgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                            const displayMsgs = showAllOverviewMessages ? sortedMsgs : sortedMsgs.slice(0, 2);
                            
                            return (
                              <>
                                <div className="space-y-3">
                                  {displayMsgs.map((msg: any) => {
                                    const isFromMe = msg.from_email === userEmail;
                                    return (
                                      <div key={msg.id} className={`p-3 rounded-lg ${isFromMe ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                          <span className={`text-sm font-semibold ${isFromMe ? 'text-slate-700 dark:text-slate-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                            {isFromMe ? 'You' : mentorData.mentor?.full_name || 'Mentor'}
                                          </span>
                                          <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                                {overviewMentorMsgs.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full mt-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => setShowAllOverviewMessages(!showAllOverviewMessages)}
                                    data-testid="button-toggle-overview-messages"
                                  >
                                    <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showAllOverviewMessages ? 'rotate-180' : ''}`} />
                                    {showAllOverviewMessages ? 'Show Less' : `Show ${overviewMentorMsgs.length - 2} More`}
                                  </Button>
                                )}
                              </>
                            );
                          })() : (
                            <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

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
                          <div key={meeting.id} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-semibold text-blue-900 dark:text-blue-100">{meeting.topic}</p>
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">{meeting.status}</Badge>
                            </div>
                            {meeting.start_time && <p className="text-sm text-blue-700 dark:text-blue-300">📅 {new Date(meeting.start_time).toLocaleString()}</p>}
                            <p className="text-sm text-blue-700 dark:text-blue-300">⏱ {meeting.duration} minutes</p>
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
                      <CardDescription>Browse specialized coaches to accelerate your growth</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">{approvedCoaches.length}</span>
                        <Button variant="outline" className="border-purple-200 text-purple-600" data-testid="button-view-coaches">
                          View All <ChevronRight className="ml-1 h-4 w-4" />
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
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Available Coaches</h1>
                <p className="text-muted-foreground mb-4">Browse our approved coaches who can help accelerate your startup journey with specialized expertise.</p>

                {/* Areas of Expertise Filter */}
                {approvedCoaches.length > 0 && !isAccountDisabled && !isPreApproved && (() => {
                  const allExpertiseAreas = Array.from(new Set(approvedCoaches.flatMap(c => {
                    const areas = c.focus_areas || "";
                    return areas.split(",").map((a: string) => a.trim()).filter((a: string) => a);
                  })));
                  if (allExpertiseAreas.length === 0) return null;
                  return (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filter by Areas of Expertise:</p>
                      <div className="flex flex-wrap gap-2">
                        {allExpertiseAreas.map((area: string) => (
                          <Badge
                            key={area}
                            variant={selectedSpecializations.includes(area) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              selectedSpecializations.includes(area) 
                                ? "bg-purple-600 text-white hover:bg-purple-700" 
                                : "hover:bg-purple-100 dark:hover:bg-purple-900/30"
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
                  <Card className="border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                    <CardContent className="pt-6 pb-6 text-center">
                      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Access Restricted</h3>
                      <p className="text-red-700 dark:text-red-400">Your account is currently disabled. Please contact the Admin team via the Messages tab to reactivate your membership and access the coaches list.</p>
                    </CardContent>
                  </Card>
                ) : isPreApproved ? (
                  <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="pt-6 pb-6 text-center">
                      <ClipboardList className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">Payment Required</h3>
                      <p className="text-amber-700 dark:text-amber-400">You have been pre-approved! To access the coaches list and other premium features, please complete your membership payment. Contact the Admin team via the Messages tab for payment instructions.</p>
                    </CardContent>
                  </Card>
                ) : approvedCoaches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {approvedCoaches
                      .filter((coach) => {
                        if (selectedSpecializations.length === 0) return true;
                        const coachAreas = (coach.focus_areas || "").split(",").map((a: string) => a.trim()).filter((a: string) => a);
                        return selectedSpecializations.some(area => coachAreas.includes(area));
                      })
                      .map((coach) => {
                      const rating = coachRatings[coach.id];
                      return (
                      <Card key={coach.id} className="border-l-4 border-l-purple-500" data-testid={`card-coach-${coach.id}`}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-purple-200">
                              <AvatarFallback className="bg-purple-500 text-white">
                                {coach.full_name?.substring(0, 2).toUpperCase() || "CO"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{coach.full_name}</CardTitle>
                                <button
                                  className="flex items-center gap-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-2 py-1 rounded-md cursor-pointer transition-colors"
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
                                      <span className="text-xs text-muted-foreground underline">({rating.totalRatings} reviews)</span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No ratings yet</span>
                                  )}
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground">{coach.expertise}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {coach.bio && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">About</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{coach.bio}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Areas of Expertise</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{coach.focus_areas}</p>
                          </div>
                          <div className="pt-2">
                            <span className="text-lg font-bold text-purple-600">${coach.hourly_rate}/hr</span>
                          </div>
                        </CardContent>
                      </Card>
                    )})}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Coaches Available Yet</h3>
                      <p className="text-muted-foreground">Coaches are being approved and will appear here soon.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (() => {
              // Include system messages in admin section if no mentor assigned
              const hasNoMentor = !mentorData?.mentor?.email;
              const adminMsgs = messages.filter((m: any) => 
                m.from_email === "admin@touchconnectpro.com" || 
                m.to_email === "admin@touchconnectpro.com" ||
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
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Messages</h1>
                <p className="text-muted-foreground mb-4">Communicate with your mentor and the TouchConnectPro admin team.</p>

                {/* Account Disabled Warning */}
                {isAccountDisabled && (
                  <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-300">Account Inactive</p>
                          <p className="text-sm text-red-700 dark:text-red-400">Your account is currently inactive. You can only contact the Admin team. To reactivate your membership, please reach out to Admin.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mentor Section (if assigned) - FIRST - hidden when account is disabled */}
                {hasActiveMentor && mentorData && mentorData.mentor && !isAccountDisabled && (
                  <Card className="mb-6 border-emerald-200 dark:border-emerald-900/30">
                    <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer" onClick={async () => {
                      const el = document.getElementById('mentor-messages-section-first');
                      if (el) el.classList.toggle('hidden');
                      const unreadMentorMsgs = mentorMsgs.filter((m: any) => m.to_email === userEmail && !m.is_read);
                      if (unreadMentorMsgs.length > 0) {
                        try {
                          await Promise.all(unreadMentorMsgs.map((m: any) => 
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
                          <GraduationCap className="h-5 w-5 text-emerald-600" />
                          Mentor: {mentorData.mentor?.full_name || "Your Mentor"}
                          {mentorUnread > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" data-testid="badge-mentor-unread-first">
                              {mentorUnread} new
                            </span>
                          )}
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent id="mentor-messages-section-first" className="space-y-4 pt-4">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Type your message to ${mentorData.mentor?.full_name || "your mentor"}...`}
                        className="w-full min-h-20 p-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        data-testid="textarea-mentor-message-first"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={async () => {
                            if (newMessage.trim() && userEmail && mentorData.mentor?.email) {
                              try {
                                const response = await fetch(`${API_BASE_URL}/api/messages`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    fromName: profileData.fullName,
                                    fromEmail: userEmail,
                                    toName: mentorData.mentor?.full_name || "Mentor",
                                    toEmail: mentorData.mentor?.email,
                                    message: newMessage
                                  })
                                });
                                if (response.ok) {
                                  const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
                                  if (loadResponse.ok) {
                                    const data = await loadResponse.json();
                                    setMessages(data.messages || []);
                                  }
                                  setNewMessage("");
                                  toast.success(`Message sent to ${mentorData.mentor?.full_name || "your mentor"}!`);
                                } else {
                                  toast.error("Failed to send message");
                                }
                              } catch (error) {
                                toast.error("Error sending message");
                              }
                            }
                          }}
                          disabled={!newMessage.trim() || !mentorData.mentor?.email}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          data-testid="button-send-mentor-message-first"
                        >
                          <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                        <Button 
                          onClick={async () => {
                            try {
                              const loadResponse = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(userEmail)}`);
                              if (loadResponse.ok) {
                                const data = await loadResponse.json();
                                setMessages(data.messages || []);
                                toast.success("Messages refreshed!");
                              }
                            } catch (error) {
                              toast.error("Error refreshing messages");
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          data-testid="button-refresh-mentor-messages-first"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Conversation History</p>
                        {mentorMsgs.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {[...mentorMsgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((msg: any) => {
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
                                }} className={`p-3 rounded-lg ${isFromMe ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-emerald-50 dark:bg-emerald-950/30'} ${!isFromMe && !msg.is_read ? 'cursor-pointer opacity-70 hover:opacity-100' : ''}`}>
                                  <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-semibold ${isFromMe ? 'text-slate-700 dark:text-slate-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                      {isFromMe ? 'You' : mentorData.mentor?.full_name || 'Mentor'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Section - SECOND */}
                <Card className="mb-6 border-cyan-200 dark:border-cyan-900/30">
                  <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20 cursor-pointer" onClick={async () => {
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
                        <MessageSquare className="h-5 w-5 text-cyan-600" />
                        Admin
                        {adminUnread > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" data-testid="badge-admin-unread">
                            {adminUnread} new
                          </span>
                        )}
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent id="admin-messages-section" className="space-y-4 pt-4">
                    <textarea
                      value={adminMessageText}
                      onChange={(e) => setAdminMessageText(e.target.value)}
                      placeholder="Type your message to the admin team..."
                      className="w-full min-h-20 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                      className="bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-send-admin-message"
                    >
                      <Send className="mr-2 h-4 w-4" /> Send
                    </Button>
                    
                    {adminMsgs.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Conversation History</p>
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
                              }} className={`p-3 rounded-lg ${isFromMe ? 'bg-slate-100 dark:bg-slate-800/50' : 'bg-cyan-50 dark:bg-cyan-950/30'} ${!isFromMe && !msg.is_read ? 'cursor-pointer opacity-70 hover:opacity-100' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-sm font-semibold ${isFromMe ? 'text-slate-700 dark:text-slate-300' : 'text-cyan-700 dark:text-cyan-400'}`}>
                                    {isFromMe ? 'You' : 'Admin'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
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
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardContent className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't been assigned a mentor yet. Once assigned, you'll be able to message them here.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
            })()}

            {/* My Idea Tab */}
            {activeTab === "idea" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Your Idea Submission</h1>
                <p className="text-muted-foreground mb-8">Here's a complete summary of your business idea that was submitted to our mentors.</p>

                <div className="space-y-6">
                  {steps.map((sec, secIdx) => (
                    <Card key={secIdx} className="border-cyan-200 dark:border-cyan-900/30">
                      <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <sec.icon className="h-5 w-5 text-cyan-600" />
                          {sec.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        {sec.fields.map((field: any) => (
                          <div key={field.key}>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">{field.label}</p>
                            <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Business Plan Tab */}
            {activeTab === "plan" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Your Business Plan</h1>
                    <p className="text-muted-foreground">Here's the business plan that was submitted to our mentors for review.</p>
                  </div>
                  {!submitted && (
                    <Button 
                      onClick={() => setIsEditingPlan(!isEditingPlan)}
                      variant={isEditingPlan ? "destructive" : "default"}
                      className={isEditingPlan ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}
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
                    { key: "revenue", label: "Revenue Model & Pricing" },
                    { key: "competitiveAdvantage", label: "Competitive Advantage" },
                    { key: "roadmap", label: "12-Month Roadmap" },
                    { key: "fundingNeeds", label: "Funding Requirements" },
                    { key: "risks", label: "Risks & Mitigation" },
                    { key: "success", label: "Success Metrics" }
                  ].map((section) => (
                    <Card key={section.key} className="border-cyan-200 dark:border-cyan-900/30">
                      <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                        <CardTitle className="text-lg">{section.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {isEditingPlan && !submitted ? (
                          <textarea
                            value={businessPlanData?.[section.key] || ""}
                            onChange={(e) => setBusinessPlanData({ ...businessPlanData, [section.key]: e.target.value })}
                            className="w-full min-h-32 p-4 rounded-lg border border-cyan-300 dark:border-cyan-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            data-testid={`textarea-plan-${section.key}`}
                          />
                        ) : (
                          <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg whitespace-pre-wrap">
                            {businessPlanData?.[section.key] || "Business plan not yet submitted"}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Notes Tab */}
            {activeTab === "notes" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Mentor Notes</h1>
                <p className="text-muted-foreground mb-8">Steps 1, 2, 3... from your mentor. Check them off as you complete them.</p>

                {mentorNotes && mentorNotes.length > 0 ? (() => {
                  // Sort notes oldest first
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
                        return (
                          <Card key={idx} className={`border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' : 'border-l-emerald-500'} border-cyan-200 dark:border-cyan-900/30`}>
                            <CardContent className="pt-6">
                              <div className="flex gap-4">
                                <div className={`text-3xl font-bold min-w-12 ${isCompleted ? 'text-green-500' : 'text-emerald-500'}`}>{idx + 1}.</div>
                                <div className="flex-1">
                                  <p className={`leading-relaxed ${isCompleted ? 'text-green-900 dark:text-green-100 line-through' : 'text-slate-900 dark:text-white'}`}>{noteText}</p>
                                  {noteTime && <p className={`text-xs mt-3 ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-slate-500 dark:text-slate-400'}`}>Added on {new Date(noteTime).toLocaleDateString()}</p>}
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
                  <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-8 pb-8 text-center">
                      <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No mentor notes yet. Check back soon for guidance from your mentor!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Meetings Tab */}
            {activeTab === "meetings" && (
              <div>
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Scheduled Meetings</h1>
                <p className="text-muted-foreground mb-8">View all meetings scheduled by your mentor</p>
                
                <div className="space-y-4">
                  {meetings.length > 0 ? meetings.map((meeting) => (
                    <Card key={meeting.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white mb-2">{meeting.topic}</p>
                            <p className="text-sm text-muted-foreground mb-1">Status: {meeting.status}</p>
                            {meeting.start_time && <p className="text-sm text-muted-foreground">{new Date(meeting.start_time).toLocaleString()}</p>}
                            <p className="text-sm text-muted-foreground">Duration: {meeting.duration} minutes</p>
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
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-muted-foreground">No meetings scheduled yet. Your mentor will schedule one soon!</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Entrepreneur Profile</h1>
                    <p className="text-muted-foreground">Your profile is visible to mentors and admins on our platform.</p>
                  </div>
                  <Button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant={isEditingProfile ? "destructive" : "default"}
                    className={isEditingProfile ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"}
                    data-testid="button-edit-profile"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {isEditingProfile ? (
                  <Card className="border-cyan-200 dark:border-cyan-900/30 max-w-2xl">
                    <CardHeader className="bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle>Edit Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Profile Picture</label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-2xl overflow-hidden">
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
                              className="border-slate-300"
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
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Full Name *</label>
                        <Input
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-name"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Email Address</label>
                        <Input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-slate-100 dark:bg-slate-800/70 text-slate-500 cursor-not-allowed"
                          data-testid="input-profile-email"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">Country *</label>
                        <Input
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/50"
                          data-testid="input-profile-country"
                        />
                      </div>

                      {(entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedinWebsite) && (
                        <div>
                          <label className="text-sm font-semibold text-slate-900 dark:text-white mb-2 block">LinkedIn Profile</label>
                          <div className="p-3 bg-slate-100 dark:bg-slate-800/70 rounded-lg">
                            <a 
                              href={(entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedinWebsite || "").startsWith('http') 
                                ? (entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedinWebsite) 
                                : `https://${entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedinWebsite}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-cyan-600 hover:text-cyan-700 break-all"
                            >
                              {entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedinWebsite}
                            </a>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">From your application (cannot be changed here)</p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-slate-300"
                          onClick={() => setIsEditingProfile(false)}
                          data-testid="button-cancel-profile"
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
                    <Card className="border-cyan-200 dark:border-cyan-900/30">
                      <CardContent className="pt-6">
                        <div className="flex gap-6">
                          <div className="w-24 h-24 rounded-full bg-cyan-200 dark:bg-cyan-900/50 flex items-center justify-center text-5xl flex-shrink-0 overflow-hidden">
                            {profileData.profileImage ? (
                              <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : "👤"}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</p>
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">{profileData.fullName}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</p>
                              <p className="text-slate-900 dark:text-white">{profileData.email}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Country</p>
                              <p className="text-slate-900 dark:text-white">{profileData.country}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {profileData.bio && (
                      <Card className="border-cyan-200 dark:border-cyan-900/30">
                        <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                          <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <p className="text-slate-900 dark:text-white">{profileData.bio}</p>
                        </CardContent>
                      </Card>
                    )}

                    {(profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin || profileData.website || entrepreneurData?.data?.website) && (
                      <Card className="border-cyan-200 dark:border-cyan-900/30">
                        <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                          <CardTitle className="text-lg">Links</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">LinkedIn</p>
                            {(profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin) ? (
                              <a 
                                href={(profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin || "").startsWith('http') 
                                  ? (profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin) 
                                  : `https://${profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-cyan-600 hover:text-cyan-700 break-all"
                                data-testid="link-entrepreneur-linkedin"
                              >
                                {profileData.linkedIn || entrepreneurData?.linkedin_profile || entrepreneurData?.data?.linkedin}
                              </a>
                            ) : (
                              <p className="text-slate-500 dark:text-slate-400">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Website</p>
                            {(profileData.website || entrepreneurData?.data?.website) ? (
                              <a 
                                href={(profileData.website || entrepreneurData?.data?.website || "").startsWith('http') 
                                  ? (profileData.website || entrepreneurData?.data?.website) 
                                  : `https://${profileData.website || entrepreneurData?.data?.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-cyan-600 hover:text-cyan-700 break-all"
                                data-testid="link-entrepreneur-website"
                              >
                                {profileData.website || entrepreneurData?.data?.website}
                              </a>
                            ) : (
                              <p className="text-slate-500 dark:text-slate-400">—</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
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
                    <p className="text-sm text-muted-foreground mt-1">
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
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                ) : (
                  coachReviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review ? (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{review.review}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No written review</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (showAIReview && aiEnhancedData) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">AI Review</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setShowAIReview(false)} 
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 font-medium"
              data-testid="button-back-to-review"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Review
            </button>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">AI Enhancement Review</h1>
            <p className="text-muted-foreground mb-8">Our AI has rewritten your answers to make them clearer and more compelling for investors. Review and accept the enhancements, or edit any answer as needed.</p>

            <div className="space-y-6">
              {steps.map((sec, secIdx) => {
                const sectionAnswers = sec.fields.filter((f: any) => aiEnhancedData[f.key]);
                if (sectionAnswers.length === 0) return null;
                
                return (
                  <Card key={secIdx} className="border-cyan-200 dark:border-cyan-900/30">
                    <CardHeader className="pb-3 bg-cyan-50/50 dark:bg-cyan-950/20">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <sec.icon className="h-5 w-5 text-cyan-600" />
                        {sec.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {sectionAnswers.map((field: any) => (
                        <div key={field.key} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{field.label}</p>
                          
                          {/* Original Answer */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Your Original Answer:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{aiEnhancedData[field.key].original}</p>
                          </div>

                          {/* AI Enhanced Answer (Editable) */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">AI Enhanced Answer:</p>
                            <textarea
                              value={aiEnhancedData[field.key].aiEnhanced}
                              onChange={(e) => handleEditAIAnswer(field.key, e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 border border-cyan-300 dark:border-cyan-700 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                              data-testid={`textarea-ai-${field.key}`}
                            />
                            {aiEnhancedData[field.key].isEdited && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">✓ You've edited this answer</p>
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
                className="flex-1 border-slate-300"
                onClick={() => setShowAIReview(false)}
                data-testid="button-back-from-ai"
              >
                Back to Review
              </Button>
              <Button 
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
                <AvatarFallback className="text-white">EN</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-sm">Entrepreneur</div>
                <div className="text-xs text-muted-foreground">Reviewing Idea</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setShowReview(false)} 
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6 font-medium"
              data-testid="button-back-to-steps"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Edit
            </button>
            
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Review Your Idea</h1>
            <p className="text-muted-foreground mb-8">Check all your answers before submitting. You can edit any section by clicking "Edit".</p>

            <div className="space-y-6">
              {steps.map((sec, idx) => (
                <Card key={idx} className="border-cyan-200 dark:border-cyan-900/30">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <sec.icon className="h-5 w-5 text-cyan-600" />
                        {sec.title}
                      </CardTitle>
                      <button onClick={() => handleEditStep(idx)} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">Edit</button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sec.fields.map((field) => (
                      <div key={field.key}>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{field.label}</p>
                        <p className="text-slate-900 dark:text-white">{formData[field.key as keyof typeof formData] || "Not provided"}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-300"
                onClick={() => setShowReview(false)}
                data-testid="button-go-back"
              >
                Go Back
              </Button>
              <Button 
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-10 w-10 border border-slate-200 bg-cyan-500">
              <AvatarFallback className="text-white">EN</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-sm">Entrepreneur</div>
              <div className="text-xs text-muted-foreground">Setting up your idea</div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start font-medium text-slate-600">
              <Lightbulb className="mr-2 h-4 w-4" /> My Idea
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{validationError}</p>
            </div>
          )}

          {/* Question Card */}
          <Card className="border-cyan-200 dark:border-cyan-900/30 bg-white dark:bg-slate-900 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-950/50 rounded-lg flex items-center justify-center">
                  <CurrentStepIcon className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                {step.title}
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{step.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {step.fields.map((field: any) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={field.rows || 3}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
                      data-testid={`input-${field.key}`}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
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
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none"
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
                  className={`flex-1 ${currentStep === 0 ? "w-full" : ""} bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  <p className="text-sm text-muted-foreground mt-1">
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
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                coachReviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300">{review.review}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No written review</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
