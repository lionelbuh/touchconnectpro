import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Users, FileText, TrendingUp, Shield, Target, ChevronDown, Lightbulb, UserCheck, Star, MessageCircle, Heart, Gem } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@assets/generated_images/hero-bg.webp";
import mentorFeature from "@assets/remember-why-you-started-poster.webp";
import step1Image from "@assets/startup-step1.webp";

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
            width={1200}
            height={1200}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-background"></div>
        </div>

        <div className="container relative z-10 px-4 text-center max-w-5xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 md:px-6 md:py-3 text-xs md:text-lg bg-white/10 text-cyan-300 border-cyan-500/30 backdrop-blur-sm hover:bg-white/20 inline-block max-w-full">
            <span className="block md:inline">AI prepares your thinking. Mentors guide your decisions.</span>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Turning Ideas Into Action
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            <span className="text-cyan-300/80 italic">The human touch inspires real creativity and makes your ideas truly unique.<br />Not AI.</span>
            <br />AI tools help you structure and refine your ideas, but your mentor keeps them creative, personalized, and actionable. You'll never feel lost, every next step is guided, with clarity and purpose.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/founder-focus">
              <Button size="lg" className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] transition-shadow hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)]">
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

      {/* What Is TouchConnectPro? */}
      <section className="py-24 bg-gradient-to-br from-cyan-50 via-slate-50 to-indigo-50 dark:from-cyan-950/20 dark:via-slate-900/30 dark:to-indigo-950/20 border-y border-cyan-100 dark:border-cyan-900/30" data-testid="section-what-is-tcp">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">What Is TouchConnectPro?</h2>
          </div>
          <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              TouchConnectPro is a mentorship platform designed to support early stage entrepreneurs through structured, real world guidance.
            </p>
            <p>
              We help founders move from idea to execution by connecting them with vetted mentors who understand the challenges of building a business from the ground up.
            </p>
            <p>
              Whether you are validating an idea, launching a product, or preparing for growth, TouchConnectPro gives you access to experience that accelerates progress.
            </p>
          </div>
        </div>
      </section>

      {/* The Journey Steps */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-slate-900 dark:text-white">Your Path to Investor Readiness</h2>
            <p className="text-muted-foreground text-lg">A structured four-step journey designed to validate, build, and scale your venture.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Sparkles className="h-6 w-6 text-cyan-500" />,
                title: "1. Community – Free",
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
              <Card key={i} className="relative overflow-hidden border-none shadow-lg bg-slate-50 dark:bg-slate-900/50">
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

      {/* Founder Focus Score CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-y border-cyan-800/30" data-testid="section-founder-focus-cta">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/3">
              <Badge variant="secondary" className="mb-3 px-3 py-1 bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-xs">
                Focus Score
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-white">
                Discover Your Biggest Growth Blocker
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Take our 5-minute Founder Focus Score diagnostic and find out what's holding your business back. Get a personalized action plan, no signup required.
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <Link href="/founder-focus">
                <Button size="lg" className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] transition-shadow" data-testid="button-founder-focus-cta">
                  Take the Free Test <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background" data-testid="section-how-it-works">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 italic">Simple. Practical. Human.</p>
          </div>
          <div className="mt-12 space-y-6">
            {[
              { num: "1", text: "Join the platform and describe your business idea or project" },
              { num: "2", text: "Get matched with experienced mentors and coaches" },
              { num: "3", text: "Receive focused, actionable guidance during mentorship sessions" },
              { num: "4", text: "Make confident decisions and move your business forward" },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <span className="text-cyan-500 font-bold">{step.num}</span>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 pt-1.5">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-slate-600 dark:text-slate-400 text-lg italic">
            Every conversation is designed to help you take the next concrete step.
          </p>
        </div>
      </section>

      {/* Who TouchConnectPro Is For (short version) */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800" data-testid="section-who-for-short">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">Who TouchConnectPro Is For</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">TouchConnectPro is built for:</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: <Lightbulb className="h-6 w-6 text-cyan-500" />, text: "Entrepreneurs with an idea and no clear roadmap" },
              { icon: <UserCheck className="h-6 w-6 text-indigo-500" />, text: "First time founders seeking experienced guidance" },
              { icon: <TrendingUp className="h-6 w-6 text-emerald-500" />, text: "Early stage startups preparing to launch or scale" },
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-md bg-white dark:bg-slate-800/50">
                <CardContent className="pt-8 pb-8 px-6 text-center">
                  <div className="mx-auto mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 w-fit rounded-xl">
                    {item.icon}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-lg text-slate-600 dark:text-slate-400">
            If you want clarity, direction, and execution focused advice, you are in the right place.
          </p>
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
                  className="w-full h-auto"
                  width={640}
                  height={360}
                  loading="lazy"
                  decoding="async"
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
                  className="w-full h-auto"
                  width={800}
                  height={533}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TouchConnectPro? */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800" data-testid="section-why-choose">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-slate-900 dark:text-white">Why Choose TouchConnectPro?</h2>
          </div>
          <div className="space-y-4 mb-12">
            {[
              "Mentors with real entrepreneurial and operational experience",
              "Practical advice focused on action, not theory",
              "Personalized guidance based on your business stage",
              "A trusted community built on experience and integrity",
              "Clear onboarding and transparent pricing",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <Check className="h-5 w-5 text-cyan-500 shrink-0" />
                <p className="text-slate-700 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            We believe progress happens faster when entrepreneurs learn directly from those who have already navigated the journey.
          </p>
        </div>
      </section>

      {/* Mentorship Powered by Experience */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-y border-indigo-800/30" data-testid="section-mentorship-experience">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-white">Mentorship Powered by Experience</h2>
          </div>
          <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
            <p>
              TouchConnectPro is not an automated advice platform.
            </p>
            <p>
              Mentorship is delivered by real people with proven backgrounds in entrepreneurship, business operations, leadership, and growth. Technology helps organize and connect, but experience drives the guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="free-entry" className="py-24 bg-slate-900 text-white scroll-smooth">
        <div className="container px-4 mx-auto text-center">
           <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Choose Your Path</h2>
           <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-4">
             Community – Free
           </p>
           <p className="text-slate-400 text-base max-w-3xl mx-auto mb-4">
             Access the founder network, clarity tools, and shared coaching opportunities. Designed for entrepreneurs who want guidance and connection, without personalized mentor follow-up.
           </p>
           <p className="text-slate-400 text-base max-w-3xl mx-auto mb-12">
             For $9.99/month, get personalized guidance and support to move your idea forward. Work closely with a dedicated mentor, receive structured feedback, and get access to expert coaches when you need it. Connect deeper with the community, build momentum, and turn inspiration into action.
           </p>
           
           <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             <Card className="bg-slate-800 border-slate-700 text-left relative overflow-hidden" data-testid="card-community-free">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Community – Free</h3>
                 <div className="text-4xl font-display font-bold mb-4 text-white">$0<span className="text-lg text-slate-400 font-normal">/mo</span> <span className="text-base text-slate-400 font-normal">– No credit card</span></div>
                 <ul className="space-y-4 mb-8">
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-cyan-500"/> Founder Focus Score</span>
                     <span className="text-sm text-slate-400 ml-6">Discover your biggest startup blocker with our quick diagnostic.</span>
                   </li>
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-cyan-500"/> Personalized Insights</span>
                     <span className="text-sm text-slate-400 ml-6">Get actionable recommendations tailored to your situation.</span>
                   </li>
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
                   <li className="text-slate-300">
                     <span className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-cyan-500"/> Optional Specialist Coaches</span>
                     <span className="text-sm text-slate-400 ml-6">Access to specialist coaches in legal, finance, and growth (paid separately).</span>
                   </li>
                 </ul>
                 <Link href="/founder-focus">
                   <Button className="w-full bg-slate-700 hover:bg-slate-600" data-testid="button-community-free">Start Free – No Credit Card</Button>
                 </Link>
               </CardContent>
             </Card>

             <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-500/50 text-left relative overflow-hidden" data-testid="card-founders-circle">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-bold mb-2 text-white">Founders Circle</h3>
                 <div className="text-4xl font-display font-bold mb-4 text-white">$9.99<span className="text-lg text-indigo-300 font-normal">/month</span></div>
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
                 <p className="text-sm text-indigo-200/70 mb-4 italic">All Community – Free features, plus:</p>
                 <h4 className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-4">What's Included</h4>
                 <ul className="space-y-3 mb-6">
                   {[
                     { title: "Dedicated Mentor", detail: "Personally matched, providing structured guidance and actionable feedback" },
                     { title: "Ask Questions Anytime", detail: "Ongoing support when you need clarity" },
                     { title: "Strategic Frameworks", detail: "Tools and resources to structure your business" },
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
             
             <Card className="bg-gradient-to-br from-amber-900/80 to-slate-900 border-amber-500/50 text-left relative overflow-hidden" data-testid="card-capital-circle">
               <CardContent className="p-8">
                 <div className="flex items-center gap-2 mb-2">
                   <Gem className="h-6 w-6 text-amber-400" />
                   <h3 className="text-2xl font-bold text-white">Capital Circle</h3>
                 </div>
                 <div className="text-4xl font-display font-bold mb-2 text-white">$49<span className="text-lg text-amber-300 font-normal">/month</span></div>
                 <p className="text-amber-200/80 text-sm mb-6">Raise capital with structure and support. For committed founders preparing to raise funding. Access is selective.</p>
                 <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wide mb-4">Included</h4>
                 <ul className="space-y-3 mb-6">
                   {[
                     "Fundraising readiness review",
                     "Pitch feedback & positioning support",
                     "Structured preparation phase",
                     "Investor visibility after approval",
                     "Ongoing capital strategy guidance"
                   ].map((item, i) => (
                     <li key={i} className="flex items-center gap-2 text-white text-sm">
                       <Check className="h-4 w-4 text-amber-400 shrink-0"/>
                       <span>{item}</span>
                     </li>
                   ))}
                 </ul>
                 <p className="text-xs text-amber-300/60 mb-4 italic">Limited seats to maintain quality.</p>
                 <p className="text-xs text-amber-200/70 mb-4">Best for: founders ready to actively pursue funding</p>
               </CardContent>
             </Card>
           </div>
        </div>
      </section>
    </div>
  );
}
