import crypto from "node:crypto";

interface SaveLeadInput {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  auditSnapshot: unknown;
}

interface SavePublicAuditInput {
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  primaryUseCase: string;
  auditSnapshot: unknown;
}

interface PublicAuditRecord {
  public_id: string;
  total_monthly_savings_usd: number;
  total_annual_savings_usd: number;
  primary_use_case: string;
  tool_count: number;
  audit_snapshot: {
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
  created_at: string;
}

function getSupabaseConfig(): { supabaseUrl: string; serviceRoleKey: string } {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration");
  }

  return { supabaseUrl, serviceRoleKey };
}

export async function saveLead(input: SaveLeadInput): Promise<{ id: string }> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const id = crypto.randomUUID();

  const body = {
    id,
    email: input.email,
    company_name: input.companyName ?? null,
    role: input.role ?? null,
    team_size: input.teamSize ?? null,
    total_monthly_savings_usd: input.totalMonthlySavingsUsd,
    total_annual_savings_usd: input.totalAnnualSavingsUsd,
    audit_snapshot: input.auditSnapshot
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase insert failed: ${text}`);
  }

  return { id };
}

export async function savePublicAudit(input: SavePublicAuditInput): Promise<{ publicId: string }> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const publicId = crypto.randomBytes(6).toString("hex");

  const tools = (input.auditSnapshot as { tools?: unknown[] })?.tools ?? [];

  const body = {
    public_id: publicId,
    total_monthly_savings_usd: input.totalMonthlySavingsUsd,
    total_annual_savings_usd: input.totalAnnualSavingsUsd,
    primary_use_case: input.primaryUseCase,
    tool_count: tools.length,
    audit_snapshot: input.auditSnapshot
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/public_audits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase insert failed: ${text}`);
  }

  return { publicId };
}

export async function getPublicAudit(publicId: string): Promise<PublicAuditRecord | null> {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

  const query = new URLSearchParams({
    public_id: `eq.${publicId}`,
    select: "public_id,total_monthly_savings_usd,total_annual_savings_usd,primary_use_case,tool_count,audit_snapshot,created_at",
    limit: "1"
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/public_audits?${query.toString()}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase select failed: ${text}`);
  }

  const rows = (await response.json()) as PublicAuditRecord[];
  return rows[0] ?? null;
}
