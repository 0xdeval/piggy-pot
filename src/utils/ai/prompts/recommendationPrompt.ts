import { PoolInfoWithMetrics } from "@/types/metrics/poolsWithMetrics";
import { PoolRecommendation } from "@/types/ai/pools";
import { extractRelevantPoolData } from "@/utils/ai/poolDataExtractor";

/**
 * Creates a prompt for pool recommendation based on user intent
 *
 * @param pools - The pools to evaluate
 * @param isLookingForVolatilePool - Whether the user is looking for volatile pools
 * @param previousRecommendations - The previous recommendations
 * @returns The prompt
 */
export function createRecommendationPrompt(
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
