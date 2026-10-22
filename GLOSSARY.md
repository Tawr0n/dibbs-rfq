# DIBBS RFQ Finder

Helps a vendor scan the Requests for Quotation that the Defense Logistics Agency posts each weekday on DIBBS and pick the ones worth quoting.

## Language

### Solicitations

**RFQ**:
A Request for Quotation: DLA asking vendors to price a specific part, identified by a solicitation number and an NSN.
_Avoid_: Opportunity, tender, bid, solicitation (as a name for the whole record)

**Solicitation number**:
The identifier of an RFQ on DIBBS, e.g. `SPE1C1-27-Q-0091`.
_Avoid_: RFQ ID, sol number

**Issue date**:
The day DLA posted the RFQ to DIBBS.
_Avoid_: Post date, publish date

**Return-by date**:
The last day a vendor can submit a quote; after it the RFQ is closed.
_Avoid_: Due date, deadline (in code and docs; fine in UI copy), close date

### Parts

**NSN**:
National Stock Number: the 13-digit identifier of the part being bought, e.g. `5905-01-003-5779`.
_Avoid_: Part number, stock number

**FSC**:
Federal Supply Class: the first four digits of the NSN, the kind of part (`5905` = resistors).
_Avoid_: Category, part class

**FSG**:
Federal Supply Group: the first two digits of the NSN, a family of FSCs (`59` = electrical components).
_Avoid_: Group, category

**Technical documents**:
Drawings or specifications attached to an RFQ, needed to manufacture the part rather than resell a known one.
_Avoid_: Tech data, attachments

### Eligibility and urgency

**Set-aside**:
A restriction of who may quote an RFQ, e.g. small businesses only; "Unrestricted" means anyone may.
_Avoid_: Eligibility, restriction

**Fast award**:
A micro-purchase RFQ that DLA may award before the return-by date, so the first acceptable quote can win.
_Avoid_: Quick award, automated award

### Vendor views

**Preset**:
A built-in, one-click set of filters answering a common go/no-go question; the same for every vendor.
_Avoid_: Saved search, quick filter, view

**Saved search**:
A vendor's own stored set of filters (not built yet).
_Avoid_: Preset, favourite
