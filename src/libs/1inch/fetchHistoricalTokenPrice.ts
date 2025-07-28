import { ChartRangeResponse } from "../../types/1inch/tokenPrice";
import { appConfig } from "../../config";

interface HistoricalTokenPriceParams {
  tokenAddress: string;
  chainId: number;
  from: number;
  to?: number;
  interval?: string;
}

export async function fetchHistoricalTokenPrice({
  tokenAddress,
  chainId,
  from,
  to,
  interval = "1h",
}: HistoricalTokenPriceParams): Promise<ChartRangeResponse["d"]> {
  to = to || Math.floor(Date.now() / 1000);
  const url = `https://api.1inch.dev/token-details/v1.0/charts/range/${chainId}/${tokenAddress}?from=${from}&to=${to}&interval=${interval}`;

  console.log("url", url);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch historical price: ${res.statusText}`);
  }

  const data = (await res.json()) as ChartRangeResponse;

  console.log("data", data);

  if (!data.d?.length) {
    throw new Error(`No price data found for ${tokenAddress}`);
  }

  // Use first price available
  return data?.d || [];
}
