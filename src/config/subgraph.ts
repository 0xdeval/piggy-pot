import dotenv from "dotenv";

dotenv.config();

if (!process.env.SUBGRAPH_KEY || !process.env.UNISWAP_V3_SUBGRAPH_ID) {
  throw new Error(
    "SUBGRAPH_KEY or/and UNISWAP_V3_SUBGRAPH_ID are not set. These values are necessary to fetch data from the subgraph about Uniswap positions"
  );
}

export const UNISWAP_V3_SUBGRAPH_ID = process.env.UNISWAP_V3_SUBGRAPH_ID;
export const SUBGRAPH_KEY = process.env.SUBGRAPH_KEY;
export const SUBGRAPH_URL = `https://gateway.thegraph.com/api/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`;

export const TOP_POOLS_PER_QUERY = 150;
