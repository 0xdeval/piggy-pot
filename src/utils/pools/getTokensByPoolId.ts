import { PoolRecommendation } from "@/types/ai/pools";
import { PoolModel } from "@/libs/database/models/poolModel";
import { logger } from "@/utils/logger";

/**
 * Fetches token information for recommended pools
 *
 * @param poolIds - Array of pool IDs to fetch token information for
 * @returns Array of pool recommendations with token information
 */
export async function fetchTokenInfoForPools(
  poolIds: string[]
): Promise<PoolRecommendation[]> {
  const recommendations: PoolRecommendation[] = [];

  for (const poolId of poolIds) {
    try {
      const poolResult = await PoolModel.findByPoolId(poolId);

      if (poolResult.success && poolResult.data) {
        const poolInfo = poolResult.data.poolInfo;
        recommendations.push({
          poolId,
          feeTier: poolInfo.feeTier,
          token0Symbol: poolInfo.token0.symbol,
          token1Symbol: poolInfo.token1.symbol,
          token0Name: poolInfo.token0.name,
          token1Name: poolInfo.token1.name,
          token0: poolInfo.token0.id,
          token1: poolInfo.token1.id,
          token0Decimals: Number(poolInfo.token0.decimals),
          token1Decimals: Number(poolInfo.token1.decimals),
          isStablecoinPool: poolInfo.isStablecoinPool,
        });
      } else {
        logger.warn(`Failed to fetch pool info for poolId: ${poolId}`, {
          error: poolResult.error,
        });
        // Add a fallback with just the poolId if we can't fetch the info
        recommendations.push({
          poolId,
          feeTier: "unknown",
          token0Symbol: "unknown",
          token1Symbol: "unknown",
          token0Name: "unknown",
          token1Name: "unknown",
          token0: "unknown",
          token1: "unknown",
          token0Decimals: null,
          token1Decimals: null,
          isStablecoinPool: false,
        });
      }
    } catch (error) {
      logger.error(`Error fetching token info for poolId: ${poolId}`, error);
      // Add a fallback with just the poolId if we can't fetch the info
      recommendations.push({
        poolId,
        feeTier: "unknown",
        token0Symbol: "unknown",
        token1Symbol: "unknown",
        token0Name: "unknown",
        token1Name: "unknown",
        token0: "unknown",
        token1: "unknown",
        isStablecoinPool: false,
        token0Decimals: null,
        token1Decimals: null,
      });
    }
  }

  return recommendations;
}
