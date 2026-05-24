export interface LeadCapturePayload {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  honeypot?: string;
  auditSnapshot: {
    totalMonthlySavingsUsd: number;
    totalAnnualSavingsUsd: number;
    primaryUseCase: string;
    tools: Array<{
      tool: string;
      currentPlan: string;
      currentMonthlySpendUsd: number;
      recommendedPlan: string;
      recommendedMonthlySpendUsd: number;
      monthlySavingsUsd: number;
      reason: string;
    }>;
  };
}

function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLeadPayload(payload: unknown): { ok: true; data: LeadCapturePayload } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid payload" };
  }

  const data = payload as LeadCapturePayload;

  if (!data.email || !isEmail(data.email)) {
    return { ok: false, error: "Valid email is required" };
  }

  if (!data.auditSnapshot || typeof data.auditSnapshot !== "object") {
    return { ok: false, error: "Audit snapshot is required" };
  }

  if (!Array.isArray(data.auditSnapshot.tools) || data.auditSnapshot.tools.length === 0) {
    return { ok: false, error: "Audit snapshot tools are required" };
  }

  return { ok: true, data };
}
