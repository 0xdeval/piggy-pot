import { Route } from "@elizaos/core/";
import { createUserHandler } from "./api/users/createUser";
import { getUserHandler } from "./api/users/getUser";
import { poolsRecommendationsHandler } from "./api/pools/recommendations";
import { createOperationHandler } from "./api/operations/createOperation";
import { getOperationsHandler } from "./api/operations/getOperations";
import { updateOperationHandler } from "./api/operations/updateOperation";
import { createLogHandler } from "./api/operations/createLog";
import { getLogsHandler } from "./api/operations/getLogs";

export const userRoutes: Route[] = [
  // POST /api/users/create - Create a new user with generated UUIDs
  {
    name: "createUser",
    path: "/api/users/create",
    type: "POST",
    handler: createUserHandler,
  },

  // GET /api/users/get - Get user by userIdRaw
  {
    name: "getUserByUserId",
    path: "/api/users/get",
    type: "GET",
    handler: getUserHandler,
  },

  // POST /api/pools/recommendations - Recommend pools to invest in
  {
    name: "recommendPools",
    path: "/api/pools/recommendations",
    type: "POST",
    handler: poolsRecommendationsHandler,
  },

  // POST /api/operations/create - Create a new operation
  {
    name: "createOperation",
    path: "/api/operations/create",
    type: "POST",
    handler: createOperationHandler,
  },

  // GET /api/operations/get - Get operations by userIdRaw
  {
    name: "getOperations",
    path: "/api/operations/get",
    type: "GET",
    handler: getOperationsHandler,
  },

  // PUT /api/operations/update - Update operation status
  {
    name: "updateOperation",
    path: "/api/operations/update",
    type: "PUT",
    handler: updateOperationHandler,
  },

  // POST /api/operations/createLog - Create a new operation log
  {
    name: "createLog",
    path: "/api/operations/createLog",
    type: "POST",
    handler: createLogHandler,
  },

  // GET /api/operations/getLogs - Get operation logs by userIdRaw or operationId
  {
    name: "getLogs",
    path: "/api/operations/getLogs",
    type: "GET",
    handler: getLogsHandler,
  },
];
