import { fetchPoolDayData } from "../subgraph/fetchPoolDayData";
import { PoolGrowthTrendResult } from "../../types/metrics/rawFormat";
import { PoolGrowthTrendLLMOutput } from "../../types/metrics/llmFormats";
import { poolGrowthTrendToLLM } from "../../utils/metrics/poolGrowthTrendToLLM";

interface PoolGrowthTrendParams {
  poolId: string;
  initialTimestamp: number;
  currentTVL: number;
}

/**
 * Calculate pool growth trend (raw data format)
 */
export async function calculatePoolGrowthTrendRaw({
  poolId,
  initialTimestamp,
  currentTVL,
}: PoolGrowthTrendParams): Promise<PoolGrowthTrendResult> {
  const history = await fetchPoolDayData(poolId, initialTimestamp);

  if (!history.length) {
    console.error("No historical data found for pool", poolId);
    return {
      poolGrowthTrendInPercentage: null,
      trend: null,
    };
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
}: PoolGrowthTrendParams): Promise<PoolGrowthTrendLLMOutput> {
  const result = await calculatePoolGrowthTrendRaw({
    poolId,
    initialTimestamp,
    currentTVL,
  });

  return poolGrowthTrendToLLM(result);
}
