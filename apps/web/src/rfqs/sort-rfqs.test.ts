import { describe, expect, it } from "vitest";

import type { Rfq } from "./rfq";
import { sortRfqs } from "./sort-rfqs";

const rfq = (
  solicitationNumber: string,
  returnByDate: string,
  quantity: number | null,
): Rfq => ({
  solicitationNumber,
  nsn: "5905-01-003-5779",
  fsc: "5905",
  nomenclature: "RESISTOR, WIREWOUND",
  hasTechnicalDocuments: false,
  setAside: "Unrestricted/Not Set Aside",
  fastAward: false,
  status: "Open",
  purchaseRequest: "7018738031",
  quantity,
  issuedDate: "2026-10-21",
  returnByDate,
  packageUrl: "https://www.dibbs.bsm.dla.mil/rfq/rfqrec.aspx?sn=X",
  documentUrl: null,
});

const soon = rfq("A", "2026-10-25", 5);
const later = rfq("B", "2026-11-20", 500);
const unknownQuantity = rfq("C", "2026-10-30", null);
const sameDeadlineAsSoon = rfq("D", "2026-10-25", 500);
const rfqs = [later, unknownQuantity, sameDeadlineAsSoon, soon];
const order = (sorted: Rfq[]) => sorted.map((r) => r.solicitationNumber);

describe("sortRfqs", () => {
  it("orders by deadline, closing soonest first, then by solicitation", () => {
    expect(order(sortRfqs(rfqs, "deadline-asc"))).toEqual(["A", "D", "C", "B"]);
  });

  it("orders by deadline, latest first", () => {
    expect(order(sortRfqs(rfqs, "deadline-desc"))).toEqual([
      "B",
      "C",
      "A",
      "D",
    ]);
  });

  it("orders by quantity, breaking ties by deadline, unknown quantity last", () => {
    expect(order(sortRfqs(rfqs, "quantity-asc"))).toEqual(["A", "D", "B", "C"]);
    expect(order(sortRfqs(rfqs, "quantity-desc"))).toEqual([
      "D",
      "B",
      "A",
      "C",
    ]);
  });

  it("leaves the input untouched", () => {
    const input = [...rfqs];
    sortRfqs(input, "quantity-desc");
    expect(input).toEqual(rfqs);
  });
});
