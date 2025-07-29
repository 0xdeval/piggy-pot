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

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch historical price: ${res.statusText}`);
    return [];
  }

  const data = (await res.json()) as ChartRangeResponse;

  //   console.log("Historical data from timestamp:", from);
  //   console.log("Historical data to timestamp:", to);

  if (!data.d?.length) {
    console.log(`No price data found for ${tokenAddress}`);
    return [];
  }

  // Use first price available
  return data?.d || [];
}
