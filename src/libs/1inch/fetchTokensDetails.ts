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
  //   console.log("current token details url: ", url);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${appConfig.oneInch.apiKey}`,
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch current token details: ${res.statusText}`);
    return {};
  }

  const tokensInfo = (await res.json()) as TokenDetailsResponse;

  if (!tokensInfo) {
    console.log(`No token details for ${tokenAddresses}`);
    return {};
  }

  return tokensInfo;
}
