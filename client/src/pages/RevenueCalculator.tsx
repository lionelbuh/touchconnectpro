import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  GraduationCap,
  UserCheck,
  Save,
  Calendar,
  Table,
  Download,
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine 
} from "recharts";
import {
  CalculatorInputs,
  CalculatorOutputs,
  MonthlyProjection,
  calculateAll,
  generate36MonthProjections,
  findBreakEvenMonth,
  defaultInternalInputs,
  defaultPublicInputs,
  formatCurrency,
  formatPercentage,
  formatNumber,
  saveInputs,
  loadInputs,
} from "@/lib/calculatorLogic";

type CalculatorMode = "internal" | "public";
type ProjectionRange = 12 | 24 | 36;
type ViewPeriod = "monthly" | "yearly";

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
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

function SummaryCard({ title, value, subtitle, icon, variant = "default" }: SummaryCardProps) {
  const variantStyles = {
    default: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  };

  const iconStyles = {
    default: "text-slate-600 dark:text-slate-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
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

function PublicView({ inputs, outputs, updateInput, viewPeriod }: { 
  inputs: CalculatorInputs; 
  outputs: CalculatorOutputs;
  updateInput: (key: keyof CalculatorInputs, value: number | boolean) => void;
  viewPeriod: ViewPeriod;
}) {
  const projections = useMemo(() => generate36MonthProjections(inputs), [inputs]);
  const month1 = projections[0];
  const periodMultiplier = viewPeriod === "yearly" ? 12 : 1;
  const periodLabel = viewPeriod === "yearly" ? "year" : "month";
  const chartData = projections.slice(0, 24).map(p => ({
    month: `M${p.month}`,
    subscribers: p.activeSubscribers,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-600" />
            SaaS Revenue Calculator
          </CardTitle>
          <CardDescription>
            Understand how subscription-based platforms scale over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InputSlider
            label="Monthly Website Visitors"
            value={inputs.monthlyVisitors}
            onChange={(v) => updateInput("monthlyVisitors", v)}
            min={100}
            max={50000}
            step={100}
            tooltip="How many people visit your website each month"
          />
          <InputSlider
            label="Conversion Rate"
            value={inputs.conversionRate}
            onChange={(v) => updateInput("conversionRate", v)}
            min={0.5}
            max={10}
            step={0.5}
            suffix="%"
            tooltip="What percentage become paying customers"
          />
          <InputSlider
            label="Monthly Subscription Price"
            value={inputs.subscriptionPrice}
            onChange={(v) => updateInput("subscriptionPrice", v)}
            min={19}
            max={199}
            step={5}
            prefix="$"
            tooltip="How much you charge per month"
          />
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Label htmlFor="include-coaching" className="text-sm font-medium">
                Include Coaching Revenue
              </Label>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <Switch
              id="include-coaching"
              checked={inputs.includeCoachingRevenue}
              onCheckedChange={(checked) => updateInput("includeCoachingRevenue", checked)}
              data-testid="switch-include-coaching"
            />
          </div>
          {inputs.includeCoachingRevenue && (
            <p className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-2 rounded">
              Coaching revenue assumes 20% of members purchase coaching at an average of $200/month, with a 20% platform commission.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            {viewPeriod === "yearly" ? "First Year Estimate" : "Month 1 Estimate"}
          </CardTitle>
          <CardDescription>{viewPeriod === "yearly" ? "Monthly acquisition rate annualized" : "Based on new subscribers acquired this month"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">New Paying Members</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatNumber(month1.newSubscribers)}</p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">{viewPeriod === "yearly" ? "Annual Revenue" : "Platform Revenue"}</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(month1.totalRevenue * periodMultiplier)}</p>
              <p className="text-xs text-muted-foreground mt-1">{inputs.includeCoachingRevenue ? "subscriptions + coaching" : "from subscriptions"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Steady-State {viewPeriod === "yearly" ? "Yearly" : "Monthly"} Estimate
          </CardTitle>
          <CardDescription>Assumes consistent traffic, conversion, and average retention over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Active Paying Members</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatNumber(outputs.activeMembers)}</p>
              <p className="text-xs text-muted-foreground mt-1">at equilibrium</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{viewPeriod === "yearly" ? "Yearly" : "Monthly"} Platform Revenue</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(outputs.totalRevenue * periodMultiplier)}</p>
              <p className="text-xs text-muted-foreground mt-1">{inputs.includeCoachingRevenue ? "subscriptions + coaching" : "from subscriptions"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-600" />
            Subscriber Growth Over Time
          </CardTitle>
          <CardDescription>Illustrative growth under constant assumptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  interval={5}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  tickLine={false}
                  tickFormatter={(v) => formatNumber(v)}
                  width={50}
                />
                <Tooltip 
                  formatter={(value: number) => [formatNumber(value), "Active Subscribers"]}
                  labelFormatter={(label) => `Month ${label.replace('M', '')}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            This estimate illustrates how subscription-based platforms typically scale over time.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">
            Want to learn more about building a SaaS business?
          </p>
          <Link href="/become-entrepreneur">
            <Button size="lg" className="w-full md:w-auto" data-testid="button-cta-apply">
              Apply to TouchConnectPro
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            These estimates are for educational purposes only. Actual results depend on execution, market conditions, and many other factors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FounderView({ inputs, outputs, updateInput, resetToDefaults, viewPeriod }: { 
  inputs: CalculatorInputs; 
  outputs: CalculatorOutputs;
  updateInput: (key: keyof CalculatorInputs, value: number | boolean) => void;
  resetToDefaults: () => void;
  viewPeriod: ViewPeriod;
}) {
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [projectionRange, setProjectionRange] = useState<ProjectionRange>(36);
  const [showTable, setShowTable] = useState(false);
  const periodMultiplier = viewPeriod === "yearly" ? 12 : 1;
  const periodLabel = viewPeriod === "yearly" ? "/yr" : "/mo";
  
  const projections = useMemo(() => generate36MonthProjections(inputs), [inputs]);
  const displayedProjections = projections.slice(0, projectionRange);
  const currentProjection = projections[selectedMonth - 1];
  const breakEvenMonth = findBreakEvenMonth(projections);

  const profitVariant = currentProjection.netProfit >= 0 ? "success" : "danger";
  const marginVariant = currentProjection.netMargin >= 20 ? "success" : currentProjection.netMargin >= 0 ? "warning" : "danger";

  const exportToCSV = () => {
    const headers = ["Month", "Subscribers", "New", "Churned", "Revenue", "Costs", "Profit", "Margin"];
    const rows = projections.map(p => [
      p.month,
      p.activeSubscribers,
      p.newSubscribers,
      p.churnedSubscribers,
      Math.round(p.totalRevenue),
      Math.round(p.totalCosts),
      Math.round(p.netProfit),
      `${p.netMargin.toFixed(1)}%`
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tcp-projections.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Growth Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputSlider
                label="Monthly Website Visitors"
                value={inputs.monthlyVisitors}
                onChange={(v) => updateInput("monthlyVisitors", v)}
                min={100}
                max={100000}
                step={100}
                tooltip="Unique visitors to your website each month"
              />
              <InputSlider
                label="Visitor Growth Rate"
                value={inputs.visitorGrowthRate}
                onChange={(v) => updateInput("visitorGrowthRate", v)}
                min={0}
                max={30}
                step={1}
                suffix="%"
                tooltip="Monthly growth rate for website visitors (compounds each month)"
              />
              <InputSlider
                label="Conversion Rate"
                value={inputs.conversionRate}
                onChange={(v) => updateInput("conversionRate", v)}
                min={0.1}
                max={10}
                step={0.1}
                suffix="%"
                tooltip="Percentage of visitors who become paying subscribers"
              />
              <InputSlider
                label="Monthly Churn Rate"
                value={inputs.monthlyChurnRate}
                onChange={(v) => updateInput("monthlyChurnRate", v)}
                min={1}
                max={20}
                step={0.5}
                suffix="%"
                tooltip="Percentage of subscribers who cancel each month"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Revenue
              </CardTitle>
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
                tooltip="How much you charge per month for membership"
              />
              <InputSlider
                label="Coaching Adoption Rate"
                value={inputs.coachingAdoptionRate}
                onChange={(v) => updateInput("coachingAdoptionRate", v)}
                min={0}
                max={50}
                step={1}
                suffix="%"
                tooltip="Percentage of subscribers who purchase coaching services"
              />
              <InputSlider
                label="Avg Coaching Spend"
                value={inputs.avgCoachingSpendPerUser}
                onChange={(v) => updateInput("avgCoachingSpendPerUser", v)}
                min={50}
                max={500}
                step={10}
                prefix="$"
                suffix="/mo"
                tooltip="Average monthly spending on coaching per user who buys coaching"
              />
              <InputSlider
                label="Platform Commission"
                value={inputs.platformCommissionRate}
                onChange={(v) => updateInput("platformCommissionRate", v)}
                min={10}
                max={30}
                step={1}
                suffix="%"
                tooltip="Percentage of coaching fees kept by the platform (coaches keep the rest)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputSlider
                label="Mentor Payout Rate (Subscriptions)"
                value={inputs.mentorPayoutRate}
                onChange={(v) => updateInput("mentorPayoutRate", v)}
                min={0}
                max={70}
                step={5}
                suffix="%"
                tooltip="Percentage of subscription revenue paid to mentors (applies to $49/mo membership only)"
              />
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Mentor Payment Estimate (Subscriptions)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  At {inputs.mentorPayoutRate}% of ${inputs.subscriptionPrice}, each entrepreneur generates <span className="font-semibold text-indigo-600">${((inputs.mentorPayoutRate / 100) * inputs.subscriptionPrice).toFixed(2)}/month</span> for their mentor.
                </p>
              </div>
              <InputSlider
                label="Mentor Payout on Coaches Profit"
                value={inputs.mentorCoachingPayoutRate || 0}
                onChange={(v) => updateInput("mentorCoachingPayoutRate", v)}
                min={0}
                max={50}
                step={5}
                suffix="%"
                tooltip={`Percentage of the platform's ${inputs.platformCommissionRate}% coaching commission shared with mentors`}
              />
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Mentor Coaching Bonus</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Mentors receive <span className="font-semibold text-indigo-600">{inputs.mentorCoachingPayoutRate || 0}%</span> of TouchConnectPro's {inputs.platformCommissionRate}% coaching commission. If a coach earns ${inputs.avgCoachingSpendPerUser}, the platform keeps ${(inputs.avgCoachingSpendPerUser * inputs.platformCommissionRate / 100).toFixed(0)} ({inputs.platformCommissionRate}%), and mentors receive <span className="font-semibold text-indigo-600">${((inputs.avgCoachingSpendPerUser * inputs.platformCommissionRate / 100) * ((inputs.mentorCoachingPayoutRate || 0) / 100)).toFixed(2)}</span>.
                </p>
              </div>
              <InputSlider
                label="Mentor Welcome Call Payment"
                value={inputs.mentorWelcomeCallPayment}
                onChange={(v) => updateInput("mentorWelcomeCallPayment", v)}
                min={0}
                max={60}
                step={5}
                prefix="$"
                tooltip="One-time payment to mentor for the first 30-minute welcome call with each new entrepreneur"
              />
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Welcome Call Cost</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Each new entrepreneur triggers a one-time <span className="font-semibold text-indigo-600">${inputs.mentorWelcomeCallPayment}</span> payment to their assigned mentor for the first 30-minute onboarding call.
                </p>
              </div>
              <InputSlider
                label="Stripe Percentage Fee"
                value={inputs.stripePercentage}
                onChange={(v) => updateInput("stripePercentage", v)}
                min={1}
                max={5}
                step={0.1}
                suffix="%"
                tooltip="Stripe's percentage fee on each transaction (typically 2.9%)"
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
              <InputSlider
                label="Fixed Monthly Costs"
                value={inputs.fixedMonthlyCosts}
                onChange={(v) => updateInput("fixedMonthlyCosts", v)}
                min={0}
                max={5000}
                step={50}
                prefix="$"
                tooltip="Monthly expenses regardless of user count (hosting, tools, etc.)"
              />
              <InputSlider
                label="Fixed Costs Growth Rate"
                value={inputs.fixedCostsGrowthRate}
                onChange={(v) => updateInput("fixedCostsGrowthRate", v)}
                min={0}
                max={20}
                step={1}
                suffix="%"
                tooltip="Monthly growth rate for fixed costs (utilities, SaaS tools, salaries, etc.)"
              />
              <InputSlider
                label="Variable Cost per User"
                value={inputs.variableCostPerUser}
                onChange={(v) => updateInput("variableCostPerUser", v)}
                min={0}
                max={20}
                step={0.5}
                prefix="$"
                tooltip="Cost that scales with each active user (support, infrastructure)"
              />
              <InputSlider
                label="Monthly Marketing Spend"
                value={inputs.monthlyMarketingSpend}
                onChange={(v) => updateInput("monthlyMarketingSpend", v)}
                min={0}
                max={10000}
                step={100}
                prefix="$"
                tooltip="Monthly budget for advertising, content, and promotions"
              />
              <InputSlider
                label="Marketing Growth Rate"
                value={inputs.marketingGrowthRate}
                onChange={(v) => updateInput("marketingGrowthRate", v)}
                min={0}
                max={30}
                step={1}
                suffix="%"
                tooltip="Monthly growth rate for marketing budget as the business scales"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Month {selectedMonth} {viewPeriod === "yearly" ? "(Annualized)" : ""}
              </h2>
              <Button variant="outline" size="sm" onClick={resetToDefaults} data-testid="button-reset">
                Reset
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Select Month</Label>
              <Slider
                value={[selectedMonth]}
                onValueChange={([v]) => setSelectedMonth(v)}
                min={1}
                max={36}
                step={1}
                className="cursor-pointer"
                data-testid="slider-month"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Month 1</span>
                <span>Month 36</span>
              </div>
            </div>

            <SummaryCard
              title="Active Subscribers"
              value={formatNumber(currentProjection.activeSubscribers)}
              subtitle={`+${formatNumber(currentProjection.newSubscribers)} new, -${formatNumber(currentProjection.churnedSubscribers)} churned`}
              icon={<Users className="h-5 w-5" />}
            />

            <SummaryCard
              title={`Total Revenue${periodLabel}`}
              value={formatCurrency(currentProjection.totalRevenue * periodMultiplier)}
              subtitle={inputs.includeCoachingRevenue !== false 
                ? `Subs: ${formatCurrency(currentProjection.subscriptionRevenue * periodMultiplier)} + Coaching: ${formatCurrency(currentProjection.coachingCommissionRevenue * periodMultiplier)}`
                : `From subscriptions`}
              icon={<DollarSign className="h-5 w-5" />}
              variant="success"
            />

            <Card className="bg-slate-50 dark:bg-slate-900 border">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Cost Breakdown{periodLabel}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mentor Payouts</span>
                    <span>{formatCurrency(currentProjection.mentorExpenses * periodMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe Fees</span>
                    <span>{formatCurrency(currentProjection.stripeFees * periodMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fixed Costs</span>
                    <span>{formatCurrency(currentProjection.fixedCosts * periodMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variable Costs</span>
                    <span>{formatCurrency(currentProjection.variableCosts * periodMultiplier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marketing</span>
                    <span>{formatCurrency(currentProjection.marketingCosts * periodMultiplier)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total Costs</span>
                    <span>{formatCurrency(currentProjection.totalCosts * periodMultiplier)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SummaryCard
              title={`Net Profit${periodLabel}`}
              value={formatCurrency(currentProjection.netProfit * periodMultiplier)}
              subtitle={currentProjection.netProfit >= 0 ? (viewPeriod === "yearly" ? "Yearly profit" : "Monthly profit") : (viewPeriod === "yearly" ? "Yearly loss" : "Monthly loss")}
              icon={currentProjection.netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              variant={profitVariant}
            />

            <SummaryCard
              title="Net Margin"
              value={formatPercentage(currentProjection.netMargin)}
              icon={<BarChart3 className="h-5 w-5" />}
              variant={marginVariant}
            />

            {breakEvenMonth && (
              <div className="text-sm p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  Break-even: Month {breakEvenMonth}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              36-Month Projections
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={projectionRange.toString()} onValueChange={(v) => setProjectionRange(parseInt(v) as ProjectionRange)}>
                <TabsList className="h-8">
                  <TabsTrigger value="12" className="text-xs px-2">12m</TabsTrigger>
                  <TabsTrigger value="24" className="text-xs px-2">24m</TabsTrigger>
                  <TabsTrigger value="36" className="text-xs px-2">36m</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Active Subscribers</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayedProjections} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip 
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Line type="monotone" dataKey="activeSubscribers" stroke="#3b82f6" strokeWidth={2} dot={false} name="Subscribers" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Revenue vs Costs</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayedProjections} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="totalCosts" stroke="#f59e0b" strokeWidth={2} dot={false} name="Costs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Net Profit</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayedProjections} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => `M${v}`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Month ${label}`}
                  />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Collapsible open={showTable} onOpenChange={setShowTable}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-toggle-table">
                  <Table className="h-4 w-4" />
                  {showTable ? "Hide" : "Show"} Detailed Table
                  {showTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2" data-testid="button-export-csv">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <CollapsibleContent className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Month</th>
                      <th className="text-right py-2 px-2">Subscribers</th>
                      <th className="text-right py-2 px-2">Revenue</th>
                      <th className="text-right py-2 px-2">Costs</th>
                      <th className="text-right py-2 px-2">Profit</th>
                      <th className="text-right py-2 px-2">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((p) => (
                      <tr 
                        key={p.month} 
                        className={`border-b hover:bg-slate-50 dark:hover:bg-slate-800 ${p.month === selectedMonth ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                      >
                        <td className="py-2 px-2">{p.month}</td>
                        <td className="text-right py-2 px-2">{formatNumber(p.activeSubscribers)}</td>
                        <td className="text-right py-2 px-2 text-green-600">{formatCurrency(p.totalRevenue)}</td>
                        <td className="text-right py-2 px-2 text-amber-600">{formatCurrency(p.totalCosts)}</td>
                        <td className={`text-right py-2 px-2 ${p.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(p.netProfit)}
                        </td>
                        <td className="text-right py-2 px-2">{formatPercentage(p.netMargin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <p className="text-xs text-muted-foreground text-center">
            Projections assume constant traffic, conversion, churn, and pricing. This is a planning tool, not a forecast.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RevenueCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("internal");
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInternalInputs);
  const [loaded, setLoaded] = useState(false);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("monthly");

  useEffect(() => {
    const saved = loadInputs(mode);
    if (saved) {
      setInputs(saved);
    } else {
      setInputs(mode === "internal" ? defaultInternalInputs : defaultPublicInputs);
    }
    setLoaded(true);
  }, [mode]);

  useEffect(() => {
    if (loaded) {
      saveInputs(inputs, mode);
    }
  }, [inputs, mode, loaded]);

  const handleModeChange = (newMode: CalculatorMode) => {
    setMode(newMode);
  };

  const updateInput = (key: keyof CalculatorInputs, value: number | boolean) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setInputs(mode === "internal" ? defaultInternalInputs : defaultPublicInputs);
  };

  const outputs: CalculatorOutputs = useMemo(() => calculateAll(inputs), [inputs]);

  const isPublic = mode === "public";

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
                {isPublic ? "Business Opportunity Calculator" : "SaaS Revenue Calculator"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isPublic 
                  ? "Understand what's possible when you build with TouchConnectPro"
                  : "Model your unit economics and make data-driven decisions"
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
              <Tabs value={viewPeriod} onValueChange={(v) => setViewPeriod(v as ViewPeriod)}>
                <TabsList className="grid w-full grid-cols-2" data-testid="tabs-period">
                  <TabsTrigger value="monthly" data-testid="tab-monthly">
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="yearly" data-testid="tab-yearly">
                    Yearly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {isPublic && (
                <Button variant="outline" size="sm" onClick={resetToDefaults} data-testid="button-reset">
                  Reset
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Save className="h-3 w-3" /> Your settings are automatically saved
          </p>
        </div>

        {isPublic ? (
          <PublicView inputs={inputs} outputs={outputs} updateInput={updateInput} viewPeriod={viewPeriod} />
        ) : (
          <FounderView inputs={inputs} outputs={outputs} updateInput={updateInput} resetToDefaults={resetToDefaults} viewPeriod={viewPeriod} />
        )}
      </div>
    </div>
  );
}
