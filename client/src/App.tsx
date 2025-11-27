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
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/mentors" component={MentorDirectory} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/how-it-works" component={() => <Placeholder title="How it Works" />} />
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
