import { logger } from "@elizaos/core";
import { OperationModel } from "src/libs/database/models/operationModel";

export const getOperationsHandler = async (req: any, res: any) => {
  logger.info("GET /api/operations/get called");
  try {
    const userIdRaw = req.query?.userIdRaw;

    if (!userIdRaw) {
      return res.status(400).json({
        success: false,
        error: "userIdRaw is required as a query parameter",
      });
    }

    const result = await OperationModel.findByUserIdRaw(userIdRaw);

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
    logger.error("Error in getOperations:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
