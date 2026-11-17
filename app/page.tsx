"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Scale
} from "lucide-react";
import { AuditResponse } from "./api/audit/route";

const PRESETS = [
  {
    name: "⚠️ Resolution Trap (Ambiguous Resolver)",
    question: "Will Protocol Alpha deploy zk-rollup mainnet before Q3?",
    rules: "This market resolves to 'Yes' if credible developer reports or community announcements confirm mainnet activation. Resolves to 'No' otherwise. If announcements are contested, resolver discretion applies.",
    odds: 42,
    notes: "Subjective definition of 'credible report' and lack of on-chain verification hash introduces dispute risk.",
  },
  {
    name: "🚀 Strong Edge (Verifiable On-Chain Metric)",
    question: "Will Layer-1 Network benchmark exceed 80,000 sustained TPS before the end of the current epoch?",
    rules: "Settlement determined strictly by the cryptographic block telemetry dashboard at official explorer telemetry endpoints. If sustained TPS exceeds 80,000 across 100 consecutive blocks, resolves to 'Yes'.",
    odds: 35,
    notes: "Stress-test benchmarks already demonstrate 92,000 TPS capacity; market odds underprice probability.",
  },
  {
    name: "⚖️ Fairly Priced (Deterministic Price Print)",
    question: "Will Asset Index touch or exceed $5,000.00 prior to monthly settlement?",
    rules: "Resolves to 'Yes' if the volume-weighted index feed prints at or above $5,000.00 during the active monthly contract window.",
    odds: 50,
    notes: "Implied volatility curves align with current market probability distribution.",
  },
];

export default function HomePage() {
  const [question, setQuestion] = useState(PRESETS[0].question);
  const [rules, setRules] = useState(PRESETS[0].rules);
  const [marketYesOdds, setMarketYesOdds] = useState<number>(PRESETS[0].odds);
  const [contextNotes, setContextNotes] = useState(PRESETS[0].notes);

  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApplyPreset = (idx: number) => {
    const preset = PRESETS[idx];
    setQuestion(preset.question);
    setRules(preset.rules);
    setMarketYesOdds(preset.odds);
    setContextNotes(preset.notes);
    setAuditResult(null);
    setErrorMsg(null);
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setAuditResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          rules,
          marketYesOdds,
          contextNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server returned HTTP ${res.status}`);
      }

      setAuditResult(data);
    } catch (err: any) {
      console.error("Audit request failed:", err);
      setErrorMsg(err.message || "Failed to execute reasoning audit.");
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c121f]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <Image
              src="/logo.png"
              alt="OracleGuard Logo"
              width={40}
              height={40}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                OracleGuard
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                SERV Reasoning
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Prediction Market Resolution & Quantitative Edge Auditor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OpenServ Reasoning API: Active</span>
          </div>
          <a
            href="https://github.com/Alafedoyinsola/oracleguard-serv"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Presets */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          {/* Preset Buttons */}
          <div className="bg-[#0f172a]/70 rounded-2xl p-5 border border-slate-800/80 shadow-xl backdrop-blur-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Market Scenario</span>
            </h2>
            <div className="flex flex-col space-y-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(i)}
                  className="text-left px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{p.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleRunAudit}
            className="bg-[#0f172a]/70 rounded-2xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-sm flex flex-col space-y-5"
          >
            <div className="border-b border-slate-800/60 pb-3">
              <h2 className="font-semibold text-sm text-slate-200 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Market Audit Parameters</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide contract rules to scan for ambiguous phrasing, oracle loopholes, and statistical mispricing.
              </p>
            </div>

            {/* Market Question */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Market Question <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Will entity X achieve milestone Y before date Z?"
                className="w-full bg-[#0a0e17] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            {/* Resolution Rules */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>Resolution Criteria & Oracle Rules <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">Verbatim contract text</span>
              </label>
              <textarea
                required
                rows={5}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Paste the full resolution rules, data source URLs, fallback oracles, and settlement clauses..."
                className="w-full bg-[#0a0e17] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition leading-relaxed"
              />
            </div>

            {/* Market Yes Odds */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Current Market &quot;Yes&quot; Price / Odds
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {marketYesOdds}% (${(marketYesOdds / 100).toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={99}
                value={marketYesOdds}
                onChange={(e) => setMarketYesOdds(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Context & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catalysts & Context Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                placeholder="Upcoming data releases, geopolitical shifts, or historical precedent..."
                className="w-full bg-[#0a0e17] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg transition ${
                loading
                  ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold shadow-cyan-500/20 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Bounded Reasoning Audit in Progress...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>Execute 4-Step Oracle Audit</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Audit Results & Reasoning Visualization */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-800/80 text-rose-200 p-4 rounded-2xl flex items-start space-x-3 text-xs animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Audit Execution Error</p>
                <p className="mt-1 text-rose-300/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-[#0f172a]/70 rounded-2xl p-8 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">
                  OpenServ Bounded Reasoning Engine
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Deconstructing settlement criteria, cross-referencing oracle vulnerabilities, and synthesizing quantitative edge...
                </p>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md pt-4 text-[11px] text-slate-400">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>1. Oracle Source Verifier</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>2. Ambiguity & Dispute Scan</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>3. Catalyst Base Calibration</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>4. Fair Odds Synthesis</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !auditResult && (
            <div className="bg-[#0f172a]/40 rounded-2xl p-8 border border-slate-800/60 border-dashed flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500">
                <BrainCircuit className="w-7 h-7 text-cyan-500/50" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm font-semibold text-slate-300">
                  No Active Audit Results
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a scenario from the presets or paste custom prediction market contract parameters on the left to run an auditable 4-stage resolution check.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulates UMA, Polymarket, Kalshi, and custom decentralized oracles</span>
              </div>
            </div>
          )}

          {!loading && auditResult && (
            <div className="flex flex-col space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Verdict Card */}
              <div
                className={`p-5 rounded-2xl border backdrop-blur-sm shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  auditResult.verdict === "RESOLUTION TRAP"
                    ? "bg-rose-950/30 border-rose-800/80 text-rose-100"
                    : auditResult.verdict === "STRONG EDGE"
                    ? "bg-emerald-950/30 border-emerald-800/80 text-emerald-100"
                    : "bg-cyan-950/30 border-cyan-800/80 text-cyan-100"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      auditResult.verdict === "RESOLUTION TRAP"
                        ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40"
                        : auditResult.verdict === "STRONG EDGE"
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                        : "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                    }`}
                  >
                    {auditResult.verdict === "RESOLUTION TRAP" ? (
                      <ShieldAlert className="w-6 h-6" />
                    ) : auditResult.verdict === "STRONG EDGE" ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
                      Audit Classification
                    </div>
                    <div className="text-xl font-bold tracking-tight">
                      {auditResult.verdict}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {auditResult.is_simulated && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Simulated Preview
                    </span>
                  )}
                  <button
                    onClick={copyJson}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1 */}
                <div className="bg-[#0f172a]/70 rounded-xl p-3.5 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Ambiguity Risk
                  </div>
                  <div
                    className={`text-lg font-mono font-bold mt-1 ${
                      auditResult.ambiguity_risk_score >= 60
                        ? "text-rose-400"
                        : auditResult.ambiguity_risk_score >= 35
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {auditResult.ambiguity_risk_score}/100
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        auditResult.ambiguity_risk_score >= 60
                          ? "bg-rose-500"
                          : auditResult.ambiguity_risk_score >= 35
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${auditResult.ambiguity_risk_score}%` }}
                    />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#0f172a]/70 rounded-xl p-3.5 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Market &quot;Yes&quot; Odds
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                    {marketYesOdds}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Implied $0.{marketYesOdds}</div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#0f172a]/70 rounded-xl p-3.5 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Fair Calculated
                  </div>
                  <div className="text-lg font-mono font-bold text-cyan-400 mt-1">
                    {auditResult.fair_yes_probability}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Bounded model</div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#0f172a]/70 rounded-xl p-3.5 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    Net Edge
                  </div>
                  <div
                    className={`text-lg font-mono font-bold mt-1 ${
                      auditResult.edge_percentage > 0
                        ? "text-emerald-400"
                        : auditResult.edge_percentage < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                    }`}
                  >
                    {auditResult.edge_percentage > 0 ? "+" : ""}
                    {auditResult.edge_percentage}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Fair minus market</div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="bg-[#0f172a]/70 rounded-xl p-4 border border-slate-800 text-xs leading-relaxed">
                <span className="font-semibold text-slate-300 block mb-1">
                  Executive Audit Summary:
                </span>
                <p className="text-slate-300">{auditResult.summary}</p>
              </div>

              {/* Loopholes / Flags */}
              {auditResult.loopholes && auditResult.loopholes.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs">
                  <div className="font-semibold text-amber-300 flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identified Oracle & Resolution Loopholes</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {auditResult.loopholes.map((lp, i) => (
                      <li key={i} className="text-slate-300">
                        {lp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4-Step Bounded Reasoning Breakdown */}
              <div className="bg-[#0f172a]/70 rounded-xl p-5 border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  4-Step Bounded Reasoning Chain
                </h4>
                <div className="space-y-3.5">
                  {auditResult.reasoning_steps.map((step) => (
                    <div
                      key={step.step_number}
                      className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800/80 flex flex-col space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-cyan-400 font-mono">
                            0{step.step_number}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {step.stage_name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                            step.status === "PASS"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : step.status === "WARN"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          }`}
                        >
                          {step.status === "PASS" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : step.status === "WARN" ? (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {step.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-6">
                        {step.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0c121f] py-5 px-6 text-center text-xs text-slate-500">
        <p>
          OracleGuard &bull; Built for Yeti Vibe Coding / SERV Hackathon &bull; Powered by OpenServ Reasoning API
        </p>
      </footer>
    </div>
  );
}
