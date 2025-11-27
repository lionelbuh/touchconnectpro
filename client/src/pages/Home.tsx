import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Users, FileText } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@assets/generated_images/modern_abstract_network_connections_hero_background.png";
import aiFeature from "@assets/generated_images/ai_business_plan_generation_feature_image.png";
import mentorFeature from "@assets/generated_images/mentorship_connection_feature_image.png";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm bg-white/10 text-cyan-300 border-cyan-500/30 backdrop-blur-sm hover:bg-white/20">
            🚀 Launch your startup journey today
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Turn Your Idea into a Business in Minutes
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            From napkin sketch to funded startup. Use our AI-powered platform to refine your idea, generate a business plan, and connect with world-class mentors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/idea-submit">
              <Button size="lg" className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] hover:scale-105">
                Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm">
                How it Works
              </Button>
            </Link>
          </div>
          
          {/* Stats/Social Proof */}
          <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 text-slate-400">
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm">Startups Launched</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm">Active Mentors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">$2M+</div>
              <div className="text-sm">Funding Raised</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">24h</div>
              <div className="text-sm">Avg. Plan Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-slate-900 dark:text-white">The TouchConnectPro Journey</h2>
            <p className="text-muted-foreground text-lg">We guide you through every step of the startup lifecycle, combining AI speed with human wisdom.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-8 w-8 text-cyan-500" />,
                title: "1. AI Refinement",
                desc: "Submit your raw idea. Our hybrid AI engine rewrites, structures, and polishes it into a viable concept instantly."
              },
              {
                icon: <Users className="h-8 w-8 text-indigo-500" />,
                title: "2. Mentor Match",
                desc: "Get matched with industry veterans who guide your journey. Join cohorts of like-minded founders."
              },
              {
                icon: <FileText className="h-8 w-8 text-emerald-500" />,
                title: "3. Execute & Scale",
                desc: "Generate a professional business plan, sign contracts securely, and pitch to our investor network."
              }
            ].map((step, i) => (
              <Card key={i} className="relative overflow-hidden border-none shadow-lg bg-slate-50 dark:bg-slate-900/50 hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="mb-6 p-3 bg-white dark:bg-slate-800 w-fit rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Split 1 */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 order-2 md:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 group">
                <img 
                  src={aiFeature} 
                  alt="AI Business Planning" 
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">AI-Powered</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">
                Smarter Business Plans, <br/>
                <span className="text-primary">Generated Instantly.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Stop struggling with formatting and writer's block. Our AI analyzes your concept and generates a comprehensive, investor-ready business plan in seconds.
              </p>
              <ul className="space-y-4 mb-8">
                {["Market Analysis & Competitor Research", "Financial Projections & Revenue Models", "Executive Summary Drafting"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg">Try AI Rewrite Demo</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split 2 */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-500">World-Class Network</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">
                Connect with Mentors <br/>
                <span className="text-indigo-500">Who Have Been There.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Don't go it alone. Get matched with experienced mentors who can guide you through the pitfalls of early-stage startups. Join cohorts to learn together.
              </p>
              <ul className="space-y-4 mb-8">
                {["Dedicated 1-on-1 Mentorship", "Small Group Cohorts (Max 10)", "Direct Investor Access"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-indigo-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="lg">Browse Mentors</Button>
            </div>
             <div className="md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 group">
                <img 
                  src={mentorFeature} 
                  alt="Mentorship Connection" 
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container px-4 mx-auto text-center">
           <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Simple, Transparent Pricing</h2>
           <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">Start for free. Upgrade when you're ready to get serious with a mentor.</p>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Explorer</h3>
                 <div className="text-4xl font-display font-bold mb-6 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                 <p className="text-slate-400 mb-8">Perfect for refining your idea.</p>
                 <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> 3 AI Idea Rewrites / Day</li>
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> Basic Business Plan</li>
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> Community Access</li>
                 </ul>
                 <Button className="w-full bg-slate-700 hover:bg-slate-600">Get Started</Button>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Founder</h3>
                 <div className="text-4xl font-display font-bold mb-6 text-white">$49<span className="text-lg text-indigo-300 font-normal">/mo</span></div>
                 <p className="text-indigo-200 mb-8">For builders ready to launch.</p>
                 <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Unlimited AI Power</li>
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Dedicated Mentor Match</li>
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Legal Contract Templates</li>
                 </ul>
                 <Button className="w-full bg-indigo-600 hover:bg-indigo-500">Waiting list - if approved by a mentor</Button>
               </CardContent>
             </Card>
           </div>
        </div>
      </section>
    </div>
  );
}
