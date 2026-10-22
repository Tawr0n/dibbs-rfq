# Demo & walkthrough (15 min)

Repo: https://github.com/Tawr0n/dibbs-rfq

## Before the call

- `pnpm dev`, wait for `page N/N` in the API log (~2.5 min) → cache is warm.
- Open http://localhost:3000.

## Demo script (~5 min)

1. **The problem in one line.** DIBBS lists ~2.5k RFQs a day, 50 per page, behind a consent banner, with no search across them. A vendor wants the 10 worth quoting, in 5 minutes.
2. **Landing.** Today's RFQs, closing soonest first, days left next to the deadline. Closed ones are hidden.
3. **Search.** Type `resistor`, then an NSN without dashes. Instant, client-side.
4. **Presets.** One click each: "Closing this week", "Small business", "Fast award". These are the go/no-go questions a vendor asks.
5. **Filter stack.** FSC `59` (electrical) + min quantity. Show the count dropping.
6. **Share.** Copy the URL: filters and sort live in it, so the view can be sent to a colleague.
7. **Open on DIBBS.** Click a solicitation → its DIBBS package page.
8. **Another day.** Date picker → a past date (served from cache instantly if already loaded).

## Walkthrough (~10 min)

**How I got the data** (problem-solving)

- No public API. Every DIBBS page sits behind the DoD consent banner → the client accepts it with a form POST.
- Results page through ASP.NET postbacks → the scraper echoes `__VIEWSTATE` back for each page.
- Measured: ~50 pages, ~2.5 min/day → that drove the caching design.

**What the live data taught me** (things tests alone would not have caught)

- "Fast award" sits as an icon in the same cell as the set-aside → first version mislabelled ~45% of rows. Split into its own flag and filter.
- Some listed RFQs were already past their return-by date → hidden by default.
- Next 16 blocked prerender when `searchParams` was read outside `<Suspense>` → page shell now streams instantly.

**Why these filters** (filter choices) — each answers one vendor question:

- Closes within N days → do I have time to quote?
- Set-aside → am I even eligible?
- FSC/FSG → is it my kind of part?
- Tech docs → can I build it from drawings?
- Min quantity → is it worth it?
- Fast award → where does speed win?

**Trade-offs** (see DECISIONS.md)

- Scrape on demand + cache, no DB: past days never change; today's list lives in memory 30 min.
- Cache warmed on startup so the first visitor doesn't wait.
- Search/filter client-side: ~2.5k rows fit in memory, every keystroke is instant.

**Known limits** (say them before they're found)

- A cold day costs ~2.5 min of scraping.
- The date picks the day DIBBS _posted_ RFQs (its search is by post date), not the RFQ's own issue date. Most rows carry a different issue date: for 2026-10-22, 2,564 of 2,620 say 2026-10-23 (posted the evening before issue); for 2026-10-21, only 90 of 1,671 match, 900 say the next day, the rest are older (likely re-posted, e.g. amended). Next step: label the picker "Posted on" and show the issue date as its own column.

**Next steps**

- Scheduled morning scrape; saved searches per vendor with email alerts ("new RFQs in my FSCs").
- Multi-day view, "new since last visit".
- Enrich from the package page: unit of issue, delivery days, award history.

**How I used AI**

- Plan first, then test-first vertical slices, one commit each.
- Verified against live DIBBS after each slice; three bugs were found there, not by the AI.
