import { describe, expect, it } from "vitest";

import { ALL_RFQS, type RfqCriteria } from "./filter-rfqs";
import { applyPreset, isPresetActive, RFQ_PRESETS } from "./rfq-presets";

const preset = (label: string) => {
  const found = RFQ_PRESETS.find((p) => p.label === label);
  if (!found) throw new Error(`No preset "${label}"`);
  return found;
};

describe("RFQ presets", () => {
  it.each<[string, Partial<RfqCriteria>]>([
    ["Closing this week", { closesWithinDays: 7 }],
    [
      "Small business + drawings",
      { setAside: "Small Business Set-Aside", techDocs: "with" },
    ],
    ["Fast award", { fastAwardOnly: true }],
  ])("%s replaces the other filters", (label, filters) => {
    const current: RfqCriteria = {
      ...ALL_RFQS,
      fsc: "59",
      minQuantity: 10,
      includeClosed: true,
    };

    expect(applyPreset(current, preset(label))).toEqual({
      ...ALL_RFQS,
      ...filters,
    });
  });

  it("keeps the vendor's search", () => {
    const current = { ...ALL_RFQS, query: "valve" };

    expect(applyPreset(current, preset("Fast award")).query).toBe("valve");
  });

  it("is active only while the filters match it exactly", () => {
    const fastAward = preset("Fast award");
    const applied = applyPreset({ ...ALL_RFQS, query: "valve" }, fastAward);

    expect(isPresetActive(applied, fastAward)).toBe(true);
    expect(isPresetActive({ ...applied, fsc: "59" }, fastAward)).toBe(false);
    expect(isPresetActive(ALL_RFQS, fastAward)).toBe(false);
  });
});
