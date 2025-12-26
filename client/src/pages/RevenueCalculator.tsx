import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
  BarChart3,
  ChevronLeft,
  Info,
  Lock,
} from "lucide-react";
import {
  CalculatorInputs,
  CalculatorOutputs,
  calculateAll,
  defaultInternalInputs,
  defaultPublicInputs,
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "@/lib/calculatorLogic";

type CalculatorMode = "internal" | "public";

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  tooltip?: string;
  disabled?: boolean;
  locked?: boolean;
}

function InputSlider({ label, value, onChange, min, max, step, suffix = "", prefix = "", tooltip, disabled, locked }: InputSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          {label}
          {tooltip && (
            <span className="text-muted-foreground cursor-help" title={tooltip}>
              <Info className="h-3 w-3" />
            </span>
          )}
          {locked && (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </Label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{prefix}</span>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-24 h-8 text-right"
            disabled={disabled || locked}
            data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <span className="text-sm text-muted-foreground">{suffix}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled || locked}
        className="cursor-pointer"
        data-testid={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

function SummaryCard({ title, value, subtitle, icon, variant = "default" }: SummaryCardProps) {
  const variantStyles = {
    default: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  };

  const iconStyles = {
    default: "text-slate-600 dark:text-slate-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Card className={`${variantStyles[variant]} border`} data-testid={`summary-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>
            <div className={iconStyles[variant]}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RevenueCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("internal");
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInternalInputs);

  const handleModeChange = (newMode: CalculatorMode) => {
    setMode(newMode);
    setInputs(newMode === "internal" ? defaultInternalInputs : defaultPublicInputs);
  };

  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const outputs: CalculatorOutputs = useMemo(() => calculateAll(inputs), [inputs]);

  const isPublic = mode === "public";
  const profitVariant = outputs.netProfit >= 0 ? "success" : "danger";
  const marginVariant = outputs.netMargin >= 20 ? "success" : outputs.netMargin >= 0 ? "warning" : "danger";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Calculator className="h-8 w-8 text-emerald-600" />
                SaaS Revenue Calculator
              </h1>
              <p className="text-muted-foreground mt-2">
                {isPublic 
                  ? "Estimate your potential monthly revenue and profit"
                  : "Model your unit economics and make data-driven pricing decisions"
                }
              </p>
            </div>

            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as CalculatorMode)}>
              <TabsList className="grid w-full grid-cols-2" data-testid="tabs-mode">
                <TabsTrigger value="internal" data-testid="tab-internal">
                  <Lock className="mr-2 h-4 w-4" />
                  Founder View
                </TabsTrigger>
                <TabsTrigger value="public" data-testid="tab-public">
                  <Target className="mr-2 h-4 w-4" />
                  Public View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Traffic & Conversion
                </CardTitle>
                <CardDescription>
                  How many visitors and what percentage convert to paying customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputSlider
                  label="Monthly Website Visitors"
                  value={inputs.monthlyVisitors}
                  onChange={(v) => updateInput("monthlyVisitors", v)}
                  min={100}
                  max={100000}
                  step={100}
                  tooltip="Total unique visitors to your website per month"
                />
                <InputSlider
                  label="Conversion Rate"
                  value={inputs.conversionRate}
                  onChange={(v) => updateInput("conversionRate", v)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  suffix="%"
                  tooltip="Percentage of visitors who become paying customers"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing & Retention
                </CardTitle>
                <CardDescription>
                  Your subscription pricing and customer retention metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputSlider
                  label="Subscription Price"
                  value={inputs.subscriptionPrice}
                  onChange={(v) => updateInput("subscriptionPrice", v)}
                  min={9}
                  max={299}
                  step={1}
                  prefix="$"
                  suffix="/mo"
                  tooltip="Monthly subscription price per customer"
                />
                <InputSlider
                  label="Monthly Churn Rate"
                  value={inputs.monthlyChurnRate}
                  onChange={(v) => updateInput("monthlyChurnRate", v)}
                  min={1}
                  max={20}
                  step={0.5}
                  suffix="%"
                  tooltip="Percentage of customers who cancel each month"
                  locked={isPublic}
                />
              </CardContent>
            </Card>

            {!isPublic && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      Payment Processing
                    </CardTitle>
                    <CardDescription>
                      Stripe fees for processing payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <InputSlider
                      label="Stripe Percentage Fee"
                      value={inputs.stripePercentage}
                      onChange={(v) => updateInput("stripePercentage", v)}
                      min={1}
                      max={5}
                      step={0.1}
                      suffix="%"
                      tooltip="Stripe's percentage fee (typically 2.9%)"
                    />
                    <InputSlider
                      label="Stripe Fixed Fee"
                      value={inputs.stripeFixedFee}
                      onChange={(v) => updateInput("stripeFixedFee", v)}
                      min={0}
                      max={1}
                      step={0.05}
                      prefix="$"
                      tooltip="Stripe's fixed fee per transaction (typically $0.30)"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                      Operating Costs
                    </CardTitle>
                    <CardDescription>
                      Fixed and variable costs to run your business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <InputSlider
                      label="Fixed Monthly Costs"
                      value={inputs.fixedMonthlyCosts}
                      onChange={(v) => updateInput("fixedMonthlyCosts", v)}
                      min={0}
                      max={5000}
                      step={50}
                      prefix="$"
                      tooltip="Infrastructure, tools, email services, etc."
                    />
                    <InputSlider
                      label="Variable Cost per User"
                      value={inputs.variableCostPerUser}
                      onChange={(v) => updateInput("variableCostPerUser", v)}
                      min={0}
                      max={20}
                      step={0.5}
                      prefix="$"
                      tooltip="AI API costs, support, scaling costs per active user"
                    />
                    <InputSlider
                      label="Monthly Marketing Spend"
                      value={inputs.monthlyMarketingSpend}
                      onChange={(v) => updateInput("monthlyMarketingSpend", v)}
                      min={0}
                      max={10000}
                      step={100}
                      prefix="$"
                      tooltip="Paid advertising, content marketing, etc."
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="sticky top-4 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                {isPublic ? "Your Estimated Revenue" : "Financial Summary"}
              </h2>

              <SummaryCard
                title="Active Members"
                value={formatNumber(outputs.activeMembers)}
                subtitle={`${formatNumber(outputs.newMembersPerMonth)} new/month`}
                icon={<Users className="h-5 w-5" />}
              />

              <SummaryCard
                title="Monthly Revenue (MRR)"
                value={formatCurrency(outputs.mrr)}
                subtitle={`${formatCurrency(inputs.subscriptionPrice)}/user × ${formatNumber(outputs.activeMembers)} users`}
                icon={<DollarSign className="h-5 w-5" />}
                variant="success"
              />

              {!isPublic && (
                <>
                  <SummaryCard
                    title="Payment Fees"
                    value={formatCurrency(outputs.stripeFees)}
                    subtitle={`${formatPercentage(inputs.stripePercentage)} + ${formatCurrency(inputs.stripeFixedFee)}/txn`}
                    icon={<CreditCard className="h-5 w-5" />}
                    variant="warning"
                  />

                  <Card className="bg-slate-50 dark:bg-slate-900 border">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Cost Breakdown</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stripe Fees</span>
                          <span>{formatCurrency(outputs.stripeFees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fixed Costs</span>
                          <span>{formatCurrency(inputs.fixedMonthlyCosts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Variable Costs</span>
                          <span>{formatCurrency(outputs.variableCosts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marketing</span>
                          <span>{formatCurrency(inputs.monthlyMarketingSpend)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total Costs</span>
                          <span>{formatCurrency(outputs.totalCosts)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {isPublic && (
                <SummaryCard
                  title="Platform Costs"
                  value={formatCurrency(outputs.totalCosts)}
                  subtitle="Estimated operating expenses"
                  icon={<TrendingDown className="h-5 w-5" />}
                  variant="warning"
                />
              )}

              <SummaryCard
                title="Net Profit"
                value={formatCurrency(outputs.netProfit)}
                subtitle={outputs.netProfit >= 0 ? "Monthly profit after all costs" : "Monthly loss"}
                icon={outputs.netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                variant={profitVariant}
              />

              <SummaryCard
                title="Net Margin"
                value={formatPercentage(outputs.netMargin)}
                subtitle={outputs.netMargin >= 20 ? "Healthy margin" : outputs.netMargin >= 0 ? "Low margin" : "Negative margin"}
                icon={<BarChart3 className="h-5 w-5" />}
                variant={marginVariant}
              />

              {!isPublic && (
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Customer Lifetime</p>
                    <p className="text-2xl font-bold">{outputs.avgLifetimeMonths.toFixed(1)} months</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      LTV: {formatCurrency(outputs.avgLifetimeMonths * inputs.subscriptionPrice)}
                    </p>
                  </CardContent>
                </Card>
              )}

              {isPublic && (
                <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Ready to build your SaaS business?
                    </p>
                    <Link href="/apply-entrepreneur">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="button-cta-apply">
                        Build This with TouchConnectPro
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Estimates are for illustration only
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isPublic && (
                <div className="text-xs text-muted-foreground p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="font-medium mb-1">💡 Quick Insights</p>
                  <ul className="space-y-1">
                    <li>• Break-even at {formatNumber(Math.ceil(outputs.totalCosts / inputs.subscriptionPrice))} subscribers</li>
                    <li>• CAC payback: {(inputs.monthlyMarketingSpend / outputs.newMembersPerMonth / inputs.subscriptionPrice).toFixed(1)} months</li>
                    <li>• LTV:CAC ratio: {((outputs.avgLifetimeMonths * inputs.subscriptionPrice) / (inputs.monthlyMarketingSpend / outputs.newMembersPerMonth)).toFixed(1)}:1</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
