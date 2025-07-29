import { TokenQualityLLMOutput } from "../../types/metrics/llmFormats";
import { TokenQualityInfo } from "../../types/metrics/rawFormat";

/**
 * Convert token quality evaluation to LLM-friendly output format
 */
export function tokenQualityToLLM(
  tokenQuality: TokenQualityInfo[string]
): TokenQualityLLMOutput {
  const { hasInProviders, hasInternalTags, hasEip2612, rating } = tokenQuality;

  // Calculate quality score based on all factors
  let qualityScore: string;
  let trustworthiness: string;
  let assessment: string;
  let recommendation: string;

  // Calculate a composite score (0-10 scale)
  let compositeScore = 0;
  let factors = 0;

  if (hasInProviders) {
    compositeScore += 3;
    factors++;
  }
  if (hasInternalTags) {
    compositeScore += 2;
    factors++;
  }
  if (hasEip2612) {
    compositeScore += 1;
    factors++;
  }
  if (rating > 0) {
    compositeScore += Math.min(rating, 4); // Cap rating contribution at 4
    factors++;
  }

  // Normalize score to 0-10 scale
  const normalizedScore = factors > 0 ? (compositeScore / factors) * 2.5 : 0;

  // Determine quality score and trustworthiness
  if (normalizedScore >= 8) {
    qualityScore = "Excellent";
    trustworthiness = "Very High";
    assessment =
      "This token demonstrates excellent quality with strong provider support, proper tagging, and high rating. It appears to be a well-established and trustworthy token.";
    recommendation =
      "This token shows excellent quality metrics. Consider it for LP positions with confidence.";
  } else if (normalizedScore >= 6) {
    qualityScore = "Good";
    trustworthiness = "High";
    assessment =
      "This token shows good quality with solid provider support and reasonable rating. It appears to be a reliable token with good standing.";
    recommendation =
      "This token shows good quality metrics. Suitable for LP positions with moderate confidence.";
  } else if (normalizedScore >= 4) {
    qualityScore = "Fair";
    trustworthiness = "Moderate";
    assessment =
      "This token shows fair quality with some provider support and moderate rating. Exercise caution and verify additional information.";
    recommendation =
      "This token shows fair quality metrics. Consider smaller position sizes and additional due diligence.";
  } else if (normalizedScore >= 2) {
    qualityScore = "Poor";
    trustworthiness = "Low";
    assessment =
      "This token shows poor quality with limited provider support and low rating. High risk of being unreliable or potentially problematic.";
    recommendation =
      "This token shows poor quality metrics. Consider avoiding or using very small position sizes with extreme caution.";
  } else {
    qualityScore = "Very Poor";
    trustworthiness = "Very Low";
    assessment =
      "This token shows very poor quality with minimal provider support and very low rating. High risk of being unreliable, scam, or problematic.";
    recommendation =
      "This token shows very poor quality metrics. Strongly recommend avoiding this token for LP positions.";
  }

  // Add specific details about individual factors
  const factorDetails = [];
  if (hasInProviders) {
    factorDetails.push("listed in major providers");
  } else {
    factorDetails.push("not listed in major providers");
  }
  if (hasInternalTags) {
    factorDetails.push("has internal quality tags");
  } else {
    factorDetails.push("no internal quality tags");
  }
  if (hasEip2612) {
    factorDetails.push("supports EIP-2612 (gasless approvals)");
  } else {
    factorDetails.push("does not support EIP-2612");
  }
  if (rating > 0) {
    factorDetails.push(`has a rating of ${rating}/10`);
  } else {
    factorDetails.push("no rating available");
  }

  // Enhance assessment with specific details
  assessment += ` Specific factors: ${factorDetails.join(", ")}.`;

  return {
    tokenQuality: {
      hasInProviders,
      hasInternalTags,
      hasEip2612,
      rating,
      qualityScore,
      trustworthiness,
      assessment,
      recommendation,
    },
  };
}
