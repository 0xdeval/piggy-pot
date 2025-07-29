import { TokenPriceVolatilityLLMOutput } from "../../types/metrics/llmFormats";
import { TokenVolatilityResult } from "../../types/metrics/rawFormat";

/**
 * Convert token price volatility calculations to LLM-friendly output format
 */
export function tokenPriceVolatilityToLLM(
  result: TokenVolatilityResult
): TokenPriceVolatilityLLMOutput {
  const { volatilityInPercentage, isStableAsset, impermanentLossRisk } = result;

  // Determine volatility level and stability description
  let volatilityLevel: string;
  let stability: string;
  let assessment: string;
  let recommendation: string;

  if (volatilityInPercentage < 5) {
    volatilityLevel = "Very Low";
    stability = "Very Stable";
    assessment =
      "This token exhibits very low price volatility, indicating extremely stable price movements. It behaves like a stablecoin or highly stable asset.";
    recommendation =
      "This token has very low volatility risk. Excellent for LP positions with minimal impermanent loss concerns.";
  } else if (volatilityInPercentage < 20) {
    volatilityLevel = "Low";
    stability = "Stable";
    assessment =
      "This token shows low price volatility, indicating stable price movements with minimal fluctuations.";
    recommendation =
      "This token has low volatility risk. Suitable for LP positions with low impermanent loss risk.";
  } else if (volatilityInPercentage < 50) {
    volatilityLevel = "Moderate";
    stability = "Moderately Stable";
    assessment =
      "This token shows moderate price volatility, indicating some price fluctuations but generally stable behavior.";
    recommendation =
      "This token has moderate volatility risk. Consider position sizing and monitor for impermanent loss.";
  } else if (volatilityInPercentage < 100) {
    volatilityLevel = "High";
    stability = "Volatile";
    assessment =
      "This token shows high price volatility, indicating significant price fluctuations and unstable behavior.";
    recommendation =
      "This token has high volatility risk. Consider smaller position sizes and active monitoring for impermanent loss.";
  } else if (volatilityInPercentage < 200) {
    volatilityLevel = "Very High";
    stability = "Very Volatile";
    assessment =
      "This token shows very high price volatility, indicating extreme price fluctuations and highly unstable behavior.";
    recommendation =
      "This token has very high volatility risk. Consider very small position sizes or avoiding LP positions entirely.";
  } else {
    volatilityLevel = "Extreme";
    stability = "Extremely Volatile";
    assessment =
      "This token shows extreme price volatility, indicating massive price fluctuations and extremely unstable behavior.";
    recommendation =
      "This token has extreme volatility risk. Strongly recommend avoiding LP positions due to very high impermanent loss risk.";
  }

  // Enhance assessment with specific volatility details
  assessment += ` The annualized volatility is ${volatilityInPercentage.toFixed(2)}%, which is ${volatilityLevel.toLowerCase()} compared to typical assets.`;

  // Add impermanent loss risk context
  if (impermanentLossRisk === "very low") {
    assessment +=
      " This makes it very suitable for liquidity provision with minimal impermanent loss concerns.";
  } else if (impermanentLossRisk === "moderate") {
    assessment +=
      " This presents moderate impermanent loss risk that should be considered when providing liquidity.";
  } else if (impermanentLossRisk === "high") {
    assessment +=
      " This presents high impermanent loss risk that requires careful consideration for liquidity provision.";
  } else if (impermanentLossRisk === "very volatile") {
    assessment +=
      " This presents very high impermanent loss risk that makes liquidity provision extremely risky.";
  }

  return {
    tokenPriceVolatility: {
      volatilityInPercentage,
      isStableAsset,
      impermanentLossRisk,
      volatilityLevel,
      stability,
      assessment,
      recommendation,
    },
  };
}
