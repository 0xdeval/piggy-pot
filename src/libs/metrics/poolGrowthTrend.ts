import { fetchPoolDayData } from "@/libs/subgraph/fetchPoolDayData";
import { PoolGrowthTrendResult } from "@/types/metrics/rawFormat";
import { PoolGrowthTrendLLMOutput } from "@/types/metrics/llmFormats";
import { poolGrowthTrendToLLM } from "@/utils/metrics/poolGrowthTrendToLLM";
import { logger } from "@/utils/logger";

interface PoolGrowthTrendParams {
  poolId: string;
  initialTimestamp: number;
  currentTVL: number;
}

/**
 * Calculate pool growth trend (raw data format)
 *
 * @param poolId - The ID of the pool to calculate pool growth trend for
 * @param initialTimestamp - The timestamp of the initial price (in seconds)
 * @param currentTVL - The current TVL of the pool
 * @returns The pool growth trend in percentage
 */
export async function calculatePoolGrowthTrendRaw({
  poolId,
  initialTimestamp,
  currentTVL,
}: PoolGrowthTrendParams): Promise<PoolGrowthTrendResult | null> {
  const history = await fetchPoolDayData(poolId, initialTimestamp);

  if (!history.length) {
    logger.error("No historical data found for pool", poolId);
    return null;
  }

  const initial = history[0];
  const totalFees = history.reduce((sum, day) => sum + Number(day.feesUSD), 0);
  const initialTVL = Number(initial?.tvlUSD);
  const finalTVL = currentTVL;

  const poolGrowthTrendInPercentage =
    ((finalTVL - initialTVL + totalFees) / initialTVL) * 100;
  return {
    poolGrowthTrendInPercentage,
    trend: poolGrowthTrendInPercentage >= 0 ? "positive" : "negative",
  };
}

/**
 * Calculate pool growth trend with LLM-friendly output format (default)
 */
export async function calculatePoolGrowthTrend({
  poolId,
  initialTimestamp,
  currentTVL,
}: PoolGrowthTrendParams): Promise<PoolGrowthTrendLLMOutput | null> {
  const result = await calculatePoolGrowthTrendRaw({
    poolId,
    initialTimestamp,
    currentTVL,
  });

  if (!result) {
    return null;
  }

  const llmResult = poolGrowthTrendToLLM(result);
  return llmResult;
}
