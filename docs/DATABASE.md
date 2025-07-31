# Database Documentation

The application uses PostgreSQL with JSONB fields for flexible data storage and optimal performance for DeFi analytics. For detailed model documentation, see [Database Models README](src/libs/database/models/README.md)

## Database Schema

### Pools Table

The main table for storing pool data and calculated metrics:

```sql
CREATE TABLE pools (
    id SERIAL,
    pool_id TEXT PRIMARY KEY,
    pool_info JSONB NOT NULL,
    token_quality JSONB NOT NULL,
    impermanent_loss JSONB NOT NULL,
    token_correlation JSONB NOT NULL,
    tokens_volatility JSONB NOT NULL,
    pool_growth_tendency JSONB NOT NULL,
    apy_volatility JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key fields:**

- `pool_id`: Unique pool identifier (e.g., "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640")
- `pool_info`: Pool metadata (tokens, TVL, fee tier, etc.)
- `token_quality`: Token quality assessment data
- `impermanent_loss`: Impermanent loss calculations
- `token_correlation`: Token correlation analysis
- `tokens_volatility`: Price volatility metrics
- `pool_growth_tendency`: Pool growth trend analysis
- `apy_volatility`: APY volatility statistics

### Users Table

User management and authentication:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id_raw VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL UNIQUE,
    delegated_wallet_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key fields:**

- `user_id`: UUID user id format that is auto generated based on `user_raw_id`
- `user_raw_id`: Privy did user id. The string filed that can be used for any user raw id format
- `delegated_wallet_hash`: A hash of a user's delegated wallet. Used for AI onchain operations

### Operations Table

Investment operation tracking:

```sql
CREATE TABLE operations (
    operation_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    operation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invested_amount DECIMAL NOT NULL,
    risky_investment DECIMAL NOT NULL,
    non_risky_investment DECIMAL NOT NULL,
    log_id UUID,
    status TEXT DEFAULT 'RECOMMENDATION_INIT',
    recommended_pools JSONB,
    profit DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key fields:**

- `operation_id` (UUID, Primary Key) - Unique identifier for the operation
- `user_id` (UUID, Foreign Key) - References the user who initiated the operation
- `operation_date` (TIMESTAMP) - When the operation was initiated
- `invested_amount` (DECIMAL) - Total amount invested
- `risky_investment` (DECIMAL) - Portion invested in high-risk assets
- `non_risky_investment` (DECIMAL) - Portion invested in low-risk assets
- `log_id` (UUID, Optional FK) - Latest operations_logs log_id
- `status` (TEXT) - Current status: 'RECOMMENDATION_INIT', 'RECOMMENDATION_FINISHED', 'RECOMMENDATION_FAILED', 'DEPOSIT_INIT', 'DEPOSIT_FAILED', 'ACTIVE_INVESTMENT', 'CLOSED_INVESTMENT'
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

The operation status field tracks the current state of an investment operation:

- **RECOMMENDATION_INIT** - Initial state when user requests pool recommendations
- **RECOMMENDATION_FINISHED** - Pool recommendation process completed successfully
- **RECOMMENDATION_FAILED** - Pool recommendation process failed
- **DEPOSIT_INIT** - User initiated deposit process
- **DEPOSIT_FAILED** - Deposit process failed
- **ACTIVE_INVESTMENT** - Investment is active and running
- **CLOSED_INVESTMENT** - Investment has been closed/completed

### Operations Logs Table

Detailed operation logging:

```sql
CREATE TABLE operations_logs (
    log_id UUID PRIMARY KEY,
    operation_id UUID NOT NULL,
    description TEXT NOT NULL,
    create_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    step_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key fields:**

- `log_id` (UUID, Primary Key) - Unique identifier for the log entry
- `operation_id` (UUID, Foreign Key) - References the operation
- `description` (TEXT) - Log message or step description
- `create_date` (TIMESTAMP) - Time the log was recorded
- `step_number` (INT) - Order of the step in the operation execution flow
- `created_at` (TIMESTAMP) - Record creation time

## JSONB Data Structure

### Pool Info Structure

```json
{
  "feeTier": "500",
  "id": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
  "liquidity": "4238720467414425241",
  "token0": {
    "decimals": "6",
    "id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "name": "USD Coin",
    "symbol": "USDC"
  },
  "token1": {
    "decimals": "18",
    "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    "name": "Wrapped Ether",
    "symbol": "WETH"
  },
  "totalValueLockedUSD": "469434302.7814979505916768168664411",
  "isStablecoinPool": false
}
```

### Token Quality Structure

```json
{
  "token0": {
    "qualityScore": "Good",
    "trustworthiness": "High",
    "assessment": "This token shows good quality...",
    "recommendation": "This token shows good quality metrics..."
  },
  "token1": {
    "qualityScore": "Good",
    "trustworthiness": "High",
    "assessment": "This token shows good quality...",
    "recommendation": "This token shows good quality metrics..."
  }
}
```

### Impermanent Loss Structure

```json
{
  "impermanent_loss_percentage": -2.27,
  "impact": "Small impact on position value",
  "recommendation": "Low impermanent loss risk...",
  "price_movement": {
    "token0": {
      "change_percentage": 0.001,
      "movement": "Stable"
    },
    "token1": {
      "change_percentage": -34.96,
      "movement": "Strong decrease"
    }
  },
  "hodl_vs_lp_comparison": {
    "lp_value": 0.977,
    "difference": -0.023,
    "performance": "LP position underperforming HODL strategy"
  }
}
```

## Indexes and Performance

### Primary Indexes

```sql
-- Pool ID lookup
CREATE INDEX idx_pools_pool_id ON pools(pool_id);

-- Updated timestamp for sorting
CREATE INDEX idx_pools_updated_at ON pools(updated_at);

-- JSONB GIN indexes for efficient querying
CREATE INDEX idx_pools_pool_info_gin ON pools USING GIN(pool_info);
CREATE INDEX idx_pools_token_quality_gin ON pools USING GIN(token_quality);
CREATE INDEX idx_pools_impermanent_loss_gin ON pools USING GIN(impermanent_loss);
CREATE INDEX idx_pools_token_correlation_gin ON pools USING GIN(token_correlation);
CREATE INDEX idx_pools_tokens_volatility_gin ON pools USING GIN(tokens_volatility);
CREATE INDEX idx_pools_pool_growth_tendency_gin ON pools USING GIN(pool_growth_tendency);
CREATE INDEX idx_pools_apy_volatility_gin ON pools USING GIN(apy_volatility);
```

### JSONB Field Indexes

```sql
-- Token address lookups
CREATE INDEX idx_pools_token0_id ON pools USING GIN((pool_info->'token0'->>'id'));
CREATE INDEX idx_pools_token1_id ON pools USING GIN((pool_info->'token1'->>'id'));

-- Fee tier filtering
CREATE INDEX idx_pools_fee_tier ON pools USING GIN((pool_info->>'feeTier'));

-- TVL filtering
CREATE INDEX idx_pools_total_value_locked ON pools USING GIN((pool_info->>'totalValueLockedUSD'));
```

## Query Examples

### Get Pools by Token Address

```sql
SELECT * FROM pools
WHERE pool_info->>'token0'->>'id' = $1
   OR pool_info->>'token1'->>'id' = $1
ORDER BY updated_at DESC;
```

### Get Pools by Fee Tier

```sql
SELECT * FROM pools
WHERE pool_info->>'feeTier' = $1
ORDER BY updated_at DESC;
```

### Get Pools by Minimum TVL

```sql
SELECT * FROM pools
WHERE CAST(pool_info->>'totalValueLockedUSD' AS DECIMAL) >= $1
ORDER BY updated_at DESC;
```

### Get Pools with High Volatility

```sql
SELECT * FROM pools
WHERE tokens_volatility->'token0'->'tokenPriceVolatility'->>'volatilityLevel' = 'High'
   OR tokens_volatility->'token1'->'tokenPriceVolatility'->>'volatilityLevel' = 'High'
ORDER BY updated_at DESC;
```

## Migrations

### Migration Files

1. `001_create_users_table.sql` - Users table
2. `002_create_operations_table.sql` - Operations table
3. `003_create_operations_logs_table.sql` - Operations logs table
4. `004_create_pools_table.sql` - Pools table with JSONB fields

## Database Models

### PoolModel

Comprehensive CRUD operations for pool data:

```typescript
import { PoolModel } from "@/libs/database/models/poolModel";

// Create pool
const result = await PoolModel.create(poolData);

// Get pool by ID
const pool = await PoolModel.findByPoolId(
  "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
);

// Get all pools
const allPools = await PoolModel.findAll();

// Update pool
const updateResult = await PoolModel.update(poolId, updateData);

// Upsert pool (create or update)
const upsertResult = await PoolModel.upsert(poolData);

// Get pools by token address
const tokenPools = await PoolModel.getPoolsByTokenAddress(
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
);

// Get pools by fee tier
const feeTierPools = await PoolModel.getPoolsByFeeTier("500");

// Get pools by minimum TVL
const highTVLPools = await PoolModel.getPoolsByMinTVL(1000000);
```

### UserModel

User management operations:

```typescript
import { UserModel } from "@/libs/database/models/userModel";

// Create user
const user = await UserModel.create(userData);

// Get user by ID
const user = await UserModel.findByUserId(userId);

// Get user by raw ID
const user = await UserModel.findByUserIdRaw(userIdRaw);
```

### OperationModel

Investment operation tracking:

```typescript
import { OperationModel } from "@/libs/database/models/operationModel";

// Create operation
const operation = await OperationModel.create(operationData);

// Get operations by user
const operations = await OperationModel.findByUserId(userId);

// Update operation
const result = await OperationModel.update(operationId, updateData);

// Get last operation by status
const lastOperation = await OperationModel.findLastByUserIdRawAndStatus(
  userIdRaw,
  status
);
```

## Connection Management

### Environment Configuration

```env
DATABASE_URL=postgresql://user:password@localhost:5432/piggy_pot
```
