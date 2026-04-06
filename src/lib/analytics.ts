import { Lead } from "./sheets";

const REVENUE_PER_SIGNED = 7500;

export interface PipelineStage {
  name: string;
  count: number;
  color: string;
}

export interface VerticalStats {
  name: string;
  total: number;
  sent: number;
  replied: number;
  signed: number;
  replyRate: number;
  revenue: number;
}

export interface AngleStats {
  angle: string;
  sent: number;
  replied: number;
  replyRate: number;
}

export interface TriggerStats {
  type: string;
  count: number;
  replied: number;
  replyRate: number;
}

export interface WeeklyData {
  week: string;
  leads: number;
  sent: number;
  replied: number;
  signed: number;
}

export interface DashboardData {
  totalLeads: number;
  totalSent: number;
  totalReplied: number;
  totalSigned: number;
  totalRevenue: number;
  replyRate: number;
  pipeline: PipelineStage[];
  verticals: VerticalStats[];
  angles: AngleStats[];
  triggers: TriggerStats[];
  weekly: WeeklyData[];
  highPriority: Lead[];
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Unknown";
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function classifyTrigger(trigger: string): string {
  const t = trigger.toLowerCase();
  if (t.includes("meta") || t.includes("ad")) return "Meta Ads";
  if (t.includes("product") || t.includes("launch")) return "New Product";
  if (t.includes("press") || t.includes("news") || t.includes("feature"))
    return "Press/News";
  if (t.includes("hire") || t.includes("hiring") || t.includes("role"))
    return "Hiring";
  if (t.includes("funding") || t.includes("raise")) return "Funding";
  if (t.includes("sale") || t.includes("discount") || t.includes("promo"))
    return "Promotion";
  return "Other";
}

export function computeDashboard(leads: Lead[]): DashboardData {
  const stageOrder = [
    "scraped",
    "enriched",
    "audited",
    "researched",
    "drafted",
    "sent",
    "replied",
    "signed",
  ];
  const stageColors: Record<string, string> = {
    scraped: "#94a3b8",
    enriched: "#60a5fa",
    audited: "#a78bfa",
    researched: "#f59e0b",
    drafted: "#fb923c",
    sent: "#38bdf8",
    replied: "#22c55e",
    signed: "#10b981",
  };

  // Pipeline funnel
  const statusCounts: Record<string, number> = {};
  for (const l of leads) {
    const s = (l.status || "unknown").toLowerCase();
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }
  const pipeline: PipelineStage[] = stageOrder.map((s) => ({
    name: s,
    count: statusCounts[s] || 0,
    color: stageColors[s] || "#94a3b8",
  }));

  // Core metrics
  const isSent = (l: Lead) =>
    ["sent", "replied", "signed"].includes(l.status?.toLowerCase()) ||
    l.sequence_status === "sent" ||
    l.sequence_status === "day1_sent";
  const isReplied = (l: Lead) =>
    l.reply_received === "true" ||
    l.reply_received === "TRUE" ||
    l.status?.toLowerCase() === "replied";
  const isSigned = (l: Lead) => l.status?.toLowerCase() === "signed";

  const totalSent = leads.filter(isSent).length;
  const totalReplied = leads.filter(isReplied).length;
  const totalSigned = leads.filter(isSigned).length;
  const totalRevenue = totalSigned * REVENUE_PER_SIGNED;
  const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

  // Verticals
  const vertMap = new Map<string, { total: number; sent: number; replied: number; signed: number }>();
  for (const l of leads) {
    const v = l.vertical || "Unknown";
    if (!vertMap.has(v)) vertMap.set(v, { total: 0, sent: 0, replied: 0, signed: 0 });
    const s = vertMap.get(v)!;
    s.total++;
    if (isSent(l)) s.sent++;
    if (isReplied(l)) s.replied++;
    if (isSigned(l)) s.signed++;
  }
  const verticals: VerticalStats[] = [...vertMap.entries()]
    .map(([name, s]) => ({
      name,
      ...s,
      replyRate: s.sent > 0 ? (s.replied / s.sent) * 100 : 0,
      revenue: s.signed * REVENUE_PER_SIGNED,
    }))
    .sort((a, b) => b.total - a.total);

  // Outreach angles
  const angleMap = new Map<string, { sent: number; replied: number }>();
  for (const l of leads) {
    if (!l.outreach_angle || !isSent(l)) continue;
    const angle = l.outreach_angle.substring(0, 60);
    if (!angleMap.has(angle)) angleMap.set(angle, { sent: 0, replied: 0 });
    const a = angleMap.get(angle)!;
    a.sent++;
    if (isReplied(l)) a.replied++;
  }
  const angles: AngleStats[] = [...angleMap.entries()]
    .map(([angle, s]) => ({
      angle,
      ...s,
      replyRate: s.sent > 0 ? (s.replied / s.sent) * 100 : 0,
    }))
    .sort((a, b) => b.replyRate - a.replyRate)
    .slice(0, 10);

  // Trigger events
  const trigMap = new Map<string, { count: number; replied: number }>();
  for (const l of leads) {
    if (!l.trigger_event || l.trigger_event === "None detected" || !l.trigger_event.trim())
      continue;
    const type = classifyTrigger(l.trigger_event);
    if (!trigMap.has(type)) trigMap.set(type, { count: 0, replied: 0 });
    const t = trigMap.get(type)!;
    t.count++;
    if (isReplied(l)) t.replied++;
  }
  const triggers: TriggerStats[] = [...trigMap.entries()]
    .map(([type, s]) => ({
      type,
      ...s,
      replyRate: s.count > 0 ? (s.replied / s.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Weekly trends
  const weekMap = new Map<string, { leads: number; sent: number; replied: number; signed: number }>();
  for (const l of leads) {
    const week = getWeekLabel(l.created_at);
    if (week === "Unknown") continue;
    if (!weekMap.has(week)) weekMap.set(week, { leads: 0, sent: 0, replied: 0, signed: 0 });
    const w = weekMap.get(week)!;
    w.leads++;
    if (isSent(l)) w.sent++;
    if (isReplied(l)) w.replied++;
    if (isSigned(l)) w.signed++;
  }
  const weekly: WeeklyData[] = [...weekMap.entries()]
    .map(([week, s]) => ({ week, ...s }))
    .slice(-8);

  // High priority
  const highPriority = leads
    .filter((l) => parseInt(l.lead_score) >= 70)
    .sort((a, b) => parseInt(b.lead_score) - parseInt(a.lead_score))
    .slice(0, 10);

  return {
    totalLeads: leads.length,
    totalSent,
    totalReplied,
    totalSigned,
    totalRevenue,
    replyRate,
    pipeline,
    verticals,
    angles,
    triggers,
    weekly,
    highPriority,
  };
}
