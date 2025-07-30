# Uniswap V3 Subgraph Utilities

This directory contains utilities for fetching and analyzing Uniswap V3 pool data using The Graph's subgraph API.

## Files

### `fetchPools.ts`

Fetches current pool information and provides detailed analysis of active Uniswap V3 pools.

### `fetchPoolDayData.ts`

Fetches historical daily data for specific pools, including TVL and fees over time.

## Features

### Pool Fetching (`fetchPools.ts`)

- Fetches pools with TVL > $1,000,000 USD
- Filters pools based on liquidity thresholds
- Identifies stablecoin pools by comparing against the stablecoins.llama.fi API
- Provides detailed pool information including:
  - Pool ID
  - Token information (symbol, name, decimals)
  - Fee tier
  - Liquidity values
  - TVL in USD
  - Stablecoin pool detection

### Historical Data Fetching (`fetchPoolDayData.ts`)

- Fetches daily pool data for a specific pool ID
- Retrieves historical TVL and fees data
- Supports date range filtering
- Returns structured daily data for analysis

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:

```env
SUBGRAPH_KEY=your_subgraph_api_key
UNISWAP_V3_SUBGRAPH_ID=your_uniswap_v3_subgraph_id
```

## Usage

### Fetch Current Pools

```typescript
import { fetchPools } from "./src/libs/subgraph/fetchPools";

// Fetch all qualifying pools
const pools = await fetchPools();
```

### Fetch Historical Pool Data

```typescript
import { fetchPoolDayData } from "./src/libs/subgraph/fetchPoolDayData";

// Fetch historical data for a specific pool
const poolId = "0xd0b53d9277642d899df5c87a3966a349a798f224";
const fromTimestamp = 1743897600; // Unix timestamp

const historicalData = await fetchPoolDayData(poolId, fromTimestamp);
```

## Output

### Pool Data (`fetchPools.ts`)

Returns an array of pool objects with the following structure:

```typescript
interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  liquidity: string;
  totalValueLockedUSD: string;
  isStablecoinPool: boolean;
}
```

### Historical Data (`fetchPoolDayData.ts`)

Returns an array of daily data objects with the following structure:

```typescript
interface PoolDayData {
  date: number;
  tvlUSD: number;
  feesUSD: number;
}
```

## API Dependencies

- **Uniswap V3 Subgraph**: Uses GraphQL to fetch pool data
- **Stablecoins.llama.fi**: Fetches the list of stablecoins to identify stablecoin pools

## Error Handling

Both utilities include comprehensive error handling for:

- Network failures
- Invalid API responses
- Missing environment variables
- GraphQL query errors
- Insufficient data scenarios

## Configuration

The utilities use configuration from `src/config/subgraph.ts`:

- `SUBGRAPH_URL`: The Graph API endpoint
- `SUBGRAPH_KEY`: API key for authentication
- `TOP_POOLS_PER_QUERY`: Maximum number of pools to fetch per query

## Notes

- Uses the built-in `fetch` API (no axios dependency)
- Stablecoin detection is based on symbol matching from the stablecoins.llama.fi API
- Historical data is limited to 1000 records per query
- All timestamps are in Unix format (seconds since epoch)
