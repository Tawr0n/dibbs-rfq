import { ALL_RFQS, type RfqCriteria } from "./filter-rfqs";

/** URL parameter for each filter: short, so a shared link stays readable. */
const PARAM = {
  query: "q",
  closesWithinDays: "closes",
  setAside: "setAside",
  fsc: "fsc",
  techDocs: "docs",
  fastAwardOnly: "fast",
  minQuantity: "minQty",
  includeClosed: "closed",
} as const satisfies Record<keyof RfqCriteria, string>;

/** Reads the vendor's filters from the URL; anything missing or malformed falls back to its default. */
export function criteriaFromSearchParams(params: URLSearchParams): RfqCriteria {
  const techDocs = params.get(PARAM.techDocs);
  const fsc = params.get(PARAM.fsc) ?? "";

  return {
    query: params.get(PARAM.query) ?? ALL_RFQS.query,
    closesWithinDays: positiveInteger(params.get(PARAM.closesWithinDays)),
    setAside: params.get(PARAM.setAside) ?? ALL_RFQS.setAside,
    fsc: /^\d+$/.test(fsc) ? fsc : ALL_RFQS.fsc,
    techDocs:
      techDocs === "with" || techDocs === "without"
        ? techDocs
        : ALL_RFQS.techDocs,
    fastAwardOnly: params.get(PARAM.fastAwardOnly) === "1",
    minQuantity: positiveInteger(params.get(PARAM.minQuantity)),
    includeClosed: params.get(PARAM.includeClosed) === "1",
  };
}

/** Returns a copy of `params` holding the filters that differ from the defaults; unrelated params (e.g. `date`) are kept. */
export function withCriteria(
  params: URLSearchParams,
  criteria: RfqCriteria,
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of Object.keys(PARAM) as (keyof RfqCriteria)[]) {
    const value = criteria[key];
    if (value === ALL_RFQS[key]) {
      next.delete(PARAM[key]);
    } else {
      next.set(PARAM[key], typeof value === "boolean" ? "1" : String(value));
    }
  }
  return next;
}

function positiveInteger(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number > 0 ? number : null;
}
