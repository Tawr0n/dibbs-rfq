import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { App } from "supertest/types.js";
import { AppModule } from "../src/app.module.js";
import { configureApp } from "../src/configure-app.js";
import { DibbsClient } from "../src/rfqs/dibbs.client.js";
import { parseRfqPage } from "../src/rfqs/parse-rfq-page.js";

const fixtureRfqs = parseRfqPage(
  readFileSync(
    join(import.meta.dirname, "fixtures/rfq-recs-page1.html"),
    "utf8",
  ),
).rfqs;

describe("GET /rfqs (e2e)", () => {
  let app: INestApplication<App>;
  const dibbs = { fetchIssuedOn: vi.fn() };

  beforeEach(async () => {
    process.env.RFQ_CACHE_DIR = mkdtempSync(join(tmpdir(), "rfq-cache-"));
    dibbs.fetchIssuedOn.mockReset().mockResolvedValue(fixtureRfqs);

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DibbsClient)
      .useValue(dibbs)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns the RFQs issued on the requested date", async () => {
    const res = await request(app.getHttpServer())
      .get("/rfqs?date=2026-10-21")
      .expect(200);

    expect(res.body.date).toBe("2026-10-21");
    expect(res.body.rfqs).toHaveLength(50);
    expect(res.body.rfqs[0].solicitationNumber).toBe("SPE1C1-27-Q-0091");
  });

  it("scrapes a date only once and serves repeats from cache", async () => {
    await request(app.getHttpServer()).get("/rfqs?date=2026-10-21").expect(200);
    await request(app.getHttpServer()).get("/rfqs?date=2026-10-21").expect(200);

    expect(dibbs.fetchIssuedOn).toHaveBeenCalledTimes(1);
  });

  it("falls back to the latest day with RFQs when no date is given", async () => {
    dibbs.fetchIssuedOn
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValue(fixtureRfqs);

    const res = await request(app.getHttpServer()).get("/rfqs").expect(200);

    expect(res.body.rfqs).toHaveLength(50);
    expect(dibbs.fetchIssuedOn).toHaveBeenCalledTimes(2);
  });

  it("rejects a malformed date with 400", async () => {
    await request(app.getHttpServer()).get("/rfqs?date=21-10-2026").expect(400);
  });
});
