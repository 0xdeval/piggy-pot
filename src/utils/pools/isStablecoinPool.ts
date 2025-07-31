import { Token } from "@/types/subgraph";
import { Stablecoin } from "@/libs/defillama";

/**
 * Checks if a pool is a stablecoin pool
 *
 * @param token0 - The first token in the pool
 * @param token1 - The second token in the pool
 * @param stablecoins - The stablecoins to check against
 * @returns True if the pool is a stablecoin pool, false otherwise
 */
export function isStablecoinPool(
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
