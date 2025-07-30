import { APYVolatilityLLMOutput } from "@/types/metrics/llmFormats";
import { calculateAPYVolatilityForLLM } from "@/utils/metrics/apyCalculationToLLM";
import { fetchPoolDayData } from "@/libs/subgraph/fetchPoolDayData";

/**
 * Calculate APY volatility stats from Uniswap subgraph data
 */
export async function calculateAPYVolatility({
  poolId,
  days = 30,
}: {
  poolId: string;
  days?: number;
}): Promise<APYVolatilityLLMOutput | null> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - days * 24 * 60 * 60;

  const poolDayData = await fetchPoolDayData(poolId, from);

  if (poolDayData.length < 2) {
    console.error("Not enough data for APY volatility calculation");
    return null;
  }

  const feesUSD: number[] = poolDayData.map((d) => d.feesUSD);
  const tvlUSD: number[] = poolDayData.map((d) => d.tvlUSD);

  //   console.log("feesUSD", feesUSD);
  //   console.log("tvlUSD", tvlUSD);

  if (tvlUSD.length === 0) {
    console.error("No TVL or fees data found");
    return null;
  }

  const dailyAPYs = feesUSD.map((fee, i) =>
    (tvlUSD?.[i] ?? 0) > 0 ? (fee / (tvlUSD?.[i] ?? 0)) * 365 * 100 : 0
  );

  const mean = dailyAPYs.reduce((sum, apy) => sum + apy, 0) / dailyAPYs.length;

  const variance =
    dailyAPYs.reduce((sum, apy) => sum + Math.pow(apy - mean, 2), 0) /
    (dailyAPYs.length - 1);

  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? stdDev / mean : 0;
  const calculations = { stdDev, mean, coefficientOfVariation: cv };

  const llmResult = await calculateAPYVolatilityForLLM(calculations);
  return llmResult;
}
