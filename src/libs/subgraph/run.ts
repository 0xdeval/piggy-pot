import { TOP_POOLS_PER_QUERY, TOP_TICKS_PER_POOL } from "src/config/subgraph";
import { fetchPools } from "./fetchPools";
import { calculateImpermanentLoss } from "../metrics/impermanentLoss";
import { evaluateTokenQuality } from "../metrics/evaluateTokenQuality";
import { calculateTokenVolatility } from "../metrics/tokenPriceVolatility";
import { calculateTokenCorrelation } from "../metrics/tokensCorrelation";
import { PoolInfoWithMetrics } from "../../types/metrics/poolsWithMetrics";
import fs from "fs";
import { appConfig } from "src/config";
import { calculatePoolGrowthTrend } from "../metrics/poolGrowthTrend";
import { calculateAPYVolatility } from "../metrics/apyVolatility";
import { waitFor } from "src/utils/waitFor";

async function main() {
  console.log("Fetching Uniswap V3 pools...");

  const pools = await fetchPools();

  console.log(`Found ${pools.length} pools matching criteria:`);

  const poolInfoWithMetrics = await Promise.all(
    pools.slice(0, 5).map(async (pool) => {
      console.log("Pool", pool);
      if (!pool.token0 || !pool.token1) {
        console.log("Skipping pool with null tokens", pool);
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
        pool,
        token0: tokenQualityInfo[pool.token0.id],
        token1: tokenQualityInfo[pool.token1.id],
        impermanentLoss: poolImpermanentLoss,
        tokenCorrelation,
        tokensVolatility: {
          token0: token0Volatility,
          token1: token1Volatility,
        },
        poolGrowthTendency: poolGrowthTendencyInPercentage,
        apyVolatility,
      };
    })
  );

  // Filter out null values from pools that were skipped
  const validPoolInfoWithMetrics = poolInfoWithMetrics.filter(
    (item) => item !== null
  );

  fs.writeFileSync(
    "llmFriendlyPoolMetrics.json",
    JSON.stringify(validPoolInfoWithMetrics, null, 2)
  );
}

main();
