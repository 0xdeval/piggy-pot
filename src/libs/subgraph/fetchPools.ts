import {
  SUBGRAPH_URL,
  SUBGRAPH_KEY,
  TOP_TICKS_PER_POOL,
  TOP_POOLS_PER_QUERY,
} from "../../config/subgraph";
import { fetchStablecoins, type Stablecoin } from "../defillama";

interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface Tick {
  id: string;
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
  price0: string;
  price1: string;
}

interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  liquidity: string;
  totalValueLockedUSD: string;
  ticks: Tick[];
  isStablecoinPool: boolean;
}

interface GraphQLResponse {
  data: {
    pools: Pool[];
  };
}

// Check if a pool contains only stablecoins
function isStablecoinPool(
  token0: Token,
  token1: Token,
  stablecoins: Stablecoin[]
): boolean {
  const stablecoinSymbols = stablecoins.map((coin) =>
    coin.symbol.toUpperCase()
  );
  const token0Symbol = token0.symbol.toUpperCase();
  const token1Symbol = token1.symbol.toUpperCase();

  return (
    stablecoinSymbols.includes(token0Symbol) &&
    stablecoinSymbols.includes(token1Symbol)
  );
}

// Fetch pools from Uniswap V3 subgraph
async function fetchPools(): Promise<Pool[]> {
  const stablecoins = await fetchStablecoins();

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
    const response = await fetch(SUBGRAPH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUBGRAPH_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = (await response.json()) as GraphQLResponse;
    console.log(result);

    if (result.data?.pools) {
      // Filter pools based on adjusted liquidity and filter ticks
      const filteredPools = result.data.pools
        .map((pool) => {
          return {
            ...pool,
            isStablecoinPool: isStablecoinPool(
              pool.token0,
              pool.token1,
              stablecoins
            ),
          };
        })
        .filter((pool) => pool.ticks.length > 0); // Only keep pools with valid ticks

      return filteredPools;
    }

    return [];
  } catch (error) {
    console.error("Error fetching pools:", error);
    return [];
  }
}

// Main function to run the script
async function main() {
  console.log("Fetching Uniswap V3 pools...");

  const pools = await fetchPools();

  console.log(`Found ${pools.length} pools matching criteria:`);
  console.log("- TVL > $1,000,000 USD");
  console.log(`- Returned pools with at least ${TOP_TICKS_PER_POOL} ticks`);
  console.log(`- Returned top ${TOP_POOLS_PER_QUERY} pools`);
  console.log("\n");

  pools.slice(0, 3).forEach((pool, index) => {
    console.log(`Pool ${index + 1}:`);
    console.log(`  Pool ID: ${pool.id}`);
    console.log(`  Token 0: ${pool.token0.symbol} (${pool.token0.name})`);
    console.log(`  Token 1: ${pool.token1.symbol} (${pool.token1.name})`);
    console.log(`  Fee Tier: ${parseInt(pool.feeTier) / 10000}%`);

    console.log(`  Raw Liquidity: ${pool.liquidity}`);

    console.log(
      `  TVL: $${parseFloat(pool.totalValueLockedUSD).toLocaleString()}`
    );
    console.log(`  Stablecoin Pool: ${pool.isStablecoinPool ? "YES" : "NO"}`);
    console.log(`  Number of Ticks: ${pool.ticks.length}`);

    if (pool.ticks.length > 0) {
      console.log("  Sample Ticks:");
      console.log("TOP-1 tick for a pool: ", pool.ticks[0]);
      console.log("TOP-2 tick for a pool: ", pool.ticks[1]);
    }

    console.log("---");
  });

  // Summary statistics
  const stablecoinPools = pools.filter((pool) => pool.isStablecoinPool);
  const totalTVL = pools.reduce(
    (sum, pool) => sum + parseFloat(pool.totalValueLockedUSD),
    0
  );

  console.log("\nSummary:");
  console.log(`Total pools found: ${pools.length}`);
  console.log(`Stablecoin pools: ${stablecoinPools.length}`);
  console.log(`Total TVL: $${totalTVL.toLocaleString()}`);

  console.log("Pool example: ", pools[0]);
}

// Export functions for use in other modules
export { fetchPools, isStablecoinPool, main };

// Run the script if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
