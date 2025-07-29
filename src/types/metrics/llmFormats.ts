export interface APYVolatilityLLMOutput {
  apyVolatility: {
    stdDev: number;
    mean: number;
    coefficientOfVariation: number;
    stabilityScore: string;
    riskLevel: string;
    description: string;
  };
}

export interface ImpermanentLossLLMOutput {
  impermanentLoss: {
    impermanent_loss_percentage: number;
    price_ratio: number;
    initial_ratio: number;
    current_ratio: number;
    severity: string;
    riskLevel: string;
    impact: string;
    recommendation: string;
    price_movement: {
      token0: {
        initial: number;
        current: number;
        change_percentage: number;
        movement: string;
      };
      token1: {
        initial: number;
        current: number;
        change_percentage: number;
        movement: string;
      };
    };
    hodl_vs_lp_comparison: {
      hodl_value: number;
      lp_value: number;
      difference: number;
      performance: string;
    };
  };
}

export interface PoolGrowthTrendLLMOutput {
  poolGrowthTrend: {
    poolGrowthTrendInPercentage: number;
    trend: string;
    performance: string;
    strength: string;
    assessment: string;
    recommendation: string;
  };
}

export interface TokenCorrelationLLMOutput {
  tokenCorrelation: {
    correlation: number;
    correlationStrength: string;
    relationship: string;
    assessment: string;
    recommendation: string;
  };
}

export interface TokenQualityLLMOutput {
  tokenQuality: {
    hasInProviders: boolean;
    hasInternalTags: boolean;
    hasEip2612: boolean;
    rating: number;
    qualityScore: string;
    trustworthiness: string;
    assessment: string;
    recommendation: string;
  };
}

export interface TokenPriceVolatilityLLMOutput {
  tokenPriceVolatility: {
    volatilityInPercentage: number;
    isStableAsset: boolean;
    impermanentLossRisk: string;
    volatilityLevel: string;
    stability: string;
    assessment: string;
    recommendation: string;
  };
}
