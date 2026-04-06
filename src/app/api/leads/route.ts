import { NextResponse } from "next/server";
import { fetchLeads } from "@/lib/sheets";
import { computeDashboard } from "@/lib/analytics";

export const revalidate = 300; // cache 5 minutes

export async function GET() {
  try {
    const leads = await fetchLeads();
    const data = computeDashboard(leads);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
