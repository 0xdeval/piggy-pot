import { Operation } from "@/types/database/operation";
import { OperationModel } from "@/libs/database/models/operationModel";
import { logger } from "@/utils/logger";
import { CreateOperationLog } from "@/types/database/operationLog";
import { OperationLogModel } from "@/libs/database/models/operationLogModel";

export const createOperation = async (operation: Operation) => {
  const operationResult = await OperationModel.create(operation);

  if (!operationResult.success) {
    logger.error(`Failed to create operation: ${operationResult.error}`);
    return {
      isCreated: false,
      data: operationResult.data,
      error: operationResult.error,
    };
  }

  return { isCreated: true, data: operationResult.data, error: null };
};

export const createOperationLog = async (
  operationId: string,
  operationLog: CreateOperationLog
) => {
  const logResult = await OperationLogModel.create(operationLog);

  if (logResult.success) {
    await OperationModel.update(operationId, {
      logId: logResult.data!.logId,
    });
  }
};
