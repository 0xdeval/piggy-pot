export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  liquidity: string;
  totalValueLockedUSD: string;
  isStablecoinPool: boolean;
}

export interface GraphQLResponse {
  data: {
    pools: Pool[];
  };
}

export interface PoolDayData {
  date: number;
  tvlUSD: number;
  feesUSD: number;
}

export interface PoolHistoryResponse {
  data: {
    poolDayDatas: PoolDayData[];
  };
}
