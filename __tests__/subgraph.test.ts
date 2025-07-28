import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchPools, main } from "../src/libs/subgraph/fetchPools";
import { fetchStablecoins } from "../src/libs/defillama";
import { isStablecoinPool } from "../src/utils/pools/isStablecoinPool";
import { Pool, Token, Tick } from "../src/types/subgraph";
import { Stablecoin } from "../src/libs/defillama";

// Mock the config module
vi.mock("../src/config/subgraph", () => ({
  SUBGRAPH_URL: "https://test-subgraph.com",
  SUBGRAPH_KEY: "test-key",
  TOP_TICKS_PER_POOL: 50,
  TOP_POOLS_PER_QUERY: 150,
}));

// Mock the defillama module
vi.mock("../src/libs/defillama", () => ({
  fetchStablecoins: vi.fn(),
}));

// Mock the isStablecoinPool utility
vi.mock("../src/utils/isStablecoinPool", () => ({
  isStablecoinPool: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("Subgraph Module", () => {
  const mockFetch = vi.mocked(fetch);
  const mockFetchStablecoins = vi.mocked(fetchStablecoins);
  const mockIsStablecoinPool = vi.mocked(isStablecoinPool);

  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn(); // Mock console.log to avoid noise in tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchPools", () => {
    const mockStablecoins: Stablecoin[] = [
      { id: "1", name: "Tether USD", symbol: "USDT" },
      { id: "2", name: "USD Coin", symbol: "USDC" },
      { id: "3", name: "Dai Stablecoin", symbol: "DAI" },
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

    const mockTick: Tick = {
      id: "tick-1",
      tickIdx: "123456",
      liquidityGross: "1000000",
      liquidityNet: "500000",
      price0: "1.5",
      price1: "0.6666666666666666",
    };

    const mockPool: Pool = {
      id: "pool-1",
      token0: mockToken0,
      token1: mockToken1,
      feeTier: "3000",
      liquidity: "1000000000",
      totalValueLockedUSD: "5000000",
      ticks: [mockTick],
      isStablecoinPool: false,
    };

    it("should fetch pools successfully", async () => {
      // Mock stablecoins response
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      // Mock GraphQL response
      const mockGraphQLResponse = {
        data: {
          pools: [mockPool],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      // Mock stablecoin detection
      mockIsStablecoinPool.mockReturnValue(false);

      const result = await fetchPools();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-subgraph.com",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-key",
          },
          body: expect.stringContaining("query GetPools"),
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockPool,
        isStablecoinPool: false,
      });
    });

    it("should handle GraphQL errors gracefully", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "GraphQL Error",
      } as Response);

      const result = await fetchPools();

      expect(result).toEqual([]);
    });

    it("should handle network errors gracefully", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchPools();

      expect(result).toEqual([]);
    });

    it("should filter pools with no ticks", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      const poolWithoutTicks = { ...mockPool, ticks: [] };
      const mockGraphQLResponse = {
        data: {
          pools: [poolWithoutTicks],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      mockIsStablecoinPool.mockReturnValue(false);

      const result = await fetchPools();

      expect(result).toHaveLength(0);
    });

    it("should correctly identify stablecoin pools", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      const stablecoinPool = {
        ...mockPool,
        token0: { ...mockToken0, symbol: "USDT" },
        token1: { ...mockToken1, symbol: "USDC" },
      };

      const mockGraphQLResponse = {
        data: {
          pools: [stablecoinPool],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      mockIsStablecoinPool.mockReturnValue(true);

      const result = await fetchPools();

      expect(result).toHaveLength(1);
      expect(result[0].isStablecoinPool).toBe(true);
      expect(mockIsStablecoinPool).toHaveBeenCalledWith(
        stablecoinPool.token0,
        stablecoinPool.token1,
        mockStablecoins
      );
    });

    it("should handle empty pools response", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      const mockGraphQLResponse = {
        data: {
          pools: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      const result = await fetchPools();

      expect(result).toEqual([]);
    });

    it("should handle null data response", async () => {
      mockFetchStablecoins.mockResolvedValue(mockStablecoins);

      const mockGraphQLResponse = {
        data: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      const result = await fetchPools();

      expect(result).toEqual([]);
    });
  });

  describe("main function", () => {
    it("should execute main function successfully", async () => {
      const mockPools: Pool[] = [
        {
          id: "pool-1",
          token0: {
            id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            symbol: "UNI",
            name: "Uniswap",
            decimals: 18,
          },
          token1: {
            id: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c8",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
          },
          feeTier: "3000",
          liquidity: "1000000000",
          totalValueLockedUSD: "5000000",
          ticks: [
            {
              id: "tick-1",
              tickIdx: "123456",
              liquidityGross: "1000000",
              liquidityNet: "500000",
              price0: "1.5",
              price1: "0.6666666666666666",
            },
          ],
          isStablecoinPool: false,
        },
      ];

      // Mock the fetchPools function
      vi.doMock("../src/libs/subgraph/fetchPools", () => ({
        fetchPools: vi.fn().mockResolvedValue(mockPools),
        main: vi.fn(),
      }));

      // Since main function logs to console, we just test that it doesn't throw
      await expect(main()).resolves.not.toThrow();
    });

    it("should handle errors in main function", async () => {
      // Mock fetchPools to throw an error
      vi.doMock("../src/libs/subgraph/fetchPools", () => ({
        fetchPools: vi.fn().mockRejectedValue(new Error("Test error")),
        main: vi.fn(),
      }));

      // The main function should handle errors gracefully
      await expect(main()).resolves.not.toThrow();
    });
  });

  describe("GraphQL Query Structure", () => {
    it("should include correct GraphQL query structure", async () => {
      mockFetchStablecoins.mockResolvedValue([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { pools: [] } }),
      } as Response);

      await fetchPools();

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body as string);
      const query = requestBody.query;

      // Check that the query contains expected fields
      expect(query).toContain("query GetPools");
      expect(query).toContain("totalValueLockedUSD_gt: 1000000");
      expect(query).toContain("liquidity_gt: 1000000");
      expect(query).toContain("first: 150");
      expect(query).toContain("first: 50");
      expect(query).toContain("token0");
      expect(query).toContain("token1");
      expect(query).toContain("feeTier");
      expect(query).toContain("liquidity");
      expect(query).toContain("totalValueLockedUSD");
      expect(query).toContain("ticks");
      expect(query).toContain("tickIdx");
      expect(query).toContain("liquidityGross");
      expect(query).toContain("liquidityNet");
      expect(query).toContain("price0");
      expect(query).toContain("price1");
    });
  });

  describe("Integration with DefiLlama", () => {
    it("should call fetchStablecoins", async () => {
      mockFetchStablecoins.mockResolvedValue([]);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { pools: [] } }),
      } as Response);

      await fetchPools();

      expect(mockFetchStablecoins).toHaveBeenCalled();
    });

    it("should handle fetchStablecoins errors gracefully", async () => {
      mockFetchStablecoins.mockResolvedValue([]); // Return empty array on error

      // Mock GraphQL response
      const mockGraphQLResponse = {
        data: {
          pools: [
            {
              id: "pool-1",
              token0: {
                id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
                symbol: "UNI",
                name: "Uniswap",
                decimals: 18,
              },
              token1: {
                id: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c8",
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
              },
              feeTier: "3000",
              liquidity: "1000000000",
              totalValueLockedUSD: "5000000",
              ticks: [
                {
                  id: "tick-1",
                  tickIdx: "123456",
                  liquidityGross: "1000000",
                  liquidityNet: "500000",
                  price0: "1.5",
                  price1: "0.6666666666666666",
                },
              ],
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      // Mock isStablecoinPool to return false when stablecoins array is empty
      mockIsStablecoinPool.mockReturnValue(false);

      const result = await fetchPools();

      // Should still return pools even if stablecoins fetch fails
      expect(result).toHaveLength(1);
      expect(result[0].isStablecoinPool).toBe(false);
    });

    it("should handle fetchStablecoins throwing errors", async () => {
      mockFetchStablecoins.mockRejectedValue(new Error("DefiLlama API error"));

      // Mock GraphQL response
      const mockGraphQLResponse = {
        data: {
          pools: [
            {
              id: "pool-1",
              token0: {
                id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
                symbol: "UNI",
                name: "Uniswap",
                decimals: 18,
              },
              token1: {
                id: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c8",
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
              },
              feeTier: "3000",
              liquidity: "1000000000",
              totalValueLockedUSD: "5000000",
              ticks: [
                {
                  id: "tick-1",
                  tickIdx: "123456",
                  liquidityGross: "1000000",
                  liquidityNet: "500000",
                  price0: "1.5",
                  price1: "0.6666666666666666",
                },
              ],
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      // Mock isStablecoinPool to return false when stablecoins array is empty
      mockIsStablecoinPool.mockReturnValue(false);

      const result = await fetchPools();

      // Should still return pools even if stablecoins fetch throws an error
      expect(result).toHaveLength(1);
      expect(result[0].isStablecoinPool).toBe(false);
    });
  });

  describe("Data Validation", () => {
    it("should validate pool data structure", async () => {
      const mockPools: Pool[] = [
        {
          id: "pool-1",
          token0: {
            id: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
            symbol: "UNI",
            name: "Uniswap",
            decimals: 18,
          },
          token1: {
            id: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8c8",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
          },
          feeTier: "3000",
          liquidity: "1000000000",
          totalValueLockedUSD: "5000000",
          ticks: [],
          isStablecoinPool: false,
        },
      ];

      mockFetchStablecoins.mockResolvedValue([]);

      const mockGraphQLResponse = {
        data: {
          pools: mockPools,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      mockIsStablecoinPool.mockReturnValue(false);

      const result = await fetchPools();

      // Should filter out pools with no ticks
      expect(result).toHaveLength(0);
    });

    it("should handle malformed pool data", async () => {
      mockFetchStablecoins.mockResolvedValue([]);

      // Mock malformed data
      const mockGraphQLResponse = {
        data: {
          pools: [
            {
              id: "pool-1",
              // Missing required fields
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraphQLResponse,
      } as Response);

      const result = await fetchPools();

      // Should handle malformed data gracefully
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
