import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicAudit } from "../../../lib/backend/supabase";
import { vendorLabel } from "../../../lib/audit/catalog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      title: "AI Spend Audit",
      description: "Shared AI spend audit"
    };
  }

  const audit = await getPublicAudit(id);
  if (!audit) {
    return {
      title: "Audit Not Found",
      description: "The shared audit link could not be found."
    };
  }

  const title = `Save $${Number(audit.total_monthly_savings_usd).toFixed(0)}/mo on AI tools`;
  const description = `Shared AI spend audit for ${audit.tool_count} tools, potential annual savings of $${Number(audit.total_annual_savings_usd).toFixed(0)}.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const url = `${baseUrl}/audit/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function SharedAuditPage({ params }: PageProps) {
  const { id } = await params;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    notFound();
  }

  const audit = await getPublicAudit(id);
  if (!audit) {
    notFound();
  }

  return (
    <div className="wrap">
      <h1>Shared AI Spend Audit</h1>
      <p>Public version. No company name or email included.</p>

      <section className="panel">
        <div className="totals">
          <div>
            <span>Monthly savings</span>
            <strong>${Number(audit.total_monthly_savings_usd).toFixed(2)}</strong>
          </div>
          <div>
            <span>Annual savings</span>
            <strong>${Number(audit.total_annual_savings_usd).toFixed(2)}</strong>
          </div>
        </div>
        <p>Use case: {audit.primary_use_case}</p>
      </section>

      <div className="stack">
        {audit.audit_snapshot.tools.map((row) => (
          <article key={`${row.tool}-${row.currentPlan}`} className="toolCard">
            <h3>{vendorLabel(row.tool as any)}</h3>
            <p>
              ${row.currentMonthlySpendUsd.toFixed(2)} / mo to ${row.recommendedMonthlySpendUsd.toFixed(2)} / mo
            </p>
            <p>Recommended: {row.recommendedPlan}</p>
            <p>Savings: ${row.monthlySavingsUsd.toFixed(2)} / mo</p>
            <p>{row.reason}</p>
          </article>
        ))}
      </div>

      <div className="panel">
        <p>Want your own audit?</p>
        <Link href="/">Run free audit</Link>
      </div>
    </div>
  );
}
