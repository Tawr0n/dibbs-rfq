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
- Known limit: the DIBBS search (`category=post`) is by post date, so a day's list is "posted on", and most rows carry another issue date (2026-10-22: 98% say the next day; 2026-10-21: 5% match, the rest are the next day or older, likely re-posts). The UI still says "Issue date"; renaming it is a next step.
- Filters and sort live in the URL via `history.replaceState`, not the Next router: no server round trip per keystroke, and Back does not step through each keystroke. Only non-default values are written, so links stay short; malformed values fall back to defaults.
- The server parses the URL and hands the initial view to the client component, so a shared link renders filtered on first paint.
- Sorting is separate from filtering (`sortRfqs`); unknown quantities always sort last, ties break by deadline then solicitation.
- First click on Qty sorts largest first (big orders are what a vendor scans for); first click on Return by sorts soonest first.
- Presets are built-in and the same for every vendor; per-vendor saved searches are a next step. A preset replaces all filters (including "Include closed") but keeps the search and sort, and is shown active only while the filters match it exactly.
- "Small business + drawings" matches the exact "Small Business Set-Aside" value, like the set-aside filter; WOSB, HUBZone and SDVOSB set-asides (~15% of a day) are left to the set-aside dropdown, so the preset stays one exact rule.
- One real day (2026-10-21, 1,671 RFQs) is committed as a cache file: the demo opens instantly and survives DIBBS being down. It goes through the normal cache path, so no database or seed code is needed.
- Layout overflow is checked in the browser (page `scrollWidth` vs viewport at 375 and 1024 px), not in jsdom, which does no layout; a unit test would only assert class names.
