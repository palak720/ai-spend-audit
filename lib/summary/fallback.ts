interface SummaryInput {
  primaryUseCase: string;
  teamSize: number;
  currentMonthlySpendUsd: number;
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  recommendations: Array<{
    tool: string;
    recommendedPlan: string;
    monthlySavingsUsd: number;
    reason: string;
  }>;
}

export function buildFallbackSummary(input: SummaryInput): string {
  const top = [...input.recommendations]
    .sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd)
    .slice(0, 2)
    .map((item) => `${item.tool} -> ${item.recommendedPlan} ($${item.monthlySavingsUsd.toFixed(0)}/mo)`)
    .join(", ");

  const savingsTone =
    input.totalMonthlySavingsUsd >= 500
      ? "Your stack has meaningful savings headroom and is worth acting on this week."
      : input.totalMonthlySavingsUsd < 100
        ? "Your stack is already fairly efficient with only modest immediate savings."
        : "There are clear optimization opportunities without changing your core workflow.";

  return `For a ${input.teamSize}-person ${input.primaryUseCase} team spending about $${input.currentMonthlySpendUsd.toFixed(0)}/month on AI tools, this audit estimates potential savings of $${input.totalMonthlySavingsUsd.toFixed(0)}/month ($${input.totalAnnualSavingsUsd.toFixed(0)}/year). ${savingsTone} Highest-impact moves: ${top || "review current plans and remove over-provisioned seats"}. Next step: apply one change, re-check spend after 30 days, and then optimize remaining tools.`;
}
