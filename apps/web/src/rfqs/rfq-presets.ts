import { ALL_RFQS, type RfqCriteria } from "./filter-rfqs";

/** A built-in, one-click set of filters for a common go/no-go question; the same for every vendor. */
export interface RfqPreset {
  label: string;
  /** The vendor question the preset answers. */
  rationale: string;
  filters: Partial<Omit<RfqCriteria, "query">>;
}

export const RFQ_PRESETS: readonly RfqPreset[] = [
  {
    label: "Closing this week",
    rationale: "Quote these first, or lose them.",
    filters: { closesWithinDays: 7 },
  },
  {
    label: "Small business + drawings",
    rationale:
      "Set aside for small businesses, with drawings to manufacture from.",
    filters: { setAside: "Small Business Set-Aside", techDocs: "with" },
  },
  {
    label: "Fast award",
    rationale: "Micro-purchases DLA may award before the deadline.",
    filters: { fastAwardOnly: true },
  },
];

/** Replaces every filter with the preset's, keeping the vendor's search. */
export function applyPreset(
  current: RfqCriteria,
  preset: RfqPreset,
): RfqCriteria {
  return { ...ALL_RFQS, query: current.query, ...preset.filters };
}

export function isPresetActive(
  current: RfqCriteria,
  preset: RfqPreset,
): boolean {
  const applied = applyPreset(current, preset);
  return (Object.keys(applied) as (keyof RfqCriteria)[]).every(
    (key) => applied[key] === current[key],
  );
}
