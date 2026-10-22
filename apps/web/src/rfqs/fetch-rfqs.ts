import type { Rfq } from "./rfq";

export interface RfqsForDate {
  date: string;
  rfqs: Rfq[];
}

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/** Fetches one issue date's RFQs from the API; omit the date for the latest day. */
export async function fetchRfqs(date?: string): Promise<RfqsForDate> {
  const url = new URL("/rfqs", API_URL);
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not load RFQs (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as RfqsForDate;
}
