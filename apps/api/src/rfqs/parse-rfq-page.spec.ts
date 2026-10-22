import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseRfqPage } from "./parse-rfq-page.js";

const html = readFileSync(
  join(import.meta.dirname, "../../test/fixtures/rfq-recs-page1.html"),
  "utf8",
);

describe("parseRfqPage", () => {
  const page = parseRfqPage(html);

  it("reads every row on the page and the total record count", () => {
    expect(page.rfqs).toHaveLength(50);
    expect(page.totalRecords).toBe(1671);
  });

  it("extracts the fields a vendor evaluates", () => {
    expect(page.rfqs[0]).toEqual({
      solicitationNumber: "SPE1C1-27-Q-0091",
      nsn: "8475-01-537-3803",
      fsc: "8475",
      nomenclature: "PAD, HELMET, AIRCRAFT",
      hasTechnicalDocuments: false,
      setAside: "Unrestricted/Not Set Aside",
      status: "Open",
      purchaseRequest: "7018738031",
      quantity: 600,
      issuedDate: "2026-10-21",
      returnByDate: "2026-11-23",
      packageUrl:
        "https://www.dibbs.bsm.dla.mil/rfq/rfqrec.aspx?sn=SPE1C127Q0091",
      documentUrl:
        "https://dibbs2.bsm.dla.mil/Downloads/RFQ/1/SPE1C127Q0091.PDF",
    });
  });
});
