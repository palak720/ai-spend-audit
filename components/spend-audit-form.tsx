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
    setResult(
      runAudit({
        teamSize: state.teamSize,
        primaryUseCase: state.primaryUseCase,
        tools: state.tools
      })
    );
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
                  ${row.currentMonthlySpendUsd.toFixed(2)} / mo ? ${row.recommendedMonthlySpendUsd.toFixed(2)} / mo
                </p>
                <p>
                  Action: {row.recommendedAction} ({vendorLabel(row.recommendedTool)} - {row.recommendedPlan})
                </p>
                <p>Savings: ${row.monthlySavingsUsd.toFixed(2)} / mo</p>
                <p>{row.reason}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
