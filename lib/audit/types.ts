export type PrimaryUseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type Vendor =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type PlanType = "seat" | "usage";

export interface PlanInfo {
  plan: string;
  monthlyPriceUsd: number;
  type: PlanType;
}

export interface ToolInput {
  tool: Vendor;
  currentPlan: string;
  currentMonthlySpendUsd: number;
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  tools: ToolInput[];
}

export type RecommendationType =
  | "keep"
  | "downgrade"
  | "switch"
  | "credits"
  | "optimize-usage";

export interface ToolAuditResult {
  tool: Vendor;
  currentPlan: string;
  currentMonthlySpendUsd: number;
  recommendedAction: RecommendationType;
  recommendedTool: Vendor;
  recommendedPlan: string;
  recommendedMonthlySpendUsd: number;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
  reason: string;
}

export interface AuditResult {
  totalCurrentMonthlyUsd: number;
  totalRecommendedMonthlyUsd: number;
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  toolResults: ToolAuditResult[];
}
