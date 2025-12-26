/**
 * SaaS Revenue Calculator - Pure Calculation Functions
 * 
 * This module contains all calculation logic for the revenue calculator.
 * These functions are pure (no side effects) and can be reused across
 * both internal and public modes.
 * 
 * Key formulas are based on standard SaaS unit economics.
 * 
 * ACCOUNTING PRINCIPLE:
 * - Revenue = 100% of platform income (subscriptions + coaching commission)
 * - Mentor payouts = Cost of services (COGS), NOT revenue reduction
 */

export interface CalculatorInputs {
  monthlyVisitors: number;
  conversionRate: number;
  subscriptionPrice: number;
  monthlyChurnRate: number;
  stripePercentage: number;
  stripeFixedFee: number;
  fixedMonthlyCosts: number;
  variableCostPerUser: number;
  monthlyMarketingSpend: number;
  coachingAdoptionRate: number;
  avgCoachingSpendPerUser: number;
  platformCommissionRate: number;
  mentorPayoutRate: number;
}

export interface CalculatorOutputs {
  newMembersPerMonth: number;
  avgLifetimeMonths: number;
  activeMembers: number;
  subscriptionRevenue: number;
  coachingBuyers: number;
  grossCoachingGMV: number;
  coachingCommissionRevenue: number;
  totalRevenue: number;
  mentorSubscriptionExpense: number;
  mentorCommissionExpense: number;
  totalMentorExpenses: number;
  stripeFees: number;
  variableCosts: number;
  totalCosts: number;
  netProfit: number;
  netMargin: number;
}

/**
 * Default values for internal mode (founder view)
 */
export const defaultInternalInputs: CalculatorInputs = {
  monthlyVisitors: 10000,
  conversionRate: 2,
  subscriptionPrice: 49,
  monthlyChurnRate: 5,
  stripePercentage: 2.9,
  stripeFixedFee: 0.30,
  fixedMonthlyCosts: 500,
  variableCostPerUser: 2,
  monthlyMarketingSpend: 1000,
  coachingAdoptionRate: 20,
  avgCoachingSpendPerUser: 200,
  platformCommissionRate: 20,
  mentorPayoutRate: 50,
};

/**
 * Default values for public mode (simplified marketing view)
 * Some values are fixed and hidden from users
 */
export const defaultPublicInputs: CalculatorInputs = {
  monthlyVisitors: 5000,
  conversionRate: 3,
  subscriptionPrice: 49,
  monthlyChurnRate: 5,
  stripePercentage: 2.9,
  stripeFixedFee: 0.30,
  fixedMonthlyCosts: 300,
  variableCostPerUser: 1.5,
  monthlyMarketingSpend: 500,
  coachingAdoptionRate: 20,
  avgCoachingSpendPerUser: 200,
  platformCommissionRate: 20,
  mentorPayoutRate: 50,
};

const STORAGE_KEY_INTERNAL = 'tcp_calculator_internal';
const STORAGE_KEY_PUBLIC = 'tcp_calculator_public';

/**
 * Save inputs to localStorage
 */
export function saveInputs(inputs: CalculatorInputs, mode: 'internal' | 'public'): void {
  try {
    const key = mode === 'internal' ? STORAGE_KEY_INTERNAL : STORAGE_KEY_PUBLIC;
    localStorage.setItem(key, JSON.stringify(inputs));
  } catch (e) {
    console.error('Failed to save calculator inputs:', e);
  }
}

/**
 * Load inputs from localStorage
 */
export function loadInputs(mode: 'internal' | 'public'): CalculatorInputs | null {
  try {
    const key = mode === 'internal' ? STORAGE_KEY_INTERNAL : STORAGE_KEY_PUBLIC;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const defaults = mode === 'internal' ? defaultInternalInputs : defaultPublicInputs;
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load calculator inputs:', e);
  }
  return null;
}

/**
 * Calculate new members acquired per month
 * Formula: visitors * (conversionRate / 100)
 */
export function calculateNewMembers(visitors: number, conversionRate: number): number {
  return Math.round(visitors * (conversionRate / 100));
}

/**
 * Calculate average customer lifetime in months
 * Formula: 1 / (churnRate / 100)
 * Example: 5% churn = 20 month average lifetime
 */
export function calculateAvgLifetimeMonths(churnRate: number): number {
  if (churnRate <= 0) return 0;
  return 1 / (churnRate / 100);
}

/**
 * Calculate active paying members (steady state)
 * Formula: newMembers * avgLifetimeMonths
 * This represents the equilibrium number of active subscribers
 */
export function calculateActiveMembers(newMembers: number, avgLifetimeMonths: number): number {
  return Math.round(newMembers * avgLifetimeMonths);
}

/**
 * Calculate subscription revenue (MRR from subscriptions)
 * Formula: activeMembers * subscriptionPrice
 */
export function calculateSubscriptionRevenue(activeMembers: number, subscriptionPrice: number): number {
  return activeMembers * subscriptionPrice;
}

/**
 * Calculate coaching buyers
 * Formula: activeMembers * (coachingAdoptionRate / 100)
 */
export function calculateCoachingBuyers(activeMembers: number, coachingAdoptionRate: number): number {
  return Math.round(activeMembers * (coachingAdoptionRate / 100));
}

/**
 * Calculate gross coaching GMV (total coaching spend through platform)
 * Formula: coachingBuyers * avgCoachingSpendPerUser
 */
export function calculateGrossCoachingGMV(coachingBuyers: number, avgCoachingSpendPerUser: number): number {
  return coachingBuyers * avgCoachingSpendPerUser;
}

/**
 * Calculate coaching commission revenue (platform's 20% cut)
 * Formula: grossCoachingGMV * (platformCommissionRate / 100)
 * NOTE: This is 100% platform revenue. The 80% paid to coaches is NOT revenue.
 */
export function calculateCoachingCommissionRevenue(grossCoachingGMV: number, platformCommissionRate: number): number {
  return grossCoachingGMV * (platformCommissionRate / 100);
}

/**
 * Calculate total platform revenue
 * Formula: subscriptionRevenue + coachingCommissionRevenue
 */
export function calculateTotalRevenue(subscriptionRevenue: number, coachingCommissionRevenue: number): number {
  return subscriptionRevenue + coachingCommissionRevenue;
}

/**
 * Calculate mentor expense from subscriptions
 * Formula: subscriptionRevenue * (mentorPayoutRate / 100)
 * Mentors receive 50% of subscription revenue as compensation
 */
export function calculateMentorSubscriptionExpense(subscriptionRevenue: number, mentorPayoutRate: number): number {
  return subscriptionRevenue * (mentorPayoutRate / 100);
}

/**
 * Calculate mentor expense from coaching commission
 * Formula: coachingCommissionRevenue * (mentorPayoutRate / 100)
 * Mentors receive 50% of coaching commission as compensation
 */
export function calculateMentorCommissionExpense(coachingCommissionRevenue: number, mentorPayoutRate: number): number {
  return coachingCommissionRevenue * (mentorPayoutRate / 100);
}

/**
 * Calculate total mentor expenses (COGS)
 * Formula: mentorSubscriptionExpense + mentorCommissionExpense
 */
export function calculateTotalMentorExpenses(mentorSubscriptionExpense: number, mentorCommissionExpense: number): number {
  return mentorSubscriptionExpense + mentorCommissionExpense;
}

/**
 * Calculate total Stripe payment processing fees
 * 
 * IMPORTANT: Stripe fees are calculated on the FULL processed volume:
 * - Subscription payments: full amount processed
 * - Coaching payments: FULL GMV processed (not just platform commission)
 * 
 * Formula: ((subscriptionRevenue + grossCoachingGMV) * stripePercentage/100) 
 *          + (activeMembers * stripeFixedFee) + (coachingBuyers * stripeFixedFee)
 */
export function calculateStripeFees(
  subscriptionRevenue: number,
  grossCoachingGMV: number,
  activeMembers: number,
  coachingBuyers: number,
  stripePercentage: number,
  stripeFixedFee: number
): number {
  const totalProcessedVolume = subscriptionRevenue + grossCoachingGMV;
  const percentageFee = totalProcessedVolume * (stripePercentage / 100);
  const subscriptionFees = activeMembers * stripeFixedFee;
  const coachingFees = coachingBuyers * stripeFixedFee;
  return percentageFee + subscriptionFees + coachingFees;
}

/**
 * Calculate variable costs that scale with users
 * Formula: activeMembers * variableCostPerUser
 * 
 * Includes: AI API costs, support costs, scaling infrastructure
 */
export function calculateVariableCosts(activeMembers: number, variableCostPerUser: number): number {
  return activeMembers * variableCostPerUser;
}

/**
 * Calculate total monthly costs
 * Formula: mentorExpenses + stripeFees + fixedMonthlyCosts + variableCosts + marketingSpend
 */
export function calculateTotalCosts(
  mentorExpenses: number,
  stripeFees: number,
  fixedMonthlyCosts: number,
  variableCosts: number,
  marketingSpend: number
): number {
  return mentorExpenses + stripeFees + fixedMonthlyCosts + variableCosts + marketingSpend;
}

/**
 * Calculate net profit
 * Formula: totalRevenue - totalCosts
 */
export function calculateNetProfit(totalRevenue: number, totalCosts: number): number {
  return totalRevenue - totalCosts;
}

/**
 * Calculate net margin percentage
 * Formula: (netProfit / totalRevenue) * 100
 * Returns 0 if totalRevenue is 0 to avoid division by zero
 */
export function calculateNetMargin(netProfit: number, totalRevenue: number): number {
  if (totalRevenue <= 0) return 0;
  return (netProfit / totalRevenue) * 100;
}

/**
 * Main calculation function - computes all outputs from inputs
 * This is the single source of truth for all calculations
 */
export function calculateAll(inputs: CalculatorInputs): CalculatorOutputs {
  const newMembersPerMonth = calculateNewMembers(inputs.monthlyVisitors, inputs.conversionRate);
  const avgLifetimeMonths = calculateAvgLifetimeMonths(inputs.monthlyChurnRate);
  const activeMembers = calculateActiveMembers(newMembersPerMonth, avgLifetimeMonths);
  
  const subscriptionRevenue = calculateSubscriptionRevenue(activeMembers, inputs.subscriptionPrice);
  
  const coachingBuyers = calculateCoachingBuyers(activeMembers, inputs.coachingAdoptionRate);
  const grossCoachingGMV = calculateGrossCoachingGMV(coachingBuyers, inputs.avgCoachingSpendPerUser);
  const coachingCommissionRevenue = calculateCoachingCommissionRevenue(grossCoachingGMV, inputs.platformCommissionRate);
  
  const totalRevenue = calculateTotalRevenue(subscriptionRevenue, coachingCommissionRevenue);
  
  const mentorSubscriptionExpense = calculateMentorSubscriptionExpense(subscriptionRevenue, inputs.mentorPayoutRate);
  const mentorCommissionExpense = calculateMentorCommissionExpense(coachingCommissionRevenue, inputs.mentorPayoutRate);
  const totalMentorExpenses = calculateTotalMentorExpenses(mentorSubscriptionExpense, mentorCommissionExpense);
  
  const stripeFees = calculateStripeFees(subscriptionRevenue, grossCoachingGMV, activeMembers, coachingBuyers, inputs.stripePercentage, inputs.stripeFixedFee);
  const variableCosts = calculateVariableCosts(activeMembers, inputs.variableCostPerUser);
  const totalCosts = calculateTotalCosts(totalMentorExpenses, stripeFees, inputs.fixedMonthlyCosts, variableCosts, inputs.monthlyMarketingSpend);
  const netProfit = calculateNetProfit(totalRevenue, totalCosts);
  const netMargin = calculateNetMargin(netProfit, totalRevenue);

  return {
    newMembersPerMonth,
    avgLifetimeMonths,
    activeMembers,
    subscriptionRevenue,
    coachingBuyers,
    grossCoachingGMV,
    coachingCommissionRevenue,
    totalRevenue,
    mentorSubscriptionExpense,
    mentorCommissionExpense,
    totalMentorExpenses,
    stripeFees,
    variableCosts,
    totalCosts,
    netProfit,
    netMargin,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}
