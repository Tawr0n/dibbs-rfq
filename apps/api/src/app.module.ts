import { Module } from "@nestjs/common";
import { RfqsModule } from "./rfqs/rfqs.module.js";

@Module({
  imports: [RfqsModule],
})
export class AppModule {}
