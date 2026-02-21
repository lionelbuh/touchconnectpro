import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Eye, BarChart3, Users, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-slate-950 to-indigo-900/20"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>

        <div className="container relative z-10 px-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white">Helping founders turn ideas into action</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">without getting stuck</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A simple platform to focus your vision, clarify your next steps, and keep your momentum.
          </p>
          <Link href="/founder-focus">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.6)] hover:scale-[1.03] transition-all duration-300"
              data-testid="button-hero-cta"
            >
              Try it free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent"></div>
      </section>

      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900" data-testid="section-features">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <Card className="group border-none shadow-md hover:shadow-xl bg-white dark:bg-slate-800/60 transition-shadow duration-300 rounded-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="mb-6 p-3.5 bg-cyan-50 dark:bg-cyan-500/10 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-slate-900 dark:text-white" data-testid="text-feature-clarity">Focus with clarity</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get tools that help you see exactly what to do next, without feeling overwhelmed.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-none shadow-md hover:shadow-xl bg-white dark:bg-slate-800/60 transition-shadow duration-300 rounded-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="mb-6 p-3.5 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-slate-900 dark:text-white" data-testid="text-feature-progress">Track your progress</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Know what's working and what needs attention so you can move forward confidently.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-none shadow-md hover:shadow-xl bg-white dark:bg-slate-800/60 transition-shadow duration-300 rounded-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-slate-900 dark:text-white" data-testid="text-feature-founders">Learn from real founders</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tips and insights from people who have been in your shoes, ready to guide you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white dark:bg-slate-950" data-testid="section-testimonials">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
              What founders are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I cut my idea-to-action time in half using TouchConnectPro.",
                color: "border-l-cyan-500",
              },
              {
                quote: "Finally, a platform that keeps me focused without being complicated.",
                color: "border-l-indigo-500",
              },
              {
                quote: "The tools are simple, yet powerful enough to move my project forward every week.",
                color: "border-l-emerald-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`border-l-4 ${item.color} bg-slate-50 dark:bg-slate-900/50 rounded-r-xl p-8 hover:translate-y-[-2px] transition-transform duration-300`}
              >
                <MessageCircle className="h-5 w-5 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic" data-testid={`text-testimonial-${i}`}>
                  "{item.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-slate-950 text-white" data-testid="section-footer-cta">
        <div className="container px-4 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Questions or curious to learn more?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            We love helping founders get unstuck. Reach out anytime or explore our tools to see how they can help you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/founder-focus">
              <Button
                size="lg"
                className="h-14 px-10 text-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.6)] hover:scale-[1.03] transition-all duration-300"
                data-testid="button-footer-cta"
              >
                Explore our tools <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-sm transition-all duration-300"
                data-testid="button-footer-how"
              >
                How it works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
