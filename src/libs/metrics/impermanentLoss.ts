import { fetchHistoricalTokenPrice } from "../1inch/fetchHistoricalTokenPrice";

interface ImpermanentLossResult {
  impermanent_loss_percentage: number;
  price_ratio: number;
  initial_ratio: number;
  current_ratio: number;
  price_movement: {
    token0: {
      initial: number;
      current: number;
      change_percentage: number;
    };
    token1: {
      initial: number;
      current: number;
      change_percentage: number;
    };
  };
  hodl_vs_lp_comparison: {
    hodl_value: number;
    lp_value: number;
    difference: number;
  };
}

/**
 * Calculate the impermanent loss of a pool
 * @param token0 - the address of the first token
 * @param token1 - the address of the second token
 * @param initialTimestamp - the timestamp of the initial price
 * @param chainId - the chain id
 * @returns impermanent loss in percentage
 */
export async function calculateImpermanentLoss({
  token0,
  token1,
  initialTimestamp,
  chainId,
}: {
  token0: string;
  token1: string;
  initialTimestamp: number; // in seconds
  chainId: number;
}): Promise<ImpermanentLossResult> {
  const [historicalPrices0, historicalPrices1] = await Promise.all([
    fetchHistoricalTokenPrice({
      tokenAddress: token0,
      from: initialTimestamp,
      chainId,
    }),
    fetchHistoricalTokenPrice({
      tokenAddress: token1,
      from: initialTimestamp,
      chainId,
    }),
  ]);

  const prices0 = historicalPrices0.sort((a, b) => b.t - a.t);
  const prices1 = historicalPrices1.sort((a, b) => b.t - a.t);

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

calculateImpermanentLoss({
  token0: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  initialTimestamp: 1745863226, // e.g., June 1, 2024
  chainId: 1, // Ethereum
}).then((res) => {
  console.log(res);
});
