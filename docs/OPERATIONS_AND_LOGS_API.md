# Operations and Logs API Documentation

This document describes the API endpoints for managing operations and their associated logs in the profit-app-server.

## Overview

Operations represent investment actions made by users, and logs provide step-by-step tracking of operation execution. The system supports real-time updates via WebSocket broadcasts.

## Database Schema

### Operations Table

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

### Operation Status Values

The operation status field tracks the current state of an investment operation:

- **RECOMMENDATION_INIT** - Initial state when user requests pool recommendations
- **RECOMMENDATION_FINISHED** - Pool recommendation process completed successfully
- **RECOMMENDATION_FAILED** - Pool recommendation process failed
- **DEPOSIT_INIT** - User initiated deposit process
- **DEPOSIT_FAILED** - Deposit process failed
- **ACTIVE_INVESTMENT** - Investment is active and running
- **CLOSED_INVESTMENT** - Investment has been closed/completed

### Operations Logs Table

- `log_id` (UUID, Primary Key) - Unique identifier for the log entry
- `operation_id` (UUID, Foreign Key) - References the operation
- `description` (TEXT) - Log message or step description
- `create_date` (TIMESTAMP) - Time the log was recorded
- `step_number` (INT) - Order of the step in the operation execution flow
- `created_at` (TIMESTAMP) - Record creation time

## API Endpoints

### 1. Create Operation

**POST** `/api/operations/create`

Creates a new operation for a user.

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

### 2. Get Operations by User

**GET** `/api/operations/get?userIdRaw=user123`

Retrieves all operations for a specific user.

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
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Update Operation

**PUT** `/api/operations/update?operationId={}`

Updates an operation's status or other fields.

**Request Body:**

```json
{
  "status": "Closed",
  "investedAmount": 11000.0
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
    "investedAmount": 11000.0,
    "riskyInvestment": 3000.0,
    "nonRiskyInvestment": 7000.0,
    "status": "Closed",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Create Operation Log

**POST** `/api/operations/createLog`

Creates a new log entry for an operation. Step numbers are automatically generated.

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

### 5. Get Operation Logs

**GET** `/api/operations/getLogs?userIdRaw=user123`
**GET** `/api/operations/getLogs?operationId=operation-uuid`

Retrieves logs either by user or by specific operation.

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

### 6. Pool Recommendations (Enhanced)

**POST** `/api/pools/recommendation`

Creates an operation and initial log when a user requests pool recommendations.

**Request Body:**

```json
{
  "userIdRaw": "test:6676:hhhhh",
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
    "message": "Pool recommendation operation created successfully"
  }
}
```

## WebSocket Events

The system broadcasts real-time updates via WebSocket events:

### OPERATION_CREATED

Emitted when a new operation is created.

```json
{
  "operation": {
    /* operation object */
  },
  "userIdRaw": "user123"
}
```

### OPERATION_LOG_CREATED

Emitted when a new log entry is created.

```json
{
  "operationId": "operation-uuid",
  "log": {
    /* log object */
  },
  "userIdRaw": "user123"
}
```

### LOG_MESSAGE

General log messages for debugging and monitoring.

```json
{
  "message": "Pool recommendation operation created successfully",
  "operationId": "operation-uuid"
}
```

## Usage Examples

### Complete Workflow Example

1. **User requests pool recommendations:**

   ```bash
   POST /api/pools/recommendation
   {
     "userIdRaw": "user123",
     "investedAmount": 10000.00,
     "riskyInvestment": 3000.00,
     "nonRiskyInvestment": 7000.00
   }
   ```

2. **System creates operation and initial log automatically**

3. **Add progress logs during processing:**

   ```bash
   POST /api/operations/createLog
   {
     "operationId": "operation-uuid",
     "description": "Analyzing market conditions"
   }
   ```

4. **Update operation status when complete:**

   ```bash
   PUT /api/operations/update/operation-uuid
   {
     "status": "Closed"
   }
   ```

5. **Retrieve all operations for user:**

   ```bash
   GET /api/operations/get?userIdRaw=user123
   ```

6. **Retrieve logs for specific operation:**
   ```bash
   GET /api/operations/getLogs?operationId=operation-uuid
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": [] // Optional validation errors
}
```

Common HTTP status codes:

- `400` - Bad Request (missing required fields)
- `404` - Not Found (user or operation not found)
- `500` - Internal Server Error

## Database Migrations

Run the following migrations to set up the database schema:

1. `002_create_operations_table.sql` - Creates the operations table
2. `003_create_operations_logs_table.sql` - Creates the operations_logs table

The migrations include proper indexes, foreign key constraints, and triggers for automatic timestamp updates.
