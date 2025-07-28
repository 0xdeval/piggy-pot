import { appConfig } from "src/config";

interface TokenDetails {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  providers: string[];
  logoURI: string;
  eip2612: boolean;
  tags: string[];
  rating: number;
}

interface TokenDetailsResponse {
  [address: string]: TokenDetails;
}

export async function fetchTokensDetails(
  tokenAddresses: string[],
  chainId: number
) {
  const params = new URLSearchParams();
  tokenAddresses.forEach((address) => params.append("addresses", address));

  const url = `https://api.1inch.dev/token/v1.3/${chainId}/custom?${params}`;
  console.log("current token details url: ", url);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch current token details: ${res.statusText}`);
  }

  const prices = (await res.json()) as TokenDetailsResponse;

  if (!prices) {
    throw new Error(`No token details for ${tokenAddresses}`);
  }

  return prices;
}
