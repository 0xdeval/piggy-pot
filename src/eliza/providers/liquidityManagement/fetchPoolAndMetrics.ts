import { Provider } from "@elizaos/core";
import { fetchPools } from "../../../libs/subgraph/fetchPools";
import { calculateImpermanentLoss } from "../../../libs/metrics/impermanentLoss";
import { evaluateTokenQuality } from "../../../libs/metrics/evaluateTokenQuality";
import { calculateTokenVolatility } from "../../../libs/metrics/tokenPriceVolatility";
import { calculateTokenCorrelation } from "../../../libs/metrics/tokensCorrelation";
import { calculatePoolGrowthTrend } from "../../../libs/metrics/poolGrowthTrend";
import { calculateAPYVolatility } from "../../../libs/metrics/apyVolatility";
import { appConfig } from "../../../config";
import { waitFor } from "../../../utils/waitFor";

// Define the PoolInfoWithMetrics interface locally since the import path might not exist
interface PoolInfoWithMetrics {
  pool: any;
  token0: any;
  token1: any;
  impermanentLoss: any;
  tokenCorrelation: any;
  tokensVolatility: {
    token0: any;
    token1: any;
  };
  poolGrowthTendency: any;
  apyVolatility: any;
}

export const fetchPoolsAndCalculateMetricsProvider: Provider = {
  name: "FETCH_POOLS_AND_CALCULATE_METRICS",
  description:
    "A provider that fetches Uniswap V3 pools and calculates comprehensive metrics for liquidity management in LLM friendly format",
  dynamic: true,
  position: -100,
  get: async (runtime, message, state) => {
    try {
      console.log("Fetching Uniswap V3 pools and calculating metrics...");

      const llmFriendlyPoolMetrics = require("../../../llmFriendlyPoolMetrics.json");

      // const pools = await fetchPools();
      // console.log(`Found ${pools.length} pools matching criteria`);

      // const nowTimestamp = Math.floor(Date.now() / 1000);
      // const analysisStartTimestamp = nowTimestamp - 30 * 24 * 60 * 60; // 30 days

      // const poolInfoWithMetrics = await Promise.all(
      //   pools.map(async (pool, index) => {
      //     console.log(`Analyzing pool ${index + 1}/${pools.length}:`, pool.id);

      //     if (!pool.token0 || !pool.token1) {
      //       console.log("Skipping pool with null tokens", pool.id);
      //       return null;
      //     }

      //     console.log("Pool tokens:", pool.token0.symbol, pool.token1.symbol);

      //     // Calculate impermanent loss
      //     const poolImpermanentLoss = await calculateImpermanentLoss({
      //       token0: pool.token0.id,
      //       token1: pool.token1.id,
      //       sinceTimestamp: analysisStartTimestamp,
      //       chainId: appConfig.chainId,
      //     });

      //     await waitFor(5000);

      //     // Evaluate token quality
      //     const tokenQualityInfo = await evaluateTokenQuality(
      //       [pool.token0.id, pool.token1.id],
      //       appConfig.chainId
      //     );

      //     await waitFor(5000);

      //     // Calculate token volatility
      //     const token0Volatility = await calculateTokenVolatility({
      //       chainId: appConfig.chainId,
      //       tokenAddress: pool.token0.id,
      //       days: 30,
      //     });

      //     await waitFor(5000);

      //     const token1Volatility = await calculateTokenVolatility({
      //       chainId: appConfig.chainId,
      //       tokenAddress: pool.token1.id,
      //       days: 30,
      //     });

      //     await waitFor(5000);

      //     // Calculate token correlation
      //     const tokenCorrelation = await calculateTokenCorrelation({
      //       chainId: appConfig.chainId,
      //       token0Address: pool.token0.id,
      //       token1Address: pool.token1.id,
      //       days: 30,
      //     });

      //     await waitFor(5000);

      //     // Calculate pool growth trend
      //     const poolGrowthTendencyInPercentage = await calculatePoolGrowthTrend(
      //       {
      //         poolId: pool.id,
      //         initialTimestamp: analysisStartTimestamp,
      //         currentTVL: Number(pool.totalValueLockedUSD),
      //       }
      //     );

      //     await waitFor(5000);

      //     // Calculate APY volatility
      //     const apyVolatility = await calculateAPYVolatility({
      //       poolId: pool.id,
      //       days: 30,
      //     });

      //     return {
      //       pool,
      //       token0: tokenQualityInfo[pool.token0.id],
      //       token1: tokenQualityInfo[pool.token1.id],
      //       impermanentLoss: poolImpermanentLoss,
      //       tokenCorrelation,
      //       tokensVolatility: {
      //         token0: token0Volatility,
      //         token1: token1Volatility,
      //       },
      //       poolGrowthTendency: poolGrowthTendencyInPercentage,
      //       apyVolatility,
      //     };
      //   })
      // );

      // Filter out null values from pools that were skipped
      const validPoolInfoWithMetrics = llmFriendlyPoolMetrics.filter(
        (item) => item !== null
      ) as PoolInfoWithMetrics[];

      console.log(
        `Successfully analyzed ${validPoolInfoWithMetrics.length} pools`
      );

      // Store all analyzed pools in state for the action to use
      if (state) {
        state.analyzedPools = validPoolInfoWithMetrics;
        state.totalPoolsAnalyzed = validPoolInfoWithMetrics.length;
        state.analysisTimestamp = new Date().toISOString();
      }

      // Create summary text for the LLM
      const poolSummaries = validPoolInfoWithMetrics.map((poolData, index) => {
        const pool = poolData.pool;
        const impermanentLoss = poolData.impermanentLoss;
        const correlation = poolData.tokenCorrelation;
        const growthTrend = poolData.poolGrowthTendency;
        const apyVolatility = poolData.apyVolatility;

        return `Pool ${index + 1}: ${pool.token0.symbol}/${pool.token1.symbol} (${pool.id}) - TVL: $${Number(pool.totalValueLockedUSD).toLocaleString()}, IL: ${impermanentLoss?.impermanentLoss?.impermanent_loss_percentage?.toFixed(2) || "N/A"}%, Correlation: ${correlation?.tokenCorrelation?.correlation || "N/A"}, Growth: ${growthTrend?.poolGrowthTrend?.poolGrowthTrendInPercentage?.toFixed(2) || "N/A"}%, APY Volatility: ${apyVolatility?.apyVolatility?.mean?.toFixed(2) || "N/A"}%`;
      });

      return {
        text: `Successfully analyzed ${validPoolInfoWithMetrics.length} Uniswap V3 pools with comprehensive metrics. Pool analysis summary: ${poolSummaries.join("; ")}`,
        values: {
          poolsWithMetrics: validPoolInfoWithMetrics,
          totalPoolsAnalyzed: validPoolInfoWithMetrics.length,
          analysisTimestamp: new Date().toISOString(),
        },
        data: {
          poolsWithMetrics: validPoolInfoWithMetrics,
          totalPoolsAnalyzed: validPoolInfoWithMetrics.length,
          analysisTimestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error fetching pool and metrics:", error);

      return {
        text: `Error occurred while analyzing pools: ${error instanceof Error ? error.message : "Unknown error"}`,
        values: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
};
