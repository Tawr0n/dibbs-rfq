import { Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { IsoDate, Rfq } from "./rfq.js";

/** One JSON file per issue date: a past date's RFQs never change, so each is scraped once. */
@Injectable()
export class RfqCache {
  private readonly dir =
    process.env.RFQ_CACHE_DIR ?? join(process.cwd(), "data");

  async get(date: IsoDate): Promise<Rfq[] | null> {
    try {
      return JSON.parse(await readFile(this.path(date), "utf8")) as Rfq[];
    } catch {
      return null;
    }
  }

  async set(date: IsoDate, rfqs: Rfq[]): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.path(date), JSON.stringify(rfqs));
  }

  private path(date: IsoDate): string {
    return join(this.dir, `rfqs-${date}.json`);
  }
}
