import { APYVolatilityLLMOutput } from "../../types/metrics/llmFormats";

/**
 * Calculate APY volatility stats with LLM-friendly output format
 */
export async function calculateAPYVolatilityForLLM({
  stdDev,
  mean,
  coefficientOfVariation,
}: {
  stdDev: number;
  mean: number;
  coefficientOfVariation: number;
}): Promise<APYVolatilityLLMOutput> {
  // Determine stability score and risk level
  let stabilityScore: string;
  let riskLevel: string;
  let description: string;

  if (coefficientOfVariation < 0.3) {
    stabilityScore = "Very Stable";
    riskLevel = "Low";
    description =
      "This pool shows very consistent APY performance with minimal volatility.";
  } else if (coefficientOfVariation < 0.5) {
    stabilityScore = "Stable";
    riskLevel = "Low-Medium";
    description =
      "This pool demonstrates stable APY performance with moderate volatility.";
  } else if (coefficientOfVariation < 0.8) {
    stabilityScore = "Moderate";
    riskLevel = "Medium";
    description =
      "This pool shows moderate APY volatility with some fluctuations.";
  } else if (coefficientOfVariation < 1.2) {
    stabilityScore = "Volatile";
    riskLevel = "Medium-High";
    description =
      "This pool exhibits high APY volatility with significant fluctuations.";
  } else {
    stabilityScore = "Very Volatile";
    riskLevel = "High";
    description =
      "This pool shows very high APY volatility with extreme fluctuations.";
  }

  return {
    stdDev,
    mean,
    coefficientOfVariation,
    stabilityScore,
    riskLevel,
    description,
  };
}
