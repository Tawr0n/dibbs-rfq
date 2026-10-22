import { Injectable } from "@nestjs/common";
import { DibbsClient } from "./dibbs.client.js";
import { RfqCache } from "./rfq-cache.js";
import type { IsoDate, Rfq } from "./rfq.js";

const MAX_LOOKBACK_DAYS = 7;
/** How long today's (still growing) or empty lists are served before re-scraping. */
const RECENT_TTL_MS = 30 * 60 * 1000;

export interface RfqsForDate {
  date: IsoDate;
  rfqs: Rfq[];
}

@Injectable()
export class RfqsService {
  private readonly inFlight = new Map<IsoDate, Promise<Rfq[]>>();
  private readonly recent = new Map<
    IsoDate,
    { rfqs: Rfq[]; fetchedAt: number }
  >();

  constructor(
    private readonly dibbs: DibbsClient,
    private readonly cache: RfqCache,
  ) {}

  async issuedOn(date: IsoDate): Promise<RfqsForDate> {
    return { date, rfqs: await this.load(date) };
  }

  /** Walks back from today to the most recent issue date that has RFQs (skips weekends/holidays). */
  async latest(today = new Date()): Promise<RfqsForDate> {
    for (let daysBack = 0; daysBack < MAX_LOOKBACK_DAYS; daysBack++) {
      const day = new Date(today);
      day.setUTCDate(day.getUTCDate() - daysBack);
      const result = await this.issuedOn(toIsoDate(day));
      if (result.rfqs.length > 0) return result;
    }
    return this.issuedOn(toIsoDate(today));
  }

  private load(date: IsoDate): Promise<Rfq[]> {
    // Concurrent requests for the same date share one scrape.
    const pending = this.inFlight.get(date) ?? this.scrapeOnce(date);
    this.inFlight.set(date, pending);
    return pending.finally(() => this.inFlight.delete(date));
  }

  private async scrapeOnce(date: IsoDate): Promise<Rfq[]> {
    const fresh = this.recent.get(date);
    if (fresh && Date.now() - fresh.fetchedAt < RECENT_TTL_MS)
      return fresh.rfqs;

    const cached = await this.cache.get(date);
    if (cached) return cached;

    const rfqs = await this.dibbs.fetchIssuedOn(date);
    // Today's list still grows during the day, and an empty day may be a weekend:
    // persist only complete, non-empty past days; keep the rest in memory briefly.
    if (rfqs.length > 0 && date < toIsoDate(new Date())) {
      await this.cache.set(date, rfqs);
    } else {
      this.recent.set(date, { rfqs, fetchedAt: Date.now() });
    }
    return rfqs;
  }
}

function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10) as IsoDate;
}
