import { TokenCorrelationLLMOutput } from "../../types/metrics/llmFormats";
import { TokenCorrelationResult } from "../../types/metrics/rawFormat";

/**
 * Convert token correlation calculations to LLM-friendly output format
 */
export function tokenCorrelationToLLM(
  result: TokenCorrelationResult
): TokenCorrelationLLMOutput {
  const { correlation } = result;

  // Determine correlation strength description
  let correlationStrength: string;
  let relationship: string;
  let assessment: string;
  let recommendation: string;

  if (correlation > 0.9) {
    correlationStrength = "Very Strong Positive";
    relationship = "Highly correlated - tokens move together strongly";
    assessment =
      "These tokens show very strong positive correlation, indicating they tend to move in the same direction with similar magnitude";
    recommendation =
      "This pair has low impermanent loss risk. Consider for stable LP positions with predictable behavior.";
  } else if (correlation > 0.7) {
    correlationStrength = "Strong Positive";
    relationship = "Strongly correlated - tokens move together";
    assessment =
      "These tokens show strong positive correlation, indicating they generally move in the same direction";
    recommendation =
      "This pair has moderate impermanent loss risk. Suitable for LP positions with some volatility tolerance.";
  } else if (correlation > 0.5) {
    correlationStrength = "Moderate Positive";
    relationship = "Moderately correlated - tokens have some relationship";
    assessment =
      "These tokens show moderate positive correlation, indicating some relationship in their price movements";
    recommendation =
      "This pair has moderate impermanent loss risk. Monitor performance and consider position sizing carefully.";
  } else if (correlation > 0.3) {
    correlationStrength = "Weak Positive";
    relationship = "Weakly correlated - minimal relationship";
    assessment =
      "These tokens show weak positive correlation, indicating minimal relationship in their price movements";
    recommendation =
      "This pair has high impermanent loss risk. Consider smaller position sizes and active monitoring.";
  } else if (correlation > 0) {
    correlationStrength = "Very Weak Positive";
    relationship = "Very weakly correlated - almost independent";
    assessment =
      "These tokens show very weak positive correlation, indicating they move almost independently";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  } else if (correlation === 0) {
    correlationStrength = "No Correlation";
    relationship = "Uncorrelated - tokens move independently";
    assessment =
      "These tokens show no correlation, indicating they move completely independently of each other";
    recommendation =
      "This pair has very high impermanent loss risk. Consider avoiding or using very small position sizes.";
  } else if (correlation > -0.3) {
    correlationStrength = "Very Weak Negative";
    relationship = "Very weakly negatively correlated";
    assessment =
      "These tokens show very weak negative correlation, indicating slight inverse relationship";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  } else if (correlation > -0.5) {
    correlationStrength = "Weak Negative";
    relationship = "Weakly negatively correlated";
    assessment =
      "These tokens show weak negative correlation, indicating some inverse relationship";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  } else if (correlation > -0.7) {
    correlationStrength = "Moderate Negative";
    relationship = "Moderately negatively correlated";
    assessment =
      "These tokens show moderate negative correlation, indicating inverse relationship";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  } else if (correlation > -0.9) {
    correlationStrength = "Strong Negative";
    relationship = "Strongly negatively correlated";
    assessment =
      "These tokens show strong negative correlation, indicating strong inverse relationship";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  } else {
    correlationStrength = "Very Strong Negative";
    relationship = "Very strongly negatively correlated";
    assessment =
      "These tokens show very strong negative correlation, indicating they move in opposite directions";
    recommendation =
      "This pair has very high impermanent loss risk. Consider alternatives or very small position sizes.";
  }

  return {
    tokenCorrelation: {
      correlation,
      correlationStrength,
      relationship,
      assessment,
      recommendation,
    },
  };
}
