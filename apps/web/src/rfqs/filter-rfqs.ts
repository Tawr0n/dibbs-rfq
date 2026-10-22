import type { Rfq } from "./rfq";

export interface RfqCriteria {
  /** Free text over solicitation, NSN, nomenclature and PR; dashes are ignored. */
  query: string;
  closesWithinDays: number | null;
  setAside: string;
  /** FSC or FSG prefix, e.g. "5905" or "59". */
  fsc: string;
  techDocs: "any" | "with" | "without";
  fastAwardOnly: boolean;
  minQuantity: number | null;
}

export const ALL_RFQS: RfqCriteria = {
  query: "",
  closesWithinDays: null,
  setAside: "",
  fsc: "",
  techDocs: "any",
  fastAwardOnly: false,
  minQuantity: null,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Applies the vendor's criteria and orders by deadline, closing soonest first. */
export function filterRfqs(
  rfqs: Rfq[],
  criteria: RfqCriteria,
  today: Date,
): Rfq[] {
  const query = normalize(criteria.query);
  const deadline =
    criteria.closesWithinDays === null
      ? null
      : new Date(today.getTime() + criteria.closesWithinDays * DAY_MS)
          .toISOString()
          .slice(0, 10);

  return rfqs
    .filter(
      (rfq) =>
        (query === "" || searchText(rfq).includes(query)) &&
        (deadline === null || rfq.returnByDate <= deadline) &&
        (criteria.setAside === "" || rfq.setAside === criteria.setAside) &&
        rfq.fsc.startsWith(criteria.fsc.trim()) &&
        (criteria.techDocs === "any" ||
          rfq.hasTechnicalDocuments === (criteria.techDocs === "with")) &&
        (!criteria.fastAwardOnly || rfq.fastAward) &&
        (criteria.minQuantity === null ||
          (rfq.quantity ?? 0) >= criteria.minQuantity),
    )
    .toSorted((a, b) => a.returnByDate.localeCompare(b.returnByDate));
}

const searchIndex = new WeakMap<Rfq, string>();

function searchText(rfq: Rfq): string {
  let text = searchIndex.get(rfq);
  if (text === undefined) {
    text = normalize(
      [
        rfq.solicitationNumber,
        rfq.nsn,
        rfq.nomenclature,
        rfq.purchaseRequest,
      ].join(" "),
    );
    searchIndex.set(rfq, text);
  }
  return text;
}

function normalize(text: string): string {
  return text.toLowerCase().replaceAll("-", "").trim();
}
