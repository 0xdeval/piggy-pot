# Uniswap V3 Pool Fetcher

This script fetches information about Uniswap V3 pools based on specific criteria and provides detailed analysis.

## Features

- Fetches pools with TVL > $1,000,000 USD
- Filters pools based on adjusted liquidity (considering token decimals)
- Filters ticks based on adjusted liquidity thresholds
- Identifies stablecoin pools by comparing against the stablecoins.llama.fi API
- Provides detailed pool information including:
  - Pool ID
  - Token information (symbol, name, decimals)
  - Fee tier
  - Raw and adjusted liquidity values
  - TVL in USD
  - Filtered tick data with adjusted liquidity
  - Stablecoin pool detection

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:

```env
SUBGRAPH_KEY=your_subgraph_api_key
UNISWAP_V3_SUBGRAPH_ID=your_uniswap_v3_subgraph_id
```

## Usage

### Run the script directly:

```bash
npm run fetch-pools
```

### Import and use in your code:

```typescript
import { fetchPools, main } from "./src/libs/subgraph";

// Run the complete analysis
await main();

// Or fetch pools programmatically
const pools = await fetchPools();
```

## Output

The script will output:

1. **Pool Details**: For each pool, it shows:

   - Pool ID
   - Token pair information
   - Fee tier (as percentage)
   - Raw and adjusted liquidity amounts
   - TVL in USD
   - Whether it's a stablecoin pool
   - Number of valid ticks
   - Sample tick data with adjusted liquidity

2. **Summary Statistics**:
   - Total number of pools found
   - Number of stablecoin pools
   - Total TVL across all pools

## API Dependencies

- **Uniswap V3 Subgraph**: Uses GraphQL to fetch pool data
- **Stablecoins.llama.fi**: Fetches the list of stablecoins to identify stablecoin pools

## Error Handling

The script includes comprehensive error handling for:

- Network failures
- Invalid API responses
- Missing environment variables
- GraphQL query errors

## Notes

- The script uses the built-in `fetch` API (no axios dependency)
- Stablecoin detection is based on symbol matching from the stablecoins.llama.fi API
- APR calculation is simplified using liquidity as a proxy since exact APR calculation requires complex historical data analysis
