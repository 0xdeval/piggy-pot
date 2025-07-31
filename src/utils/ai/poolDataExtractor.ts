import { PoolInfoWithMetrics } from "@/types/metrics/poolsWithMetrics";

/**
 * Extracts only the relevant fields for LLM decision-making
 *
 * @param pools - The pools to extract data from
 * @returns The extracted data
 */
export function extractRelevantPoolData(pools: PoolInfoWithMetrics[]) {
  return pools.map((pool) => ({
    poolId: pool.pool.id,
    feeTier: pool.pool.feeTier,
    token0Symbol: pool.pool.token0.symbol,
    token1Symbol: pool.pool.token1.symbol,
    isStablecoinPool: pool.pool.isStablecoinPool,
    totalValueLockedUSD: pool.pool.totalValueLockedUSD,
    liquidity: pool.pool.liquidity,
    impermanentLoss: pool.impermanentLoss
      ? {
          impermanent_loss_percentage:
            pool.impermanentLoss.impermanent_loss_percentage,
          impact: pool.impermanentLoss.impact,
          recommendation: pool.impermanentLoss.recommendation,
        }
      : null,
    tokenQuality: {
      token0: pool.tokenQuality.token0
        ? {
            qualityScore: pool.tokenQuality.token0.qualityScore,
            trustworthiness: pool.tokenQuality.token0.trustworthiness,
          }
        : null,
      token1: pool.tokenQuality.token1
        ? {
            qualityScore: pool.tokenQuality.token1.qualityScore,
            trustworthiness: pool.tokenQuality.token1.trustworthiness,
          }
        : null,
    },
    tokenCorrelation: pool.tokenCorrelation
      ? {
          relationship: pool.tokenCorrelation.relationship,
          recommendation: pool.tokenCorrelation.recommendation,
        }
      : null,
    tokensVolatility: {
      token0: {
        volatilityLevel:
          pool.tokensVolatility.token0.tokenPriceVolatility?.volatilityLevel ||
          null,
        recommendation:
          pool.tokensVolatility.token0.tokenPriceVolatility?.recommendation ||
          null,
      },
      token1: {
        volatilityLevel:
          pool.tokensVolatility.token1.tokenPriceVolatility?.volatilityLevel ||
          null,
        recommendation:
          pool.tokensVolatility.token1.tokenPriceVolatility?.recommendation ||
          null,
      },
    },
    poolGrowthTendency: pool.poolGrowthTendency
      ? {
          poolGrowthTrendInPercentage:
            pool.poolGrowthTendency.poolGrowthTrendInPercentage,
          trend: pool.poolGrowthTendency.trend,
          performance: pool.poolGrowthTendency.performance,
          recommendation: pool.poolGrowthTendency.recommendation,
        }
      : null,
    apyVolatility: pool.apyVolatility
      ? {
          stabilityScore: pool.apyVolatility.stabilityScore,
          riskLevel: pool.apyVolatility.riskLevel,
        }
      : null,
  }));
}
