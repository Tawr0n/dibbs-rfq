import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Rfq } from "./rfq";
import { RfqBrowser } from "./rfq-browser";

const base: Rfq = {
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
};
const rfqs: Rfq[] = [
  base,
  {
    ...base,
    solicitationNumber: "SPEFA5-27-T-0113",
    nsn: "5905-01-003-5779",
    fsc: "5905",
    nomenclature: "RESISTOR, WIREWOUND",
    setAside: "Small Business Set-Aside",
    fastAward: true,
    packageUrl:
      "https://www.dibbs.bsm.dla.mil/rfq/rfqrec.aspx?sn=SPEFA527T0113",
  },
];

const today = new Date("2026-10-22T12:00:00Z");
const rows = () => screen.getAllByRole("row").slice(1);

describe("RfqBrowser", () => {
  it("lists RFQs, each linking to its DIBBS page", () => {
    render(<RfqBrowser rfqs={rfqs} today={today} />);

    expect(rows()).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "SPE1C1-27-Q-0091" }),
    ).toHaveAttribute("href", base.packageUrl);
  });

  it("narrows the list as the vendor types a search", async () => {
    render(<RfqBrowser rfqs={rfqs} today={today} />);

    await userEvent.type(screen.getByRole("searchbox"), "resistor");

    expect(rows()).toHaveLength(1);
    expect(
      within(rows()[0]!).getByText("RESISTOR, WIREWOUND"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 2 RFQs")).toBeInTheDocument();
  });

  it("filters by set-aside", async () => {
    render(<RfqBrowser rfqs={rfqs} today={today} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Set-aside" }),
      "Small Business Set-Aside",
    );

    expect(rows()).toHaveLength(1);
  });
});
