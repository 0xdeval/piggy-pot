import { TokenQualityLLMOutput } from "@/types/metrics/llmFormats";
import { ImpermanentLossLLMOutput } from "@/types/metrics/llmFormats";
import { TokenPriceVolatilityLLMOutput } from "@/types/metrics/llmFormats";
import { TokenCorrelationLLMOutput } from "@/types/metrics/llmFormats";
import { PoolGrowthTrendLLMOutput } from "@/types/metrics/llmFormats";
import { APYVolatilityLLMOutput } from "@/types/metrics/llmFormats";
import { Pool } from "@/types/subgraph";

export interface PoolInfoWithMetrics {
  pool: Pool & {
    isStablecoinPool?: boolean;
  };
  tokenQuality: {
    token0: TokenQualityLLMOutput | null;
    token1: TokenQualityLLMOutput | null;
  };
  impermanentLoss: ImpermanentLossLLMOutput | null;
  tokenCorrelation: TokenCorrelationLLMOutput | null;
  tokensVolatility: {
    token0: {
      tokenPriceVolatility: TokenPriceVolatilityLLMOutput | null;
    };
    token1: {
      tokenPriceVolatility: TokenPriceVolatilityLLMOutput | null;
    };
  };
  poolGrowthTendency: PoolGrowthTrendLLMOutput | null;
  apyVolatility: APYVolatilityLLMOutput | null;
}
