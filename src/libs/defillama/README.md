# DefiLlama Integration Module

This module provides integration with DefiLlama APIs for fetching cryptocurrency and DeFi data.

## Features

- **Stablecoin Data**: Fetches comprehensive stablecoin information from the DefiLlama stablecoins API
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Robust error handling for API failures

## API Endpoints

### Stablecoins API

- **Endpoint**: `https://stablecoins.llama.fi/stablecoins`
- **Purpose**: Fetches a comprehensive list of all stablecoins tracked by DefiLlama
- **Returns**: Array of stablecoin objects with id, name, and symbol

## Usage

### Import the module

```typescript
import { fetchStablecoins, type Stablecoin } from "./src/libs/defillama";
```

### Fetch stablecoins

```typescript
const stablecoins = await fetchStablecoins();
console.log(`Found ${stablecoins.length} stablecoins`);

stablecoins.forEach((coin) => {
  console.log(`${coin.symbol}: ${coin.name}`);
});
```

## Types

### Stablecoin

```typescript
interface Stablecoin {
  id: string;
  name: string;
  symbol: string;
}
```

### StablecoinsResponse

```typescript
interface StablecoinsResponse {
  peggedAssets: Stablecoin[];
}
```

## Error Handling

The module includes comprehensive error handling:

- Network failures are caught and logged
- Invalid API responses are handled gracefully
- Functions return empty arrays on failure to prevent crashes

## Notes

- Uses the built-in `fetch` API (no external dependencies)
- All API calls include proper error handling
- TypeScript types are exported for use in other modules
