import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, CheckCircle2, Copy, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

export default function IdeaSubmit() {
  const [idea, setIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    pitch: string;
    summary: string;
    model: string;
  }>(null);
  const [location, setLocation] = useLocation();

  const handleAnalyze = () => {
    if (!idea.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate AI delay
    setTimeout(() => {
      setResult({
        pitch: "A platform that democratizes startup success by combining instant AI business planning with accessible human mentorship.",
        summary: "TouchConnectPro bridges the gap between raw ideas and funded businesses. It leverages a hybrid AI engine to restructure vague concepts into actionable business plans while simultaneously providing a marketplace for experienced mentors to guide early-stage founders.",
        model: "SaaS Subscription ($49/mo) + Marketplace Commission (10% on coaching fees)."
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 h-full">
        
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 text-slate-900 dark:text-white">What's your big idea?</h1>
            <p className="text-muted-foreground">Don't worry about formatting. Just dump your thoughts here, and our AI will structure them into a professional pitch.</p>
          </div>

          <Card className="flex-1 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-6 h-full flex flex-col">
              <Textarea 
                placeholder="e.g. I want to build a subscription service for organic dog food that delivers customized meals based on the dog's breed and age..."
                className="flex-1 min-h-[300px] text-lg p-4 resize-none border-slate-200 focus-visible:ring-cyan-500/50"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{idea.length} chars</span>
                <Button 
                  size="lg" 
                  onClick={handleAnalyze} 
                  disabled={!idea.trim() || isAnalyzing}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Rewrite with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-6">
          <div className="hidden md:block">
            <h2 className="text-3xl font-display font-bold mb-2 opacity-0">Results</h2>
            <p className="text-muted-foreground opacity-0">Placeholder for alignment</p>
          </div>

          <Card className={`flex-1 border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 bg-slate-100/50 dark:bg-slate-900/50 dashed-border'}`}>
            <CardContent className="p-6 h-full relative">
              {!result && !isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4 text-slate-300" />
                  <p>AI output will appear here</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 className="h-12 w-12 text-cyan-500 animate-spin relative z-10" />
                  </div>
                  <p className="mt-4 text-cyan-600 font-medium animate-pulse">Structuring your business plan...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-600">Refined Pitch</h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                    </div>
                    <p className="text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                      "{result.pitch}"
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-500 mb-2">Executive Summary</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-2">Business Model</h3>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
                      {result.model}
                    </Badge>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <Button className="flex-1" onClick={() => setLocation('/dashboard')}>
                      Accept & Create Plan <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleAnalyze}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
