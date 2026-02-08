import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Home from "@/pages/Home";
import IdeaSubmit from "@/pages/IdeaSubmit";
import Dashboard from "@/pages/Dashboard";
import MentorDirectory from "@/pages/MentorDirectory";
import Pricing from "@/pages/Pricing";
import QA from "@/pages/QA";
import HowItWorks from "@/pages/HowItWorks";
import ComingSoon from "@/pages/ComingSoon";
import BecomeaMentor from "@/pages/BecomeaMentor";
import MentorWaitlist from "@/pages/MentorWaitlist";
import BecomeaCoach from "@/pages/BecomeaCoach";
import BecomeaInvestor from "@/pages/BecomeaInvestor";
import BecomeaEntrepreneur from "@/pages/BecomeaEntrepreneur";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import SetPassword from "@/pages/SetPassword";
import ResetPassword from "@/pages/ResetPassword";
import DashboardEntrepreneur from "@/pages/DashboardEntrepreneur";
import DashboardCoach from "@/pages/DashboardCoach";
import DashboardMentor from "@/pages/DashboardMentor";
import DashboardInvestor from "@/pages/DashboardInvestor";
import AdminMentorApproval from "@/pages/AdminMentorApproval";
import AdminDashboard from "@/pages/AdminDashboard";
import BusinessPlan from "@/pages/BusinessPlan";
import RateCoach from "@/pages/RateCoach";
import ContactCoach from "@/pages/ContactCoach";
import CoachProfile from "@/pages/CoachProfile";
import RevenueCalculator from "@/pages/RevenueCalculator";
import { TestForm } from "@/pages/TestForm";
import FounderFocusScore from "@/pages/FounderFocusScore";
import TrialDashboard from "@/pages/TrialDashboard";
import Insights from "@/pages/Insights";
import InsightArticle from "@/pages/InsightArticle";
import NotFound from "@/pages/not-found";

// Placeholder pages for now
function Placeholder({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-display font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground">Coming soon...</p>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/idea-submit" component={IdeaSubmit} />
        <Route path="/coming-soon" component={ComingSoon} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/mentors" component={MentorDirectory} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/qa" component={QA} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/become-entrepreneur" component={BecomeaEntrepreneur} />
        <Route path="/become-mentor" component={MentorWaitlist} />
        <Route path="/become-mentor2" component={BecomeaMentor} />
        <Route path="/become-coach" component={BecomeaCoach} />
        <Route path="/investors" component={BecomeaInvestor} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/login" component={Login} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/set-password" component={SetPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/dashboard-entrepreneur" component={DashboardEntrepreneur} />
        <Route path="/dashboard-coach" component={DashboardCoach} />
        <Route path="/dashboard-mentor" component={DashboardMentor} />
        <Route path="/dashboard-investor" component={DashboardInvestor} />
        <Route path="/admin-mentor-approval" component={AdminMentorApproval} />
        <Route path="/admin-dashboard">
          {() => (
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          )}
        </Route>
        <Route path="/business-plan" component={BusinessPlan} />
        <Route path="/rate-coach" component={RateCoach} />
        <Route path="/contact-coach/:coachId" component={ContactCoach} />
        <Route path="/coach/:coachId" component={CoachProfile} />
        <Route path="/calculator">
          {() => (
            <AdminProtectedRoute>
              <RevenueCalculator />
            </AdminProtectedRoute>
          )}
        </Route>
        <Route path="/founder-focus" component={FounderFocusScore} />
        <Route path="/trial-dashboard" component={TrialDashboard} />
        <Route path="/insights" component={Insights} />
        <Route path="/insights/:slug" component={InsightArticle} />
        <Route path="/test-form" component={TestForm} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
        <CookieConsentBanner />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
