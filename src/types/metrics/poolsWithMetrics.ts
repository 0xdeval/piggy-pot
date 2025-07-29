import { TokenQualityInfo } from "./rawFormat";
import { ImpermanentLossResult } from "./rawFormat";
import { TokenVolatilityResult } from "./rawFormat";
import { TokenCorrelationResult } from "./rawFormat";
import { PoolGrowthTrendResult } from "./rawFormat";
import { Pool } from "../subgraph";

export interface PoolInfoWithMetrics {
  pool: Pool;
  token0: TokenQualityInfo;
  token1: TokenQualityInfo;
  impermanentLoss: ImpermanentLossResult;
  tokensVolatility: {
    token0: TokenVolatilityResult;
    token1: TokenVolatilityResult;
  };
  tokenCorrelation: TokenCorrelationResult;
  poolGrowthTendency: PoolGrowthTrendResult;
}
