export type BusinessUnit = "shared-studios" | "noro";

export interface CustomerType {
  portalsPerCustomer: number;
  organizersPerCustomer: number;
  pricing: number;
  chargedAnnually: boolean;
}

export interface GrowthAssumptions {
  newPortals: number;
  q1Pct: number;
  q2Pct: number;
  q3Pct: number;
  q4Pct: number;
}

export interface YearlyOpEx {
  marketingMonthly: number;
  gaMonthly: number;
  rdMonthly: number;
}

export interface PeopleAssumptions {
  benefitsPct: number;
  foundersContractorThreshold: number;
  monthlyPayroll: number;
  noroMonthlyPayroll: number;
}

export interface NoroAssumptions {
  currency: string;
  modelStartMonth: number;
  monthlyChurnRate: number;
  upfrontPctHardware: number;
  onDeliveryPctHardware: number;

  annualSoftwarePerPortal: number;
  hwMarginPerPortal: number;

  noroAnnualSoftwarePerPortal: number;
  noroHwMarginPerPortal: number;

  sharedStudiosAvgMonthlyBookings: number;
  sharedStudiosCogsPct: number;
  installLagMonths: number;

  customerTypes: {
    start: CustomerType;
    enterprise: CustomerType;
    global: CustomerType;
  };

  people: PeopleAssumptions;

  opex: {
    2026: YearlyOpEx;
    2027: YearlyOpEx;
    2028: YearlyOpEx;
  };

  noroOpex: {
    2026: YearlyOpEx;
    2027: YearlyOpEx;
    2028: YearlyOpEx;
  };

  startingCash: number;
  fundraiseInflows: { 2026: number; 2027: number; 2028: number };
  loanRepaymentsMonthly: number;

  newCustomers2026: {
    start: number[];
    enterprise: number[];
    global: number[];
  };

  growth: {
    2027: GrowthAssumptions;
    2028: GrowthAssumptions;
  };
}

export interface MonthlyData {
  month: number;
  label: string;
  newStartSigned: number;
  newEnterpriseSigned: number;
  newGlobalSigned: number;
  startInstalled: number;
  enterpriseInstalled: number;
  globalInstalled: number;
  activeStartCustomers: number;
  activeEnterpriseCustomers: number;
  activeGlobalCustomers: number;
  totalActiveCustomers: number;
  activePortals: number;
  portalsInstalled: number;
  softwareRevenue: number;
  usageRevenue: number;
  hardwareCashIn: number;
  totalRevenue: number;
}

export interface PLData {
  month: number;
  label: string;
  contractedARR: number;
  contractedVRR: number;
  contractedNewRevenue: number;
  newNoroRevenue: number;
  newSharedStudiosRevenue: number;
  totalRevenue: number;
  totalRevenueNonVRR: number;
  hardwareCOGS: number;
  cogsNonNewNoro: number;
  totalCOGS: number;
  grossProfit: number;
  payroll: number;
  marketing: number;
  rd: number;
  ga: number;
  totalOpEx: number;
  ebitda: number;
}

export interface CashData {
  month: number;
  label: string;
  beginningCash: number;
  cashIn: number;
  cashOut: number;
  founderRepayments: number;
  netCashFlow: number;
  endingCash: number;
}

export interface AnnualSummary {
  year: number;
  arrRevenue: number;
  newNoroRevenue: number;
  newSharedStudiosRevenue: number;
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalOpEx: number;
  ebitda: number;
  endingCash: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const defaultAssumptions: NoroAssumptions = {
  currency: "USD",
  modelStartMonth: 1,
  monthlyChurnRate: 2.0,
  upfrontPctHardware: 50,
  onDeliveryPctHardware: 50,

  annualSoftwarePerPortal: 4800,
  hwMarginPerPortal: 2000,

  noroAnnualSoftwarePerPortal: 2400,
  noroHwMarginPerPortal: 1200,

  sharedStudiosAvgMonthlyBookings: 500,
  sharedStudiosCogsPct: 20,
  installLagMonths: 2,

  customerTypes: {
    start: { portalsPerCustomer: 1, organizersPerCustomer: 1, pricing: 399, chargedAnnually: true },
    enterprise: { portalsPerCustomer: 3, organizersPerCustomer: 5, pricing: 999, chargedAnnually: true },
    global: { portalsPerCustomer: 10, organizersPerCustomer: 20, pricing: 2499, chargedAnnually: true },
  },

  people: {
    benefitsPct: 25,
    foundersContractorThreshold: 500000,
    monthlyPayroll: 15000,
    noroMonthlyPayroll: 8000,
  },

  opex: {
    2026: { marketingMonthly: 5000, gaMonthly: 3000, rdMonthly: 8000 },
    2027: { marketingMonthly: 8000, gaMonthly: 5000, rdMonthly: 12000 },
    2028: { marketingMonthly: 12000, gaMonthly: 8000, rdMonthly: 15000 },
  },

  noroOpex: {
    2026: { marketingMonthly: 2000, gaMonthly: 1000, rdMonthly: 6000 },
    2027: { marketingMonthly: 4000, gaMonthly: 2000, rdMonthly: 9000 },
    2028: { marketingMonthly: 6000, gaMonthly: 3000, rdMonthly: 12000 },
  },

  startingCash: 100000,
  fundraiseInflows: { 2026: 500000, 2027: 0, 2028: 0 },
  loanRepaymentsMonthly: 0,

  newCustomers2026: {
    start: [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
    enterprise: [0, 1, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    global: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  },

  growth: {
    2027: { newPortals: 120, q1Pct: 20, q2Pct: 25, q3Pct: 30, q4Pct: 25 },
    2028: { newPortals: 200, q1Pct: 20, q2Pct: 25, q3Pct: 30, q4Pct: 25 },
  },
};

function distributeByQuarter(total: number, q1: number, q2: number, q3: number, q4: number): number[] {
  const monthly: number[] = [];
  const quarters = [q1, q2, q3, q4];
  for (let q = 0; q < 4; q++) {
    const qTotal = Math.round(total * quarters[q] / 100);
    const perMonth = Math.floor(qTotal / 3);
    const remainder = qTotal - perMonth * 3;
    for (let m = 0; m < 3; m++) {
      monthly.push(perMonth + (m < remainder ? 1 : 0));
    }
  }
  return monthly;
}

export function calculateMonthlyData(assumptions: NoroAssumptions, year: 2026 | 2027 | 2028, businessUnit: BusinessUnit = "shared-studios"): MonthlyData[] {
  const isNoro = businessUnit === "noro";
  const churnRate = assumptions.monthlyChurnRate / 100;
  const lag = assumptions.installLagMonths;
  const ct = assumptions.customerTypes;

  const annualSoftware = isNoro ? assumptions.noroAnnualSoftwarePerPortal : assumptions.annualSoftwarePerPortal;
  const hwMargin = isNoro ? assumptions.noroHwMarginPerPortal : assumptions.hwMarginPerPortal;

  let newStartByMonth: number[];
  let newEnterpriseByMonth: number[];
  let newGlobalByMonth: number[];

  if (year === 2026) {
    newStartByMonth = [...assumptions.newCustomers2026.start];
    newEnterpriseByMonth = [...assumptions.newCustomers2026.enterprise];
    newGlobalByMonth = [...assumptions.newCustomers2026.global];
  } else {
    const g = assumptions.growth[year];
    const totalPortals = g.newPortals;
    const startRatio = ct.start.portalsPerCustomer;
    const entRatio = ct.enterprise.portalsPerCustomer;
    const globalRatio = ct.global.portalsPerCustomer;
    const totalRatio = startRatio + entRatio + globalRatio;

    const startPortals = Math.round(totalPortals * startRatio / totalRatio);
    const entPortals = Math.round(totalPortals * entRatio / totalRatio);
    const globalPortals = totalPortals - startPortals - entPortals;

    const startCustomers = Math.round(startPortals / ct.start.portalsPerCustomer);
    const entCustomers = Math.round(entPortals / ct.enterprise.portalsPerCustomer);
    const globalCustomers = Math.round(globalPortals / ct.global.portalsPerCustomer);

    newStartByMonth = distributeByQuarter(startCustomers, g.q1Pct, g.q2Pct, g.q3Pct, g.q4Pct);
    newEnterpriseByMonth = distributeByQuarter(entCustomers, g.q1Pct, g.q2Pct, g.q3Pct, g.q4Pct);
    newGlobalByMonth = distributeByQuarter(globalCustomers, g.q1Pct, g.q2Pct, g.q3Pct, g.q4Pct);
  }

  const priorYearActive = getPriorYearActiveCustomers(assumptions, year);
  let activeStart = priorYearActive.start;
  let activeEnterprise = priorYearActive.enterprise;
  let activeGlobal = priorYearActive.global;

  const pendingInstallStart: number[] = [];
  const pendingInstallEnterprise: number[] = [];
  const pendingInstallGlobal: number[] = [];

  const results: MonthlyData[] = [];

  for (let m = 0; m < 12; m++) {
    const newS = newStartByMonth[m] || 0;
    const newE = newEnterpriseByMonth[m] || 0;
    const newG = newGlobalByMonth[m] || 0;

    pendingInstallStart.push(newS);
    pendingInstallEnterprise.push(newE);
    pendingInstallGlobal.push(newG);

    let installedS = 0, installedE = 0, installedG = 0;
    if (m >= lag) {
      installedS = pendingInstallStart[m - lag] || 0;
      installedE = pendingInstallEnterprise[m - lag] || 0;
      installedG = pendingInstallGlobal[m - lag] || 0;
    }

    activeStart = activeStart * (1 - churnRate) + installedS;
    activeEnterprise = activeEnterprise * (1 - churnRate) + installedE;
    activeGlobal = activeGlobal * (1 - churnRate) + installedG;

    const totalActive = activeStart + activeEnterprise + activeGlobal;
    const activePortals = activeStart * ct.start.portalsPerCustomer +
                          activeEnterprise * ct.enterprise.portalsPerCustomer +
                          activeGlobal * ct.global.portalsPerCustomer;
    const portalsInstalled = installedS * ct.start.portalsPerCustomer +
                             installedE * ct.enterprise.portalsPerCustomer +
                             installedG * ct.global.portalsPerCustomer;

    const softwareRevenue = activePortals * (annualSoftware / 12);
    const usageRevenue = isNoro ? 0 : totalActive * assumptions.sharedStudiosAvgMonthlyBookings;

    const signedPortals = newS * ct.start.portalsPerCustomer + newE * ct.enterprise.portalsPerCustomer + newG * ct.global.portalsPerCustomer;
    const upfrontHw = signedPortals * hwMargin * (assumptions.upfrontPctHardware / 100);
    const deliveryHw = portalsInstalled * hwMargin * (assumptions.onDeliveryPctHardware / 100);
    const hardwareCashIn = upfrontHw + deliveryHw;

    results.push({
      month: m + 1,
      label: MONTH_LABELS[m],
      newStartSigned: newS,
      newEnterpriseSigned: newE,
      newGlobalSigned: newG,
      startInstalled: installedS,
      enterpriseInstalled: installedE,
      globalInstalled: installedG,
      activeStartCustomers: Math.round(activeStart * 100) / 100,
      activeEnterpriseCustomers: Math.round(activeEnterprise * 100) / 100,
      activeGlobalCustomers: Math.round(activeGlobal * 100) / 100,
      totalActiveCustomers: Math.round(totalActive * 100) / 100,
      activePortals: Math.round(activePortals * 100) / 100,
      portalsInstalled: portalsInstalled,
      softwareRevenue: Math.round(softwareRevenue),
      usageRevenue: Math.round(usageRevenue),
      hardwareCashIn: Math.round(hardwareCashIn),
      totalRevenue: Math.round(softwareRevenue + usageRevenue + hardwareCashIn),
    });
  }

  return results;
}

function getPriorYearActiveCustomers(assumptions: NoroAssumptions, year: 2026 | 2027 | 2028): { start: number; enterprise: number; global: number } {
  if (year === 2026) {
    return { start: 0, enterprise: 0, global: 0 };
  }
  const priorYear = (year - 1) as 2026 | 2027;
  const priorData = calculateMonthlyData(assumptions, priorYear);
  const lastMonth = priorData[11];
  return {
    start: lastMonth.activeStartCustomers,
    enterprise: lastMonth.activeEnterpriseCustomers,
    global: lastMonth.activeGlobalCustomers,
  };
}

export function calculatePL(assumptions: NoroAssumptions, year: 2026 | 2027 | 2028, businessUnit: BusinessUnit = "shared-studios"): PLData[] {
  const monthlyData = calculateMonthlyData(assumptions, year, businessUnit);
  const isNoro = businessUnit === "noro";
  const yearOpex = isNoro ? assumptions.noroOpex[year] : assumptions.opex[year];
  const hwMargin = isNoro ? assumptions.noroHwMarginPerPortal : assumptions.hwMarginPerPortal;

  return monthlyData.map((md) => {
    const contractedARR = md.softwareRevenue;
    const contractedVRR = md.usageRevenue;
    const contractedNewRevenue = md.hardwareCashIn;
    const newNoroRevenue = md.softwareRevenue + md.hardwareCashIn;
    const newSharedStudiosRevenue = md.usageRevenue;
    const totalRevenue = md.totalRevenue;
    const totalRevenueNonVRR = totalRevenue - contractedVRR;

    const hardwareCOGS = md.portalsInstalled * hwMargin * 0.6;
    const cogsNonNewNoro = isNoro ? 0 : (md.usageRevenue) * (assumptions.sharedStudiosCogsPct / 100);
    const totalCOGS = hardwareCOGS + cogsNonNewNoro;
    const grossProfit = totalRevenue - totalCOGS;

    const payrollBase = isNoro ? assumptions.people.noroMonthlyPayroll : assumptions.people.monthlyPayroll;
    const payroll = payrollBase * (1 + assumptions.people.benefitsPct / 100);

    const totalOpEx = payroll + yearOpex.marketingMonthly + yearOpex.rdMonthly + yearOpex.gaMonthly;
    const ebitda = grossProfit - totalOpEx;

    return {
      month: md.month,
      label: md.label,
      contractedARR,
      contractedVRR,
      contractedNewRevenue,
      newNoroRevenue,
      newSharedStudiosRevenue,
      totalRevenue,
      totalRevenueNonVRR,
      hardwareCOGS: Math.round(hardwareCOGS),
      cogsNonNewNoro: Math.round(cogsNonNewNoro),
      totalCOGS: Math.round(totalCOGS),
      grossProfit: Math.round(grossProfit),
      payroll: Math.round(payroll),
      marketing: yearOpex.marketingMonthly,
      rd: yearOpex.rdMonthly,
      ga: yearOpex.gaMonthly,
      totalOpEx: Math.round(totalOpEx),
      ebitda: Math.round(ebitda),
    };
  });
}

export function calculateCash(assumptions: NoroAssumptions, year: 2026 | 2027 | 2028, businessUnit: BusinessUnit = "shared-studios"): CashData[] {
  let beginningCash: number;

  if (year === 2026) {
    beginningCash = assumptions.startingCash + assumptions.fundraiseInflows[2026];
  } else {
    const priorYear = (year - 1) as 2026 | 2027;
    const priorCash = calculateCash(assumptions, priorYear, businessUnit);
    beginningCash = priorCash[11].endingCash + assumptions.fundraiseInflows[year];
  }

  const plData = calculatePL(assumptions, year, businessUnit);
  const results: CashData[] = [];

  for (let m = 0; m < 12; m++) {
    const pl = plData[m];
    const cashIn = pl.totalRevenue;
    const cashOut = pl.totalCOGS + pl.totalOpEx;
    const founderRepayments = assumptions.loanRepaymentsMonthly;
    const netCashFlow = cashIn - cashOut - founderRepayments;
    const endingCash = beginningCash + netCashFlow;

    results.push({
      month: m + 1,
      label: pl.label,
      beginningCash: Math.round(beginningCash),
      cashIn: Math.round(cashIn),
      cashOut: Math.round(cashOut),
      founderRepayments,
      netCashFlow: Math.round(netCashFlow),
      endingCash: Math.round(endingCash),
    });

    beginningCash = endingCash;
  }

  return results;
}

export function calculateAnnualSummaries(assumptions: NoroAssumptions, businessUnit: BusinessUnit = "shared-studios"): AnnualSummary[] {
  const years: (2026 | 2027 | 2028)[] = [2026, 2027, 2028];

  return years.map((year) => {
    const plData = calculatePL(assumptions, year, businessUnit);
    const cashData = calculateCash(assumptions, year, businessUnit);

    const arrRevenue = plData.reduce((sum, m) => sum + m.contractedARR, 0);
    const newNoroRevenue = plData.reduce((sum, m) => sum + m.newNoroRevenue, 0);
    const newSharedStudiosRevenue = plData.reduce((sum, m) => sum + m.newSharedStudiosRevenue, 0);
    const totalRevenue = plData.reduce((sum, m) => sum + m.totalRevenue, 0);
    const totalCOGS = plData.reduce((sum, m) => sum + m.totalCOGS, 0);
    const grossProfit = plData.reduce((sum, m) => sum + m.grossProfit, 0);
    const totalOpEx = plData.reduce((sum, m) => sum + m.totalOpEx, 0);
    const ebitda = plData.reduce((sum, m) => sum + m.ebitda, 0);
    const endingCash = cashData[11].endingCash;

    return {
      year,
      arrRevenue: Math.round(arrRevenue),
      newNoroRevenue: Math.round(newNoroRevenue),
      newSharedStudiosRevenue: Math.round(newSharedStudiosRevenue),
      totalRevenue: Math.round(totalRevenue),
      totalCOGS: Math.round(totalCOGS),
      grossProfit: Math.round(grossProfit),
      totalOpEx: Math.round(totalOpEx),
      ebitda: Math.round(ebitda),
      endingCash: Math.round(endingCash),
    };
  });
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  const absValue = Math.abs(value);
  const formatted = absValue >= 1000000
    ? `${(absValue / 1000000).toFixed(1)}M`
    : absValue >= 1000
    ? `${(absValue / 1000).toFixed(1)}K`
    : absValue.toLocaleString();
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return value < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCurrencyFull(value: number, currency: string = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  const formatted = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return value < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

const STORAGE_KEY = "noro_financial_model";

export function saveAssumptions(assumptions: NoroAssumptions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assumptions));
  } catch (e) {
    console.error("Failed to save assumptions:", e);
  }
}

export function loadAssumptions(): NoroAssumptions | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.people.noroMonthlyPayroll && parsed.people.noroMonthlyPayroll !== 0) {
        parsed.people.noroMonthlyPayroll = defaultAssumptions.people.noroMonthlyPayroll;
      }
      if (!parsed.noroOpex) {
        parsed.noroOpex = { ...defaultAssumptions.noroOpex };
      }
      if (parsed.noroAnnualSoftwarePerPortal === undefined) {
        parsed.noroAnnualSoftwarePerPortal = defaultAssumptions.noroAnnualSoftwarePerPortal;
      }
      if (parsed.noroHwMarginPerPortal === undefined) {
        parsed.noroHwMarginPerPortal = defaultAssumptions.noroHwMarginPerPortal;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load assumptions:", e);
  }
  return null;
}
