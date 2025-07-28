import { logger } from "@elizaos/core";
import { OperationModel } from "src/libs/database/models/operationModel";
import { UpdateOperationSchema } from "src/types/operation";

export const updateOperationHandler = async (req: any, res: any) => {
  logger.info("PUT /api/operations/update called");
  try {
    const operationId = req.query?.operationId;
    const updateData = req.body;

    if (!operationId) {
      return res.status(400).json({
        success: false,
        error: "operationId is required in the URL path",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Update data is required",
      });
    }

    const validationResult = UpdateOperationSchema.safeParse(updateData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid update data",
        details: validationResult.error.errors,
      });
    }

    const result = await OperationModel.update(
      operationId,
      validationResult.data
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in updateOperation:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
