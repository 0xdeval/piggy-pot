import { appConfig } from "@/config";
import { PoolDayData, PoolHistoryResponse } from "@/types/subgraph";
import { logger } from "@/utils/logger";

export async function fetchPoolDayData(
  poolId: string,
  from: number
): Promise<PoolDayData[]> {
  const query = `
  query PoolHistory($poolId: ID!, $from: Int!) {
    poolDayDatas(
      where: { pool: $poolId, date_gte: $from }
      orderBy: date
      orderDirection: asc
      first: 1000
    ) {
      date
      tvlUSD
      feesUSD
    }
  }
`;

  const res = await fetch(appConfig.subgraph.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.subgraph.apiKey}`,
    },
    body: JSON.stringify({
      query,
      variables: { poolId: poolId.toLowerCase(), from },
    }),
  });

  const json = (await res.json()) as PoolHistoryResponse;

  // Debug: print errors or empty state
  if ((json as any).errors) {
    logger.error("GraphQL Error:", (json as any).errors);
    throw new Error("Subgraph query failed");
  }

  if (!json.data || !json.data.poolDayDatas) {
    logger.error("Unexpected response format:", json);
    throw new Error("Missing poolDayDatas in response");
  }

  logger.debug("response for pool day data", {
    poolId,
    dataLength: json.data.poolDayDatas.length,
  });

  return json.data.poolDayDatas;
}
