import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { configureApp } from "./configure-app.js";
import { RfqsService } from "./rfqs/rfqs.service.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ?? 3001);

  // A day's first scrape takes ~1-2 min, so warm the cache before the first visitor arrives.
  app
    .get(RfqsService)
    .latest()
    .catch((error: unknown) => Logger.error(error, "Cache warm-up failed"));
}
await bootstrap();
