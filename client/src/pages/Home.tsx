import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Users, FileText, TrendingUp, Shield, Target } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@assets/generated_images/modern_abstract_network_connections_hero_background.png";
import aiFeature from "@assets/generated_images/ai_business_plan_generation_feature_image.png";
import mentorFeature from "@assets/generated_images/mentorship_connection_feature_image.png";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white pt-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge variant="secondary" className="mb-6 px-4 py-2 md:px-6 md:py-3 text-xs md:text-lg bg-white/10 text-cyan-300 border-cyan-500/30 backdrop-blur-sm hover:bg-white/20 inline-block max-w-full">
            <span className="block md:inline">AI Helps You Get Ready. People Help You Win.</span>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Connecting Ideas, Mentors,<br />and Entrepreneurs
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            TouchConnectPro bridges the gap between raw ambition and investor readiness. We combine AI-powered tools with expert human mentorship to transform promising ideas into fundable ventures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/coming-soon">
              <Button size="lg" className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] hover:scale-105">
                Start Free - No Credit Card <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm">
                See the Journey
              </Button>
            </Link>
          </div>
          
          {/* Zero Barrier Entry Point Note */}
          <p className="mt-6 text-sm text-slate-400">
            Zero-Barrier Entry Point: Start refining your idea immediately with our intuitive platform.
          </p>
        </div>
      </section>

      {/* The Journey Steps */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-slate-900 dark:text-white">Your Path to Investor Readiness</h2>
            <p className="text-muted-foreground text-lg">A structured four-step journey designed to validate, build, and scale your venture.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-cyan-500" />,
                title: "1. Free Entry",
                desc: "AI-powered idea refinement and draft business plan generation to structure your thinking."
              },
              {
                icon: <Shield className="h-6 w-6 text-indigo-500" />,
                title: "2. Mentor Match",
                desc: "Evaluation and acceptance into a personalized mentorship program with an industry expert."
              },
              {
                icon: <Users className="h-6 w-6 text-emerald-500" />,
                title: "3. Active Development",
                desc: "Monthly coaching sessions, community learning, and specialized support to build your foundation."
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
                title: "4. Investor Ready",
                desc: "Refine pitch deck and fundraising strategy for angel investors."
              }
            ].map((step, i) => (
              <Card key={i} className="relative overflow-hidden border-none shadow-lg bg-slate-50 dark:bg-slate-900/50 hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="mb-4 p-3 bg-white dark:bg-slate-800 w-fit rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Commitment Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/20 via-cyan-900/20 to-indigo-900/20 border-y border-slate-700">
        <div className="container mx-auto px-4">
          <Card className="border-indigo-500/30 shadow-xl bg-gradient-to-br from-indigo-950/50 to-slate-950/50 backdrop-blur-sm">
            <CardContent className="p-10 md:p-16">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="md:w-1/2">
                  <Shield className="h-16 w-16 text-indigo-400 mb-6" />
                  <h3 className="text-3xl font-display font-bold text-white mb-4">Your Mentor Is Committed</h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Once your idea is approved into a mentor's portfolio, your mentor becomes your dedicated guide through every stage of your journey — from initial validation, through active development, all the way to securing investor funding.
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur">
                    <p className="text-slate-200 italic text-sm">
                      "TouchConnectPro succeeds only when you succeed — creating a true partnership focused on your long-term growth."
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Long-Term Partnership</h4>
                        <p className="text-sm text-slate-300">Not just feedback—a sustained commitment to your success</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-cyan-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Aligned Incentives</h4>
                        <p className="text-sm text-slate-300">Mentors benefit when you succeed—creating genuine partnership</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-emerald-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Complete Support</h4>
                        <p className="text-sm text-slate-300">From strategy to execution to investor introductions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Split 1: AI */}
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
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Step 1: AI Refinement</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">
                Zero Friction. <br/>
                <span className="text-primary">Immediate Value.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Our intelligent tools help you articulate your value proposition, clarify your messaging, and structure your thinking. Receive a mentor-ready business plan outline that demonstrates viability.
              </p>
              <ul className="space-y-4 mb-8">
                {["Articulate Value Proposition", "Clarify Messaging", "Structure Your Thinking", "Demonstrate Viability with our mentor-ready business plan"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#free-entry">
                <Button size="lg">Try AI Rewrite Demo</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split 2: Mentorship */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-500">Step 2 & 3: Partnership</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">
                Your Mentor <br/>
                <span className="text-indigo-500">Matched to Your Goals.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Membership begins after your mentor reviews your AI-prepared materials and approves your idea into his or her portfolio. This ensures meaningful, committed partnership.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "30-min Face-to-Face Onboarding (Month 1)", 
                  "Monthly Group Coaching Sessions", 
                  "Access to Specialized Experts (Legal, Finance, etc.)",
                  "Access to our business tools from our partners",
                  "Ongoing mentor follow-through on your project — especially valuable when challenges arise and you're unsure what direction to take"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-indigo-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
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
      <section id="free-entry" className="py-24 bg-slate-900 text-white scroll-smooth">
        <div className="container px-4 mx-auto text-center">
           <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Membership: Your Growth Foundation</h2>
           <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
             For $49/month, our mentor provides personalized support, guiding you every step from starting out to launching your business.
             <br/><span className="text-sm opacity-70">Membership begins *after* mentor acceptance.</span>
           </p>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Free Entry</h3>
                 <div className="text-4xl font-display font-bold mb-6 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                 <p className="text-slate-400 mb-8">No credit card required.</p>
                 <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> AI Idea Refinement</li>
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> Draft Business Plan Gen</li>
                   <li className="flex items-center gap-2 text-slate-300"><Check className="h-4 w-4 text-cyan-500"/> Prepare for Mentor Review</li>
                 </ul>
                 <Link href="/coming-soon">
                   <Button className="w-full bg-slate-700 hover:bg-slate-600">Start Free - No Credit Card</Button>
                 </Link>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Member</h3>
                 <div className="text-4xl font-display font-bold mb-6 text-white">$49<span className="text-lg text-indigo-300 font-normal">/mo</span></div>
                 <p className="text-indigo-200 mb-8">Upon Mentor Acceptance.</p>
                 <div className="mb-8 p-4 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/40 rounded-lg backdrop-blur-sm">
                   <div className="flex items-start gap-3">
                     <div className="font-bold text-indigo-300 pt-1">📋</div>
                     <div>
                       <p className="font-bold text-indigo-200 mb-1">Waiting List</p>
                       <p className="text-xs text-indigo-300">Only if your idea is approved and you are in a mentor's portfolio</p>
                     </div>
                   </div>
                 </div>
                 <ul className="space-y-3 mb-8">
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Dedicated Mentor-Coach</li>
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Monthly Group Coaching</li>
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Strategic Frameworks</li>
                   <li className="flex items-center gap-2 text-white"><Check className="h-4 w-4 text-indigo-400"/> Community Access</li>
                 </ul>
               </CardContent>
             </Card>
           </div>
        </div>
      </section>
    </div>
  );
}
