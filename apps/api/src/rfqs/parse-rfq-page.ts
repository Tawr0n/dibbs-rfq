import { load } from "cheerio";
import type { Rfq } from "./rfq.js";

export interface RfqPage {
  rfqs: Rfq[];
  totalRecords: number;
}

const GRID = "#ctl00_cph1_grdRfqSearch";

/** Parses one page of DIBBS `RfqRecs.aspx` results. */
export function parseRfqPage(html: string): RfqPage {
  const $ = load(html);

  const rfqs = $(`${GRID} tr`)
    .toArray()
    .filter((row) => $(row).find("[id$='_lblSolicitation']").length > 0)
    .map((row): Rfq => {
      const cell = (suffix: string) => $(row).find(`[id$='_${suffix}']`);
      const solicitation = cell("lblSolicitation");
      const badges = solicitation
        .find("img")
        .toArray()
        .map((img) => $(img).attr("alt")?.trim() ?? "");
      // Usually: PDF link + "Package View" link. With no PDF, the first link
      // goes straight to the package and reads "<number><br>--»Attachments".
      const firstLink = solicitation.find("a").first();
      const hrefs = solicitation
        .find("a")
        .toArray()
        .map((link) => $(link).attr("href") ?? "");
      const packageUrl = hrefs.find(isPackageUrl) ?? "";
      const firstHref = firstLink.attr("href");
      const nsn = cell("lblNsn").text().trim();
      const [purchaseRequest = "", quantityLine = ""] = (
        cell("lblPr").html() ?? ""
      )
        .split(/<br\s*\/?>/i)
        .map((part) => $(`<p>${part}</p>`).text().trim());
      const quantity = Number.parseInt(quantityLine.replace(/\D/g, ""), 10);

      return {
        solicitationNumber: firstLink.contents().first().text().trim(),
        nsn,
        fsc: nsn.replace(/\D/g, "").slice(0, 4),
        nomenclature: cell("lblNomenclature").text().trim(),
        hasTechnicalDocuments:
          cell("lblTechnicalDocuments").find("a").length > 0,
        setAside: badges.find((badge) => /set.?aside/i.test(badge)) ?? "",
        fastAward: badges.some((badge) => badge.startsWith("Fast Award")),
        status: cell("lblStatus").children("span").first().text().trim(),
        purchaseRequest,
        quantity: Number.isNaN(quantity) ? null : quantity,
        issuedDate: toIsoDate(cell("lblIssued").text()),
        returnByDate: toIsoDate(cell("lblReturnBy").text()),
        packageUrl,
        documentUrl:
          firstHref === undefined || isPackageUrl(firstHref) ? null : firstHref,
      };
    });

  const totalRecords = Number.parseInt(
    $("#ctl00_cph1_lblRecCount").text().replace(/\D/g, ""),
    10,
  );

  return { rfqs, totalRecords: Number.isNaN(totalRecords) ? 0 : totalRecords };
}

function isPackageUrl(href: string): boolean {
  return /\/rfq\/rfqrec\.aspx\?/i.test(href);
}

/** DIBBS dates are MM-DD-YYYY. */
function toIsoDate(dibbsDate: string): string {
  const [month, day, year] = dibbsDate.trim().split("-");
  return `${year}-${month}-${day}`;
}
