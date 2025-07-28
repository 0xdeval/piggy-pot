import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchStablecoins, type Stablecoin } from "../src/libs/defillama";

// Mock global fetch
global.fetch = vi.fn();

describe("DefiLlama Module", () => {
  const mockFetch = vi.mocked(fetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchStablecoins", () => {
    const mockStablecoinsResponse = {
      peggedAssets: [
        {
          id: "1",
          name: "Tether USD",
          symbol: "USDT",
        },
        {
          id: "2",
          name: "USD Coin",
          symbol: "USDC",
        },
        {
          id: "3",
          name: "Dai Stablecoin",
          symbol: "DAI",
        },
        {
          id: "4",
          name: "Binance USD",
          symbol: "BUSD",
        },
        {
          id: "5",
          name: "TrueUSD",
          symbol: "TUSD",
        },
      ],
    };

    it("should fetch stablecoins successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStablecoinsResponse,
      } as Response);

      const result = await fetchStablecoins();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://stablecoins.llama.fi/stablecoins"
      );
      expect(result).toEqual(mockStablecoinsResponse.peggedAssets);
      expect(result).toHaveLength(5);
    });

    it("should handle API errors gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "API Error",
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });

    it("should handle malformed response data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidField: [] }),
      } as Response);

      const result = await fetchStablecoins();

      // Should return empty array when peggedAssets field is missing
      expect(result).toEqual([]);
    });

    it("should handle response with null peggedAssets", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ peggedAssets: null }),
      } as Response);

      const result = await fetchStablecoins();

      // Should return empty array when peggedAssets is null
      expect(result).toEqual([]);
    });

    it("should handle response with non-array peggedAssets", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ peggedAssets: "not an array" }),
      } as Response);

      const result = await fetchStablecoins();

      // Should return empty array when peggedAssets is not an array
      expect(result).toEqual([]);
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ peggedAssets: [] }),
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });

    it("should handle null response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });

    it("should validate stablecoin data structure", async () => {
      const validStablecoins = [
        {
          id: "1",
          name: "Tether USD",
          symbol: "USDT",
        },
        {
          id: "2",
          name: "USD Coin",
          symbol: "USDC",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ peggedAssets: validStablecoins }),
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("symbol");
      expect(typeof result[0].id).toBe("string");
      expect(typeof result[0].name).toBe("string");
      expect(typeof result[0].symbol).toBe("string");
    });

    it("should handle large response data", async () => {
      // Create a large array of stablecoins
      const largeStablecoinsArray = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: (index + 1).toString(),
          name: `Stablecoin ${index + 1}`,
          symbol: `STB${index + 1}`,
        })
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ peggedAssets: largeStablecoinsArray }),
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toHaveLength(1000);
      expect(result[0].id).toBe("1");
      expect(result[999].id).toBe("1000");
    });

    it("should handle JSON parsing errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("JSON parsing error");
        },
      } as unknown as Response);

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });

    it("should handle timeout scenarios", async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 100);
        });
      });

      const result = await fetchStablecoins();

      expect(result).toEqual([]);
    });
  });

  describe("Type Definitions", () => {
    it("should have correct Stablecoin interface", () => {
      const stablecoin: Stablecoin = {
        id: "1",
        name: "Test Stablecoin",
        symbol: "TEST",
      };

      expect(stablecoin).toHaveProperty("id");
      expect(stablecoin).toHaveProperty("name");
      expect(stablecoin).toHaveProperty("symbol");
      expect(typeof stablecoin.id).toBe("string");
      expect(typeof stablecoin.name).toBe("string");
      expect(typeof stablecoin.symbol).toBe("string");
    });

    it("should handle stablecoin symbols with different cases", async () => {
      const mixedCaseStablecoins = {
        peggedAssets: [
          { id: "1", name: "Tether USD", symbol: "USDT" },
          { id: "2", name: "USD Coin", symbol: "usdc" },
          { id: "3", name: "Dai Stablecoin", symbol: "Dai" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mixedCaseStablecoins,
      } as Response);

      const result = await fetchStablecoins();

      expect(result).toHaveLength(3);
      expect(result[0].symbol).toBe("USDT");
      expect(result[1].symbol).toBe("usdc");
      expect(result[2].symbol).toBe("Dai");
    });
  });

  describe("Error Logging", () => {
    it("should log errors to console", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFetch.mockRejectedValueOnce(new Error("Test error"));

      await fetchStablecoins();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching stablecoins:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should log API errors to console", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      } as Response);

      await fetchStablecoins();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching stablecoins:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
