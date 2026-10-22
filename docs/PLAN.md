# Plan

## Task

Full-stack app that pulls daily DIBBS RFQs and lets a vendor browse, search and filter them, opening each one on DIBBS.

## Slices

- [x] 1. API: parse a DIBBS `RfqRecs.aspx` page into RFQ records.
- [x] 2. API: DIBBS client (consent banner → all pages via postback), JSON file cache, `GET /rfqs?date=`.
- [x] 3. Web: RFQ table for the latest business day, each row links to its DIBBS package page.
- [x] 4. Web: instant search (solicitation, NSN, nomenclature, PR).
- [x] 5. Web: filters — closes within N days, set-aside, FSC, has tech docs, min quantity; date picker.
- [x] 6. Web: search, filters and sort live in the URL, so a view survives reload and can be shared.
- [x] 7. Web: sort by quantity or deadline.
- [x] 8. Web: one-click presets — Closing this week, Small business + drawings, Fast award.

## Out of scope

- Auth, a database, scheduled background scraping, RFP/IFB solicitations.
