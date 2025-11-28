import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp, Target, ArrowRight } from "lucide-react";

export default function BecomeaInvestor() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-amber-900/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30">
              <Star className="inline-block mr-2 h-4 w-4" /> Investment Opportunities
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-900 dark:text-white">
              Invest in the Future of Entrepreneurship
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Support the platform that supports entrepreneurs — and multiply your impact.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Two Ways Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">⭐ Two Ways to Invest</h2>
          </div>

          {/* Investment Option 1 */}
          <div className="mb-16">
            <Card className="border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 mb-8">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Invest in TouchConnectPro as a Whole</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Support the platform that supports entrepreneurs.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              When you invest directly in TouchConnectPro, you fuel:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                "The growth of our mentor network",
                "Expansion of coach marketplace & expert resources",
                "Improved founder tools & learning pathways",
                "A scalable model that can help thousands globally"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <TrendingUp className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>

            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardContent className="p-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                  <strong>This option allows you to impact many startups at once — not just one.</strong> You invest in us, and through us, in the success of every entrepreneur we help.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Option 2 */}
          <div className="mb-16">
            <Card className="border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/20 mb-8">
              <CardContent className="p-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Invest in Individual Projects Inside Our Ecosystem</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  For investors who want a closer relationship with specific founders, we also present high-potential startups emerging from our mentor programs.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              You can choose to invest in a selected startup once it becomes "funding-ready." This creates a more direct investment opportunity — but naturally reaches fewer entrepreneurs compared to investing in the platform.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { label: "Impact focus", value: "Narrow & deep" },
                { label: "Investment scope", value: "Single or selected few startups" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">{item.label}</p>
                  <p className="text-lg text-slate-900 dark:text-white font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Join */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold mb-8 text-slate-900 dark:text-white">Why Angel Investors Join Us</h2>
            <div className="space-y-4">
              {[
                "A growing marketplace of entrepreneurial success",
                "Access to a pipeline of validated, guided founders",
                "Mentors ensure founders progress with accountability",
                "Coaches accelerate execution with expert learning",
                "Opportunity to back the whole ecosystem or single ventures"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <Check className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                  <p className="text-slate-700 dark:text-slate-300 text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vision */}
          <div className="mb-16">
            <Card className="border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-10 space-y-6">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong>TouchConnectPro aims to become the hub where ideas evolve into businesses — supported, coached, and funded.</strong>
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed border-t border-emerald-200 dark:border-emerald-900/50 pt-6">
                  <strong>You're not just investing in a company.</strong> You're investing in the next generation of founders.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-amber-900/50 to-slate-900/50 rounded-2xl p-12 text-center border border-amber-500/30">
            <h2 className="text-3xl font-display font-bold mb-6 text-white">Ready to Invest?</h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              If you'd like to discuss alignment, investment terms, SAFE notes, or upcoming rounds — we're ready to talk.
            </p>
            <p className="text-slate-600 dark:text-slate-500 mb-8">
              Let's build futures together.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold">
              Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
