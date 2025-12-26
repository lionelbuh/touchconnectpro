/**
 * SaaS Revenue Calculator - Pure Calculation Functions
 * 
 * This module contains all calculation logic for the revenue calculator.
 * These functions are pure (no side effects) and can be reused across
 * both internal and public modes.
 * 
 * Key formulas are based on standard SaaS unit economics.
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
}

export interface CalculatorOutputs {
  newMembersPerMonth: number;
  avgLifetimeMonths: number;
  activeMembers: number;
  mrr: number;
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
};

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
 * Calculate Monthly Recurring Revenue
 * Formula: activeMembers * subscriptionPrice
 */
export function calculateMRR(activeMembers: number, subscriptionPrice: number): number {
  return activeMembers * subscriptionPrice;
}

/**
 * Calculate total Stripe payment processing fees
 * Formula: (MRR * stripePercentage/100) + (activeMembers * stripeFixedFee)
 * 
 * Stripe charges both a percentage fee and a fixed fee per transaction.
 * We assume one transaction per member per month.
 */
export function calculateStripeFees(
  mrr: number,
  activeMembers: number,
  stripePercentage: number,
  stripeFixedFee: number
): number {
  const percentageFee = mrr * (stripePercentage / 100);
  const fixedFees = activeMembers * stripeFixedFee;
  return percentageFee + fixedFees;
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
 * Formula: stripeFees + fixedMonthlyCosts + variableCosts + marketingSpend
 */
export function calculateTotalCosts(
  stripeFees: number,
  fixedMonthlyCosts: number,
  variableCosts: number,
  marketingSpend: number
): number {
  return stripeFees + fixedMonthlyCosts + variableCosts + marketingSpend;
}

/**
 * Calculate net profit
 * Formula: MRR - totalCosts
 */
export function calculateNetProfit(mrr: number, totalCosts: number): number {
  return mrr - totalCosts;
}

/**
 * Calculate net margin percentage
 * Formula: (netProfit / MRR) * 100
 * Returns 0 if MRR is 0 to avoid division by zero
 */
export function calculateNetMargin(netProfit: number, mrr: number): number {
  if (mrr <= 0) return 0;
  return (netProfit / mrr) * 100;
}

/**
 * Main calculation function - computes all outputs from inputs
 * This is the single source of truth for all calculations
 */
export function calculateAll(inputs: CalculatorInputs): CalculatorOutputs {
  const newMembersPerMonth = calculateNewMembers(inputs.monthlyVisitors, inputs.conversionRate);
  const avgLifetimeMonths = calculateAvgLifetimeMonths(inputs.monthlyChurnRate);
  const activeMembers = calculateActiveMembers(newMembersPerMonth, avgLifetimeMonths);
  const mrr = calculateMRR(activeMembers, inputs.subscriptionPrice);
  const stripeFees = calculateStripeFees(mrr, activeMembers, inputs.stripePercentage, inputs.stripeFixedFee);
  const variableCosts = calculateVariableCosts(activeMembers, inputs.variableCostPerUser);
  const totalCosts = calculateTotalCosts(stripeFees, inputs.fixedMonthlyCosts, variableCosts, inputs.monthlyMarketingSpend);
  const netProfit = calculateNetProfit(mrr, totalCosts);
  const netMargin = calculateNetMargin(netProfit, mrr);

  return {
    newMembersPerMonth,
    avgLifetimeMonths,
    activeMembers,
    mrr,
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
