import db from "@/libs/database/connection";
import { logger } from "@elizaos/core";

export async function testDatabaseConnection(): Promise<void> {
  try {
    logger.info("Testing database connection...");

    const result = await db.query(
      "SELECT NOW() as current_time, version() as db_version"
    );

    logger.info("✅ Database connection successful!");
    logger.info("Current time:", result.rows[0].current_time);
    logger.info("Database version:", result.rows[0].db_version);

    const tableResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (tableResult.rows[0].exists) {
      logger.info("✅ Users table exists");

      const tableInfo = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      logger.info("\nUsers table structure:");
      tableInfo.rows.forEach((row: any) => {
        logger.info(
          `  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
        );
      });

      const countResult = await db.query("SELECT COUNT(*) FROM users");
      logger.info(`\nTotal users in database: ${countResult.rows[0].count}`);
    } else {
      logger.info("❌ Users table does not exist - run initialization first");
    }
  } catch (error) {
    logger.error("❌ Database connection test failed:", error);
    throw error;
  }
}
