# DIBBS RFQ Finder

A fast, focused way for a vendor to scan the day's DLA Requests for Quotation from [DIBBS](https://www.dibbs.bsm.dla.mil/RFQ/), find the ones worth quoting, and jump straight to them on DIBBS.

## Run it

Requires Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev        # web on http://localhost:3000, API on http://localhost:3001
pnpm check      # format, lint, typecheck, unit tests
pnpm test:e2e   # API e2e tests (DIBBS is faked)
```

On startup the API pulls the latest issue date from DIBBS (~1–2 min for ~1.7k RFQs); after that the page is instant.

## What it does

- **Pulls** every RFQ issued on a date: solicitation, NSN, FSC, item name, quantity, PR, set-aside, fast-award flag, tech-docs flag, issue and return-by dates, links.
- **Browse** as a table sorted by deadline (closing soonest first), with days left next to each date.
- **Search** across solicitation, NSN, item name and PR; dashes are optional (`5905010035779` finds `5905-01-003-5779`).
- **Filter** by what drives a go/no-go decision:
  - **Closes within N days**: is there time to prepare a quote?
  - **Set-aside**: is my business eligible (small business, WOSB, HUBZone, SDVOSB)?
  - **FSC / FSG prefix**: is this a part class I make or stock (`59` = electrical components)?
  - **Technical documents**: can I build it from drawings, or is it a known commercial part?
  - **Min quantity**: is the order worth the effort?
  - **Fast award only**: micro-purchases DLA may award before the deadline, where speed wins.
- **Open** each solicitation on its DIBBS package page in a new tab.
- **Pick another issue date** with the date picker.

## How it works

```
Next.js (apps/web) ──GET /rfqs?date=──▶ NestJS (apps/api) ──▶ JSON cache ──miss──▶ DIBBS scraper
 server component                        RfqsService            data/*.json          consent banner + postback paging
 + client-side filters
```

- **Scraper** (`apps/api/src/rfqs/dibbs.client.ts`): DIBBS has no public API. It accepts the DoD consent banner, loads `RfqRecs.aspx` for the date, then walks every page through ASP.NET postbacks, echoing back `__VIEWSTATE`.
- **Parser** (`parse-rfq-page.ts`): cheerio over the results grid; tested against a real saved page.
- **Caching**: past dates are written to `data/rfqs-YYYY-MM-DD.json` once, since they never change. Today's list still grows, so it lives in memory for 30 minutes. Concurrent requests share one scrape.
- **Web**: a server component fetches the day and streams in behind `<Suspense>`. Search and filters run in the browser over ~1.7k rows, so every keystroke is instant.

Trade-offs and reasoning: [docs/DECISIONS.md](docs/DECISIONS.md).

## Next steps

- Scheduled background scrape each morning, so nobody waits for the first load.
- A multi-day view and a "new since my last visit" marker.
- Saved searches per vendor (their FSCs and set-aside status) with email alerts.
- Enrich rows from the package page: unit of issue, delivery days, AMSC code.
- Virtualised table if multi-day views reach tens of thousands of rows.
