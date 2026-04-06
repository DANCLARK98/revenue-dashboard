"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/analytics";
import HudBackground from "./HudBackground";

function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`hud-card p-3 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-1 bg-cyan-400/40 rounded-full" />
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/50">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/10 to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  glow,
}: {
  label: string;
  value: string | number;
  glow?: boolean;
}) {
  return (
    <div className="text-center px-2">
      <div
        className="text-xl font-bold text-white tracking-tight"
        style={
          glow
            ? {
                textShadow:
                  "0 0 8px rgba(0,180,255,0.5), 0 0 20px rgba(0,120,255,0.2)",
              }
            : {}
        }
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
      <>
        <HudBackground />
        <div className="vignette" />
        <div className="h-screen flex items-center justify-center relative z-10">
          <div className="text-cyan-400/40 text-sm font-mono animate-pulse tracking-widest">
            CONNECTING TO PIPELINE...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HudBackground />
        <div className="vignette" />
        <div className="h-screen flex items-center justify-center relative z-10">
          <div className="hud-card p-6 max-w-md text-center">
            <div className="text-red-400 text-sm font-semibold mb-2">
              Failed to load data
            </div>
            <div className="text-red-300/60 text-xs">{error}</div>
            <div className="text-slate-600 text-[10px] mt-3">
              Check GOOGLE_API_KEY and GOOGLE_SPREADSHEET_ID env vars
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data) return null;

  const maxStage = Math.max(...data.pipeline.map((s) => s.count), 1);
  const stageColors: Record<string, string> = {
    scraped: "#334155",
    enriched: "#3b82f6",
    audited: "#6366f1",
    researched: "#0891b2",
    drafted: "#0284c7",
    sent: "#0ea5e9",
    replied: "#22c55e",
    signed: "#10b981",
  };

  return (
    <>
      <HudBackground />
      <div className="vignette" />
      <div className="scanline" />

      <div className="h-screen w-screen overflow-hidden relative z-10 flex flex-col p-3 gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400/70 pulse-glow" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-white/90">
              Proverse
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
              Revenue Attribution
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-slate-600 tracking-wide">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="font-mono text-xs text-cyan-400/50 tracking-wider">
              {time}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-cyan-400 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="flex-shrink-0">
          <Card className="flex items-center justify-around py-2.5">
            <Metric label="Total Leads" value={data.totalLeads} glow />
            <div className="w-px h-7 bg-blue-500/10" />
            <Metric label="Emails Sent" value={data.totalSent} />
            <div className="w-px h-7 bg-blue-500/10" />
            <Metric label="Replies" value={data.totalReplied} glow />
            <div className="w-px h-7 bg-blue-500/10" />
            <Metric
              label="Reply Rate"
              value={`${data.replyRate.toFixed(1)}%`}
              glow={data.replyRate >= 5}
            />
            <div className="w-px h-7 bg-blue-500/10" />
            <Metric label="Signed" value={data.totalSigned} glow />
            <div className="w-px h-7 bg-blue-500/10" />
            <div className="text-center px-2">
              <div
                className="text-2xl font-black text-white tracking-tight"
                style={{
                  textShadow:
                    "0 0 12px rgba(0,180,255,0.6), 0 0 30px rgba(0,120,255,0.25), 0 0 60px rgba(0,80,255,0.1)",
                }}
              >
                £{data.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">
                Revenue
              </div>
            </div>
          </Card>
        </div>

        {/* Main grid */}
        <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-2.5">
          {/* Pipeline Funnel */}
          <Card title="Pipeline Funnel" className="row-span-2 flex flex-col">
            <div className="flex-1 flex flex-col justify-around">
              {data.pipeline.map((stage) => {
                const pct =
                  maxStage > 0 ? (stage.count / maxStage) * 100 : 0;
                const color = stageColors[stage.name] || "#334155";
                return (
                  <div key={stage.name} className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-slate-500 capitalize text-right">
                      {stage.name}
                    </div>
                    <div className="flex-1 bg-slate-800/30 rounded-sm h-4 overflow-hidden border border-white/[0.03]">
                      <div
                        className="h-full rounded-sm transition-all duration-1000"
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}50`,
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
          </Card>

          {/* Verticals */}
          <Card
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
                      className="border-t border-white/[0.03] hover:bg-cyan-500/[0.02]"
                    >
                      <td className="py-1.5 font-medium text-slate-300">
                        {v.name}
                      </td>
                      <td className="py-1.5 text-right text-slate-500 font-mono">
                        {v.total}
                      </td>
                      <td className="py-1.5 text-right text-slate-500 font-mono">
                        {v.sent}
                      </td>
                      <td className="py-1.5 text-right text-cyan-400/70 font-mono">
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
                      <td className="py-1.5 text-right text-emerald-400/70 font-mono">
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
          </Card>

          {/* Top Leads */}
          <Card
            title="Priority Targets"
            className="row-span-2 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-auto no-scrollbar space-y-1">
              {data.highPriority.length === 0 ? (
                <div className="text-slate-600 text-[10px] text-center py-4">
                  No high-priority leads
                </div>
              ) : (
                data.highPriority.map((l) => {
                  const score = parseInt(l.lead_score) || 0;
                  return (
                    <div
                      key={l.lead_id}
                      className="flex items-center gap-2 p-1.5 rounded border border-white/[0.03] hover:border-cyan-500/15 transition-colors bg-white/[0.01]"
                    >
                      <div
                        className={`text-sm font-bold font-mono w-7 text-center ${
                          score >= 85
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                        style={{
                          textShadow: `0 0 8px ${score >= 85 ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.25)"}`,
                        }}
                      >
                        {score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-white/80 truncate">
                          {l.store_name || l.store_url}
                        </div>
                        <div className="text-[8px] text-slate-500 truncate">
                          {[l.vertical, l.decision_maker]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      </div>
                      <div className="text-[8px] text-slate-600 uppercase tracking-wide">
                        {l.status}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Outreach Angles */}
          <Card
            title="Outreach Angles"
            className="overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-auto no-scrollbar">
              {data.angles.length === 0 ? (
                <div className="text-slate-600 text-[10px] text-center py-4">
                  No outreach data yet
                </div>
              ) : (
                <div className="space-y-2">
                  {data.angles.slice(0, 5).map((a, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 truncate flex-1 mr-2">
                          {a.angle}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold ${
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-slate-800/30 h-1.5 rounded-sm overflow-hidden border border-white/[0.02]">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${a.sent > 0 ? (a.replied / a.sent) * 100 : 0}%`,
                              backgroundColor: "rgba(0, 160, 255, 0.5)",
                              boxShadow: "0 0 6px rgba(0,140,255,0.2)",
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {a.sent}s/{a.replied}r
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Trigger Events */}
          <Card
            title="Trigger Events"
            className="overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-auto no-scrollbar">
              {data.triggers.length === 0 ? (
                <div className="text-slate-600 text-[10px] text-center py-4">
                  No trigger events yet
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
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-slate-400">
                            {t.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">
                            {t.count}x{" "}
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
                        <div className="bg-slate-800/30 h-2 rounded-sm overflow-hidden border border-white/[0.02]">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${pct}%`,
                              background:
                                "linear-gradient(90deg, rgba(0,80,200,0.5), rgba(0,160,255,0.4))",
                              boxShadow: "0 0 6px rgba(0,140,255,0.2)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Status bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-1 text-[9px] text-slate-600 uppercase tracking-[0.15em]">
          <span>Proverse Autonomous Lead Gen</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 pulse-glow" />
            Pipeline Active
          </span>
        </div>
      </div>
    </>
  );
}
