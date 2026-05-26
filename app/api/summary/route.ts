import { NextResponse } from "next/server";
import { buildFallbackSummary } from "../../../lib/summary/fallback";

interface SummaryRequest {
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

function validate(payload: unknown): payload is SummaryRequest {
  const p = payload as SummaryRequest;
  return Boolean(
    p &&
      typeof p.primaryUseCase === "string" &&
      typeof p.teamSize === "number" &&
      typeof p.currentMonthlySpendUsd === "number" &&
      typeof p.totalMonthlySavingsUsd === "number" &&
      typeof p.totalAnnualSavingsUsd === "number" &&
      Array.isArray(p.recommendations)
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validate(body)) {
    return NextResponse.json({ error: "Invalid summary payload" }, { status: 400 });
  }

  const fallback = buildFallbackSummary(body);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ summary: fallback, source: "fallback" });
  }

  const system = "You are a concise finance-aware AI spend analyst. Write ~100 words, practical and neutral. Use only supplied numbers.";
  const user = `Create a personalized summary for this audit:\nUse case: ${body.primaryUseCase}\nTeam size: ${body.teamSize}\nCurrent monthly spend: $${body.currentMonthlySpendUsd.toFixed(2)}\nPotential monthly savings: $${body.totalMonthlySavingsUsd.toFixed(2)}\nPotential annual savings: $${body.totalAnnualSavingsUsd.toFixed(2)}\nTop recommendations: ${body.recommendations.slice(0, 3).map((r) => `${r.tool} -> ${r.recommendedPlan} ($${r.monthlySavingsUsd.toFixed(0)}/mo): ${r.reason}`).join("; ")}\nInclude one clear next step.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 220,
        system,
        messages: [{ role: "user", content: user }]
      })
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ summary: fallback, source: "fallback" });
    }

    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((chunk) => chunk.type === "text")?.text?.trim();

    if (!text) {
      return NextResponse.json({ summary: fallback, source: "fallback" });
    }

    return NextResponse.json({ summary: text, source: "llm" });
  } catch {
    return NextResponse.json({ summary: fallback, source: "fallback" });
  }
}
