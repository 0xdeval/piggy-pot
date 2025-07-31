import { getPoolsAndCalculateMetrics } from "@/processors/liquidityManagement/getPoolsAndCalculateMetrics";
import { PoolModel } from "@/libs/database/models/poolModel";
import { CreatePool } from "@/types/database/pool";
import { logger } from "@/utils/logger";
import { waitFor } from "@/utils/waitFor";

/**
 * Fetches pools with metrics and updates the PostgreSQL database
 */
export async function fetchAndUpdatePoolsInDatabase() {
  try {
    logger.info("Starting pool fetch and database update process...");

    // Fetch pools and calculate metrics
    const poolsWithMetrics = await getPoolsAndCalculateMetrics();

    if (!poolsWithMetrics || poolsWithMetrics.length === 0) {
      logger.warn("No pools with metrics found to update in database");
      return {
        success: false,
        error: "No pools with metrics found",
        updatedCount: 0,
      };
    }

    logger.info(
      `Found ${poolsWithMetrics.length} pools with metrics to update in database`
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each pool and upsert to database
    for (const poolData of poolsWithMetrics) {
      try {
        // Transform the data to match the CreatePool type with null checks
        const createPoolData: CreatePool = {
          poolId: poolData.pool.id,
          poolInfo: poolData.pool,
          tokenQuality: {
            token0: poolData.tokenQuality.token0,
            token1: poolData.tokenQuality.token1,
          },
          impermanentLoss: poolData.impermanentLoss,
          tokenCorrelation: poolData.tokenCorrelation,
          tokensVolatility: poolData.tokensVolatility,
          poolGrowthTendency: poolData.poolGrowthTendency,
          apyVolatility: poolData.apyVolatility,
        };

        // Upsert the pool data to database
        const result = await PoolModel.upsert(createPoolData);

        if (result.success) {
          successCount++;
          logger.info(
            `Successfully upserted pool ${poolData.pool.id} to database`
          );
        } else {
          errorCount++;
          const errorMsg = `Failed to upsert pool ${poolData.pool.id}: ${result.error}`;
          errors.push(errorMsg);
          logger.error(errorMsg);
        }

        // Add a small delay between database operations to avoid overwhelming the database
        await waitFor(100);
      } catch (error) {
        errorCount++;
        const errorMsg = `Error processing pool ${poolData.pool.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    logger.info(
      `Database update completed. Success: ${successCount}, Errors: ${errorCount}`
    );

    return {
      success: errorCount === 0,
      updatedCount: successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const errorMsg = `Error in fetchAndUpdatePoolsInDatabase: ${error instanceof Error ? error.message : "Unknown error"}`;
    logger.error(errorMsg);
    return {
      success: false,
      error: errorMsg,
      updatedCount: 0,
    };
  }
}

/**
 * Runs the pool update process with retry logic
 */
export async function runPoolUpdateWithRetry(maxRetries: number = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.info(`Starting pool update attempt ${attempt}/${maxRetries}`);

    const result = await fetchAndUpdatePoolsInDatabase();

    if (result.success) {
      logger.info(`Pool update completed successfully on attempt ${attempt}`);
      return result;
    } else {
      logger.warn(`Pool update failed on attempt ${attempt}: ${result.error}`);

      if (attempt < maxRetries) {
        const delay = attempt * 5000; // Exponential backoff: 5s, 10s, 15s
        logger.info(`Waiting ${delay}ms before retry...`);
        await waitFor(delay);
      }
    }
  }

  logger.error(`Pool update failed after ${maxRetries} attempts`);
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts`,
    updatedCount: 0,
  };
}
