import { describe, expect, it } from "vitest";

import { ALL_RFQS, type RfqCriteria } from "./filter-rfqs";
import { criteriaFromSearchParams, withCriteria } from "./rfq-search-params";

const everyFilter: RfqCriteria = {
  query: "valve",
  closesWithinDays: 7,
  setAside: "Small Business Set-Aside",
  fsc: "59",
  techDocs: "with",
  fastAwardOnly: true,
  minQuantity: 10,
  includeClosed: true,
};

describe("RFQ criteria in the URL", () => {
  it("round-trips every filter", () => {
    const params = withCriteria(new URLSearchParams(), everyFilter);

    expect(criteriaFromSearchParams(params)).toEqual(everyFilter);
  });

  it("writes only what differs from the defaults, keeping other params", () => {
    const params = withCriteria(new URLSearchParams("date=2026-10-21"), {
      ...ALL_RFQS,
      query: "valve",
      closesWithinDays: 7,
    });

    expect(params.toString()).toBe("date=2026-10-21&q=valve&closes=7");
  });

  it("clears filters that went back to their defaults", () => {
    const params = withCriteria(
      new URLSearchParams("date=2026-10-21&q=valve&fast=1"),
      ALL_RFQS,
    );

    expect(params.toString()).toBe("date=2026-10-21");
  });

  it("falls back to defaults for malformed values", () => {
    const params = new URLSearchParams(
      "closes=soon&docs=maybe&minQty=-3&fsc=5a9&fast=yes",
    );

    expect(criteriaFromSearchParams(params)).toEqual(ALL_RFQS);
  });
});
