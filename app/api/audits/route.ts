import { NextResponse } from "next/server";
import { isRateLimited } from "../../../lib/backend/rate-limit";
import { savePublicAudit } from "../../../lib/backend/supabase";

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
  if (isRateLimited(`audit-share:${ip}`)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = payload as {
    totalMonthlySavingsUsd?: number;
    totalAnnualSavingsUsd?: number;
    primaryUseCase?: string;
    tools?: unknown[];
  };

  if (
    typeof data.totalMonthlySavingsUsd !== "number" ||
    typeof data.totalAnnualSavingsUsd !== "number" ||
    typeof data.primaryUseCase !== "string" ||
    !Array.isArray(data.tools)
  ) {
    return NextResponse.json({ error: "Invalid audit payload" }, { status: 400 });
  }

  try {
    const saved = await savePublicAudit({
      totalMonthlySavingsUsd: data.totalMonthlySavingsUsd,
      totalAnnualSavingsUsd: data.totalAnnualSavingsUsd,
      primaryUseCase: data.primaryUseCase,
      auditSnapshot: { tools: data.tools }
    });

    return NextResponse.json({ ok: true, publicId: saved.publicId });
  } catch (error) {
    console.error("Public audit save failed", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
