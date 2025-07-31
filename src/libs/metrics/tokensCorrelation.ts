import { fetchHistoricalTokenPrice } from "@/libs/1inch/fetchHistoricalTokenPrice";
import { logger } from "@/utils/logger";
import { TokenCorrelationResult } from "@/types/metrics/rawFormat";
import { TokenCorrelationLLMOutput } from "@/types/metrics/llmFormats";
import { tokenCorrelationToLLM } from "@/utils/metrics/tokenCorrelationToLLM";

interface TokenCorrelationParams {
  chainId: number;
  token0Address: string;
  token1Address: string;
  days?: number;
}

/**
 * Calculate correlation between two tokens and impermanent loss risk (raw data format)
 *
 * @param chainId - The chain ID of the tokens
 * @param token0Address - The address of the first token
 * @param token1Address - The address of the second token
 * @param days - The number of days to calculate correlation for (default: 30)
 * @returns The correlation between the two tokens and impermanent loss risk
 */
export async function calculateTokenCorrelationRaw({
  chainId,
  token0Address,
  token1Address,
  days = 30,
}: TokenCorrelationParams): Promise<TokenCorrelationResult | null> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 86400;

  const [prices0, prices1] = await Promise.all([
    fetchHistoricalTokenPrice({
      chainId,
      tokenAddress: token0Address,
      from,
      to: now,
    }),
    fetchHistoricalTokenPrice({
      chainId,
      tokenAddress: token1Address,
      from,
      to: now,
    }),
  ]);

  if (prices0.length < 2 || prices1.length < 2) {
    logger.error("Not enough historical data to calculate correlation");
    return null;
  }

  const sortedPrices0 = prices0.sort((a, b) => a.t - b.t);
  const sortedPrices1 = prices1.sort((a, b) => a.t - b.t);

  const returns0: number[] = [];
  const returns1: number[] = [];

  for (let i = 1; i < sortedPrices0.length; i++) {
    const ret0 = Math.log(sortedPrices0[i].v / sortedPrices0[i - 1].v);
    const ret1 = Math.log(sortedPrices1[i].v / sortedPrices1[i - 1].v);
    returns0.push(ret0);
    returns1.push(ret1);
  }

  const n = returns0.length;
  const sum0 = returns0.reduce((sum, r) => sum + r, 0);
  const sum1 = returns1.reduce((sum, r) => sum + r, 0);
  const sum0Sq = returns0.reduce((sum, r) => sum + r * r, 0);
  const sum1Sq = returns1.reduce((sum, r) => sum + r * r, 0);
  const sum01 = returns0.reduce((sum, r, i) => sum + r * returns1[i], 0);

  const numerator = n * sum01 - sum0 * sum1;
  const denominator = Math.sqrt(
    (n * sum0Sq - sum0 * sum0) * (n * sum1Sq - sum1 * sum1)
  );

  const correlation = denominator !== 0 ? numerator / denominator : 0;

  return {
    correlation: Math.round(correlation * 100) / 100,
  };
}

/**
 * Calculate correlation between two tokens with LLM-friendly output format (default)
 *
 * @param chainId - The chain ID of the tokens
 * @param token0Address - The address of the first token
 * @param token1Address - The address of the second token
 * @param days - The number of days to calculate correlation for (default: 30)
 * @returns The correlation between the two tokens in LLM-friendly format
 */
export async function calculateTokenCorrelation({
  chainId,
  token0Address,
  token1Address,
  days = 30,
}: TokenCorrelationParams): Promise<TokenCorrelationLLMOutput | null> {
  const result = await calculateTokenCorrelationRaw({
    chainId,
    token0Address,
    token1Address,
    days,
  });

  if (!result) {
    return null;
  }

  const llmResult = tokenCorrelationToLLM(result);
  return llmResult;
}
