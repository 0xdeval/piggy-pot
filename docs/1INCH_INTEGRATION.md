# 1inch API Integration

The application leverages the 1inch API to enhance token quality assessment and price analysis. This integration is crucial for providing accurate risk assessments and investment recommendations.

## API Configuration

The 1inch API is configured via environment variables:

```env
ONE_INCH_API_KEY=your_1inch_api_key_here
```

## Available Endpoints

### 1. Token Details & Quality Assessment

- **Endpoint**: `GET /token/v1.3/{chainId}/custom`
- **Purpose**: Fetch comprehensive token information for quality evaluation
- **Usage**: Used in token quality assessment to determine trustworthiness

```typescript
import { fetchTokensDetails } from "@/libs/1inch/fetchTokensDetails";

const tokenDetails = await fetchTokensDetails(
  ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"], // USDC
  appConfig.chainId
);
```

**Returns**:

- Token metadata (name, symbol, decimals)
- Provider support (which DEXs list the token)
- EIP-2612 support (gasless approvals)
- Quality tags and ratings
- Logo URI

### 2. Current Token Prices

- **Endpoint**: `GET /price/v1.1/{chainId}/{tokenAddresses}`
- **Purpose**: Get real-time token prices for calculations
- **Usage**: Used for impermanent loss calculations and price analysis

```typescript
import { fetchCurrentTokensPrices } from "@/libs/1inch/fetchCurrentTokensPrices";

const prices = await fetchCurrentTokensPrices({
  tokenAddresses: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
  chainId: 1,
});
```

### 3. Historical Price Data

- **Endpoint**: `GET /token-details/v1.0/charts/range/{chainId}/{tokenAddress}`
- **Purpose**: Fetch historical price data for volatility analysis
- **Usage**: Used for token price volatility calculations and trend analysis

```typescript
import { fetchHistoricalTokenPrice } from "@/libs/1inch/fetchHistoricalTokenPrice";

const historicalData = await fetchHistoricalTokenPrice({
  tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  chainId: 1,
  from: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
  interval: "1h",
});
```

## Integration in Pool Analysis

The 1inch API data is used throughout the pool analysis process:

### Token Quality Assessment

```typescript
// Used in evaluateTokenQuality function
const tokenDetails = await fetchTokensDetails(tokenAddresses, chainId);

// Quality factors assessed:
// - Provider support (hasInProviders)
// - Internal quality tags (hasInternalTags)
// - EIP-2612 support (hasEip2612)
// - Overall rating (rating)
```

### Price Volatility Analysis

```typescript
// Used in calculateTokenVolatility function
const historicalPrices = await fetchHistoricalTokenPrice({
  tokenAddress,
  chainId,
  from: thirtyDaysBackTimestamp,
  interval: "1h",
});

// Calculates:
// - Price volatility percentage
// - Volatility level (Low/Medium/High)
// - Stability assessment
```

### Impermanent Loss Calculation

```typescript
// Used in calculateImpermanentLoss function
const currentPrices = await fetchCurrentTokensPrices({
  tokenAddresses: [token0, token1],
  chainId,
});

// Calculates:
// - Impermanent loss percentage
// - Price movement analysis
// - HODL vs LP comparison
```

## Error Handling & Rate Limiting

The integration includes robust error handling:

```typescript
// Automatic retry logic
if (!res.ok) {
  logger.error(`Failed to fetch token details: ${res.statusText}`);
  return {}; // Graceful fallback
}

// Rate limiting consideration
await waitFor(1000); // 1 second delay between requests
```
