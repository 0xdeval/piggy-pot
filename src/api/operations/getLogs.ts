import { logger } from "@elizaos/core";
import { OperationLogModel } from "src/libs/database/models/operationLogModel";

export const getLogsHandler = async (req: any, res: any) => {
  logger.info("GET /api/operations/getLogs called");
  try {
    const { userIdRaw, operationId } = req.query;

    if (!userIdRaw && !operationId) {
      return res.status(400).json({
        success: false,
        error:
          "Either userIdRaw or operationId is required as a query parameter",
      });
    }

    let result;

    if (operationId) {
      result = await OperationLogModel.findByOperationId(operationId);
    } else {
      result = await OperationLogModel.findByUserIdRaw(userIdRaw);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    logger.error("Error in getLogs:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
