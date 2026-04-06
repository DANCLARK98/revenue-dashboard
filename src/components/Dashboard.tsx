"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/analytics";

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#1e293b] border border-[#334155] rounded-xl p-5 ${className}`}
    >
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function FunnelBar({
  name,
  count,
  max,
  color,
}: {
  name: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-20 text-xs text-slate-400 capitalize text-right">
        {name}
      </div>
      <div className="flex-1 bg-[#0f172a] rounded-full h-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
        >
          {pct > 12 && (
            <span className="text-xs font-semibold text-white">{count}</span>
          )}
        </div>
      </div>
      {pct <= 12 && (
        <div className="w-8 text-xs font-semibold text-slate-300">{count}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
          setLastUpdated(
            new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-lg animate-pulse">
          Loading pipeline data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 max-w-md text-center">
          <div className="text-red-400 font-semibold mb-2">
            Failed to load data
          </div>
          <div className="text-red-300 text-sm">{error}</div>
          <div className="text-slate-500 text-xs mt-3">
            Check GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_SPREADSHEET_ID env vars
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxStage = Math.max(...data.pipeline.map((s) => s.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Proverse Revenue Attribution
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pipeline performance and revenue tracking
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Updated {lastUpdated} ·{" "}
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatBox label="Total Leads" value={data.totalLeads} />
        <StatBox label="Emails Sent" value={data.totalSent} />
        <StatBox
          label="Replies"
          value={data.totalReplied}
          color="text-green-400"
        />
        <StatBox
          label="Reply Rate"
          value={`${data.replyRate.toFixed(1)}%`}
          color={data.replyRate >= 5 ? "text-green-400" : "text-amber-400"}
        />
        <StatBox
          label="Signed"
          value={data.totalSigned}
          color="text-emerald-400"
        />
        <StatBox
          label="Revenue"
          value={`£${data.totalRevenue.toLocaleString()}`}
          sub={`@ £7,500 each`}
          color="text-emerald-400"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Pipeline Funnel */}
        <Card title="Pipeline Funnel">
          <div className="space-y-1">
            {data.pipeline.map((stage) => (
              <FunnelBar
                key={stage.name}
                name={stage.name}
                count={stage.count}
                max={maxStage}
                color={stage.color}
              />
            ))}
          </div>
        </Card>

        {/* 2. Vertical Breakdown */}
        <Card title="Vertical Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs">
                  <th className="text-left pb-2">Vertical</th>
                  <th className="text-right pb-2">Leads</th>
                  <th className="text-right pb-2">Sent</th>
                  <th className="text-right pb-2">Replied</th>
                  <th className="text-right pb-2">Reply %</th>
                  <th className="text-right pb-2">Signed</th>
                  <th className="text-right pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.verticals.map((v) => (
                  <tr
                    key={v.name}
                    className="border-t border-[#334155]/50 hover:bg-[#0f172a]/50"
                  >
                    <td className="py-2 font-medium text-slate-200">
                      {v.name}
                    </td>
                    <td className="py-2 text-right text-slate-400">
                      {v.total}
                    </td>
                    <td className="py-2 text-right text-slate-400">
                      {v.sent}
                    </td>
                    <td className="py-2 text-right text-green-400">
                      {v.replied}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={
                          v.replyRate >= 10
                            ? "text-green-400"
                            : v.replyRate >= 5
                              ? "text-amber-400"
                              : "text-slate-400"
                        }
                      >
                        {v.replyRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2 text-right text-emerald-400">
                      {v.signed}
                    </td>
                    <td className="py-2 text-right text-emerald-400 font-medium">
                      {v.revenue > 0 ? `£${v.revenue.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 3. Outreach Angle Performance */}
        <Card title="Outreach Angle Performance">
          {data.angles.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              No outreach data yet
            </div>
          ) : (
            <div className="space-y-3">
              {data.angles.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 truncate">
                      {a.angle}
                    </div>
                    <div className="text-xs text-slate-500">
                      {a.sent} sent · {a.replied} replied
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      a.replyRate >= 10
                        ? "text-green-400"
                        : a.replyRate >= 5
                          ? "text-amber-400"
                          : "text-slate-400"
                    }`}
                  >
                    {a.replyRate.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 4. Trigger Event Performance */}
        <Card title="Trigger Event Performance">
          {data.triggers.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
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
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300">{t.type}</span>
                      <span className="text-slate-500">
                        {t.count} leads · {t.replied} replied ·{" "}
                        <span
                          className={
                            t.replyRate >= 10
                              ? "text-green-400"
                              : "text-slate-400"
                          }
                        >
                          {t.replyRate.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="bg-[#0f172a] rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 5. Weekly Trends */}
        <Card title="Weekly Trends" className="lg:col-span-2">
          {data.weekly.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">
              Not enough data for weekly trends
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left pb-2">Week of</th>
                    <th className="text-right pb-2">New Leads</th>
                    <th className="text-right pb-2">Sent</th>
                    <th className="text-right pb-2">Replied</th>
                    <th className="text-right pb-2">Signed</th>
                    <th className="text-left pb-2 pl-4">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.weekly.map((w) => {
                    const maxLeads = Math.max(
                      ...data.weekly.map((wk) => wk.leads),
                      1
                    );
                    const barPct = (w.leads / maxLeads) * 100;
                    return (
                      <tr
                        key={w.week}
                        className="border-t border-[#334155]/50"
                      >
                        <td className="py-2 text-slate-300 font-medium">
                          {w.week}
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {w.leads}
                        </td>
                        <td className="py-2 text-right text-slate-400">
                          {w.sent}
                        </td>
                        <td className="py-2 text-right text-green-400">
                          {w.replied}
                        </td>
                        <td className="py-2 text-right text-emerald-400">
                          {w.signed}
                        </td>
                        <td className="py-2 pl-4 w-40">
                          <div className="bg-[#0f172a] rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-500/70"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* High-priority leads */}
      {data.highPriority.length > 0 && (
        <div className="mt-5">
          <Card title="High-Priority Leads (Score 70+)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.highPriority.map((l) => {
                const score = parseInt(l.lead_score) || 0;
                return (
                  <div
                    key={l.lead_id}
                    className="bg-[#0f172a] border border-[#334155] rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {l.store_name || l.store_url}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {[l.vertical, l.decision_maker, l.status]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ml-3 ${
                        score >= 85
                          ? "text-green-400"
                          : score >= 70
                            ? "text-amber-400"
                            : "text-slate-400"
                      }`}
                    >
                      {score}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 mt-8 pb-4">
        Proverse Autonomous Lead Gen — Revenue Attribution Dashboard
      </div>
    </div>
  );
}
