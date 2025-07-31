import { fetchHistoricalTokenPrice } from "@/libs/1inch/fetchHistoricalTokenPrice";
import { ImpermanentLossResult } from "@/types/metrics/rawFormat";
import { ImpermanentLossLLMOutput } from "@/types/metrics/llmFormats";
import { impermanentLossToLLM } from "@/utils/metrics/impermanentLossToLLM";
import { logger } from "@/utils/logger";

/**
 * Calculate the impermanent loss of a pool (raw data format)
 *
 * @param token0 - the address of the first token
 * @param token1 - the address of the second token
 * @param sinceTimestamp - the timestamp of the initial price (in seconds)
 * @param chainId - the chain id
 * @returns impermanent loss in percentage
 */
export async function calculateImpermanentLossRaw({
  token0,
  token1,
  sinceTimestamp,
  chainId,
}: {
  token0: string;
  token1: string;
  sinceTimestamp: number; // in seconds
  chainId: number;
}): Promise<ImpermanentLossResult | null> {
  const [historicalPrices0, historicalPrices1] = await Promise.all([
    fetchHistoricalTokenPrice({
      tokenAddress: token0,
      from: sinceTimestamp,
      chainId,
    }),
    fetchHistoricalTokenPrice({
      tokenAddress: token1,
      from: sinceTimestamp,
      chainId,
    }),
  ]);

  const prices0 = historicalPrices0.sort((a, b) => b.t - a.t);
  const prices1 = historicalPrices1.sort((a, b) => b.t - a.t);

  if (prices0.length === 0 || prices1.length === 0) {
    return null;
  }

  const initialPrice0 = prices0[0].v;
  const initialPrice1 = prices1[0].v;

  const currentPrice0 = prices0[prices0.length - 1].v;
  const currentPrice1 = prices1[prices1.length - 1].v;

  const initialRatio = initialPrice0 / initialPrice1;
  const currentRatio = currentPrice0 / currentPrice1;

  const priceRatio = currentRatio / initialRatio;
  const sqrtRatio = Math.sqrt(priceRatio);

  const il = (2 * sqrtRatio) / (1 + priceRatio) - 1;

  const ilPercentage = il * 100;

  return {
    impermanent_loss_percentage: ilPercentage,
    price_ratio: priceRatio,
    initial_ratio: initialRatio,
    current_ratio: currentRatio,
    price_movement: {
      token0: {
        initial: initialPrice0,
        current: currentPrice0,
        change_percentage:
          ((currentPrice0 - initialPrice0) / initialPrice0) * 100,
      },
      token1: {
        initial: initialPrice1,
        current: currentPrice1,
        change_percentage:
          ((currentPrice1 - initialPrice1) / initialPrice1) * 100,
      },
    },
    hodl_vs_lp_comparison: {
      hodl_value: 1,
      lp_value: 1 + il,
      difference: il,
    },
  };
}

/**
 * Calculate impermanent loss with LLM-friendly output format (default)
 */
export async function calculateImpermanentLoss({
  token0,
  token1,
  sinceTimestamp,
  chainId,
}: {
  token0: string;
  token1: string;
  sinceTimestamp: number;
  chainId: number;
}): Promise<ImpermanentLossLLMOutput | null> {
  const result = await calculateImpermanentLossRaw({
    token0,
    token1,
    sinceTimestamp,
    chainId,
  });

  if (!result) {
    logger.error(
      "Unable to calculate impermanent loss - insufficient price data"
    );
    return null;
  }

  const llmResult = impermanentLossToLLM(result);
  return llmResult;
}
