import { describe, it, expect } from "vitest";
import { isStablecoinPool } from "../src/utils/pools/isStablecoinPool";
import { Token } from "../src/types/subgraph";
import { Stablecoin } from "../src/libs/defillama";

describe("isStablecoinPool", () => {
  const mockStablecoins: Stablecoin[] = [
    { id: "1", name: "Tether USD", symbol: "USDT" },
    { id: "2", name: "USD Coin", symbol: "USDC" },
    { id: "3", name: "Dai Stablecoin", symbol: "DAI" },
    { id: "4", name: "Binance USD", symbol: "BUSD" },
    { id: "5", name: "TrueUSD", symbol: "TUSD" },
    { id: "6", name: "Frax", symbol: "FRAX" },
    { id: "7", name: "Pax Dollar", symbol: "USDP" },
  ];

  const mockToken0: Token = {
    id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
  };

  const mockToken1: Token = {
    id: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c8",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  };

  describe("Stablecoin Pool Detection", () => {
    it("should identify USDT/USDC pool as stablecoin pool", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });

    it("should identify DAI/USDC pool as stablecoin pool", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "DAI",
        name: "Dai Stablecoin",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });

    it("should identify BUSD/USDT pool as stablecoin pool", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "BUSD",
        name: "Binance USD",
      };
      const token1: Token = {
        ...mockToken1,
        symbol: "USDT",
        name: "Tether USD",
      };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });

    it("should identify FRAX/USDP pool as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "FRAX", name: "Frax" };
      const token1: Token = {
        ...mockToken1,
        symbol: "USDP",
        name: "Pax Dollar",
      };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });
  });

  describe("Non-Stablecoin Pool Detection", () => {
    it("should not identify UNI/USDC pool as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "UNI", name: "Uniswap" };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });

    it("should not identify ETH/USDC pool as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "ETH", name: "Ethereum" };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });

    it("should not identify BTC/ETH pool as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "BTC", name: "Bitcoin" };
      const token1: Token = { ...mockToken1, symbol: "ETH", name: "Ethereum" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });

    it("should not identify UNI/ETH pool as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "UNI", name: "Uniswap" };
      const token1: Token = { ...mockToken1, symbol: "ETH", name: "Ethereum" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });
  });

  describe("Case Sensitivity", () => {
    it("should handle lowercase stablecoin symbols", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "usdt",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "usdc", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });

    it("should handle mixed case stablecoin symbols", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "Usdt",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "UsDc", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });

    it("should handle uppercase stablecoin symbols", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty stablecoins array", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, []);

      expect(result).toBe(false);
    });

    it("should handle stablecoins with empty symbols", () => {
      const stablecoinsWithEmptySymbols: Stablecoin[] = [
        { id: "1", name: "Tether USD", symbol: "" },
        { id: "2", name: "USD Coin", symbol: "USDC" },
      ];

      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(
        token0,
        token1,
        stablecoinsWithEmptySymbols
      );

      expect(result).toBe(false);
    });

    it("should handle tokens with empty symbols", () => {
      const token0: Token = { ...mockToken0, symbol: "", name: "Tether USD" };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });

    it("should handle duplicate stablecoin symbols in list", () => {
      const stablecoinsWithDuplicates: Stablecoin[] = [
        { id: "1", name: "Tether USD", symbol: "USDT" },
        { id: "2", name: "USD Coin", symbol: "USDC" },
        { id: "3", name: "Another Tether", symbol: "USDT" },
      ];

      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(
        token0,
        token1,
        stablecoinsWithDuplicates
      );

      expect(result).toBe(true);
    });
  });

  describe("Token Order Independence", () => {
    it("should return same result regardless of token order", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result1 = isStablecoinPool(token0, token1, mockStablecoins);
      const result2 = isStablecoinPool(token1, token0, mockStablecoins);

      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });

    it("should return same result for non-stablecoin pools regardless of token order", () => {
      const token0: Token = { ...mockToken0, symbol: "UNI", name: "Uniswap" };
      const token1: Token = { ...mockToken1, symbol: "ETH", name: "Ethereum" };

      const result1 = isStablecoinPool(token0, token1, mockStablecoins);
      const result2 = isStablecoinPool(token1, token0, mockStablecoins);

      expect(result1).toBe(result2);
      expect(result1).toBe(false);
    });
  });

  describe("Partial Stablecoin Pools", () => {
    it("should not identify pool with only one stablecoin as stablecoin pool", () => {
      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "ETH", name: "Ethereum" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });

    it("should not identify pool with only one stablecoin (reversed) as stablecoin pool", () => {
      const token0: Token = { ...mockToken0, symbol: "ETH", name: "Ethereum" };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const result = isStablecoinPool(token0, token1, mockStablecoins);

      expect(result).toBe(false);
    });
  });

  describe("Performance", () => {
    it("should handle large stablecoin lists efficiently", () => {
      // Create a large list of stablecoins
      const largeStablecoinsList: Stablecoin[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: (index + 1).toString(),
          name: `Stablecoin ${index + 1}`,
          symbol: `STB${index + 1}`,
        })
      );

      // Add some known stablecoins to the end
      largeStablecoinsList.push(
        { id: "1001", name: "Tether USD", symbol: "USDT" },
        { id: "1002", name: "USD Coin", symbol: "USDC" }
      );

      const token0: Token = {
        ...mockToken0,
        symbol: "USDT",
        name: "Tether USD",
      };
      const token1: Token = { ...mockToken1, symbol: "USDC", name: "USD Coin" };

      const startTime = performance.now();
      const result = isStablecoinPool(token0, token1, largeStablecoinsList);
      const endTime = performance.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
