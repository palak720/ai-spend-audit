import { NextResponse } from "next/server";
import { sendLeadConfirmationEmail } from "../../../lib/backend/email";
import { validateLeadPayload } from "../../../lib/backend/lead-validation";
import { isRateLimited } from "../../../lib/backend/rate-limit";
import { saveLead } from "../../../lib/backend/supabase";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server is missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const ip = clientIp(request);

  if (isRateLimited(`lead:${ip}`)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const payload = validation.data;

  // Honeypot field should stay empty for humans.
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const saved = await saveLead({
      email: payload.email,
      companyName: payload.companyName,
      role: payload.role,
      teamSize: payload.teamSize,
      totalMonthlySavingsUsd: payload.auditSnapshot.totalMonthlySavingsUsd,
      totalAnnualSavingsUsd: payload.auditSnapshot.totalAnnualSavingsUsd,
      auditSnapshot: payload.auditSnapshot
    });
    const hasEmailConfig = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
    if (hasEmailConfig) {
      await sendLeadConfirmationEmail({
        toEmail: payload.email,
        monthlySavingsUsd: payload.auditSnapshot.totalMonthlySavingsUsd,
        annualSavingsUsd: payload.auditSnapshot.totalAnnualSavingsUsd
      });
    }

    return NextResponse.json({ ok: true, leadId: saved.id, emailSkipped: !hasEmailConfig });
  } catch (error) {
    console.error("Lead capture failed", error);
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}
