export interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
}

export interface StablecoinsResponse {
  peggedAssets: Stablecoin[];
}

/**
 * Fetch stablecoins from the DefiLlama API
 * @returns Promise<Stablecoin[]> Array of stablecoin objects
 */
export async function fetchStablecoins(): Promise<Stablecoin[]> {
  try {
    const response = await fetch("https://stablecoins.llama.fi/stablecoins");
    if (!response.ok) {
      throw new Error(`Failed to fetch stablecoins: ${response.statusText}`);
    }
    const data = (await response.json()) as StablecoinsResponse;

    // Check if the response has the expected structure
    if (!data || !data.peggedAssets || !Array.isArray(data.peggedAssets)) {
      console.error("Error fetching stablecoins: Invalid response structure");
      return [];
    }

    return data.peggedAssets;
  } catch (error) {
    console.error("Error fetching stablecoins:", error);
    return [];
  }
}
