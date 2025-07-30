import { appConfig } from "@/config";
import { CurrentPriceResponse } from "@/types/1inch/tokenPrice";

interface CurrentTokenPriceParams {
  tokenAddresses: string[];
  chainId: number;
}
// NOT USED FOR NOW
export async function fetchCurrentTokensPrices({
  tokenAddresses,
  chainId,
}: CurrentTokenPriceParams): Promise<{ [key: string]: number }> {
  const url = `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddresses}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current price: ${res.statusText}`);
  }

  const prices = (await res.json()) as CurrentPriceResponse;

  if (!prices) {
    console.log(`No current price for ${tokenAddresses}`);
    return {};
  }

  return prices;
}
