import type { AuditInput, ToolInput } from "../audit/types";

export interface SpendFormState {
  teamSize: number;
  primaryUseCase: AuditInput["primaryUseCase"];
  tools: ToolInput[];
}

export const STORAGE_KEY = "ai-spend-audit:form:v1";

export const defaultFormState: SpendFormState = {
  teamSize: 5,
  primaryUseCase: "coding",
  tools: [
    {
      tool: "cursor",
      currentPlan: "Pro",
      currentMonthlySpendUsd: 100,
      seats: 5
    }
  ]
};
