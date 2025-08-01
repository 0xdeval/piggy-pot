export interface PoolRecommendation {
  poolId: string;
  feeTier: string;
  token0: string;
  token1: string;
  isStablecoinPool: boolean;
  token0Decimals: number | null;
  token1Decimals: number | null;
}

export interface RecommendLiquidityPoolsParams {
  userId: string;
  isLookingForVolatilePool: boolean;
}
