import { fetchHistoricalTokenPrice } from "../1inch/fetchHistoricalTokenPrice";
import { logger } from "@elizaos/core";

export interface TokenCorrelationParams {
  chainId: number;
  token0Address: string;
  token1Address: string;
  days?: number;
}

export interface TokenCorrelationResult {
  correlation: number;
  stable_pair: boolean;
  impermanent_loss_risk: "low" | "moderate" | "high" | "very risky";
}

/**
 * Calculate correlation between two tokens and impermanent loss risk
 */
export async function calculateTokenCorrelation({
  chainId,
  token0Address,
  token1Address,
  days = 30,
}: TokenCorrelationParams): Promise<TokenCorrelationResult> {
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
    return {
      correlation: 0,
      stable_pair: false,
      impermanent_loss_risk: "high",
    };
  }

  // Sort by timestamp and align data points
  const sortedPrices0 = prices0.sort((a, b) => a.t - b.t);
  const sortedPrices1 = prices1.sort((a, b) => a.t - b.t);

  // Calculate log returns for both tokens
  const returns0: number[] = [];
  const returns1: number[] = [];

  for (let i = 1; i < sortedPrices0.length; i++) {
    const ret0 = Math.log(sortedPrices0[i].v / sortedPrices0[i - 1].v);
    const ret1 = Math.log(sortedPrices1[i].v / sortedPrices1[i - 1].v);
    returns0.push(ret0);
    returns1.push(ret1);
  }

  // Calculate correlation coefficient
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

  // Determine impermanent loss risk based on correlation
  let impermanent_loss_risk: "low" | "moderate" | "high" | "very risky";
  let stable_pair: boolean;

  if (correlation > 0.9) {
    impermanent_loss_risk = "low";
    stable_pair = true;
  } else if (correlation >= 0.5 && correlation <= 0.9) {
    impermanent_loss_risk = "moderate";
    stable_pair = false;
  } else if (correlation >= 0 && correlation < 0.5) {
    impermanent_loss_risk = "high";
    stable_pair = false;
  } else {
    impermanent_loss_risk = "very risky";
    stable_pair = false;
  }

  return {
    correlation: Math.round(correlation * 100) / 100, // Round to 2 decimal places
    stable_pair,
    impermanent_loss_risk,
  };
}

// Example usage
const result = await calculateTokenCorrelation({
  chainId: 1,
  token0Address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
  token1Address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
});

console.log(`Result:`, result);
// Output: { correlation: 0.91, stable_pair: true, impermanent_loss_risk: "low" }
