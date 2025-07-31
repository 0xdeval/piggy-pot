import { fetchHistoricalTokenPrice } from "../1inch/fetchHistoricalTokenPrice";
import { logger } from "@/utils/logger";
import { TokenVolatilityResult } from "@/types/metrics/rawFormat";
import { TokenPriceVolatilityLLMOutput } from "@/types/metrics/llmFormats";
import { tokenPriceVolatilityToLLM } from "@/utils/metrics/tokenPriceVolatilityToLLM";

interface TokenVolatilityParams {
  chainId: number;
  tokenAddress: string;
  days?: number;
}

/**
 * Calculate annualized volatility and impermanent loss risk (raw data format)
 *
 * @param chainId - The chain ID of the token
 * @param tokenAddress - The address of the token
 * @param days - The number of days to calculate volatility for (default: 30)
 * @returns The volatility and impermanent loss risk
 */
export async function calculateTokenVolatilityRaw({
  chainId,
  tokenAddress,
  days = 30,
}: TokenVolatilityParams): Promise<TokenVolatilityResult> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 86400;

  const prices = await fetchHistoricalTokenPrice({
    chainId,
    tokenAddress,
    from,
    to: now,
  });

  if (prices.length < 2) {
    logger.error("Not enough historical data to calculate volatility");
    return {
      volatilityInPercentage: 0,
      isStableAsset: true,
      impermanentLossRisk: "very low",
    };
  }

  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const ret = Math.log(prices[i]?.v / prices[i - 1]?.v);
    logReturns.push(ret);
  }

  const mean = logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;
  const variance =
    logReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
    (logReturns.length - 1);

  const dailyStd = Math.sqrt(variance);
  const annualizedVol = dailyStd * Math.sqrt(365) * 100;

  let impermanentLossRisk: "very low" | "moderate" | "high" | "very volatile";
  let isStableAsset: boolean;

  if (annualizedVol < 5) {
    impermanentLossRisk = "very low";
    isStableAsset = true;
  } else if (annualizedVol >= 5 && annualizedVol < 20) {
    impermanentLossRisk = "moderate";
    isStableAsset = false;
  } else if (annualizedVol >= 20 && annualizedVol < 50) {
    impermanentLossRisk = "high";
    isStableAsset = false;
  } else {
    impermanentLossRisk = "very volatile";
    isStableAsset = false;
  }

  return {
    volatilityInPercentage: annualizedVol,
    isStableAsset,
    impermanentLossRisk,
  };
}

/**
 * Calculate annualized volatility and impermanent loss risk with LLM-friendly output format (default)
 *
 * @param chainId - The chain ID of the token
 * @param tokenAddress - The address of the token
 * @param days - The number of days to calculate volatility for (default: 30)
 * @returns The volatility and impermanent loss risk in LLM-friendly format
 */
export async function calculateTokenVolatility({
  chainId,
  tokenAddress,
  days = 30,
}: TokenVolatilityParams): Promise<TokenPriceVolatilityLLMOutput | null> {
  const result = await calculateTokenVolatilityRaw({
    chainId,
    tokenAddress,
    days,
  });

  const llmResult = tokenPriceVolatilityToLLM(result);
  return llmResult;
}
