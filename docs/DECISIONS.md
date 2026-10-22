# Decisions

One line per decision: what, why, what was traded off.

- Monorepo with pnpm workspaces: one `pnpm check` gate for web and api.
- Data source: scrape `RfqRecs.aspx` by issue date. DIBBS has no public API; every page sits behind the DoD consent banner, which the client accepts with a form POST.
- Paging is ASP.NET postback (50 rows/page, ~35 pages/day): fetched sequentially to stay polite to DIBBS; trade-off is a ~2 min first load per date (~50 pages).
- Cache each date in a JSON file: a past issue date never changes, so it is scraped once. No database needed for an MVP.
- `cheerio` for HTML parsing: robust selectors over the ASP.NET grid instead of regexes.
- Search and filters run client-side: ~1.7k rows/day fit in memory, so every keystroke is instant with no round trip.
- Filters picked for a vendor's go/no-go decision: closes within N days (time to quote), set-aside (eligibility), FSC (the vendor's part classes), has tech docs (can it be built), min quantity (is it worth it).
- Fast award split from set-aside: DIBBS shows both as icons in one cell; ~45% of RFQs are micro-purchase fast awards, a distinct "act now" signal for vendors.
- Today's list is kept in memory for 30 min (not on disk): DIBBS keeps adding RFQs for the current day.
- The cache is warmed on API startup so the first visitor does not wait for a cold scrape.
- RFQ type duplicated in web (one file) instead of a shared package: wiring a TS package into both Nest (nodenext ESM) and Next costs more time than it saves here.
- Server component + `<Suspense>` streams the page shell immediately while a cold date is being scraped.
- Closed RFQs (return-by date in the past) are hidden by default: live data showed amended RFQs re-issued after their deadline, which a vendor cannot quote.
- Known limit: some rows report an issue date one day after the requested date (seen live for 2026-10-21). Not yet verified whether DIBBS lists them that way or a postback page drifts; next step is to compare a page fetched directly in DIBBS.
