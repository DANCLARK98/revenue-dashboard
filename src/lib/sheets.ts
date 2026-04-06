import { google } from "googleapis";

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

function getAuth() {
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!creds) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const parsed = JSON.parse(creds);
  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export async function fetchLeads(): Promise<Lead[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SPREADSHEET_ID not set");

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Leads!A1:ZZ",
  });

  const rows = res.data.values;
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
