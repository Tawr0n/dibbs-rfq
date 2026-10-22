import type { Rfq } from "./rfq";

export type RfqSortKey = "deadline" | "quantity";
export type SortDirection = "asc" | "desc";
export type RfqSort = `${RfqSortKey}-${SortDirection}`;

export const RFQ_SORTS: readonly RfqSort[] = [
  "deadline-asc",
  "deadline-desc",
  "quantity-asc",
  "quantity-desc",
];

/** Closing soonest first: the order a vendor triages in. */
export const DEFAULT_SORT: RfqSort = "deadline-asc";

export function isRfqSort(value: unknown): value is RfqSort {
  return RFQ_SORTS.includes(value as RfqSort);
}

/** Returns a sorted copy. Ties fall back to deadline, then solicitation; unknown quantities always go last. */
export function sortRfqs(rfqs: Rfq[], sort: RfqSort): Rfq[] {
  const [key, direction] = sort.split("-") as [RfqSortKey, SortDirection];
  const sign = direction === "asc" ? 1 : -1;

  return rfqs.toSorted((a, b) => {
    if (key === "quantity" && a.quantity !== b.quantity) {
      if (a.quantity === null) return 1;
      if (b.quantity === null) return -1;
      return sign * (a.quantity - b.quantity);
    }
    const byDeadline = a.returnByDate.localeCompare(b.returnByDate);
    if (byDeadline !== 0)
      return key === "deadline" ? sign * byDeadline : byDeadline;
    return a.solicitationNumber.localeCompare(b.solicitationNumber);
  });
}
