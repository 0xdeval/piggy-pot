import { logger } from "@elizaos/core";
import { OperationModel } from "src/libs/database/models/operationModel";
import { UserModel } from "src/libs/database/models/userModel";
import { CreateOperationSchema } from "src/types/operation";

export const createOperationHandler = async (req: any, res: any) => {
  logger.info("POST /api/operations/create called");
  try {
    const {
      userIdRaw,
      investedAmount,
      riskyInvestment,
      nonRiskyInvestment,
      status,
    } = req.body;

    if (!userIdRaw) {
      return res.status(400).json({
        success: false,
        error: "userIdRaw is required",
      });
    }

    if (!investedAmount || !riskyInvestment || !nonRiskyInvestment) {
      return res.status(400).json({
        success: false,
        error:
          "investedAmount, riskyInvestment, and nonRiskyInvestment are required",
      });
    }

    const userResult = await UserModel.findByUserIdRaw(userIdRaw);
    if (!userResult.success) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const operationData = {
      userId: userResult.data!.userId,
      investedAmount: parseFloat(investedAmount),
      riskyInvestment: parseFloat(riskyInvestment),
      nonRiskyInvestment: parseFloat(nonRiskyInvestment),
      status: status || "Active",
    };

    const validationResult = CreateOperationSchema.safeParse(operationData);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid operation data",
        details: validationResult.error.errors,
      });
    }

    const result = await OperationModel.create(validationResult.data);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in createOperation:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
