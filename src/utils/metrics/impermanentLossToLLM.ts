import { ImpermanentLossLLMOutput } from "../../types/metrics/llmFormats";
import { ImpermanentLossResult } from "../../types/metrics/rawFormat";

/**
 * Convert impermanent loss calculations to LLM-friendly output format
 */
export function impermanentLossToLLM(
  result: ImpermanentLossResult
): ImpermanentLossLLMOutput {
  const { impermanent_loss_percentage } = result;

  // Determine severity and risk level based on impermanent loss percentage
  let impact: string;
  let recommendation: string;

  if (impermanent_loss_percentage > -1) {
    impact = "Negligible impact on position value";
    recommendation =
      "This pool has minimal impermanent loss risk. Safe for long-term holding.";
  } else if (impermanent_loss_percentage > -5) {
    impact = "Small impact on position value";
    recommendation =
      "Low impermanent loss risk. Consider monitoring price movements.";
  } else if (impermanent_loss_percentage > -15) {
    impact = "Noticeable impact on position value";
    recommendation =
      "Moderate impermanent loss risk. Consider rebalancing or monitoring closely.";
  } else if (impermanent_loss_percentage > -30) {
    impact = "Significant impact on position value";
    recommendation =
      "High impermanent loss risk. Consider reducing position or rebalancing.";
  } else {
    impact = "Severe impact on position value";
    recommendation =
      "Very high impermanent loss risk. Consider exiting position or significant rebalancing.";
  }

  // Determine token movement descriptions
  const token0Movement = getMovementDescription(
    result.price_movement.token0.change_percentage
  );
  const token1Movement = getMovementDescription(
    result.price_movement.token1.change_percentage
  );

  // Determine LP vs HODL performance
  const performance =
    result.hodl_vs_lp_comparison.difference > 0
      ? "LP position outperforming HODL strategy"
      : result.hodl_vs_lp_comparison.difference < -10
        ? "LP position significantly underperforming HODL strategy"
        : "LP position underperforming HODL strategy";

  return {
    impermanent_loss_percentage: result.impermanent_loss_percentage,
    impact,
    recommendation,
    price_movement: {
      token0: {
        change_percentage: result.price_movement.token0.change_percentage,
        movement: token0Movement,
      },
      token1: {
        change_percentage: result.price_movement.token1.change_percentage,
        movement: token1Movement,
      },
    },
    hodl_vs_lp_comparison: {
      lp_value: result.hodl_vs_lp_comparison.lp_value,
      difference: result.hodl_vs_lp_comparison.difference,
      performance,
    },
  };
}

/**
 * Helper function to describe price movement
 */
function getMovementDescription(changePercentage: number): string {
  if (changePercentage > 50) {
    return "Extreme increase";
  } else if (changePercentage > 20) {
    return "Strong increase";
  } else if (changePercentage > 5) {
    return "Moderate increase";
  } else if (changePercentage > 1) {
    return "Slight increase";
  } else if (changePercentage > -1) {
    return "Stable";
  } else if (changePercentage > -5) {
    return "Slight decrease";
  } else if (changePercentage > -20) {
    return "Moderate decrease";
  } else if (changePercentage > -50) {
    return "Strong decrease";
  } else {
    return "Extreme decrease";
  }
}
