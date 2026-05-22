import { describe, expect, it } from "vitest";
import { runAudit } from "../lib/audit/engine";

describe("audit engine", () => {
  it("computes monthly and annual savings totals", () => {
    const result = runAudit({
      teamSize: 4,
      primaryUseCase: "coding",
      tools: [
        {
          tool: "cursor",
          currentPlan: "Business",
          currentMonthlySpendUsd: 240,
          seats: 6
        }
      ]
    });

    expect(result.totalCurrentMonthlyUsd).toBe(240);
    expect(result.totalMonthlySavingsUsd).toBeGreaterThan(0);
    expect(result.totalAnnualSavingsUsd).toBe(result.totalMonthlySavingsUsd * 12);
  });

  it("flags over-provisioned team plan for low seat counts", () => {
    const result = runAudit({
      teamSize: 2,
      primaryUseCase: "coding",
      tools: [
        {
          tool: "chatgpt",
          currentPlan: "Team",
          currentMonthlySpendUsd: 60,
          seats: 2
        }
      ]
    });

    const row = result.toolResults[0];
    expect(["downgrade", "switch", "credits"]).toContain(row.recommendedAction);
    expect(row.recommendedMonthlySpendUsd).toBeLessThan(60);
  });

  it("recommends a same-vendor downgrade when it materially saves", () => {
    const result = runAudit({
      teamSize: 3,
      primaryUseCase: "coding",
      tools: [
        {
          tool: "cursor",
          currentPlan: "Enterprise",
          currentMonthlySpendUsd: 180,
          seats: 3
        }
      ]
    });

    const row = result.toolResults[0];
    expect(["downgrade", "credits"]).toContain(row.recommendedAction);
    expect(row.monthlySavingsUsd).toBeGreaterThan(0);
  });

  it("recommends alternative vendor when substantially cheaper", () => {
    const result = runAudit({
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [
        {
          tool: "github-copilot",
          currentPlan: "Enterprise",
          currentMonthlySpendUsd: 39,
          seats: 1
        }
      ]
    });

    const row = result.toolResults[0];
    expect(["switch", "downgrade", "credits"]).toContain(row.recommendedAction);
    expect(row.recommendedMonthlySpendUsd).toBeLessThan(39);
  });

  it("returns honest keep recommendation when already optimal", () => {
    const result = runAudit({
      teamSize: 1,
      primaryUseCase: "coding",
      tools: [
        {
          tool: "windsurf",
          currentPlan: "Pro",
          currentMonthlySpendUsd: 12,
          seats: 1
        }
      ]
    });

    const row = result.toolResults[0];
    expect(row.recommendedAction).toBe("keep");
    expect(row.monthlySavingsUsd).toBe(0);
  });
});
