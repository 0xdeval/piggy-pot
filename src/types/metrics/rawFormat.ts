export interface ImpermanentLossResult {
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

export interface TokenQualityInfo {
  [address: string]: {
    hasInProviders: boolean;
    hasInternalTags: boolean;
    hasEip2612: boolean;
    rating: number;
  };
}

export interface TokenVolatilityResult {
  volatilityInPercentage: number;
  isStableAsset: boolean;
  impermanentLossRisk: "very low" | "moderate" | "high" | "very volatile";
}

export interface TokenCorrelationResult {
  correlation: number;
}

export interface PoolGrowthTrendResult {
  poolGrowthTrendInPercentage: number;
  trend: "positive" | "negative";
}
