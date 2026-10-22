import { INestApplication, ValidationPipe } from "@nestjs/common";

// Shared by main.ts and e2e tests so both run the same global setup.
export function configureApp(app: INestApplication): void {
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
