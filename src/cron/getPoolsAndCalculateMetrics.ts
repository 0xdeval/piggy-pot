import { fetchPools } from "@/libs/subgraph/fetchPools";
import { calculateImpermanentLoss } from "@/libs/metrics/impermanentLoss";
import { evaluateTokenQuality } from "@/libs/metrics/evaluateTokenQuality";
import { calculateTokenVolatility } from "@/libs/metrics/tokenPriceVolatility";
import { calculateTokenCorrelation } from "@/libs/metrics/tokensCorrelation";
import { appConfig } from "@/config";
import { calculatePoolGrowthTrend } from "@/libs/metrics/poolGrowthTrend";
import { calculateAPYVolatility } from "@/libs/metrics/apyVolatility";
import { waitFor } from "@/utils/waitFor";
import { logger } from "@/utils/logger";

/**
 * Process pools in batches to limit parallel execution
 */
async function processPoolBatch(
  pools: any[],
  startIndex: number,
  batchSize: number
) {
  const batch = pools.slice(startIndex, startIndex + batchSize);
  return Promise.all(
    batch.map(async (pool) => {
      logger.info("Pool", pool);
      if (!pool.token0 || !pool.token1) {
        logger.info("Skipping pool with null tokens", pool);
        return null;
      }

      console.log("Pool with tokens: ", pool.token0.symbol, pool.token1.symbol);

      const nowTimestamp = Math.floor(Date.now() / 1000);
      const thirtyDaysBackTimestamp = nowTimestamp - 30 * 24 * 60 * 60;

      const poolImpermanentLoss = await calculateImpermanentLoss({
        token0: pool.token0.id,
        token1: pool.token1.id,
        sinceTimestamp: thirtyDaysBackTimestamp,
        chainId: appConfig.chainId,
      });

      await waitFor(5000);

      const tokenQualityInfo = await evaluateTokenQuality(
        [pool.token0.id, pool.token1.id],
        appConfig.chainId
      );
      await waitFor(5000);

      const token0Volatility = await calculateTokenVolatility({
        chainId: appConfig.chainId,
        tokenAddress: pool.token0.id,
        days: 30,
      });

      await waitFor(5000);

      const token1Volatility = await calculateTokenVolatility({
        chainId: appConfig.chainId,
        tokenAddress: pool.token1.id,
        days: 30,
      });

      await waitFor(5000);

      const tokenCorrelation = await calculateTokenCorrelation({
        chainId: appConfig.chainId,
        token0Address: pool.token0.id,
        token1Address: pool.token1.id,
        days: 30,
      });

      await waitFor(5000);

      const poolGrowthTendencyInPercentage = await calculatePoolGrowthTrend({
        poolId: pool.id,
        initialTimestamp: thirtyDaysBackTimestamp,
        currentTVL: Number(pool.totalValueLockedUSD),
      });

      const apyVolatility = await calculateAPYVolatility({
        poolId: pool.id,
        days: 30,
      });

      return {
        pool: pool,
        tokenQuality: {
          token0: tokenQualityInfo[pool.token0.id],
          token1: tokenQualityInfo[pool.token1.id],
        },
        impermanentLoss: poolImpermanentLoss,
        tokenCorrelation,
        tokensVolatility: {
          token0: {
            tokenPriceVolatility: token0Volatility,
          },
          token1: {
            tokenPriceVolatility: token1Volatility,
          },
        },
        poolGrowthTendency: poolGrowthTendencyInPercentage,
        apyVolatility,
      };
    })
  );
}

export async function getPoolsAndCalculateMetrics() {
  logger.info("Fetching Uniswap V3 pools...");

  const pools = await fetchPools();

  const maxPools = 100;
  const maxParallelProcesses = 2;
  const poolsToProcess = pools.slice(0, maxPools);

  const allResults = [];

  for (let i = 0; i < poolsToProcess.length; i += maxParallelProcesses) {
    console.log(
      `Processing batch ${Math.floor(i / maxParallelProcesses) + 1}/${Math.ceil(poolsToProcess.length / maxParallelProcesses)}`
    );

    const batchResults = await processPoolBatch(
      poolsToProcess,
      i,
      maxParallelProcesses
    );
    allResults.push(...batchResults);

    if (i + maxParallelProcesses < poolsToProcess.length) {
      console.log("Waiting 2 seconds before next batch...");
      await waitFor(2000);
    }
  }

  const validPoolInfoWithMetrics = allResults.filter((item) => item !== null);

  return validPoolInfoWithMetrics;
}
