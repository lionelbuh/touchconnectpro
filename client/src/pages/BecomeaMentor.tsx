import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Heart, Mail, ArrowRight } from "lucide-react";

export default function BecomeaMentor() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-indigo-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30">
              <Star className="inline-block mr-2 h-4 w-4" /> Join Our Mentor Network
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Become a Mentor at TouchConnectPro
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              We are building a network of mentors who believe in the power of entrepreneurship — and in the people behind it.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <Card className="mb-12 border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20">
            <CardContent className="p-10">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                TouchConnectPro is designed to guide founders from their first idea to market launch, supported not only by AI but by real humans who've been there, built things, solved problems, and pushed through the messy middle.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mt-2">
                We are currently seeking mentors who bring experience, wisdom, and a genuine desire to help new entrepreneurs succeed.
              </p>
            </CardContent>
          </Card>

          {/* Who We're Looking For */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">👥 Who We're Looking For</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              We welcome mentors with strong professional backgrounds, ideally including:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Experience in startups, innovation, or fast-growing companies",
                "Understanding of product development, market strategy, and business growth",
                "Knowledge of corporate structures, fundraising, or scaling operations",
                "Strength in guiding others, problem-solving, and strategic thinking",
                "Patience, empathy, and leadership — especially when entrepreneurs face difficult situations"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
            <Card className="mt-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg">
                  <span className="font-semibold">You don't need to know everything.</span> You need to care, think critically, and share what you've learned along the way.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mentor Role & Commitment */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">🔥 Mentor Role & Commitment</h2>
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="p-10 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Your Group</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Each mentor will guide and follow a group of <strong>10 entrepreneurs</strong>, helping them progress month after month.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Time Commitment</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    This represents approximately <strong>1 hour + 30 minutes per new member subscribing</strong> including group sessions, feedback, and follow-up.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Scaling Your Impact</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    Mentors who wish to commit more time may lead additional groups of 10, allowing them to support more founders while increasing their impact within TouchConnectPro.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Mentor */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">💛 Why Mentor With Us?</h2>
            <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-10">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  At TouchConnectPro, <strong>mentorship is a relationship — not just a transaction.</strong>
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Our goal is not only to help build companies, but to support the people behind them. Mentors will accompany entrepreneurs through decisions, strategy, setbacks and breakthroughs, and into market success.
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <Heart className="inline-block mr-2 h-5 w-5 text-red-500" />
                  Compensation is provided, but the real motivation is <strong>purpose, impact, and community.</strong> We are looking for mentors who value teaching, guiding and elevating others.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 rounded-2xl p-12 text-center border border-indigo-500/30">
            <h2 className="text-3xl font-display font-bold mb-6 text-white">🔗 Ready to Join the Mentor Network?</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              If you believe your experience could change the trajectory of someone's business, we'd love to hear from you.
            </p>
            <p className="text-slate-600 dark:text-slate-500 mb-8">
              Our team will review all mentor submissions and connect with those whose profile matches our mission and founders' needs.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
              Apply to Become a Mentor <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
