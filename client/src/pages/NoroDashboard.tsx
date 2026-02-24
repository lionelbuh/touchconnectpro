import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/config";
import {
  ChevronLeft,
  Save,
  RotateCcw,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Lock,
  Loader2,
} from "lucide-react";
import {
  NoroAssumptions,
  defaultAssumptions,
  calculateMonthlyData,
  calculatePL,
  calculateCash,
  calculateAnnualSummaries,
  formatCurrency,
  formatCurrencyFull,
  saveAssumptions,
  loadAssumptions,
} from "@/lib/noroModel";

type Screen = "assumptions" | "revenue" | "pl" | "cash" | "annual";
type Year = 2026 | 2027 | 2028;

function NumInput({ value, onChange, prefix, suffix, className, min, step, id }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
  className?: string; min?: number; step?: number; id?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""} ${className || ""}`}
        min={min}
        step={step || 1}
        data-testid={id ? `input-${id}` : undefined}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}
    </div>
  );
}

function NoroLoginGate() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const existingToken = localStorage.getItem("tcp_noroToken");
  const [authenticated, setAuthenticated] = useState(!!existingToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/noro/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("tcp_noroToken", data.token);
        setAuthenticated(true);
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authenticated) {
    return <NoroDashboardContent />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0f172a" }}>
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-blue-600/20 flex items-center justify-center">
            <Lock className="h-7 w-7 text-blue-400" />
          </div>
          <CardTitle className="text-white text-xl">NORO Financial Model</CardTitle>
          <p className="text-slate-400 text-sm mt-1">Enter your password to access the dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <Label className="text-slate-300 text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Enter password"
                autoFocus
                data-testid="input-noro-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !password}
              data-testid="button-noro-login"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NoroLoginGate;

function NoroDashboardContent() {
  const [assumptions, setAssumptions] = useState<NoroAssumptions>(() => loadAssumptions() || { ...defaultAssumptions });
  const [screen, setScreen] = useState<Screen>("assumptions");
  const [selectedYear, setSelectedYear] = useState<Year>(2026);
  const [saved, setSaved] = useState(false);

  const updateAssumption = useCallback(<K extends keyof NoroAssumptions>(key: K, value: NoroAssumptions[K]) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    saveAssumptions(assumptions);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [assumptions]);

  const handleReset = useCallback(() => {
    setAssumptions({ ...defaultAssumptions });
    saveAssumptions(defaultAssumptions);
  }, []);

  const monthlyData = useMemo(() => calculateMonthlyData(assumptions, selectedYear), [assumptions, selectedYear]);
  const plData = useMemo(() => calculatePL(assumptions, selectedYear), [assumptions, selectedYear]);
  const cashData = useMemo(() => calculateCash(assumptions, selectedYear), [assumptions, selectedYear]);
  const annualSummaries = useMemo(() => calculateAnnualSummaries(assumptions), [assumptions]);

  const handleExportCSV = useCallback(() => {
    let csv = "";
    if (screen === "revenue") {
      csv = "Month,New Start,New Enterprise,New Global,Active Customers,Active Portals,Software Rev,Usage Rev,Hardware Rev,Total Rev\n";
      monthlyData.forEach((m) => {
        csv += `${m.label},${m.newStartSigned},${m.newEnterpriseSigned},${m.newGlobalSigned},${m.totalActiveCustomers},${m.activePortals},${m.softwareRevenue},${m.usageRevenue},${m.hardwareCashIn},${m.totalRevenue}\n`;
      });
    } else if (screen === "pl") {
      csv = "Month,Total Revenue,Total COGS,Gross Profit,Total OpEx,EBITDA\n";
      plData.forEach((m) => {
        csv += `${m.label},${m.totalRevenue},${m.totalCOGS},${m.grossProfit},${m.totalOpEx},${m.ebitda}\n`;
      });
    } else if (screen === "cash") {
      csv = "Month,Beginning Cash,Cash In,Cash Out,Net Cash Flow,Ending Cash\n";
      cashData.forEach((m) => {
        csv += `${m.label},${m.beginningCash},${m.cashIn},${m.cashOut},${m.netCashFlow},${m.endingCash}\n`;
      });
    } else if (screen === "annual") {
      csv = "Metric,2026,2027,2028\n";
      const keys: { key: keyof typeof annualSummaries[0]; label: string }[] = [
        { key: "arrRevenue", label: "ARR Revenue" },
        { key: "newNoroRevenue", label: "New Noro Revenue" },
        { key: "newSharedStudiosRevenue", label: "New Shared Studios Revenue" },
        { key: "totalRevenue", label: "Total Revenue" },
        { key: "totalCOGS", label: "Total COGS" },
        { key: "grossProfit", label: "Gross Profit" },
        { key: "totalOpEx", label: "Total OpEx" },
        { key: "ebitda", label: "EBITDA" },
        { key: "endingCash", label: "Ending Cash" },
      ];
      keys.forEach(({ key, label }) => {
        csv += `${label},${annualSummaries[0][key]},${annualSummaries[1][key]},${annualSummaries[2][key]}\n`;
      });
    }
    if (csv) {
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `noro-${screen}-${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [screen, selectedYear, monthlyData, plData, cashData, annualSummaries]);

  const navItems = [
    { id: "assumptions" as Screen, label: "Assumptions", icon: Settings },
    { id: "revenue" as Screen, label: "Revenue", icon: BarChart3 },
    { id: "pl" as Screen, label: "P&L", icon: FileText },
    { id: "cash" as Screen, label: "Cash", icon: DollarSign },
    { id: "annual" as Screen, label: "Summary", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="button-back">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">NORO Financial Model</h1>
          </div>
          <div className="flex items-center gap-2">
            {screen !== "assumptions" && (
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-slate-600 text-slate-300 hover:text-white" data-testid="button-export">
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleReset} className="border-slate-600 text-slate-300 hover:text-white" data-testid="button-reset">
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} className={saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} data-testid="button-save">
              <Save className="h-4 w-4 mr-1" /> {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 pb-2 flex items-center gap-4">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  screen === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
          {screen !== "assumptions" && screen !== "annual" && (
            <div className="ml-auto">
              <Tabs value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v) as Year)}>
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="2026" className="data-[state=active]:bg-blue-600" data-testid="tab-2026">2026</TabsTrigger>
                  <TabsTrigger value="2027" className="data-[state=active]:bg-blue-600" data-testid="tab-2027">2027</TabsTrigger>
                  <TabsTrigger value="2028" className="data-[state=active]:bg-blue-600" data-testid="tab-2028">2028</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {screen === "assumptions" && <AssumptionsScreen assumptions={assumptions} setAssumptions={setAssumptions} />}
        {screen === "revenue" && <RevenueScreen data={monthlyData} year={selectedYear} currency={assumptions.currency} />}
        {screen === "pl" && <PLScreen data={plData} year={selectedYear} currency={assumptions.currency} />}
        {screen === "cash" && <CashScreen data={cashData} year={selectedYear} currency={assumptions.currency} />}
        {screen === "annual" && <AnnualScreen data={annualSummaries} currency={assumptions.currency} />}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">{children}</h3>;
}

function AssumptionsScreen({ assumptions, setAssumptions }: { assumptions: NoroAssumptions; setAssumptions: React.Dispatch<React.SetStateAction<NoroAssumptions>> }) {
  const update = <K extends keyof NoroAssumptions>(key: K, value: NoroAssumptions[K]) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  };

  const updateCustomerType = (type: "start" | "enterprise" | "global", field: string, value: number) => {
    setAssumptions((prev) => ({
      ...prev,
      customerTypes: {
        ...prev.customerTypes,
        [type]: { ...prev.customerTypes[type], [field]: value },
      },
    }));
  };

  const updateOpex = (year: 2026 | 2027 | 2028, field: string, value: number) => {
    setAssumptions((prev) => ({
      ...prev,
      opex: { ...prev.opex, [year]: { ...prev.opex[year], [field]: value } },
    }));
  };

  const updateGrowth = (year: 2027 | 2028, field: string, value: number) => {
    setAssumptions((prev) => ({
      ...prev,
      growth: { ...prev.growth, [year]: { ...prev.growth[year], [field]: value } },
    }));
  };

  const updatePeople = (field: string, value: number) => {
    setAssumptions((prev) => ({
      ...prev,
      people: { ...prev.people, [field]: value },
    }));
  };

  const updateFundraise = (year: 2026 | 2027 | 2028, value: number) => {
    setAssumptions((prev) => ({
      ...prev,
      fundraiseInflows: { ...prev.fundraiseInflows, [year]: value },
    }));
  };

  const update2026Customers = (type: "start" | "enterprise" | "global", monthIdx: number, value: number) => {
    setAssumptions((prev) => {
      const arr = [...prev.newCustomers2026[type]];
      arr[monthIdx] = value;
      return { ...prev, newCustomers2026: { ...prev.newCustomers2026, [type]: arr } };
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs">Currency</Label>
                <select
                  value={assumptions.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="w-full mt-1 rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm"
                  data-testid="select-currency"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Monthly Churn Rate</Label>
                <NumInput value={assumptions.monthlyChurnRate} onChange={(v) => update("monthlyChurnRate", v)} suffix="%" step={0.1} />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Upfront % (Hardware)</Label>
                <NumInput value={assumptions.upfrontPctHardware} onChange={(v) => update("upfrontPctHardware", v)} suffix="%" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">On Delivery % (Hardware)</Label>
                <NumInput value={assumptions.onDeliveryPctHardware} onChange={(v) => update("onDeliveryPctHardware", v)} suffix="%" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">NORO Portals & Shared Studios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs">Annual Software / Portal</Label>
                <NumInput value={assumptions.annualSoftwarePerPortal} onChange={(v) => update("annualSoftwarePerPortal", v)} prefix="$" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">HW Margin / Portal</Label>
                <NumInput value={assumptions.hwMarginPerPortal} onChange={(v) => update("hwMarginPerPortal", v)} prefix="$" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Avg Monthly Bookings</Label>
                <NumInput value={assumptions.sharedStudiosAvgMonthlyBookings} onChange={(v) => update("sharedStudiosAvgMonthlyBookings", v)} prefix="$" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">COGS %</Label>
                <NumInput value={assumptions.sharedStudiosCogsPct} onChange={(v) => update("sharedStudiosCogsPct", v)} suffix="%" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Install Lag (months)</Label>
                <NumInput value={assumptions.installLagMonths} onChange={(v) => update("installLagMonths", v)} min={0} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Customer Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Metric</th>
                  <th className="text-center py-2 px-4">Start</th>
                  <th className="text-center py-2 px-4">Enterprise</th>
                  <th className="text-center py-2 px-4">Global</th>
                </tr>
              </thead>
              <tbody>
                {(["portalsPerCustomer", "organizersPerCustomer", "pricing"] as const).map((field) => (
                  <tr key={field} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-300 capitalize">
                      {field === "portalsPerCustomer" ? "Portals / Customer" : field === "organizersPerCustomer" ? "Organizers / Customer" : "Pricing"}
                    </td>
                    {(["start", "enterprise", "global"] as const).map((type) => (
                      <td key={type} className="py-2 px-4">
                        <NumInput
                          value={assumptions.customerTypes[type][field]}
                          onChange={(v) => updateCustomerType(type, field, v)}
                          prefix={field === "pricing" ? "$" : undefined}
                          className="w-24 mx-auto text-center"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">2026 New Customers (Monthly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Type</th>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                    <th key={m} className="text-center py-2 px-1 w-16">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["start", "enterprise", "global"] as const).map((type) => (
                  <tr key={type} className="border-b border-slate-700/50">
                    <td className="py-2 pr-2 text-slate-300 capitalize font-medium">{type}</td>
                    {assumptions.newCustomers2026[type].map((val, idx) => (
                      <td key={idx} className="py-1 px-1">
                        <Input
                          type="number"
                          value={val}
                          onChange={(e) => update2026Customers(type, idx, Number(e.target.value))}
                          className="w-14 text-center text-xs px-1 bg-slate-700 border-slate-600 text-white"
                          min={0}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs">Monthly Payroll</Label>
                <NumInput value={assumptions.people.monthlyPayroll} onChange={(v) => updatePeople("monthlyPayroll", v)} prefix="$" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Benefits %</Label>
                <NumInput value={assumptions.people.benefitsPct} onChange={(v) => updatePeople("benefitsPct", v)} suffix="%" />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300 text-xs">Founders Contractor Threshold</Label>
                <NumInput value={assumptions.people.foundersContractorThreshold} onChange={(v) => updatePeople("foundersContractorThreshold", v)} prefix="$" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Financing & Cash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs">Starting Cash</Label>
                <NumInput value={assumptions.startingCash} onChange={(v) => update("startingCash", v)} prefix="$" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Loan Repayments / Mo</Label>
                <NumInput value={assumptions.loanRepaymentsMonthly} onChange={(v) => update("loanRepaymentsMonthly", v)} prefix="$" />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs mb-2 block">Fundraise Inflows</Label>
              <div className="grid grid-cols-3 gap-3">
                {([2026, 2027, 2028] as const).map((yr) => (
                  <div key={yr}>
                    <Label className="text-slate-400 text-xs">{yr}</Label>
                    <NumInput value={assumptions.fundraiseInflows[yr]} onChange={(v) => updateFundraise(yr, v)} prefix="$" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Operating Expenses (Monthly)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Category</th>
                  <th className="text-center py-2 px-4">2026</th>
                  <th className="text-center py-2 px-4">2027</th>
                  <th className="text-center py-2 px-4">2028</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { field: "marketingMonthly", label: "Marketing" },
                  { field: "gaMonthly", label: "G&A" },
                  { field: "rdMonthly", label: "R&D" },
                ] as const).map(({ field, label }) => (
                  <tr key={field} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-300 font-medium">{label}</td>
                    {([2026, 2027, 2028] as const).map((yr) => (
                      <td key={yr} className="py-2 px-4">
                        <NumInput
                          value={assumptions.opex[yr][field]}
                          onChange={(v) => updateOpex(yr, field, v)}
                          prefix="$"
                          className="w-28 mx-auto"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Growth Assumptions (2027–2028)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-center py-2 px-4">2027</th>
                  <th className="text-center py-2 px-4">2028</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { field: "newPortals", label: "New Portals", suffix: "" },
                  { field: "q1Pct", label: "Q1 %", suffix: "%" },
                  { field: "q2Pct", label: "Q2 %", suffix: "%" },
                  { field: "q3Pct", label: "Q3 %", suffix: "%" },
                  { field: "q4Pct", label: "Q4 %", suffix: "%" },
                ] as const).map(({ field, label, suffix }) => (
                  <tr key={field} className="border-b border-slate-700/50">
                    <td className="py-2 pr-4 text-slate-300 font-medium">{label}</td>
                    {([2027, 2028] as const).map((yr) => (
                      <td key={yr} className="py-2 px-4">
                        <NumInput
                          value={assumptions.growth[yr][field]}
                          onChange={(v) => updateGrowth(yr, field, v)}
                          suffix={suffix || undefined}
                          className="w-24 mx-auto text-center"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueScreen({ data, year, currency }: { data: ReturnType<typeof calculateMonthlyData>; year: Year; currency: string }) {
  const totals = useMemo(() => ({
    newStart: data.reduce((s, m) => s + m.newStartSigned, 0),
    newEnterprise: data.reduce((s, m) => s + m.newEnterpriseSigned, 0),
    newGlobal: data.reduce((s, m) => s + m.newGlobalSigned, 0),
    softwareRev: data.reduce((s, m) => s + m.softwareRevenue, 0),
    usageRev: data.reduce((s, m) => s + m.usageRevenue, 0),
    hardwareRev: data.reduce((s, m) => s + m.hardwareCashIn, 0),
    totalRev: data.reduce((s, m) => s + m.totalRevenue, 0),
  }), [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatCurrency(totals.totalRev, currency)} color="blue" />
        <MetricCard label="Software Revenue" value={formatCurrency(totals.softwareRev, currency)} color="green" />
        <MetricCard label="Usage Revenue" value={formatCurrency(totals.usageRev, currency)} color="purple" />
        <MetricCard label="Hardware Revenue" value={formatCurrency(totals.hardwareRev, currency)} color="amber" />
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Revenue Model — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-600">
                  <th className="text-left py-2 pr-2 sticky left-0 bg-slate-800/90">Metric</th>
                  {data.map((m) => <th key={m.month} className="text-right py-2 px-2 min-w-[70px]">{m.label}</th>)}
                  <th className="text-right py-2 px-2 min-w-[80px] font-bold text-blue-400">Total</th>
                </tr>
              </thead>
              <tbody>
                <TableSection title="New Customers (Signed)" />
                <DataRow label="Start" data={data} field="newStartSigned" total={totals.newStart} />
                <DataRow label="Enterprise" data={data} field="newEnterpriseSigned" total={totals.newEnterprise} />
                <DataRow label="Global" data={data} field="newGlobalSigned" total={totals.newGlobal} />
                <TableSection title="Active Customers" />
                <DataRow label="Start" data={data} field="activeStartCustomers" decimal />
                <DataRow label="Enterprise" data={data} field="activeEnterpriseCustomers" decimal />
                <DataRow label="Global" data={data} field="activeGlobalCustomers" decimal />
                <DataRow label="Total Active" data={data} field="totalActiveCustomers" bold decimal />
                <TableSection title="Portals" />
                <DataRow label="Active Portals" data={data} field="activePortals" decimal />
                <DataRow label="Installed" data={data} field="portalsInstalled" />
                <TableSection title="Revenue" />
                <DataRow label="Software" data={data} field="softwareRevenue" currency={currency} total={totals.softwareRev} />
                <DataRow label="Usage" data={data} field="usageRevenue" currency={currency} total={totals.usageRev} />
                <DataRow label="Hardware" data={data} field="hardwareCashIn" currency={currency} total={totals.hardwareRev} />
                <DataRow label="Total Revenue" data={data} field="totalRevenue" currency={currency} bold total={totals.totalRev} highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PLScreen({ data, year, currency }: { data: ReturnType<typeof calculatePL>; year: Year; currency: string }) {
  const totals = useMemo(() => {
    const sum = (field: keyof typeof data[0]) => data.reduce((s, m) => s + (m[field] as number), 0);
    return {
      totalRevenue: sum("totalRevenue"),
      totalCOGS: sum("totalCOGS"),
      grossProfit: sum("grossProfit"),
      totalOpEx: sum("totalOpEx"),
      ebitda: sum("ebitda"),
      contractedARR: sum("contractedARR"),
      contractedVRR: sum("contractedVRR"),
      contractedNewRevenue: sum("contractedNewRevenue"),
      newNoroRevenue: sum("newNoroRevenue"),
      newSharedStudiosRevenue: sum("newSharedStudiosRevenue"),
      hardwareCOGS: sum("hardwareCOGS"),
      cogsNonNewNoro: sum("cogsNonNewNoro"),
      payroll: sum("payroll"),
      marketing: sum("marketing"),
      rd: sum("rd"),
      ga: sum("ga"),
    };
  }, [data]);

  const ebitdaColor = totals.ebitda >= 0 ? "green" : "red";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={formatCurrency(totals.totalRevenue, currency)} color="blue" />
        <MetricCard label="Gross Profit" value={formatCurrency(totals.grossProfit, currency)} color="green" />
        <MetricCard label="Total OpEx" value={formatCurrency(totals.totalOpEx, currency)} color="amber" />
        <MetricCard label="EBITDA" value={formatCurrency(totals.ebitda, currency)} color={ebitdaColor} />
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Profit & Loss — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-600">
                  <th className="text-left py-2 pr-2 sticky left-0 bg-slate-800/90">Line Item</th>
                  {data.map((m) => <th key={m.month} className="text-right py-2 px-2 min-w-[70px]">{m.label}</th>)}
                  <th className="text-right py-2 px-2 min-w-[80px] font-bold text-blue-400">Total</th>
                </tr>
              </thead>
              <tbody>
                <TableSection title="Revenue" />
                <PLRow label="Contracted ARR" data={data} field="contractedARR" currency={currency} total={totals.contractedARR} />
                <PLRow label="Contracted VRR" data={data} field="contractedVRR" currency={currency} total={totals.contractedVRR} />
                <PLRow label="New Noro Revenue" data={data} field="newNoroRevenue" currency={currency} total={totals.newNoroRevenue} />
                <PLRow label="New Shared Studios" data={data} field="newSharedStudiosRevenue" currency={currency} total={totals.newSharedStudiosRevenue} />
                <PLRow label="Total Revenue" data={data} field="totalRevenue" currency={currency} bold total={totals.totalRevenue} highlight />
                <TableSection title="Cost of Goods Sold" />
                <PLRow label="Hardware COGS" data={data} field="hardwareCOGS" currency={currency} total={totals.hardwareCOGS} />
                <PLRow label="COGS (Non-New Noro)" data={data} field="cogsNonNewNoro" currency={currency} total={totals.cogsNonNewNoro} />
                <PLRow label="Total COGS" data={data} field="totalCOGS" currency={currency} bold total={totals.totalCOGS} />
                <TableSection title="Gross Profit" />
                <PLRow label="Gross Profit" data={data} field="grossProfit" currency={currency} bold total={totals.grossProfit} highlight />
                <TableSection title="Operating Expenses" />
                <PLRow label="Payroll" data={data} field="payroll" currency={currency} total={totals.payroll} />
                <PLRow label="Marketing" data={data} field="marketing" currency={currency} total={totals.marketing} />
                <PLRow label="R&D" data={data} field="rd" currency={currency} total={totals.rd} />
                <PLRow label="G&A" data={data} field="ga" currency={currency} total={totals.ga} />
                <PLRow label="Total OpEx" data={data} field="totalOpEx" currency={currency} bold total={totals.totalOpEx} />
                <TableSection title="Result" />
                <PLRow label="EBITDA" data={data} field="ebitda" currency={currency} bold total={totals.ebitda} highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CashScreen({ data, year, currency }: { data: ReturnType<typeof calculateCash>; year: Year; currency: string }) {
  const totals = useMemo(() => ({
    cashIn: data.reduce((s, m) => s + m.cashIn, 0),
    cashOut: data.reduce((s, m) => s + m.cashOut, 0),
    founderRepayments: data.reduce((s, m) => s + m.founderRepayments, 0),
    netCashFlow: data.reduce((s, m) => s + m.netCashFlow, 0),
  }), [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Beginning Cash" value={formatCurrency(data[0].beginningCash, currency)} color="blue" />
        <MetricCard label="Total Cash In" value={formatCurrency(totals.cashIn, currency)} color="green" />
        <MetricCard label="Total Cash Out" value={formatCurrency(totals.cashOut, currency)} color="red" />
        <MetricCard label="Ending Cash" value={formatCurrency(data[11].endingCash, currency)} color={data[11].endingCash >= 0 ? "green" : "red"} />
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Cash Summary — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-600">
                  <th className="text-left py-2 pr-2 sticky left-0 bg-slate-800/90">Line Item</th>
                  {data.map((m) => <th key={m.month} className="text-right py-2 px-2 min-w-[80px]">{m.label}</th>)}
                  <th className="text-right py-2 px-2 min-w-[90px] font-bold text-blue-400">Total</th>
                </tr>
              </thead>
              <tbody>
                <CashRow label="Beginning Cash" data={data} field="beginningCash" currency={currency} />
                <CashRow label="Cash In (Revenue)" data={data} field="cashIn" currency={currency} total={totals.cashIn} />
                <CashRow label="Cash Out (COGS+OpEx)" data={data} field="cashOut" currency={currency} total={totals.cashOut} />
                <CashRow label="Founder Repayments" data={data} field="founderRepayments" currency={currency} total={totals.founderRepayments} />
                <CashRow label="Net Cash Flow" data={data} field="netCashFlow" currency={currency} bold total={totals.netCashFlow} />
                <CashRow label="Ending Cash" data={data} field="endingCash" currency={currency} bold highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnnualScreen({ data, currency }: { data: ReturnType<typeof calculateAnnualSummaries>; currency: string }) {
  const rows: { label: string; key: keyof typeof data[0]; bold?: boolean; highlight?: boolean }[] = [
    { label: "ARR Revenue", key: "arrRevenue" },
    { label: "New Noro Revenue", key: "newNoroRevenue" },
    { label: "New Shared Studios Revenue", key: "newSharedStudiosRevenue" },
    { label: "Total Revenue", key: "totalRevenue", bold: true, highlight: true },
    { label: "Total COGS", key: "totalCOGS" },
    { label: "Gross Profit", key: "grossProfit", bold: true },
    { label: "Total OpEx", key: "totalOpEx" },
    { label: "EBITDA", key: "ebitda", bold: true, highlight: true },
    { label: "Ending Cash", key: "endingCash", bold: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {data.map((yr) => (
          <Card key={yr.year} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg text-center">{yr.year}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(yr.totalRevenue, currency)}</div>
              <div className="text-xs text-slate-400 mt-1">Total Revenue</div>
              <div className={`text-xl font-bold mt-2 ${yr.ebitda >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(yr.ebitda, currency)}
              </div>
              <div className="text-xs text-slate-400 mt-1">EBITDA</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base">Annual Summary — 3-Year View</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-600">
                <th className="text-left py-3 pr-4">Metric</th>
                <th className="text-right py-3 px-6">2026</th>
                <th className="text-right py-3 px-6">2027</th>
                <th className="text-right py-3 px-6">2028</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, key, bold, highlight }) => (
                <tr key={key} className={`border-b border-slate-700/50 ${highlight ? "bg-slate-700/20" : ""}`}>
                  <td className={`py-3 pr-4 text-slate-300 ${bold ? "font-semibold" : ""}`}>{label}</td>
                  {data.map((yr) => (
                    <td key={yr.year} className={`py-3 px-6 text-right ${bold ? "font-semibold" : ""} ${
                      (yr[key] as number) < 0 ? "text-red-400" : "text-slate-200"
                    }`}>
                      {formatCurrencyFull(yr[key] as number, currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-600/20 to-blue-800/10 border-blue-500/30",
    green: "from-green-600/20 to-green-800/10 border-green-500/30",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-500/30",
    amber: "from-amber-600/20 to-amber-800/10 border-amber-500/30",
    red: "from-red-600/20 to-red-800/10 border-red-500/30",
  };
  const textColor: Record<string, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colorMap[color]} p-4`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${textColor[color]}`}>{value}</div>
    </div>
  );
}

function TableSection({ title }: { title: string }) {
  return (
    <tr>
      <td colSpan={14} className="pt-3 pb-1 text-xs font-semibold text-blue-400 uppercase tracking-wider">{title}</td>
    </tr>
  );
}

function DataRow({ label, data, field, currency, bold, total, highlight, decimal }: {
  label: string; data: any[]; field: string; currency?: string; bold?: boolean; total?: number; highlight?: boolean; decimal?: boolean;
}) {
  return (
    <tr className={`border-b border-slate-700/30 ${highlight ? "bg-blue-900/10" : ""}`}>
      <td className={`py-1.5 pr-2 text-slate-300 sticky left-0 bg-slate-800/90 ${bold ? "font-semibold" : ""}`}>{label}</td>
      {data.map((m: any, i: number) => {
        const val = m[field];
        return (
          <td key={i} className={`py-1.5 px-2 text-right ${bold ? "font-semibold text-slate-200" : "text-slate-400"} ${val < 0 ? "text-red-400" : ""}`}>
            {currency ? formatCurrencyFull(val, currency) : decimal ? val.toFixed(1) : val}
          </td>
        );
      })}
      <td className={`py-1.5 px-2 text-right font-semibold ${total !== undefined && total < 0 ? "text-red-400" : "text-blue-400"}`}>
        {total !== undefined ? (currency ? formatCurrencyFull(total, currency) : total) : ""}
      </td>
    </tr>
  );
}

function PLRow({ label, data, field, currency, bold, total, highlight }: {
  label: string; data: any[]; field: string; currency: string; bold?: boolean; total?: number; highlight?: boolean;
}) {
  return (
    <tr className={`border-b border-slate-700/30 ${highlight ? "bg-blue-900/10" : ""}`}>
      <td className={`py-1.5 pr-2 text-slate-300 sticky left-0 bg-slate-800/90 ${bold ? "font-semibold" : ""}`}>{label}</td>
      {data.map((m: any, i: number) => {
        const val = m[field];
        return (
          <td key={i} className={`py-1.5 px-2 text-right ${bold ? "font-semibold text-slate-200" : "text-slate-400"} ${val < 0 ? "text-red-400" : ""}`}>
            {formatCurrencyFull(val, currency)}
          </td>
        );
      })}
      <td className={`py-1.5 px-2 text-right font-semibold ${total !== undefined && total < 0 ? "text-red-400" : "text-blue-400"}`}>
        {total !== undefined ? formatCurrencyFull(total, currency) : ""}
      </td>
    </tr>
  );
}

function CashRow({ label, data, field, currency, bold, total, highlight }: {
  label: string; data: any[]; field: string; currency: string; bold?: boolean; total?: number; highlight?: boolean;
}) {
  return (
    <tr className={`border-b border-slate-700/30 ${highlight ? "bg-blue-900/10" : ""}`}>
      <td className={`py-1.5 pr-2 text-slate-300 sticky left-0 bg-slate-800/90 ${bold ? "font-semibold" : ""}`}>{label}</td>
      {data.map((m: any, i: number) => {
        const val = m[field];
        return (
          <td key={i} className={`py-1.5 px-2 text-right ${bold ? "font-semibold text-slate-200" : "text-slate-400"} ${val < 0 ? "text-red-400" : ""}`}>
            {formatCurrencyFull(val, currency)}
          </td>
        );
      })}
      <td className={`py-1.5 px-2 text-right font-semibold ${total !== undefined && total < 0 ? "text-red-400" : "text-blue-400"}`}>
        {total !== undefined ? formatCurrencyFull(total, currency) : ""}
      </td>
    </tr>
  );
}
