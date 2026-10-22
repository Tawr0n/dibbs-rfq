import { describe, expect, it } from "vitest";

import { ALL_RFQS, filterRfqs } from "./filter-rfqs";
import type { Rfq } from "./rfq";

const rfq = (overrides: Partial<Rfq>): Rfq => ({
  solicitationNumber: "SPE1C1-27-Q-0091",
  nsn: "8475-01-537-3803",
  fsc: "8475",
  nomenclature: "PAD, HELMET, AIRCRAFT",
  hasTechnicalDocuments: false,
  setAside: "Unrestricted/Not Set Aside",
  fastAward: false,
  status: "Open",
  purchaseRequest: "7018738031",
  quantity: 600,
  issuedDate: "2026-10-21",
  returnByDate: "2026-11-23",
  packageUrl: "https://www.dibbs.bsm.dla.mil/rfq/rfqrec.aspx?sn=SPE1C127Q0091",
  documentUrl: null,
  ...overrides,
});

const today = new Date("2026-10-22T12:00:00Z");
const solicitations = (rfqs: Rfq[]) => rfqs.map((r) => r.solicitationNumber);

describe("filterRfqs", () => {
  const helmet = rfq({});
  const resistor = rfq({
    solicitationNumber: "SPEFA5-27-T-0113",
    nsn: "5905-01-003-5779",
    fsc: "5905",
    nomenclature: "RESISTOR, WIREWOUND",
    setAside: "Small Business Set-Aside",
    fastAward: true,
    hasTechnicalDocuments: true,
    quantity: 2,
    returnByDate: "2026-10-29",
  });
  const rfqs = [helmet, resistor];

  it("returns everything, closing soonest first, with no criteria", () => {
    expect(solicitations(filterRfqs(rfqs, ALL_RFQS, today))).toEqual([
      "SPEFA5-27-T-0113",
      "SPE1C1-27-Q-0091",
    ]);
  });

  it.each([
    ["nomenclature, any case", "resistor"],
    ["NSN without dashes", "5905010035779"],
    ["NSN with dashes", "5905-01-003"],
    ["solicitation without dashes", "SPEFA527T0113"],
  ])("searches by %s", (_, query) => {
    expect(
      solicitations(filterRfqs(rfqs, { ...ALL_RFQS, query }, today)),
    ).toEqual(["SPEFA5-27-T-0113"]);
  });

  it("hides RFQs already past their return-by date unless asked", () => {
    const closed = rfq({
      solicitationNumber: "SPE7M1-26-U-6227",
      returnByDate: "2026-10-09",
    });

    expect(
      solicitations(filterRfqs([closed, helmet], ALL_RFQS, today)),
    ).toEqual(["SPE1C1-27-Q-0091"]);
    expect(
      solicitations(
        filterRfqs(
          [closed, helmet],
          { ...ALL_RFQS, includeClosed: true },
          today,
        ),
      ),
    ).toEqual(["SPE7M1-26-U-6227", "SPE1C1-27-Q-0091"]);
  });

  it("keeps RFQs closing within N days", () => {
    const result = filterRfqs(
      rfqs,
      { ...ALL_RFQS, closesWithinDays: 7 },
      today,
    );
    expect(solicitations(result)).toEqual(["SPEFA5-27-T-0113"]);
  });

  it("filters by set-aside, FSC prefix, tech docs, fast award and min quantity", () => {
    const only = (criteria: Partial<typeof ALL_RFQS>) =>
      solicitations(filterRfqs(rfqs, { ...ALL_RFQS, ...criteria }, today));

    expect(only({ setAside: "Small Business Set-Aside" })).toEqual([
      "SPEFA5-27-T-0113",
    ]);
    expect(only({ fsc: "84" })).toEqual(["SPE1C1-27-Q-0091"]);
    expect(only({ techDocs: "with" })).toEqual(["SPEFA5-27-T-0113"]);
    expect(only({ techDocs: "without" })).toEqual(["SPE1C1-27-Q-0091"]);
    expect(only({ fastAwardOnly: true })).toEqual(["SPEFA5-27-T-0113"]);
    expect(only({ minQuantity: 100 })).toEqual(["SPE1C1-27-Q-0091"]);
  });
});
