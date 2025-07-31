#!/usr/bin/env bun
import { initDatabase } from "@/libs/database/init";
import { testDatabaseConnection } from "@/libs/database/testConnection";

(async () => {
  await initDatabase();
  await testDatabaseConnection();

  console.log("✅ Services initialized!");
  process.exit(0);
})().catch((err) => {
  console.error("⚠️ Initialization of services failed:", err);
  process.exit(1);
});
