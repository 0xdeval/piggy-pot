import { logger } from "@elizaos/core";
import { OperationLogModel } from "src/libs/database/models/operationLogModel";
import { OperationModel } from "src/libs/database/models/operationModel";
import { CreateOperationLogSchema } from "src/types/operationLog";
import { broadcastEvent } from "src/libs/socket/init";

export const createLogHandler = async (req: any, res: any) => {
  logger.info("POST /api/operations/createLog called");
  try {
    const { operationId, description } = req.body;

    if (!operationId || !description) {
      return res.status(400).json({
        success: false,
        error: "operationId and description are required",
      });
    }

    const operationResult = await OperationModel.findByOperationId(operationId);
    if (!operationResult.success) {
      return res.status(404).json({
        success: false,
        error: "Operation not found",
      });
    }

    const stepNumber = await OperationLogModel.getNextStepNumber(operationId);

    const logData = {
      operationId,
      description,
      stepNumber,
    };

    const validationResult = CreateOperationLogSchema.safeParse(logData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid log data",
        details: validationResult.error.errors,
      });
    }

    const result = await OperationLogModel.create(validationResult.data);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    await OperationModel.update(operationId, {
      logId: result.data!.logId,
    });

    broadcastEvent("OPERATION_LOG_CREATED", {
      operationId,
      log: result.data,
      userIdRaw: operationResult.data!.userId,
    });

    return res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in createLog:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
