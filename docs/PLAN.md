# Plan

## Task

Full-stack app that pulls daily DIBBS RFQs and lets a vendor browse, search and filter them, opening each one on DIBBS.

## Slices

- [x] 1. API: parse a DIBBS `RfqRecs.aspx` page into RFQ records.
- [ ] 2. API: DIBBS client (consent banner → all pages via postback), JSON file cache, `GET /rfqs?date=`.
- [ ] 3. Web: RFQ table for the latest business day, each row links to its DIBBS package page.
- [ ] 4. Web: instant search (solicitation, NSN, nomenclature, PR).
- [ ] 5. Web: filters — closes within N days, set-aside, FSC, has tech docs, min quantity; date picker.

## Out of scope

- Auth, a database, scheduled background scraping, RFP/IFB solicitations.
