"use client";

import { useEffect, useMemo, useState } from "react";
import { runAudit } from "../lib/audit/engine";
import { STORAGE_KEY, defaultFormState, type SpendFormState } from "../lib/audit/form-state";
import { SUPPORTED_TOOLS, vendorLabel } from "../lib/audit/catalog";
import type { AuditResult, PrimaryUseCase, ToolInput, Vendor } from "../lib/audit/types";
import { plansForTool } from "../lib/pricing/plans";

function emptyTool(tool: Vendor): ToolInput {
  return {
    tool,
    currentPlan: plansForTool(tool)[0],
    currentMonthlySpendUsd: 0,
    seats: 1
  };
}

export default function SpendAuditForm() {
  const [state, setState] = useState<SpendFormState>(defaultFormState);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompanyName, setLeadCompanyName] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [leadTeamSize, setLeadTeamSize] = useState<number>(state.teamSize);
  const [honeypot, setHoneypot] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [leadMessage, setLeadMessage] = useState("");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SpendFormState;
      if (parsed && parsed.tools && parsed.tools.length > 0) {
        setState(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const usedTools = useMemo(() => new Set(state.tools.map((t) => t.tool)), [state.tools]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextResult = runAudit({
      teamSize: state.teamSize,
      primaryUseCase: state.primaryUseCase,
      tools: state.tools
    });
    setResult(nextResult);
    setLeadTeamSize(state.teamSize);
    setLeadStatus("idle");
    setLeadMessage("");
  };

  const onLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!result) {
      return;
    }

    setLeadStatus("loading");
    setLeadMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          companyName: leadCompanyName || undefined,
          role: leadRole || undefined,
          teamSize: leadTeamSize,
          honeypot,
          auditSnapshot: {
            totalMonthlySavingsUsd: result.totalMonthlySavingsUsd,
            totalAnnualSavingsUsd: result.totalAnnualSavingsUsd,
            primaryUseCase: state.primaryUseCase,
            tools: result.toolResults.map((row) => ({
              tool: row.tool,
              currentPlan: row.currentPlan,
              currentMonthlySpendUsd: row.currentMonthlySpendUsd,
              recommendedPlan: row.recommendedPlan,
              recommendedMonthlySpendUsd: row.recommendedMonthlySpendUsd,
              monthlySavingsUsd: row.monthlySavingsUsd,
              reason: row.reason
            }))
          }
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setLeadStatus("error");
        setLeadMessage(data.error ?? "Failed to submit lead.");
        return;
      }

      setLeadStatus("success");
      setLeadMessage("Audit saved. Check your email for confirmation.");
    } catch {
      setLeadStatus("error");
      setLeadMessage("Could not reach server. Check if app is running and try again.");
    }
  };

  return (
    <div className="wrap">
      <h1>AI Spend Auditor</h1>
      <p>Enter your stack to get an instant, deterministic spend audit.</p>

      <form onSubmit={onSubmit} className="panel">
        <div className="grid">
          <label>
            Team size
            <input
              type="number"
              min={1}
              value={state.teamSize}
              onChange={(e) =>
                setState((prev) => ({ ...prev, teamSize: Number(e.target.value) || 1 }))
              }
            />
          </label>

          <label>
            Primary use case
            <select
              value={state.primaryUseCase}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  primaryUseCase: e.target.value as PrimaryUseCase
                }))
              }
            >
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="data">Data</option>
              <option value="research">Research</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>

        <div className="stack">
          {state.tools.map((tool, index) => (
            <div key={`${tool.tool}-${index}`} className="toolCard">
              <label>
                Tool
                <select
                  value={tool.tool}
                  onChange={(e) => {
                    const nextTool = e.target.value as Vendor;
                    const next = [...state.tools];
                    next[index] = emptyTool(nextTool);
                    setState((prev) => ({ ...prev, tools: next }));
                  }}
                >
                  {SUPPORTED_TOOLS.map((candidate) => (
                    <option key={candidate} value={candidate}>
                      {vendorLabel(candidate)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Plan
                <select
                  value={tool.currentPlan}
                  onChange={(e) => {
                    const next = [...state.tools];
                    next[index] = { ...tool, currentPlan: e.target.value };
                    setState((prev) => ({ ...prev, tools: next }));
                  }}
                >
                  {plansForTool(tool.tool).map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Monthly spend (USD)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={tool.currentMonthlySpendUsd}
                  onChange={(e) => {
                    const next = [...state.tools];
                    next[index] = { ...tool, currentMonthlySpendUsd: Number(e.target.value) || 0 };
                    setState((prev) => ({ ...prev, tools: next }));
                  }}
                />
              </label>

              <label>
                Seats
                <input
                  type="number"
                  min={1}
                  value={tool.seats}
                  onChange={(e) => {
                    const next = [...state.tools];
                    next[index] = { ...tool, seats: Number(e.target.value) || 1 };
                    setState((prev) => ({ ...prev, tools: next }));
                  }}
                />
              </label>

              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (state.tools.length === 1) {
                    return;
                  }
                  const next = state.tools.filter((_, i) => i !== index);
                  setState((prev) => ({ ...prev, tools: next }));
                }}
              >
                Remove tool
              </button>
            </div>
          ))}
        </div>

        <div className="actions">
          <button
            type="button"
            onClick={() => {
              const nextTool = SUPPORTED_TOOLS.find((t) => !usedTools.has(t)) ?? "chatgpt";
              setState((prev) => ({ ...prev, tools: [...prev.tools, emptyTool(nextTool)] }));
            }}
          >
            Add tool
          </button>

          <button type="submit">Run audit</button>
        </div>
      </form>

      {result ? (
        <section className="panel">
          <h2>Audit Results</h2>
          <div className="totals">
            <div>
              <span>Monthly savings</span>
              <strong>${result.totalMonthlySavingsUsd.toFixed(2)}</strong>
            </div>
            <div>
              <span>Annual savings</span>
              <strong>${result.totalAnnualSavingsUsd.toFixed(2)}</strong>
            </div>
          </div>

          <div className="stack">
            {result.toolResults.map((row) => (
              <article key={`${row.tool}-${row.currentPlan}`} className="toolCard">
                <h3>{vendorLabel(row.tool)}</h3>
                <p>
                  ${row.currentMonthlySpendUsd.toFixed(2)} / mo to ${row.recommendedMonthlySpendUsd.toFixed(2)} / mo
                </p>
                <p>
                  Action: {row.recommendedAction} ({vendorLabel(row.recommendedTool)} - {row.recommendedPlan})
                </p>
                <p>Savings: ${row.monthlySavingsUsd.toFixed(2)} / mo</p>
                <p>{row.reason}</p>
              </article>
            ))}
          </div>

          <form onSubmit={onLeadSubmit} className="panel">
            <h3>Get this report on email</h3>
            <div className="grid">
              <label>
                Work email
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                />
              </label>
              <label>
                Company name (optional)
                <input
                  type="text"
                  value={leadCompanyName}
                  onChange={(e) => setLeadCompanyName(e.target.value)}
                />
              </label>
              <label>
                Role (optional)
                <input type="text" value={leadRole} onChange={(e) => setLeadRole(e.target.value)} />
              </label>
              <label>
                Team size (optional)
                <input
                  type="number"
                  min={1}
                  value={leadTeamSize}
                  onChange={(e) => setLeadTeamSize(Number(e.target.value) || 1)}
                />
              </label>
            </div>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hp"
              aria-hidden="true"
            />

            <div className="actions">
              <button type="submit" disabled={leadStatus === "loading"}>
                {leadStatus === "loading" ? "Submitting..." : "Save report"}
              </button>
            </div>

            {leadMessage ? <p>{leadMessage}</p> : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}
