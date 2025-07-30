import type { Plugin } from "@elizaos/core";
import {
  type Action,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from "@elizaos/core";
import { z } from "zod";
import { LiquidityManagerService } from "../services/liquidityManagerService";

const configSchema = z.object({
  // Database configuration
  DATABASE_CONNECTION_URL: z
    .string()
    .min(1, "Database connection URL is required")
    .url("Database connection URL must be a valid URL")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: DATABASE_CONNECTION_URL is not provided");
      }
      return val;
    }),

  // UUID configuration
  UUID_NAMESPACE: z
    .string()
    .min(1, "UUID namespace is required")
    .uuid("UUID namespace must be a valid UUID")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: UUID_NAMESPACE is not provided");
      }
      return val;
    }),

  // Subgraph configuration
  SUBGRAPH_KEY: z
    .string()
    .min(1, "Subgraph API key is required")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: SUBGRAPH_KEY is not provided");
      }
      return val;
    }),

  UNISWAP_V3_SUBGRAPH_ID: z
    .string()
    .min(1, "Uniswap V3 subgraph ID is required")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: UNISWAP_V3_SUBGRAPH_ID is not provided");
      }
      return val;
    }),

  // 1inch configuration
  ONE_INCH_API_KEY: z
    .string()
    .min(1, "1inch API key is required")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: ONE_INCH_API_KEY is not provided");
      }
      return val;
    }),

  // Chain configuration
  CHAIN_ID: z
    .string()
    .min(1, "Chain ID is required")
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn("Warning: CHAIN_ID is not provided");
      }
      return val;
    }),
});

const liquidityManagerPlugin: Plugin = {
  name: "liquidity-manager-plugin",
  description:
    "A plugin that fetch, filter and recommend Uniswap V3 pools based on user's risk tolerance and goals",
  priority: 9999999,
  config: {
    DATABASE_CONNECTION_URL: process.env.DATABASE_CONNECTION_URL,
    UUID_NAMESPACE: process.env.UUID_NAMESPACE,
    SUBGRAPH_KEY: process.env.SUBGRAPH_KEY,
    UNISWAP_V3_SUBGRAPH_ID: process.env.UNISWAP_V3_SUBGRAPH_ID,
    ONE_INCH_API_KEY: process.env.ONE_INCH_API_KEY,
    CHAIN_ID: process.env.CHAIN_ID,
  },
  async init(config: Record<string, string>) {
    logger.info("*** Initializing starter plugin ***");
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  },
  // Fallback models to call if other models are not available
  models: {},
  // Routes that can be exposed externally
  routes: [],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("MESSAGE_RECEIVED event received");

        logger.info(Object.keys(params));
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info("VOICE_MESSAGE_RECEIVED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info("WORLD_CONNECTED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info("WORLD_JOINED event received");
        // print the keys
        logger.info(Object.keys(params));
      },
    ],
  },
  services: [LiquidityManagerService],
  actions: [],
  providers: [],
};

export default liquidityManagerPlugin;
