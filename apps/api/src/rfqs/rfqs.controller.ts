import { Controller, Get, Query } from "@nestjs/common";
import { IsOptional, Matches } from "class-validator";
import type { IsoDate } from "./rfq.js";
import { RfqsService, type RfqsForDate } from "./rfqs.service.js";

export class RfqsQuery {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "date must be YYYY-MM-DD" })
  date?: IsoDate;
}

@Controller("rfqs")
export class RfqsController {
  constructor(private readonly rfqs: RfqsService) {}

  @Get()
  list(@Query() { date }: RfqsQuery): Promise<RfqsForDate> {
    return date ? this.rfqs.issuedOn(date) : this.rfqs.latest();
  }
}
