import { fetchTokensDetails } from "@/libs/1inch/fetchTokensDetails";
import { TokenQualityInfo } from "@/types/metrics/rawFormat";
import { TokenQualityLLMOutput } from "@/types/metrics/llmFormats";
import { tokenQualityToLLM } from "@/utils/metrics/tokenQualityToLLM";

/**
 * Evaluate the quality of a token by returning a list of parameters relates to a token (raw data format)
 *
 * @param addresses - The addresses of the tokens to evaluate
 * @param chainId - The chain id of the tokens
 * @returns The quality of the tokens
 */
export const evaluateTokenQualityRaw = async (
  addresses: string[],
  chainId: number
): Promise<TokenQualityInfo> => {
  const tokenDetails = await fetchTokensDetails(addresses, chainId);

  const tokenQualityInfo: TokenQualityInfo = {};

  addresses.forEach((address) => {
    const tokenDetail = tokenDetails[address];
    if (!tokenDetail) {
      return;
    }

    tokenQualityInfo[address] = {
      hasInProviders: false,
      hasInternalTags: false,
      hasEip2612: false,
      rating: 0,
    };

    if (tokenDetail.providers.length > 0) {
      tokenQualityInfo[address].hasInProviders = true;
    }

    if (tokenDetail.tags.length > 0) {
      tokenQualityInfo[address].hasInternalTags = true;
    }

    if (tokenDetail.eip2612) {
      tokenQualityInfo[address].hasEip2612 = true;
    }

    if (tokenDetail.rating) {
      tokenQualityInfo[address].rating = tokenDetail.rating;
    }
  });

  return tokenQualityInfo;
};

/**
 * Evaluate the quality of a token with LLM-friendly output format (default)
 *
 * @param addresses - The addresses of the tokens to evaluate
 * @param chainId - The chain id of the tokens
 * @returns The quality of the tokens in LLM-friendly format
 */
export const evaluateTokenQuality = async (
  addresses: string[],
  chainId: number
): Promise<{ [address: string]: TokenQualityLLMOutput | null }> => {
  const rawResults = await evaluateTokenQualityRaw(addresses, chainId);

  const llmResults: {
    [address: string]: TokenQualityLLMOutput;
  } = {};

  addresses.forEach((address) => {
    const tokenQuality = rawResults[address];
    if (tokenQuality) {
      const llmResult = tokenQualityToLLM(tokenQuality);
      llmResults[address] = llmResult;
    }
  });

  return llmResults;
};
