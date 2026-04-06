export interface Lead {
  lead_id: string;
  store_url: string;
  store_name: string;
  vertical: string;
  decision_maker: string;
  title: string;
  email: string;
  est_revenue: string;
  audit_score: string;
  lead_score: string;
  trigger_event: string;
  outreach_angle: string;
  status: string;
  reply_received: string;
  outcome: string;
  revenue: string;
  created_at: string;
  last_updated: string;
  sequence_status: string;
  last_email_sent_at: string;
  pattern_used: string;
  decay_applied: string;
  expired_at: string;
  meta_ad_count: string;
  trustpilot_rating: string;
  monthly_visits: string;
  linkedin_status: string;
}

export async function fetchLeads(): Promise<Lead[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not set");
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID not set");

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A1:ZZ?key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  const data = await res.json();
  const rows: string[][] = data.values;
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((h: string) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((row) => {
    const lead: Record<string, string> = {};
    headers.forEach((h: string, i: number) => {
      lead[h] = row[i] || "";
    });
    return lead as unknown as Lead;
  });
}
