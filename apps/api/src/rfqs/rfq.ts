/** One DIBBS Request for Quotation, as a vendor evaluates it. */
export interface Rfq {
  solicitationNumber: string;
  nsn: string;
  /** Federal Supply Class: the first 4 digits of the NSN, i.e. the kind of part. */
  fsc: string;
  nomenclature: string;
  hasTechnicalDocuments: boolean;
  setAside: string;
  status: string;
  purchaseRequest: string;
  quantity: number | null;
  /** ISO date, YYYY-MM-DD. */
  issuedDate: string;
  /** ISO date, YYYY-MM-DD. */
  returnByDate: string;
  /** The RFQ's own page on DIBBS. */
  packageUrl: string;
  /** The solicitation PDF. */
  documentUrl: string | null;
}
