//**
// Flow:
// 1. Get user infromation from frontend
// 2. Fetch pools and metrics using custom provider
// 3. Get current user's active operation and it status
// 3. Generate a prompt to LLM with pools information and user information (by batches as we have a lot of pools)
// 4. Call LLM and get recommendations in JSON format
// 5. Save recommendation to database per user
// 6. Return the recommendations to frontend
//
// Question:
// We have operation per user table and eliza memmory table. How to save in one table here?
//
//  */

import {
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
  Action,
} from "@elizaos/core";

export const recommendPoolsAction: Action = {
  name: "POOL_RECOMMENDATIONS",
  similes: [
    "POOL_SUGGESTIONS",
    "POOL_ANALYSIS_AND_RECOMMENDATIONS",
    "LIQUIDITY_POOL_RECOMMENDATIONS",
    "DEFI_POOL_ANALYSIS",
    "INVESTMENT_POOL_SUGGESTIONS",
    "YIELD_FARMING_RECOMMENDATIONS",
  ],
  description:
    "Analyzes DeFi liquidity pools by fetching data from subgraphs, calculating complex metrics (APY, impermanent loss, volatility, correlation), and provides personalized investment recommendations based on user risk tolerance - conservative users receive 1 stablecoin pool recommendation, while risk-tolerant users receive 2 pools (1 stable + 1 volatile) for optimal portfolio diversification",

  validate: async (
    _runtime: IAgentRuntime,
    message: Memory,
    state: State
  ): Promise<boolean> => {
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {},
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'm comfortable with risk and want to maximize my returns. What pools should I invest in?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Based on your risk tolerance, here are 2 recommended pools for optimal returns: 1 stablecoin pool for stability and 1 volatile pool for higher yields: ",
          actions: ["POOL_RECOMMENDATIONS"],
          providers: ["FETCH_POOLS_AND_CALCULATE_METRICS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I prefer conservative investments with minimal risk. Which stablecoin pools are safest?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "For conservative investors, here's the top stablecoin pool with excellent yields and minimal risk: ",
          actions: ["POOL_RECOMMENDATIONS"],
          providers: ["FETCH_POOLS_AND_CALCULATE_METRICS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I want to invest in both stable and volatile assets. What's the best combination?",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "Perfect! Here are 2 pools for balanced exposure: 1 stablecoin pool for safety and 1 volatile pool for growth potential: ",
          actions: ["POOL_RECOMMENDATIONS"],
          providers: ["FETCH_POOLS_AND_CALCULATE_METRICS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'm new to DeFi and want to start with safe investments only",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "For beginners, I recommend starting with this stablecoin pool that offers good yields with minimal risk: ",
          actions: ["POOL_RECOMMENDATIONS"],
          providers: ["FETCH_POOLS_AND_CALCULATE_METRICS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'm an experienced investor looking for high-risk, high-reward opportunities",
        },
      },
      {
        name: "Eliza",
        content: {
          text: "For experienced investors seeking high returns, here are 2 pools: 1 stablecoin pool for base stability and 1 high-volatility pool for maximum growth potential: ",
          actions: ["POOL_RECOMMENDATIONS"],
          providers: ["FETCH_POOLS_AND_CALCULATE_METRICS"],
        },
      },
    ],
  ],
};
