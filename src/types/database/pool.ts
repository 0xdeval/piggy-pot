import { z } from "zod";

// Schema for pool information
export const PoolInfoSchema = z.object({
  feeTier: z.string(),
  id: z.string(),
  liquidity: z.string(),
  token0: z.object({
    decimals: z.string(),
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  token1: z.object({
    decimals: z.string(),
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  totalValueLockedUSD: z.string(),
  isStablecoinPool: z.boolean(),
});

// Schema for token quality
export const TokenQualitySchema = z.object({
  qualityScore: z.string(),
  trustworthiness: z.string(),
  assessment: z.string(),
  recommendation: z.string(),
});

export const TokenQualityInfoSchema = z.object({
  token0: TokenQualitySchema.nullable(),
  token1: TokenQualitySchema.nullable(),
});

// Schema for impermanent loss
export const PriceMovementSchema = z.object({
  change_percentage: z.number(),
  movement: z.string(),
});

export const HodlVsLpComparisonSchema = z.object({
  lp_value: z.number(),
  difference: z.number(),
  performance: z.string(),
});

export const ImpermanentLossSchema = z.object({
  impermanent_loss_percentage: z.number(),
  impact: z.string(),
  recommendation: z.string(),
  price_movement: z.object({
    token0: PriceMovementSchema,
    token1: PriceMovementSchema,
  }),
  hodl_vs_lp_comparison: HodlVsLpComparisonSchema,
});

// Schema for token correlation
export const TokenCorrelationSchema = z.object({
  relationship: z.string(),
  assessment: z.string(),
  recommendation: z.string(),
});

// Schema for token volatility
export const TokenPriceVolatilitySchema = z.object({
  volatilityInPercentage: z.number(),
  volatilityLevel: z.string(),
  stability: z.string(),
  assessment: z.string(),
  recommendation: z.string(),
});

export const TokensVolatilitySchema = z.object({
  token0: z.object({
    tokenPriceVolatility: TokenPriceVolatilitySchema.nullable(),
  }),
  token1: z.object({
    tokenPriceVolatility: TokenPriceVolatilitySchema.nullable(),
  }),
});

// Schema for pool growth tendency
export const PoolGrowthTendencySchema = z.object({
  poolGrowthTrendInPercentage: z.number(),
  trend: z.string(),
  performance: z.string(),
  assessment: z.string(),
  recommendation: z.string(),
});

// Schema for APY volatility
export const ApyVolatilitySchema = z.object({
  stdDev: z.number(),
  mean: z.number(),
  coefficientOfVariation: z.number(),
  stabilityScore: z.string(),
  riskLevel: z.string(),
  description: z.string(),
});

// Main pool schema
export const PoolSchema = z.object({
  poolId: z.string(),
  poolInfo: PoolInfoSchema,
  tokenQuality: TokenQualityInfoSchema,
  impermanentLoss: ImpermanentLossSchema.nullable(),
  tokenCorrelation: TokenCorrelationSchema.nullable(),
  tokensVolatility: TokensVolatilitySchema.nullable(),
  poolGrowthTendency: PoolGrowthTendencySchema.nullable(),
  apyVolatility: ApyVolatilitySchema.nullable(),
  updatedAt: z.date(),
});

// Schema for creating a pool - requires all fields except auto-generated ones
export const CreatePoolSchema = PoolSchema.omit({
  updatedAt: true,
});

// Schema for updating a pool
export const UpdatePoolSchema = PoolSchema.partial().omit({
  poolId: true,
  updatedAt: true,
});

export type Pool = z.infer<typeof PoolSchema>;
export type CreatePool = z.infer<typeof CreatePoolSchema>;
export type UpdatePool = z.infer<typeof UpdatePoolSchema>;
export type PoolInfo = z.infer<typeof PoolInfoSchema>;
export type TokenQualityInfo = z.infer<typeof TokenQualityInfoSchema>;
export type ImpermanentLoss = z.infer<typeof ImpermanentLossSchema>;
export type TokenCorrelation = z.infer<typeof TokenCorrelationSchema>;
export type TokensVolatility = z.infer<typeof TokensVolatilitySchema>;
export type PoolGrowthTendency = z.infer<typeof PoolGrowthTendencySchema>;
export type ApyVolatility = z.infer<typeof ApyVolatilitySchema>;

export interface PoolQueryResult {
  success: boolean;
  data?: Pool;
  error?: string;
}

export interface PoolsQueryResult {
  success: boolean;
  data?: Pool[];
  error?: string;
}
