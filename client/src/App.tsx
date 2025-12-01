import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import IdeaSubmit from "@/pages/IdeaSubmit";
import Dashboard from "@/pages/Dashboard";
import MentorDirectory from "@/pages/MentorDirectory";
import Pricing from "@/pages/Pricing";
import QA from "@/pages/QA";
import HowItWorks from "@/pages/HowItWorks";
import ComingSoon from "@/pages/ComingSoon";
import BecomeaMentor from "@/pages/BecomeaMentor";
import BecomeaCoach from "@/pages/BecomeaCoach";
import BecomeaInvestor from "@/pages/BecomeaInvestor";
import BecomeaEntrepreneur from "@/pages/BecomeaEntrepreneur";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Login from "@/pages/Login";
import SetPassword from "@/pages/SetPassword";
import DashboardEntrepreneur from "@/pages/DashboardEntrepreneur";
import DashboardCoach from "@/pages/DashboardCoach";
import DashboardMentor from "@/pages/DashboardMentor";
import DashboardInvestor from "@/pages/DashboardInvestor";
import AdminMentorApproval from "@/pages/AdminMentorApproval";
import AdminDashboard from "@/pages/AdminDashboard";
import BusinessPlan from "@/pages/BusinessPlan";
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
        <Route path="/become-mentor" component={BecomeaMentor} />
        <Route path="/become-coach" component={BecomeaCoach} />
        <Route path="/investors" component={BecomeaInvestor} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/login" component={Login} />
        <Route path="/set-password" component={SetPassword} />
        <Route path="/dashboard-entrepreneur" component={DashboardEntrepreneur} />
        <Route path="/dashboard-coach" component={DashboardCoach} />
        <Route path="/dashboard-mentor" component={DashboardMentor} />
        <Route path="/dashboard-investor" component={DashboardInvestor} />
        <Route path="/admin-mentor-approval" component={AdminMentorApproval} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/business-plan" component={BusinessPlan} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
