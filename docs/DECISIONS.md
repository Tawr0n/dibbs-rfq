# Decisions

One line per decision: what, why, what was traded off.

- Monorepo with pnpm workspaces: one `pnpm check` gate for web and api.
- Data source: scrape `RfqRecs.aspx` by issue date. DIBBS has no public API; every page sits behind the DoD consent banner, which the client accepts with a form POST.
- Paging is ASP.NET postback (50 rows/page, ~35 pages/day): fetched sequentially to stay polite to DIBBS; trade-off is a ~30–60 s first load per date.
- Cache each date in a JSON file: a past issue date never changes, so it is scraped once. No database needed for an MVP.
- `cheerio` for HTML parsing: robust selectors over the ASP.NET grid instead of regexes.
- Search and filters run client-side: ~1.7k rows/day fit in memory, so every keystroke is instant with no round trip.
- Filters picked for a vendor's go/no-go decision: closes within N days (time to quote), set-aside (eligibility), FSC (the vendor's part classes), has tech docs (can it be built), min quantity (is it worth it).
