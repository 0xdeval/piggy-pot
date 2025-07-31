import { PoolModel } from "@/libs/database/models/poolModel";
import { PoolInfoWithMetrics } from "@/types/metrics/poolsWithMetrics";
import { logger } from "@/utils/logger";

/**
 * Fetches pools data from the database
 *
 * @returns The pools data or null if no data exists in the database
 */
export async function getPoolsFromDatabase(): Promise<
  PoolInfoWithMetrics[] | null
> {
  try {
    logger.info("Fetching pools data from database...");

    const result = await PoolModel.findAll();

    if (!result.success) {
      logger.error("Failed to fetch pools from database:", result.error);
      return null;
    }

    if (!result.data || result.data.length === 0) {
      logger.warn("No pools data found in database");
      return null;
    }

    const poolsWithMetrics: PoolInfoWithMetrics[] = result.data.map((pool) => ({
      pool: {
        id: pool.poolId,
        token0: {
          ...pool.poolInfo.token0,
          decimals: Number(pool.poolInfo.token0.decimals),
        },
        token1: {
          ...pool.poolInfo.token1,
          decimals: Number(pool.poolInfo.token1.decimals),
        },
        feeTier: pool.poolInfo.feeTier,
        liquidity: pool.poolInfo.liquidity || "0",
        totalValueLockedUSD: pool.poolInfo.totalValueLockedUSD,
        isStablecoinPool: pool.poolInfo.isStablecoinPool,
      },
      tokenQuality: pool.tokenQuality || { token0: null, token1: null },
      impermanentLoss: pool.impermanentLoss,
      tokenCorrelation: pool.tokenCorrelation,
      tokensVolatility: pool.tokensVolatility || {
        token0: { tokenPriceVolatility: null },
        token1: { tokenPriceVolatility: null },
      },
      poolGrowthTendency: pool.poolGrowthTendency,
      apyVolatility: pool.apyVolatility,
    }));

    logger.info(
      `Successfully fetched ${poolsWithMetrics.length} pools from database`
    );
    return poolsWithMetrics;
  } catch (error) {
    logger.error("Error fetching pools from database:", error);
    return null;
  }
}
