export interface PoolRecommendation {
  poolId: string;
  feeTier: string;
}

export interface RecommendLiquidityPoolsParams {
  userId: string;
  isLookingForVolatilePool: boolean;
}
