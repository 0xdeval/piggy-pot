import { appConfig } from "../../config";
import { PoolDayData, PoolHistoryResponse } from "../../types/subgraph";

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
    console.error(
      "GraphQL Error:",
      JSON.stringify((json as any).errors, null, 2)
    );
    throw new Error("Subgraph query failed");
  }

  if (!json.data || !json.data.poolDayDatas) {
    console.error("Unexpected response format:", JSON.stringify(json, null, 2));
    throw new Error("Missing poolDayDatas in response");
  }

  console.log("response for pool day data", json);

  return json.data.poolDayDatas;
}
