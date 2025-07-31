import { PoolGrowthTrendLLMOutput } from "@/types/metrics/llmFormats";
import { PoolGrowthTrendResult } from "@/types/metrics/rawFormat";

/**
 * Convert pool growth trend calculations to LLM-friendly output format
 *
 * @param result - The pool growth trend result
 * @returns The pool growth trend in LLM-friendly format
 */
export function poolGrowthTrendToLLM(
  result: PoolGrowthTrendResult
): PoolGrowthTrendLLMOutput {
  const { poolGrowthTrendInPercentage, trend } = result;

  if (poolGrowthTrendInPercentage === null || trend === null) {
    return {
      poolGrowthTrendInPercentage: 0,
      trend: "unknown",
      performance: "No data available",
      assessment: "Unable to assess pool performance due to insufficient data",
      recommendation:
        "Consider checking if the pool has sufficient historical data for analysis",
    };
  }

  let performance: string;
  let assessment: string;
  let recommendation: string;

  if (trend === "positive") {
    if (poolGrowthTrendInPercentage > 50) {
      performance = "Exceptional growth";
      assessment =
        "This pool has shown exceptional performance with substantial growth in TVL and fees";
      recommendation =
        "This pool demonstrates excellent performance. Consider maintaining or increasing position size.";
    } else if (poolGrowthTrendInPercentage > 20) {
      performance = "Strong growth";
      assessment =
        "This pool has shown strong positive performance with healthy growth in TVL and fees";
      recommendation =
        "This pool shows strong performance. Consider maintaining current position or moderate increase.";
    } else if (poolGrowthTrendInPercentage > 5) {
      performance = "Moderate growth";
      assessment =
        "This pool has shown moderate positive performance with steady growth in TVL and fees";
      recommendation =
        "This pool shows moderate growth. Monitor performance and consider maintaining position.";
    } else {
      performance = "Slight growth";
      assessment =
        "This pool has shown minimal positive performance with slight growth in TVL and fees";
      recommendation =
        "This pool shows minimal growth. Consider monitoring closely or exploring alternatives.";
    }
  } else {
    if (poolGrowthTrendInPercentage < -50) {
      performance = "Severe decline";
      assessment =
        "This pool has shown severe negative performance with substantial decline in TVL and fees";
      recommendation =
        "This pool shows concerning decline. Consider reducing position or exiting entirely.";
    } else if (poolGrowthTrendInPercentage < -20) {
      performance = "Significant decline";
      assessment =
        "This pool has shown significant negative performance with notable decline in TVL and fees";
      recommendation =
        "This pool shows significant decline. Consider reducing position size or monitoring closely.";
    } else if (poolGrowthTrendInPercentage < -5) {
      performance = "Moderate decline";
      assessment =
        "This pool has shown moderate negative performance with some decline in TVL and fees";
      recommendation =
        "This pool shows moderate decline. Consider monitoring performance and reducing exposure.";
    } else {
      performance = "Slight decline";
      assessment =
        "This pool has shown minimal negative performance with slight decline in TVL and fees";
      recommendation =
        "This pool shows slight decline. Monitor performance and consider alternatives if trend continues.";
    }
  }

  return {
    poolGrowthTrendInPercentage,
    trend,
    performance,
    assessment,
    recommendation,
  };
}
