import { Injectable, Logger } from "@nestjs/common";
import { load } from "cheerio";
import { parseRfqPage } from "./parse-rfq-page.js";
import type { IsoDate, Rfq } from "./rfq.js";

const BASE_URL = "https://www.dibbs.bsm.dla.mil";
const GRID_EVENT_TARGET = "ctl00$cph1$grdRfqSearch";

/** Scrapes RFQs from DIBBS: accepts the DoD consent banner, then walks every result page. */
@Injectable()
export class DibbsClient {
  private readonly logger = new Logger(DibbsClient.name);

  async fetchIssuedOn(date: IsoDate): Promise<Rfq[]> {
    const cookies = await this.acceptConsent();
    const [year, month, day] = date.split("-");
    const url = `${BASE_URL}/RFQ/RfqRecs.aspx?category=post&TypeSrch=dt&Value=${month}-${day}-${year}`;

    let html = await this.request(url, cookies);
    const first = parseRfqPage(html);
    const rfqs = [...first.rfqs];
    const pageCount = Math.ceil(
      first.totalRecords / Math.max(first.rfqs.length, 1),
    );

    for (let page = 2; page <= pageCount; page++) {
      html = await this.request(url, cookies, {
        ...hiddenFields(html),
        __EVENTTARGET: GRID_EVENT_TARGET,
        __EVENTARGUMENT: `Page$${page}`,
      });
      rfqs.push(...parseRfqPage(html).rfqs);
      this.logger.log(`${date}: page ${page}/${pageCount}`);
    }

    return rfqs;
  }

  private async acceptConsent(): Promise<Map<string, string>> {
    const cookies = new Map<string, string>();
    const consentUrl = `${BASE_URL}/dodwarning.aspx?goto=%2frfq%2f`;
    const banner = await this.request(consentUrl, cookies);
    await this.request(consentUrl, cookies, {
      ...hiddenFields(banner),
      butAgree: "OK",
    });
    return cookies;
  }

  private async request(
    url: string,
    cookies: Map<string, string>,
    form?: Record<string, string>,
  ): Promise<string> {
    const res = await fetch(url, {
      method: form ? "POST" : "GET",
      redirect: "manual",
      headers: {
        cookie: [...cookies]
          .map(([name, value]) => `${name}=${value}`)
          .join("; "),
        ...(form && { "content-type": "application/x-www-form-urlencoded" }),
      },
      body: form && new URLSearchParams(form),
    });

    for (const header of res.headers.getSetCookie()) {
      const [pair = ""] = header.split(";");
      const separator = pair.indexOf("=");
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location") ?? "/";
      return this.request(new URL(location, url).toString(), cookies);
    }
    if (!res.ok) {
      throw new Error(`DIBBS responded ${res.status} for ${url}`);
    }
    return res.text();
  }
}

/** ASP.NET WebForms state (__VIEWSTATE* etc.) that every postback must echo back. */
function hiddenFields(html: string): Record<string, string> {
  const $ = load(html);
  return Object.fromEntries(
    $("input[type=hidden]")
      .toArray()
      .map((input) => [
        $(input).attr("name") ?? "",
        $(input).attr("value") ?? "",
      ])
      .filter(([name]) => name !== ""),
  );
}
