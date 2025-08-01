import { getLLMResponse } from "@/libs/openai";
import { extractJsonFromMarkdownBlock } from "@/utils/openai/extractJson";
import { PoolInfoWithMetrics } from "@/types/metrics/poolsWithMetrics";
import { logger } from "@/utils/logger";
import { waitFor } from "@/utils/waitFor";
import { getPoolsFromDatabase } from "./getPools";
import {
  PoolRecommendation,
  RecommendLiquidityPoolsParams,
} from "@/types/ai/pools";
import { createRecommendationPrompt } from "@/utils/ai/prompts/recommendationPrompt";

/**
 * Processes pools in batches and gets LLM recommendations
 *
 * @param pools - The pools to evaluate
 * @param isLookingForVolatilePool - Whether the user is looking for volatile pools
 * @param previousRecommendations - The previous recommendations
 * @returns The recommendations
 */
async function processBatchWithLLM(
  pools: PoolInfoWithMetrics[],
  isLookingForVolatilePool: boolean,
  previousRecommendations: PoolRecommendation[] = []
): Promise<PoolRecommendation[]> {
  const prompt = createRecommendationPrompt(
    pools,
    isLookingForVolatilePool,
    previousRecommendations
  );

  const llmResponse = await getLLMResponse(prompt);

  if (!llmResponse.success || !llmResponse.data) {
    logger.error("LLM response failed:", llmResponse.error);
    return previousRecommendations;
  }

  const extractedJson = extractJsonFromMarkdownBlock(llmResponse.data);

  if (!extractedJson || !Array.isArray(extractedJson)) {
    logger.error("Failed to extract valid JSON from LLM response");
    return previousRecommendations;
  }

  return extractedJson as PoolRecommendation[];
}

/**
 * Recommends liquidity pools based on user intent
 *
 * @param userId - The user ID
 * @param isLookingForVolatilePool - Whether the user is looking for volatile pools
 * @returns The recommendations
 */
export async function recommendLiquidityPools({
  userId,
  isLookingForVolatilePool,
}: RecommendLiquidityPoolsParams): Promise<PoolRecommendation[]> {
  logger.recommendation(`Starting pool recommendations`, {
    userId,
    isLookingForVolatilePool,
  });

  let poolsWithMetrics = await getPoolsFromDatabase();

  if (!poolsWithMetrics || poolsWithMetrics.length === 0) {
    logger.error("No pools with metrics found", null, { userId });
    return [];
  }

  // CURRENTLY POOLS ARE LIMITED TO 20 POOLS TO AVOID HIGH SPENDS ON LLM CALLS
  // TODO: Optimize this part to use all pools and spend less on LLM calls
  poolsWithMetrics = poolsWithMetrics.slice(0, 20);

  let filteredPools: PoolInfoWithMetrics[];

  if (isLookingForVolatilePool) {
    filteredPools = poolsWithMetrics;
  } else {
    filteredPools = poolsWithMetrics.filter(
      (pool: PoolInfoWithMetrics) => pool.pool.isStablecoinPool
    );
  }

  if (filteredPools.length === 0) {
    logger.error(`No pools found matching criteria`, null, {
      userId,
      isLookingForVolatilePool,
    });
    return [];
  }

  logger.recommendation(`Processing ${filteredPools.length} pools in batches`, {
    userId,
    poolCount: filteredPools.length,
  });

  const batchSize = 10;
  const maxRecommendations = isLookingForVolatilePool ? 2 : 1;
  let currentRecommendations: PoolRecommendation[] = [];

  for (let i = 0; i < filteredPools.length; i += batchSize) {
    const batch = filteredPools.slice(i, i + batchSize);
    logger.debug(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filteredPools.length / batchSize)}`,
      {
        userId,
        batchNumber: Math.floor(i / batchSize) + 1,
        totalBatches: Math.ceil(filteredPools.length / batchSize),
        currentRecommendations: currentRecommendations.length,
      }
    );

    const batchRecommendations = await processBatchWithLLM(
      batch,
      isLookingForVolatilePool,
      currentRecommendations
    );

    currentRecommendations = batchRecommendations;

    if (i + batchSize < filteredPools.length) {
      logger.debug("Waiting 1 second before next batch...", { userId });
      await waitFor(1000);
    }
  }

  const finalResults = currentRecommendations.slice(0, maxRecommendations);

  logger.recommendation(`Final recommendations generated`, {
    userId,
    recommendations: finalResults,
    totalPoolsEvaluated: filteredPools.length,
  });

  return finalResults;
}
