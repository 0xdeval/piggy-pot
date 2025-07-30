import { getPoolsAndCalculateMetrics } from "./getPoolsAndCalculateMetrics";
import { getLLMResponse } from "@/libs/openai";
import { extractJsonFromMarkdownBlock } from "@/utils/openai/extractJson";
import { PoolInfoWithMetrics } from "@/types/metrics/poolsWithMetrics";
import { extractRelevantPoolData } from "@/utils/ai/poolDataExtractor";
import { logger } from "@/utils/logger";
import fs from "fs";
import { waitFor } from "@/utils/waitFor";

interface PoolRecommendation {
  poolId: string;
  feeTier: string;
}

interface RecommendLiquidityPoolsParams {
  userId: string;
  isLookingForVolatilePool: boolean;
}

/**
 * Creates a prompt for pool recommendation based on user intent
 */
function createRecommendationPrompt(
  pools: PoolInfoWithMetrics[],
  isLookingForVolatilePool: boolean,
  previousRecommendations: PoolRecommendation[] = []
): string {
  const intent = isLookingForVolatilePool
    ? "to find 2 pools: one stablecoin pool (both tokens are stablecoins) and one volatile pool (at least one token is volatile)"
    : "to find the best stablecoin pool (both tokens should be stablecoins)";

  const previousSelectionsText =
    previousRecommendations.length > 0
      ? JSON.stringify(previousRecommendations, null, 2)
      : "(none yet)";

  // Extract only relevant data for LLM
  const relevantPoolData = extractRelevantPoolData(pools);

  return `
You are an expert DeFi LP advisor.
A user wants ${intent}.

${
  previousSelectionsText === "(none yet)"
    ? "Here are pools to evaluate for initial recommendations:"
    : "Here are additional pools to evaluate. Compare them against your current top picks:"
}

Current top recommendations:
${previousSelectionsText}

New pools to evaluate:
\`\`\`json
${JSON.stringify(relevantPoolData, null, 2)}
\`\`\`

${
  previousSelectionsText === "(none yet)"
    ? "Select the best pools from this batch based on the metrics."
    : "Compare these new pools against your current top picks and select the absolute best ones overall."
}

IMPORTANT RULES:
${
  isLookingForVolatilePool
    ? `1. Return EXACTLY 2 pools: one stablecoin pool and one volatile pool
2. For stablecoin pool: both tokens must be stablecoins (USDC, USDT, DAI, etc.). For the simplicity you can use isStablecoinPool field from the pool object
3. For volatile pool: at least one token should be volatile (not a stablecoin). For the simplicity you can use isStablecoinPool field from the pool object
4. Consider metrics like impermanent loss, token quality, volatility, and correlation`
    : `1. Return EXACTLY 1 pool: the best stablecoin pool
2. Both tokens must be stablecoins (USDC, USDT, DAI, etc.). For the simplicity you can use isStablecoinPool field from the pool object
3. Consider metrics like impermanent loss, token quality, and pool stability`
}

IMPORTANT: You must return ONLY a JSON array with the exact format below. Do not include any other text, explanations, or markdown formatting.

Return this exact JSON structure:
\`\`\`json
[
  {
    "poolId": "0x...",
    "feeTier": "500"
  }
]
\`\`\`

Rules:
1. Return ONLY the JSON array - no other text
2. Use the exact field names: "poolId" and "feeTier"
3. poolId should be the pool's ID from the data
4. feeTier should be the pool's fee tier (e.g., "500", "3000", "10000")
5. ${isLookingForVolatilePool ? "Select exactly 2 pools" : "Select exactly 1 pool"}
6. Do not include any explanations, markdown, or additional text
7. Compare new pools against current top picks and select the absolute best ones overall
`;
}

/**
 * Processes pools in batches and gets LLM recommendations
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
    console.error("LLM response failed:", llmResponse.error);
    return previousRecommendations;
  }

  const extractedJson = extractJsonFromMarkdownBlock(llmResponse.data);

  if (!extractedJson || !Array.isArray(extractedJson)) {
    console.error("Failed to extract valid JSON from LLM response");
    return previousRecommendations;
  }

  return extractedJson as PoolRecommendation[];
}

/**
 * Recommends liquidity pools based on user intent
 */
export async function recommendLiquidityPools({
  userId,
  isLookingForVolatilePool,
}: RecommendLiquidityPoolsParams): Promise<PoolRecommendation[]> {
  logger.recommendation(`Starting pool recommendations`, {
    userId,
    isLookingForVolatilePool,
  });

  // Get all pools with metrics
  //   const poolsWithMetrics: PoolInfoWithMetrics[] =
  //     await getPoolsAndCalculateMetrics();

  const poolsWithMetrics = JSON.parse(
    fs.readFileSync("examples/llmFriendlyPoolMetrics.json", "utf8")
  );

  if (!poolsWithMetrics || poolsWithMetrics.length === 0) {
    logger.error("No pools with metrics found", null, { userId });
    return [];
  }

  // Filter pools based on user intent
  let filteredPools: PoolInfoWithMetrics[];

  if (isLookingForVolatilePool) {
    // For volatile pools, we want both stablecoin and non-stablecoin pools
    filteredPools = poolsWithMetrics;
  } else {
    // For non-volatile pools, we only want stablecoin pools
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

  // Process pools in batches to avoid overwhelming the LLM
  const batchSize = 10;
  const maxRecommendations = isLookingForVolatilePool ? 2 : 1;
  let currentRecommendations: PoolRecommendation[] = [];

  // Process all pools in batches, maintaining the best recommendations so far
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

    // Evaluate this batch against current best recommendations
    const batchRecommendations = await processBatchWithLLM(
      batch,
      isLookingForVolatilePool,
      currentRecommendations
    );

    // Update current recommendations with the best ones found so far
    currentRecommendations = batchRecommendations;

    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < filteredPools.length) {
      logger.debug("Waiting 1 second before next batch...", { userId });
      await waitFor(1000);
    }
  }

  // Ensure we return the correct number of recommendations
  const finalResults = currentRecommendations.slice(0, maxRecommendations);

  logger.recommendation(`Final recommendations generated`, {
    userId,
    recommendations: finalResults,
    totalPoolsEvaluated: filteredPools.length,
  });

  return finalResults;
}
