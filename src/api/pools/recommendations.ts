import { logger } from "@elizaos/core";
import { broadcastEvent } from "src/libs/socket/init";
import { OperationModel } from "src/libs/database/models/operationModel";
import { OperationLogModel } from "src/libs/database/models/operationLogModel";
import { UserModel } from "src/libs/database/models/userModel";

export const poolsRecommendationsHandler = async (req: any, res: any) => {
  logger.info("POST /api/pools/recommendations called");
  try {
    const { userIdRaw, investedAmount, riskyInvestment, nonRiskyInvestment } =
      req.body;

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

    logger.info(`Looking up user with userIdRaw: ${userIdRaw}`);
    const userResult = await UserModel.findByUserIdRaw(userIdRaw);
    if (!userResult.success) {
      logger.error(`User not found for userIdRaw: ${userIdRaw}`);
      return res.status(404).json({
        success: false,
        error: `User not found for userIdRaw: ${userIdRaw}`,
      });
    }

    logger.info(`User found: ${JSON.stringify(userResult.data)}`);
    logger.info(`User ID from result: ${userResult.data!.userId}`);
    logger.info(`User ID type: ${typeof userResult.data!.userId}`);

    const operationData = {
      userId: userResult.data!.userId,
      investedAmount: parseFloat(investedAmount),
      riskyInvestment: parseFloat(riskyInvestment),
      nonRiskyInvestment: parseFloat(nonRiskyInvestment),
      status: "RECOMMENDATION_INIT" as const,
    };

    logger.info(
      `Creating operation with data: ${JSON.stringify(operationData)}`
    );
    logger.info(`Operation userId: ${operationData.userId}`);
    logger.info(`Operation userId type: ${typeof operationData.userId}`);

    const operationResult = await OperationModel.create(operationData);
    if (!operationResult.success) {
      logger.error(`Failed to create operation: ${operationResult.error}`);
      return res.status(500).json({
        success: false,
        error: `Failed to create operation: ${operationResult.error}`,
      });
    }

    const operation = operationResult.data!;

    const logResult = await OperationLogModel.create({
      operationId: operation.operationId,
      description: "Pool recommendation request initiated",
      stepNumber: 1,
    });

    if (logResult.success) {
      await OperationModel.update(operation.operationId, {
        logId: logResult.data!.logId,
      });

      broadcastEvent("OPERATION_LOG_CREATED", {
        operationId: operation.operationId,
        log: logResult.data,
        userIdRaw,
      });
    }

    broadcastEvent("OPERATION_CREATED", {
      operation,
      userIdRaw,
    });

    broadcastEvent("LOG_MESSAGE", {
      message: "Pool recommendation operation created successfully",
      operationId: operation.operationId,
    });

    return res.status(200).json({
      success: true,
      data: {
        operation,
        message: "Pool recommendation operation created successfully",
      },
    });
  } catch (error) {
    logger.error("Error in poolsRecommendationsHandler:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
