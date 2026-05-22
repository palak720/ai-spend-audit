import {
  creditsDiscountRate,
  pricingByTool,
  sameUseCaseAlternatives
} from "../pricing/schema";
import type {
  AuditInput,
  AuditResult,
  PlanInfo,
  PrimaryUseCase,
  RecommendationType,
  ToolAuditResult,
  ToolInput,
  Vendor
} from "./types";

function getPlanInfo(tool: Vendor, plan: string): PlanInfo | undefined {
  return pricingByTool[tool].find((item) => item.plan.toLowerCase() === plan.toLowerCase());
}

function seatBasedCost(monthlySeatPrice: number, seats: number): number {
  return monthlySeatPrice * Math.max(seats, 1);
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function minPricedPlanForSeats(tool: Vendor, seats: number): PlanInfo {
  const plans = pricingByTool[tool].filter((p) => p.type === "seat");
  const sorted = [...plans].sort((a, b) => a.monthlyPriceUsd - b.monthlyPriceUsd);

  const viable = sorted.find((p) => {
    if (p.plan === "Team" || p.plan === "Business") {
      return seats >= 3;
    }
    if (p.plan === "Enterprise") {
      return seats >= 10;
    }
    return true;
  });

  return viable ?? sorted[0];
}

function findAlternative(
  current: ToolInput,
  useCase: PrimaryUseCase,
  seats: number
): { tool: Vendor; plan: PlanInfo; cost: number } | null {
  const candidates = sameUseCaseAlternatives[useCase] ?? [];
  let best: { tool: Vendor; plan: PlanInfo; cost: number } | null = null;

  for (const tool of candidates) {
    if (tool === current.tool) {
      continue;
    }

    const plan = minPricedPlanForSeats(tool, seats);
    const cost = seatBasedCost(plan.monthlyPriceUsd, seats);

    if (!best || cost < best.cost) {
      best = { tool, plan, cost };
    }
  }

  return best;
}

function evaluateOne(input: ToolInput, parent: AuditInput): ToolAuditResult {
  const planInfo = getPlanInfo(input.tool, input.currentPlan);
  const inferredCurrent = planInfo?.type === "seat"
    ? seatBasedCost(planInfo.monthlyPriceUsd, input.seats)
    : input.currentMonthlySpendUsd;

  const baseCurrent = input.currentMonthlySpendUsd > 0
    ? input.currentMonthlySpendUsd
    : inferredCurrent;
  const sameVendorBestPlan = minPricedPlanForSeats(input.tool, input.seats);
  const sameVendorCost = seatBasedCost(sameVendorBestPlan.monthlyPriceUsd, input.seats);

  const alternative = findAlternative(input, parent.primaryUseCase, input.seats);
  const bestAltCost = alternative?.cost ?? Number.POSITIVE_INFINITY;

  const discountCost = rounded(baseCurrent * (1 - creditsDiscountRate));

  let recommendedAction: RecommendationType = "keep";
  let recommendedTool: Vendor = input.tool;
  let recommendedPlan = input.currentPlan;
  let recommendedMonthlySpendUsd = baseCurrent;
  let reason = "Current setup is cost-efficient for your team size and use case.";

  const hasCatalogAlignedSpend = baseCurrent >= inferredCurrent * 0.95;
  if (hasCatalogAlignedSpend && sameVendorCost <= baseCurrent * 0.85) {
    recommendedAction = "downgrade";
    recommendedTool = input.tool;
    recommendedPlan = sameVendorBestPlan.plan;
    recommendedMonthlySpendUsd = sameVendorCost;
    reason = `A lower plan from the same vendor fits ${input.seats} seats and reduces cost.`;
  }

  const altSavings = recommendedMonthlySpendUsd - bestAltCost;
  if (
    alternative &&
    bestAltCost <= recommendedMonthlySpendUsd * 0.7 &&
    altSavings >= 20
  ) {
    recommendedAction = "switch";
    recommendedTool = alternative.tool;
    recommendedPlan = alternative.plan.plan;
    recommendedMonthlySpendUsd = alternative.cost;
    reason = `A comparable ${parent.primaryUseCase} workflow is materially cheaper on ${alternative.tool}.`;
  }

  const creditSavings = recommendedMonthlySpendUsd - discountCost;
  if (discountCost <= recommendedMonthlySpendUsd * 0.9 && creditSavings >= 15) {
    recommendedAction = "credits";
    recommendedTool = input.tool;
    recommendedPlan = recommendedPlan;
    recommendedMonthlySpendUsd = discountCost;
    reason = "You are paying near-retail; discounted infrastructure credits can reduce recurring spend.";
  }

  const monthlySavingsUsd = rounded(Math.max(0, baseCurrent - recommendedMonthlySpendUsd));
  const annualSavingsUsd = rounded(monthlySavingsUsd * 12);

  return {
    tool: input.tool,
    currentPlan: input.currentPlan,
    currentMonthlySpendUsd: rounded(baseCurrent),
    recommendedAction,
    recommendedTool,
    recommendedPlan,
    recommendedMonthlySpendUsd: rounded(recommendedMonthlySpendUsd),
    monthlySavingsUsd,
    annualSavingsUsd,
    reason
  };
}

export function runAudit(input: AuditInput): AuditResult {
  const toolResults = input.tools.map((tool) => evaluateOne(tool, input));

  const totalCurrentMonthlyUsd = rounded(
    toolResults.reduce((sum, item) => sum + item.currentMonthlySpendUsd, 0)
  );

  const totalRecommendedMonthlyUsd = rounded(
    toolResults.reduce((sum, item) => sum + item.recommendedMonthlySpendUsd, 0)
  );

  const totalMonthlySavingsUsd = rounded(
    toolResults.reduce((sum, item) => sum + item.monthlySavingsUsd, 0)
  );

  return {
    totalCurrentMonthlyUsd,
    totalRecommendedMonthlyUsd,
    totalMonthlySavingsUsd,
    totalAnnualSavingsUsd: rounded(totalMonthlySavingsUsd * 12),
    toolResults
  };
}
