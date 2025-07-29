import { TOP_TICKS_PER_POOL, TOP_POOLS_PER_QUERY } from "../../config/subgraph";
import { fetchStablecoins, type Stablecoin } from "../defillama";
import { Pool, GraphQLResponse } from "../../types/subgraph";
import { isStablecoinPool } from "../../utils/pools/isStablecoinPool";
import { isSpamTokens } from "../../utils/pools/filterSpamTokens";
import { appConfig } from "../../config";

export async function fetchPools(): Promise<Pool[]> {
  let stablecoins: Stablecoin[] = [];
  try {
    stablecoins = await fetchStablecoins();
  } catch (error) {
    console.error("Error fetching stablecoins:", error);
    stablecoins = [];
  }

  const query = `
    query GetPools {
  pools(
    where: {
      totalValueLockedUSD_gt: 1000000
      liquidity_gt: 1000000  
    }
    orderBy: totalValueLockedUSD
    orderDirection: desc
    first: ${TOP_POOLS_PER_QUERY}
  ) {
    id
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
    feeTier
    liquidity
    totalValueLockedUSD
    ticks(
      orderBy: tickIdx
      
      first: ${TOP_TICKS_PER_POOL}
    ) {
      id
      tickIdx
      liquidityGross
      liquidityNet
      price0
      price1
    }
  }
}
  `;

  try {
    const response = await fetch(appConfig.subgraph.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appConfig.subgraph.apiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = (await response.json()) as GraphQLResponse;
    // console.log(result);

    if (result.data?.pools) {
      // Filter pools based on adjusted liquidity and filter ticks
      const filteredPools = result.data.pools
        .map((pool) => {
          if (
            isSpamTokens(pool.token0.symbol) ||
            isSpamTokens(pool.token1.symbol)
          ) {
            return null;
          }

          return {
            ...pool,
            isStablecoinPool: isStablecoinPool(
              pool.token0,
              pool.token1,
              stablecoins
            ),
          };
        })
        .filter((pool): pool is Pool => pool !== null);

      return filteredPools;
    }

    return [];
  } catch (error) {
    console.error("Error fetching pools:", error);
    return [];
  }
}
