import { ONE_INCH_API_KEY } from "./1inch";
import dotenv from "dotenv";
import { getDatabaseUrl } from "./database";
import { SUBGRAPH_KEY, SUBGRAPH_URL } from "./subgraph";

dotenv.config();

if (!process.env.CHAIN_ID) {
  throw new Error("CHAIN_ID is not set");
}

// TODO: Add other config here and migrate to new config file
export const appConfig = {
  oneInch: {
    apiKey: ONE_INCH_API_KEY,
  },
  database: {
    url: getDatabaseUrl(),
  },
  subgraph: {
    url: SUBGRAPH_URL,
    apiKey: SUBGRAPH_KEY,
  },
  chainId: parseInt(process.env.CHAIN_ID),
};
