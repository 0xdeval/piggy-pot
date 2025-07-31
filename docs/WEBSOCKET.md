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
