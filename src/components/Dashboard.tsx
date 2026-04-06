"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/analytics";

function GlowCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glow-card p-3 ${className}`}>
      {title && (
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/70 mb-2">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-xl font-black tracking-tight stat-value ${
          accent ? "text-cyan-400" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });

    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center relative z-10">
        <div className="text-indigo-400/60 text-sm font-mono animate-pulse tracking-widest">
          INITIALISING PIPELINE...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center relative z-10">
        <div className="glow-card p-6 max-w-md text-center border-red-500/30">
          <div className="text-red-400 font-mono text-sm mb-2">
            SYSTEM ERROR
          </div>
          <div className="text-red-300/70 text-xs font-mono">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxStage = Math.max(...data.pipeline.map((s) => s.count), 1);
  const stageColors: Record<string, string> = {
    scraped: "#64748b",
    enriched: "#6366f1",
    audited: "#8b5cf6",
    researched: "#f59e0b",
    drafted: "#f97316",
    sent: "#06b6d4",
    replied: "#22c55e",
    signed: "#10b981",
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative z-10 flex flex-col p-4 gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/90">
            Proverse
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/50">
            Revenue Attribution
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="font-mono text-xs text-cyan-400/60 tracking-wider">
            {time}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="text-[10px] uppercase tracking-widest text-indigo-400/40 hover:text-indigo-400 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex-shrink-0">
        <GlowCard className="flex items-center justify-around py-3">
          <Metric label="Total Leads" value={data.totalLeads} />
          <div className="w-px h-8 bg-indigo-500/10" />
          <Metric label="Emails Sent" value={data.totalSent} />
          <div className="w-px h-8 bg-indigo-500/10" />
          <Metric label="Replies" value={data.totalReplied} accent />
          <div className="w-px h-8 bg-indigo-500/10" />
          <Metric
            label="Reply Rate"
            value={`${data.replyRate.toFixed(1)}%`}
            accent
          />
          <div className="w-px h-8 bg-indigo-500/10" />
          <Metric label="Signed" value={data.totalSigned} accent />
          <div className="w-px h-8 bg-indigo-500/10" />
          <Metric
            label="Revenue"
            value={`£${data.totalRevenue.toLocaleString()}`}
            accent
          />
        </GlowCard>
      </div>

      {/* Main grid - fills remaining space */}
      <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-3">
        {/* Pipeline Funnel */}
        <GlowCard title="Pipeline Funnel" className="row-span-2 flex flex-col">
          <div className="flex-1 flex flex-col justify-around">
            {data.pipeline.map((stage) => {
              const pct = maxStage > 0 ? (stage.count / maxStage) * 100 : 0;
              const color = stageColors[stage.name] || "#64748b";
              return (
                <div key={stage.name} className="flex items-center gap-2">
                  <div className="w-16 text-[10px] text-slate-500 capitalize text-right tracking-wide">
                    {stage.name}
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded h-4 overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-1000"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />
                  </div>
                  <div className="w-6 text-[11px] font-mono font-bold text-slate-300 text-right">
                    {stage.count}
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        {/* Verticals */}
        <GlowCard
          title="Verticals"
          className="col-span-2 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-auto no-scrollbar">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-600 text-[9px] uppercase tracking-wider">
                  <th className="text-left pb-1.5 font-medium">Vertical</th>
                  <th className="text-right pb-1.5 font-medium">Leads</th>
                  <th className="text-right pb-1.5 font-medium">Sent</th>
                  <th className="text-right pb-1.5 font-medium">Replied</th>
                  <th className="text-right pb-1.5 font-medium">Rate</th>
                  <th className="text-right pb-1.5 font-medium">Signed</th>
                  <th className="text-right pb-1.5 font-medium">Rev</th>
                </tr>
              </thead>
              <tbody>
                {data.verticals.slice(0, 8).map((v) => (
                  <tr
                    key={v.name}
                    className="border-t border-white/[0.03] hover:bg-indigo-500/[0.03]"
                  >
                    <td className="py-1.5 text-slate-300 font-medium">
                      {v.name}
                    </td>
                    <td className="py-1.5 text-right text-slate-500 font-mono">
                      {v.total}
                    </td>
                    <td className="py-1.5 text-right text-slate-500 font-mono">
                      {v.sent}
                    </td>
                    <td className="py-1.5 text-right text-cyan-400/80 font-mono">
                      {v.replied}
                    </td>
                    <td className="py-1.5 text-right font-mono">
                      <span
                        className={
                          v.replyRate >= 10
                            ? "text-emerald-400"
                            : v.replyRate >= 5
                              ? "text-amber-400"
                              : "text-slate-500"
                        }
                      >
                        {v.replyRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-emerald-400/80 font-mono">
                      {v.signed}
                    </td>
                    <td className="py-1.5 text-right text-emerald-400 font-mono font-bold">
                      {v.revenue > 0
                        ? `£${(v.revenue / 1000).toFixed(0)}k`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>

        {/* Top Leads */}
        <GlowCard
          title="Top Leads"
          className="row-span-2 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-auto no-scrollbar space-y-1.5">
            {data.highPriority.length === 0 ? (
              <div className="text-slate-600 text-[10px] text-center py-4 font-mono">
                NO HIGH-PRIORITY LEADS
              </div>
            ) : (
              data.highPriority.map((l) => {
                const score = parseInt(l.lead_score) || 0;
                return (
                  <div
                    key={l.lead_id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/20 transition-colors"
                  >
                    <div
                      className={`text-base font-black font-mono w-8 text-center ${
                        score >= 85
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                      style={{
                        textShadow: `0 0 12px ${score >= 85 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                      }}
                    >
                      {score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white/90 truncate">
                        {l.store_name || l.store_url}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {[l.vertical, l.decision_maker]
                          .filter(Boolean)
                          .join(" / ")}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase">
                      {l.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </GlowCard>

        {/* Angles */}
        <GlowCard
          title="Outreach Angles"
          className="overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-auto no-scrollbar">
            {data.angles.length === 0 ? (
              <div className="text-slate-600 text-[10px] text-center py-4 font-mono">
                NO OUTREACH DATA
              </div>
            ) : (
              <div className="space-y-2">
                {data.angles.slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-300 truncate">
                        {a.angle}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-600 font-mono">
                        {a.sent}s/{a.replied}r
                      </span>
                      <span
                        className={`text-[11px] font-bold font-mono ${
                          a.replyRate >= 10
                            ? "text-emerald-400"
                            : a.replyRate >= 5
                              ? "text-amber-400"
                              : "text-slate-500"
                        }`}
                      >
                        {a.replyRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlowCard>

        {/* Triggers */}
        <GlowCard
          title="Trigger Events"
          className="overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-auto no-scrollbar">
            {data.triggers.length === 0 ? (
              <div className="text-slate-600 text-[10px] text-center py-4 font-mono">
                NO TRIGGER DATA
              </div>
            ) : (
              <div className="space-y-2">
                {data.triggers.map((t) => {
                  const maxCount = Math.max(
                    ...data.triggers.map((tr) => tr.count),
                    1
                  );
                  const pct = (t.count / maxCount) * 100;
                  return (
                    <div key={t.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">
                          {t.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600">
                          {t.count}{" "}
                          <span
                            className={
                              t.replyRate >= 10
                                ? "text-emerald-400"
                                : "text-slate-500"
                            }
                          >
                            {t.replyRate.toFixed(0)}%
                          </span>
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500/70"
                          style={{
                            width: `${pct}%`,
                            boxShadow: "0 0 6px rgba(99,102,241,0.3)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlowCard>
      </div>

      {/* Bottom status bar */}
      <div className="flex-shrink-0 flex items-center justify-between text-[9px] text-slate-600 uppercase tracking-[0.2em] px-1">
        <span>
          Proverse Autonomous Lead Gen v1.0
        </span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 pulse-dot" />
          Pipeline Active
        </span>
      </div>
    </div>
  );
}
