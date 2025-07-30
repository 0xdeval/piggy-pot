import db from "@/libs/database/connection";
import { logger } from "@elizaos/core";

export async function initDatabase(): Promise<void> {
  try {
    logger.info("Initializing database...");

    logger.info("Testing database connection...");
    const connectionTest = await db.query(
      "SELECT NOW() as current_time, version() as db_version"
    );
    logger.info("✅ Database connection successful!");
    logger.info("Current time:", connectionTest.rows[0].current_time);
    logger.info("Database version:", connectionTest.rows[0].db_version);

    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      logger.info("Users table does not exist. Creating tables...");

      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            user_id_raw VARCHAR(255) NOT NULL UNIQUE,
            user_id UUID NOT NULL UNIQUE,
            channel_id UUID NOT NULL,
            room_id UUID NOT NULL,
            agent_id UUID NOT NULL,
            delegated_wallet_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_user_id_raw ON users(user_id_raw);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_channel_id ON users(channel_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_room_id ON users(room_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_agent_id ON users(agent_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_delegated_wallet_hash ON users(delegated_wallet_hash);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);"
      );

      await db.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await db.query(`
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `);

      logger.info("✅ Users table and indexes created successfully!");
    } else {
      logger.info("✅ Users table already exists.");
    }

    const operationsTableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'operations'
      );
    `);

    if (!operationsTableExists.rows[0].exists) {
      logger.info(
        "Operations table does not exist. Creating operations table..."
      );

      await db.query(`
        CREATE TABLE IF NOT EXISTS operations (
            operation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            operation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            invested_amount DECIMAL(20,8) NOT NULL,
            risky_investment DECIMAL(20,8) NOT NULL,
            non_risky_investment DECIMAL(20,8) NOT NULL,
            log_id UUID,
            status TEXT NOT NULL DEFAULT 'RECOMMENDATION_INIT' CHECK (status IN ('RECOMMENDATION_INIT', 'RECOMMENDATION_FINISHED', 'RECOMMENDATION_FAILED', 'DEPOSIT_INIT', 'DEPOSIT_FAILED', 'ACTIVE_INVESTMENT', 'CLOSED_INVESTMENT')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
      `);

      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_operation_date ON operations(operation_date);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_log_id ON operations(log_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_created_at ON operations(created_at);"
      );

      await db.query(`
        CREATE TRIGGER update_operations_updated_at 
            BEFORE UPDATE ON operations 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `);

      logger.info("✅ Operations table and indexes created successfully!");
    } else {
      logger.info("✅ Operations table already exists.");
    }

    const logsTableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'operations_logs'
      );
    `);

    if (!logsTableExists.rows[0].exists) {
      logger.info(
        "Operations logs table does not exist. Creating operations_logs table..."
      );

      await db.query(`
        CREATE TABLE IF NOT EXISTS operations_logs (
            log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            operation_id UUID NOT NULL,
            description TEXT NOT NULL,
            create_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            step_number INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            FOREIGN KEY (operation_id) REFERENCES operations(operation_id) ON DELETE CASCADE
        );
      `);

      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_logs_operation_id ON operations_logs(operation_id);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_logs_create_date ON operations_logs(create_date);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_logs_step_number ON operations_logs(step_number);"
      );
      await db.query(
        "CREATE INDEX IF NOT EXISTS idx_operations_logs_created_at ON operations_logs(created_at);"
      );

      await db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_operations_logs_operation_step_unique 
            ON operations_logs(operation_id, step_number);
      `);

      logger.info("✅ Operations logs table and indexes created successfully!");
    } else {
      logger.info("✅ Operations logs table already exists.");
    }

    const tableInfo = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
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

    const operationsTableInfo = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'operations'
      ORDER BY ordinal_position;
    `);

    logger.info("\nOperations table structure:");
    operationsTableInfo.rows.forEach((row: any) => {
      logger.info(
        `  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    const logsTableInfo = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'operations_logs'
      ORDER BY ordinal_position;
    `);

    logger.info("\nOperations logs table structure:");
    logsTableInfo.rows.forEach((row: any) => {
      logger.info(
        `  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    const usersCountResult = await db.query("SELECT COUNT(*) FROM users");
    const operationsCountResult = await db.query(
      "SELECT COUNT(*) FROM operations"
    );
    const logsCountResult = await db.query(
      "SELECT COUNT(*) FROM operations_logs"
    );

    logger.info(`\nTotal users in database: ${usersCountResult.rows[0].count}`);
    logger.info(
      `Total operations in database: ${operationsCountResult.rows[0].count}`
    );
    logger.info(
      `Total operation logs in database: ${logsCountResult.rows[0].count}`
    );

    logger.info("\n✅ Database initialization completed successfully!");
  } catch (error) {
    logger.error("❌ Database initialization failed:", error);
    throw error;
  }
}
