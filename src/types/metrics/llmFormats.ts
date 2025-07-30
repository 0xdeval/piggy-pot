export interface APYVolatilityLLMOutput {
  stdDev: number;
  mean: number;
  coefficientOfVariation: number;
  stabilityScore: string;
  riskLevel: string;
  description: string;
}

export interface ImpermanentLossLLMOutput {
  impermanent_loss_percentage: number;
  impact: string;
  recommendation: string;
  price_movement: {
    token0: {
      change_percentage: number;
      movement: string;
    };
    token1: {
      change_percentage: number;
      movement: string;
    };
  };
  hodl_vs_lp_comparison: {
    lp_value: number;
    difference: number;
    performance: string;
  };
}

export interface PoolGrowthTrendLLMOutput {
  poolGrowthTrendInPercentage: number;
  trend: string;
  performance: string;
  assessment: string;
  recommendation: string;
}

export interface TokenCorrelationLLMOutput {
  relationship: string;
  assessment: string;
  recommendation: string;
}

export interface TokenQualityLLMOutput {
  qualityScore: string;
  trustworthiness: string;
  assessment: string;
  recommendation: string;
}

export interface TokenPriceVolatilityLLMOutput {
  volatilityInPercentage: number;
  volatilityLevel: string;
  stability: string;
  assessment: string;
  recommendation: string;
}
