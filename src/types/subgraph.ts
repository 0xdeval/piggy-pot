export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface Tick {
  id: string;
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
  price0: string;
  price1: string;
}

export interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  liquidity: string;
  totalValueLockedUSD: string;
  ticks: Tick[];
  isStablecoinPool: boolean;
}

export interface GraphQLResponse {
  data: {
    pools: Pool[];
  };
}
