import { TokenQualityLLMOutput } from "./llmFormats";
import { ImpermanentLossLLMOutput } from "./llmFormats";
import { TokenPriceVolatilityLLMOutput } from "./llmFormats";
import { TokenCorrelationLLMOutput } from "./llmFormats";
import { PoolGrowthTrendLLMOutput } from "./llmFormats";
import { APYVolatilityLLMOutput } from "./llmFormats";
import { Pool } from "../subgraph";

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
