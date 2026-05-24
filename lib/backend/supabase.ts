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

export async function saveLead(input: SaveLeadInput): Promise<{ id: string }> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase configuration");
  }

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
