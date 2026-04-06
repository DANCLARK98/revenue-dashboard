"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/analytics";
import MatrixRain from "./MatrixRain";

function HudCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`hud-card hud-corners p-2.5 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-1 bg-cyan-400/60" />
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-500/60">
            {title}
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}

function HexMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "cyan" | "green" | "amber";
}) {
  const glowClass =
    accent === "green"
      ? "neon-green"
      : accent === "amber"
        ? "neon-amber"
        : "neon-text";
  return (
    <div className="text-center px-2">
      <div className={`text-xl font-black tracking-tight ${glowClass}`}>
        {value}
      </div>
      <div className="text-[8px] uppercase tracking-[0.3em] text-blue-400/30 mt-0.5 font-bold">
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
  const [bootText, setBootText] = useState("");

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

  // Boot sequence
  useEffect(() => {
    if (loading) {
      const lines = [
        "> INITIALISING PROVERSE NEURAL NETWORK...",
        "> CONNECTING TO PIPELINE DATABASE...",
        "> LOADING LEAD INTELLIGENCE...",
        "> DECRYPTING REVENUE MATRICES...",
      ];
      let i = 0;
      const iv = setInterval(() => {
        if (i < lines.length) {
          setBootText((prev) => prev + (prev ? "\n" : "") + lines[i]);
          i++;
        }
      }, 400);
      return () => clearInterval(iv);
    }
  }, [loading]);

  if (loading) {
    return (
      <>
        <MatrixRain />
        <div className="crt-overlay" />
        <div className="vignette" />
        <div className="h-screen flex items-center justify-center relative z-10">
          <div className="hud-card p-8 max-w-lg w-full">
            <pre className="text-[11px] text-cyan-400/80 font-mono whitespace-pre-wrap leading-relaxed">
              {bootText}
            </pre>
            <div className="mt-2 text-[11px] text-cyan-300/60 cursor-blink font-mono">
              ESTABLISHING UPLINK
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MatrixRain />
        <div className="crt-overlay" />
        <div className="h-screen flex items-center justify-center relative z-10">
          <div className="hud-card p-6 max-w-md text-center">
            <div className="neon-red text-sm font-bold tracking-widest mb-2">
              [ SYSTEM BREACH ]
            </div>
            <div className="text-red-400/60 text-[11px] font-mono">{error}</div>
          </div>
        </div>
      </>
    );
  }

  if (!data) return null;

  const maxStage = Math.max(...data.pipeline.map((s) => s.count), 1);
  const stageColors: Record<string, string> = {
    scraped: "#1e40af",
    enriched: "#2563eb",
    audited: "#7c3aed",
    researched: "#0891b2",
    drafted: "#0284c7",
    sent: "#0ea5e9",
    replied: "#00ff88",
    signed: "#00ff88",
  };

  return (
    <>
      <MatrixRain />
      <div className="crt-overlay" />
      <div className="vignette" />
      <div className="scanline" />

      <div className="h-screen w-screen overflow-hidden relative z-10 flex flex-col p-3 gap-2">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 px-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-cyan-400 pulse-glow" />
              <div className="w-1.5 h-1.5 bg-blue-500/60 pulse-glow" style={{ animationDelay: "0.5s" }} />
              <div className="w-1 h-1 bg-blue-600/40 pulse-glow" style={{ animationDelay: "1s" }} />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.4em] neon-text">
              Proverse
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-blue-400/30 font-bold">
              // Revenue Attribution System v1.0
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[9px] text-blue-500/30 uppercase tracking-[0.2em] font-bold">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="font-mono text-sm neon-text tracking-[0.2em]">
              {time}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-[9px] uppercase tracking-[0.2em] text-blue-500/30 hover:text-cyan-400 transition-colors font-bold border border-blue-500/10 px-2 py-0.5 hover:border-cyan-400/30"
            >
              [ Refresh ]
            </button>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="flex-shrink-0">
          <HudCard className="flex items-center justify-around py-2.5">
            <HexMetric label="Total Leads" value={data.totalLeads} accent="cyan" />
            <div className="w-px h-6 bg-cyan-500/10" />
            <HexMetric label="Emails Sent" value={data.totalSent} />
            <div className="w-px h-6 bg-cyan-500/10" />
            <HexMetric label="Replies" value={data.totalReplied} accent="green" />
            <div className="w-px h-6 bg-cyan-500/10" />
            <HexMetric label="Reply Rate" value={`${data.replyRate.toFixed(1)}%`} accent={data.replyRate >= 5 ? "green" : "amber"} />
            <div className="w-px h-6 bg-cyan-500/10" />
            <HexMetric label="Signed" value={data.totalSigned} accent="green" />
            <div className="w-px h-6 bg-cyan-500/10" />
            <div className="text-center px-2">
              <div className="text-2xl font-black tracking-tight mega-glow">
                £{data.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[8px] uppercase tracking-[0.3em] text-blue-400/30 mt-0.5 font-bold">
                Revenue
              </div>
            </div>
          </HudCard>
        </div>

        {/* Main grid */}
        <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-2">
          {/* Pipeline Funnel — left column, full height */}
          <HudCard title="Pipeline Funnel" className="row-span-2 flex flex-col">
            <div className="flex-1 flex flex-col justify-around">
              {data.pipeline.map((stage) => {
                const pct = maxStage > 0 ? (stage.count / maxStage) * 100 : 0;
                const color = stageColors[stage.name] || "#1e40af";
                const isActive = stage.name === "replied" || stage.name === "signed";
                return (
                  <div key={stage.name} className="flex items-center gap-2">
                    <div className="w-16 text-[9px] text-blue-400/40 capitalize text-right tracking-wider font-bold">
                      {stage.name}
                    </div>
                    <div className="flex-1 bg-blue-950/30 rounded-none h-4 overflow-hidden border border-blue-500/5">
                      <div
                        className={`h-full transition-all duration-1000 ${isActive ? "bar-glow" : ""}`}
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}60, inset 0 1px 0 rgba(255,255,255,0.1)`,
                        }}
                      />
                    </div>
                    <div className={`w-6 text-[11px] font-mono font-black text-right ${isActive ? "neon-green" : "text-cyan-400/60"}`}>
                      {stage.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </HudCard>

          {/* Verticals — top middle, 2 cols */}
          <HudCard title="Vertical Intel" className="col-span-2 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto no-scrollbar">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-blue-400/25 text-[8px] uppercase tracking-[0.2em]">
                    <th className="text-left pb-1 font-bold">Vertical</th>
                    <th className="text-right pb-1 font-bold">Leads</th>
                    <th className="text-right pb-1 font-bold">Sent</th>
                    <th className="text-right pb-1 font-bold">Replied</th>
                    <th className="text-right pb-1 font-bold">Rate</th>
                    <th className="text-right pb-1 font-bold">Signed</th>
                    <th className="text-right pb-1 font-bold">Rev</th>
                  </tr>
                </thead>
                <tbody>
                  {data.verticals.slice(0, 7).map((v, i) => (
                    <tr
                      key={v.name}
                      className="border-t border-cyan-500/[0.04] hover:bg-cyan-500/[0.03]"
                    >
                      <td className="py-1 text-cyan-300/70 font-bold">
                        <span className="text-blue-500/20 mr-1">{String(i + 1).padStart(2, "0")}</span>
                        {v.name}
                      </td>
                      <td className="py-1 text-right text-blue-300/30 font-mono">{v.total}</td>
                      <td className="py-1 text-right text-blue-300/30 font-mono">{v.sent}</td>
                      <td className="py-1 text-right font-mono neon-text" style={{ opacity: v.replied > 0 ? 1 : 0.2 }}>{v.replied}</td>
                      <td className="py-1 text-right font-mono font-bold">
                        <span className={v.replyRate >= 10 ? "neon-green" : v.replyRate >= 5 ? "neon-amber" : "text-blue-400/20"}>
                          {v.replyRate.toFixed(0)}%
                        </span>
                      </td>
                      <td className={`py-1 text-right font-mono font-bold ${v.signed > 0 ? "neon-green" : "text-blue-400/20"}`}>{v.signed}</td>
                      <td className={`py-1 text-right font-mono font-black ${v.revenue > 0 ? "neon-green" : "text-blue-400/15"}`}>
                        {v.revenue > 0 ? `£${(v.revenue / 1000).toFixed(0)}k` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </HudCard>

          {/* Top Leads — right column, full height */}
          <HudCard title="Priority Targets" className="row-span-2 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto no-scrollbar space-y-1">
              {data.highPriority.length === 0 ? (
                <div className="text-blue-500/20 text-[9px] text-center py-4 font-mono tracking-widest">
                  NO TARGETS ACQUIRED
                </div>
              ) : (
                data.highPriority.map((l, i) => {
                  const score = parseInt(l.lead_score) || 0;
                  return (
                    <div
                      key={l.lead_id}
                      className="flex items-center gap-2 p-1.5 border border-cyan-500/[0.06] hover:border-cyan-400/20 transition-all bg-blue-950/20 hover:bg-blue-950/40"
                    >
                      <div className="text-[8px] text-blue-500/20 font-mono w-3">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        className={`text-sm font-black font-mono w-7 text-center ${
                          score >= 85 ? "neon-green" : "neon-amber"
                        }`}
                      >
                        {score}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-cyan-300/80 truncate">
                          {l.store_name || l.store_url}
                        </div>
                        <div className="text-[8px] text-blue-400/25 truncate font-bold tracking-wider">
                          {[l.vertical, l.decision_maker].filter(Boolean).join(" // ")}
                        </div>
                      </div>
                      <div className={`text-[8px] font-bold tracking-wider px-1 py-0.5 border ${
                        l.status === "drafted" ? "text-cyan-400/50 border-cyan-500/15" :
                        l.status === "sent" ? "text-blue-400/50 border-blue-500/15" :
                        l.status === "replied" ? "neon-green border-green-500/20" :
                        "text-blue-500/25 border-blue-500/10"
                      }`}>
                        {(l.status || "").toUpperCase()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </HudCard>

          {/* Outreach Angles */}
          <HudCard title="Outreach Angles" className="overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto no-scrollbar">
              {data.angles.length === 0 ? (
                <div className="text-blue-500/20 text-[9px] text-center py-4 font-mono tracking-widest">
                  AWAITING OUTREACH DATA
                </div>
              ) : (
                <div className="space-y-1.5">
                  {data.angles.slice(0, 5).map((a, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between">
                        <div className="text-[9px] text-cyan-300/50 truncate flex-1 mr-2">{a.angle}</div>
                        <span className={`text-[10px] font-mono font-black ${
                          a.replyRate >= 10 ? "neon-green" : a.replyRate >= 5 ? "neon-amber" : "text-blue-400/25"
                        }`}>
                          {a.replyRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-blue-950/30 h-1.5 overflow-hidden border border-blue-500/5">
                          <div
                            className="h-full bg-blue-500/40"
                            style={{
                              width: `${a.sent > 0 ? (a.replied / a.sent) * 100 : 0}%`,
                              boxShadow: "0 0 6px rgba(0,140,255,0.3)",
                            }}
                          />
                        </div>
                        <span className="text-[8px] text-blue-400/20 font-mono">{a.sent}s/{a.replied}r</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </HudCard>

          {/* Trigger Events */}
          <HudCard title="Trigger Events" className="overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto no-scrollbar">
              {data.triggers.length === 0 ? (
                <div className="text-blue-500/20 text-[9px] text-center py-4 font-mono tracking-widest">
                  NO TRIGGERS DETECTED
                </div>
              ) : (
                <div className="space-y-2">
                  {data.triggers.map((t) => {
                    const maxCount = Math.max(...data.triggers.map((tr) => tr.count), 1);
                    const pct = (t.count / maxCount) * 100;
                    return (
                      <div key={t.type}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] text-cyan-400/50 font-bold">{t.type}</span>
                          <span className="text-[9px] font-mono">
                            <span className="text-blue-400/25">{t.count}x</span>
                            {" "}
                            <span className={t.replyRate >= 10 ? "neon-green" : "text-blue-400/25"}>
                              {t.replyRate.toFixed(0)}%
                            </span>
                          </span>
                        </div>
                        <div className="bg-blue-950/30 h-2 overflow-hidden border border-blue-500/5">
                          <div
                            className="h-full bar-glow"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, rgba(0,80,200,0.6), rgba(0,180,255,0.4))`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </HudCard>
        </div>

        {/* Status bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-1 text-[8px] text-blue-500/20 uppercase tracking-[0.3em] font-bold">
          <span className="flex items-center gap-2">
            <span className="text-blue-500/10">[</span>
            SYS.PROVERSE.LEADGEN
            <span className="text-blue-500/10">]</span>
          </span>
          <span className="flex items-center gap-4">
            <span>NODES: 18</span>
            <span>AGENTS: 14</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400/80 pulse-glow" />
              PIPELINE ONLINE
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
