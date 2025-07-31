# API Endpoints Documentation

This document describes all available API endpoints in the Piggy Pot application.

## Base URL

All endpoints are relative to the base URL of your application (e.g., `http://localhost:3000`).

## Authentication

Most endpoints require authentication. Include your authentication token in the request headers:

```
Authorization: Bearer your-token-here
```

## Health Check

### GET /api/health

Service health status endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Operations

### GET /api/operations

Get user operations.

**Query Parameters:**

- `userIdRaw` (required): User ID

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "operationId": "uuid-here",
      "userId": "user-uuid",
      "operationDate": "2024-01-01T00:00:00.000Z",
      "investedAmount": 10000.0,
      "riskyInvestment": 3000.0,
      "nonRiskyInvestment": 7000.0,
      "status": "RECOMMENDATION_INIT",
      "recommendedPools": [...],
      "profit": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/operations/create

Create new operation.

**Request Body:**

```json
{
  "userIdRaw": "user123",
  "investedAmount": 10000.0,
  "riskyInvestment": 3000.0,
  "nonRiskyInvestment": 7000.0,
  "status": "RECOMMENDATION_INIT"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "operationId": "uuid-here",
    "userId": "user-uuid",
    "operationDate": "2024-01-01T00:00:00.000Z",
    "investedAmount": 10000.0,
    "riskyInvestment": 3000.0,
    "nonRiskyInvestment": 7000.0,
    "status": "RECOMMENDATION_INIT",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/operations/update

Update operation.

**Query Parameters:**

- `operationId` (required): Operation ID

**Request Body:**

```json
{
  "status": "ACTIVE_INVESTMENT",
  "profit": 500.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "operationId": "uuid-here",
    "userId": "user-uuid",
    "operationDate": "2024-01-01T00:00:00.000Z",
    "investedAmount": 10000.0,
    "riskyInvestment": 3000.0,
    "nonRiskyInvestment": 7000.0,
    "status": "ACTIVE_INVESTMENT",
    "profit": 500.0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/operations/create-log

Create new operation log.

**Request Body:**

```json
{
  "operationId": "operation-uuid",
  "description": "Pool analysis completed"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "logId": "log-uuid",
    "operationId": "operation-uuid",
    "description": "Pool analysis completed",
    "createDate": "2024-01-01T00:00:00.000Z",
    "stepNumber": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/operations/logs

Get operation logs.

**Query Parameters:**

- `userIdRaw` (optional): User ID to get all logs for user
- `operationId` (optional): Operation ID to get logs for specific operation

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "logId": "log-uuid",
      "operationId": "operation-uuid",
      "description": "Pool recommendation request initiated",
      "createDate": "2024-01-01T00:00:00.000Z",
      "stepNumber": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Pools

### POST /api/pools/recommendations

Create pool recommendation operation and get recommendations.

**Request Body:**

```json
{
  "userIdRaw": "user123",
  "investedAmount": 10000.0,
  "riskyInvestment": 3000.0,
  "nonRiskyInvestment": 7000.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "operation": {
      "operationId": "uuid-here",
      "userId": "user-uuid",
      "operationDate": "2024-01-01T00:00:00.000Z",
      "investedAmount": 10000.0,
      "riskyInvestment": 3000.0,
      "nonRiskyInvestment": 7000.0,
      "status": "RECOMMENDATION_INIT"
    },
    "recommendations": [
      {
        "pool": {
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
        },
        "tokenQuality": {
          "token0": {
            "hasInProviders": true,
            "hasInternalTags": true,
            "hasEip2612": true,
            "rating": 8,
            "qualityScore": "Good",
            "trustworthiness": "High",
            "assessment": "This token shows good quality...",
            "recommendation": "This token shows good quality metrics..."
          },
          "token1": {
            "hasInProviders": true,
            "hasInternalTags": true,
            "hasEip2612": false,
            "rating": 7,
            "qualityScore": "Good",
            "trustworthiness": "High",
            "assessment": "This token shows good quality...",
            "recommendation": "This token shows good quality metrics..."
          }
        },
        "impermanentLoss": {
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
        },
        "tokenCorrelation": {
          "relationship": "Uncorrelated - tokens move independently",
          "assessment": "These tokens show no correlation...",
          "recommendation": "This pair has very high impermanent loss risk..."
        },
        "tokensVolatility": {
          "token0": {
            "tokenPriceVolatility": {
              "volatilityInPercentage": 0.09,
              "volatilityLevel": "Very Low",
              "stability": "Very Stable",
              "assessment": "This token exhibits very low price volatility...",
              "recommendation": "This token has very low volatility risk..."
            }
          },
          "token1": {
            "tokenPriceVolatility": {
              "volatilityInPercentage": 57.21,
              "volatilityLevel": "High",
              "stability": "Volatile",
              "assessment": "This token shows high price volatility...",
              "recommendation": "This token has high volatility risk..."
            }
          }
        },
        "poolGrowthTendency": {
          "poolGrowthTrendInPercentage": 20.93,
          "trend": "positive",
          "performance": "Strong growth",
          "assessment": "This pool has shown strong positive performance...",
          "recommendation": "This pool shows strong performance..."
        },
        "apyVolatility": {
          "stdDev": 1.84,
          "mean": 3.6,
          "coefficientOfVariation": 0.51,
          "stabilityScore": "Moderate",
          "riskLevel": "Medium",
          "description": "This pool shows moderate APY volatility..."
        }
      }
    ],
    "message": "Pool recommendation operation created successfully"
  }
}
```

## Users

### GET /api/users/get

Get user data.

**Query Parameters:**

- `userIdRaw` (required): User ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userIdRaw": "user123",
    "userId": "user-uuid",
    "delegatedWalletHash": "hash-here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/users/create

Create new user.

**Request Body:**

```json
{
  "userIdRaw": "user123",
  "delegatedWalletHash": "hash-here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userIdRaw": "user123",
    "userId": "user-uuid",
    "delegatedWalletHash": "hash-here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": [] // Optional validation errors
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Limits are:

- 100 requests per minute per IP
- 1000 requests per hour per user

## WebSocket Events

The application also supports real-time updates via WebSocket:

- `OPERATION_CREATED` - When a new operation is created
- `OPERATION_LOG_CREATED` - When a new log entry is created
- `LOG_MESSAGE` - General log messages

For detailed WebSocket documentation, see [WEBSOCKET](WEBSOCKET.md).
