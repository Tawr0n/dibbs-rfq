import { Module } from "@nestjs/common";
import { DibbsClient } from "./dibbs.client.js";
import { RfqCache } from "./rfq-cache.js";
import { RfqsController } from "./rfqs.controller.js";
import { RfqsService } from "./rfqs.service.js";

@Module({
  controllers: [RfqsController],
  providers: [DibbsClient, RfqCache, RfqsService],
})
export class RfqsModule {}
