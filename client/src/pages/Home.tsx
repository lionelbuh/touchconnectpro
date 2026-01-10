import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Users, FileText, TrendingUp, Shield, Target, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@assets/generated_images/modern_abstract_network_connections_hero_background.png";
import mentorFeature from "@assets/stock_images/business_mentor_coac_726c681a.jpg";
import step1Image from "@assets/stock_images/entrepreneur_brainst_de5546e3.jpg";

interface ExpandableItemProps {
  title: string;
  detail: string;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor?: string;
}

function ExpandableItem({ title, detail, isExpanded, onToggle, iconColor = "text-primary" }: ExpandableItemProps) {
  return (
    <div 
      className="cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
        <div className={`h-6 w-6 rounded-full ${iconColor.includes('indigo') ? 'bg-indigo-500/10' : 'bg-primary/10'} flex items-center justify-center shrink-0`}>
          <Check className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
      {isExpanded && (
        <p className="mt-2 ml-9 text-sm text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-top-1 duration-200">
          {detail}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [expandedAiItem, setExpandedAiItem] = useState<number | null>(null);
  const [expandedMentorItem, setExpandedMentorItem] = useState<number | null>(null);
  const [expandedPricingItem, setExpandedPricingItem] = useState<number | null>(null);
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
            <span className="block md:inline">AI prepares your thinking. Mentors guide your decisions.</span>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Turning Ideas Into Action
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI tools help you structure and refine your ideas, but your mentor keeps them creative, personalized, and actionable. You'll never feel lost, every next step is guided, with clarity and purpose.
            <br /><span className="text-cyan-300/80 italic">The human touch inspires real creativity and makes your ideas truly unique.<br />Not AI.</span>
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
                desc: "Step-by-step idea refinement and draft business plan generation for clear, structured thinking."
              },
              {
                icon: <Shield className="h-6 w-6 text-indigo-500" />,
                title: "2. Mentor Match",
                desc: "Evaluation and acceptance into a personalized mentorship program with an industry expert."
              },
              {
                icon: <Users className="h-6 w-6 text-emerald-500" />,
                title: "3. Active Development",
                desc: "Work with a mentor personally matched to you, receive ongoing tailored feedback and guidance, ask questions anytime, and access specialized coaching when needed."
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
                    Once your idea is approved into a mentor's portfolio, your mentor becomes your personalized guide, providing tailored feedback and actionable advice at every stage, from initial validation, through active development, to preparing for investor readiness.
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur">
                    <p className="text-slate-200 italic text-sm">
                      "TouchConnectPro succeeds only when you succeed, creating a true partnership focused on your long-term growth."
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Long-Term Partnership</h4>
                        <p className="text-sm text-slate-300">A dedicated mentor guiding you with tailored feedback every step of the way.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-cyan-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Aligned Incentives</h4>
                        <p className="text-sm text-slate-300">Structured, mentor-led guidance ensures your mentor's success is tied directly to your progress, creating a genuine, committed partnership.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
                      <Check className="h-6 w-6 text-emerald-400 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-white mb-1">Complete Support</h4>
                        <p className="text-sm text-slate-300">Your mentor provides clarity and actionable feedback at every stage, with optional live coaching for deeper expertise.</p>
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
                  src={step1Image} 
                  alt="AI Business Planning with Human Guidance" 
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">Step 1: Idea Refinement</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">
                Zero Friction. <br/>
                <span className="text-primary">Immediate Value.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Our intelligent tools help you articulate your value, clarify your messaging, and structure your thinking, all in a way that is mentor-ready. You'll receive a personalized business plan outline designed to demonstrate viability and guide your next steps, so your mentor can provide focused, actionable feedback.
              </p>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Key Benefits</h4>
              <ul className="space-y-4 mb-8">
                {[
                  { title: "Articulate Your Value Proposition", detail: "Clearly show what problem you solve and for whom" },
                  { title: "Clarify Your Messaging", detail: "Present your idea in a compelling, concise way" },
                  { title: "Structure Your Thinking", detail: "Organize priorities and decisions for maximum clarity" },
                  { title: "Mentor-Ready Business Plan", detail: "Demonstrate viability and progress with a plan your mentor can guide you on" }
                ].map((item, i) => (
                  <li key={i}>
                    <ExpandableItem
                      title={item.title}
                      detail={item.detail}
                      isExpanded={expandedAiItem === i}
                      onToggle={() => setExpandedAiItem(expandedAiItem === i ? null : i)}
                    />
                  </li>
                ))}
              </ul>
              <a href="#free-entry">
                <Button size="lg">Try the Free Guided Rewrite Demo</Button>
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
                <span className="text-indigo-500">Matched to Your Goals</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Membership begins once your mentor reviews the materials you've prepared using our smart tools and approves your idea for their portfolio. This ensures a personalized, focused mentoring relationship from day one.
              </p>
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">What's Included</h4>
              <ul className="space-y-4 mb-8">
                {[
                  { title: "Personalized Mentor Guidance", detail: "Matched to your goals, providing structured feedback and actionable advice" },
                  { title: "Ongoing Mentor Support", detail: "Ask questions anytime; your mentor responds thoughtfully to keep your project moving forward" },
                  { title: "Partner Business Tools", detail: "Curated resources to help you structure and grow your idea" },
                  { title: "Mentor-Ready Guided Materials", detail: "Guidance starts from materials your mentor can review immediately, so feedback is focused and actionable" },
                  { title: "Optional Specialist Experts", detail: "Access paid coaches for legal, finance, marketing, or other deep expertise when needed" },
                  { title: "No scheduled meetings required", detail: "Guidance happens when it matters most." }
                ].map((item, i) => (
                  <li key={i}>
                    <ExpandableItem
                      title={item.title}
                      detail={item.detail}
                      isExpanded={expandedMentorItem === i}
                      onToggle={() => setExpandedMentorItem(expandedMentorItem === i ? null : i)}
                      iconColor="text-indigo-500"
                    />
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
           <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-12">
             For $49/month, your personalized mentor gives structured guidance and tailored feedback at every stage, from refining your idea to building a strong business foundation. Ask questions anytime and tap into optional expert coaches when needed, all without blocking your calendar with unnecessary meetings.
           </p>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Free Entry</h3>
                 <div className="text-4xl font-display font-bold mb-4 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span> <span className="text-base text-slate-400 font-normal">– No credit card required</span></div>
                 <ul className="space-y-4 mb-8">
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Refine Your Idea</span>
                     <span className="text-sm text-slate-400 ml-6">Turn your raw concept into a clear, compelling vision.</span>
                   </li>
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Build a Draft Plan</span>
                     <span className="text-sm text-slate-400 ml-6">Quickly create a structured business plan to guide your next steps.</span>
                   </li>
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Get Mentor-Ready</span>
                     <span className="text-sm text-slate-400 ml-6">Prepare your materials so your mentor can give targeted, actionable feedback from day one.</span>
                   </li>
                 </ul>
                 <Link href="/coming-soon">
                   <Button className="w-full bg-slate-700 hover:bg-slate-600">Start Free - No Credit Card</Button>
                 </Link>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Member</h3>
                 <div className="text-4xl font-display font-bold mb-4 text-white">$49<span className="text-lg text-indigo-300 font-normal">/month</span></div>
                 <p className="text-indigo-200 mb-6">Upon Mentor Acceptance</p>
                 <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/40 rounded-lg backdrop-blur-sm">
                   <div className="flex items-start gap-3">
                     <div className="font-bold text-indigo-300 pt-1">📋</div>
                     <div>
                       <p className="font-bold text-indigo-200 mb-1">Waiting List</p>
                       <p className="text-xs text-indigo-300">Only after your idea is approved and added to a mentor's portfolio</p>
                     </div>
                   </div>
                 </div>
                 <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-4">What's Included</h4>
                 <ul className="space-y-3 mb-6">
                   {[
                     { title: "Dedicated Mentor", detail: "Personally matched, providing structured guidance and actionable feedback" },
                     { title: "Ask Questions Anytime", detail: "Ongoing support when you need clarity" },
                     { title: "Strategic Frameworks", detail: "Tools and resources to structure your business" },
                     { title: "Optional Specialist Coaches", detail: "Live sessions for legal, finance, or growth expertise" },
                     { title: "Community Access", detail: "Learn from focused other entrepreneurs" },
                     { title: "All without fixed scheduled meetings", detail: "Guidance happens on your busy calendar." }
                   ].map((item, i) => (
                     <li 
                       key={i} 
                       className="cursor-pointer"
                       onClick={() => setExpandedPricingItem(expandedPricingItem === i ? null : i)}
                     >
                       <div className="flex items-center gap-2 text-white">
                         <Check className="h-4 w-4 text-indigo-400 shrink-0"/>
                         <span className="flex-1">{item.title}</span>
                         <ChevronDown className={`h-4 w-4 text-indigo-300 transition-transform duration-200 ${expandedPricingItem === i ? 'rotate-180' : ''}`} />
                       </div>
                       {expandedPricingItem === i && (
                         <p className="mt-2 ml-6 text-sm text-indigo-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                           {item.detail}
                         </p>
                       )}
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           </div>
        </div>
      </section>
    </div>
  );
}
