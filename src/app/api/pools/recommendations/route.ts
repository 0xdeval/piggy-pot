import { NextRequest, NextResponse } from "next/server";
import { broadcastEvent } from "@/libs/socket/init";
import { OperationModel } from "@/libs/database/models/operationModel";
import { OperationLogModel } from "@/libs/database/models/operationLogModel";
import { UserModel } from "@/libs/database/models/userModel";
import { recommendLiquidityPools } from "@/processors/liquidityManagement/recommendLiquidityPools";
import { logger } from "@/utils/logger";

export async function POST(request: NextRequest) {
  logger.info("POST /api/pools/recommendations called");
  try {
    const { userIdRaw, investedAmount, riskyInvestment, nonRiskyInvestment } =
      await request.json();

    if (!userIdRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "userIdRaw is required",
        },
        { status: 400 }
      );
    }

    if (!investedAmount || !riskyInvestment || !nonRiskyInvestment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "investedAmount, riskyInvestment, and nonRiskyInvestment are required",
        },
        { status: 400 }
      );
    }

    logger.info(`Looking up user with userIdRaw: ${userIdRaw}`);
    const userResult = await UserModel.findByUserIdRaw(userIdRaw);
    if (!userResult.success) {
      logger.error(`User not found for userIdRaw: ${userIdRaw}`);
      return NextResponse.json(
        {
          success: false,
          error: `User not found for userIdRaw: ${userIdRaw}`,
        },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create operation: ${operationResult.error}`,
        },
        { status: 500 }
      );
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

    // Determine if user wants volatile pools based on investment preferences
    const isLookingForVolatilePool = riskyInvestment > 0;

    logger.info(
      `Starting pool recommendations for user ${userResult.data!.userId}, volatile: ${isLookingForVolatilePool}`
    );

    try {
      // Get pool recommendations
      const recommendations = await recommendLiquidityPools({
        userId: userResult.data!.userId,
        isLookingForVolatilePool,
      });

      logger.info(
        `Pool recommendations generated: ${JSON.stringify(recommendations)}`
      );

      // Log the recommendations
      const recommendationsLogResult = await OperationLogModel.create({
        operationId: operation.operationId,
        description: `Pool recommendations generated: ${JSON.stringify(recommendations)}`,
        stepNumber: 2,
      });

      if (recommendationsLogResult.success) {
        await OperationModel.update(operation.operationId, {
          logId: recommendationsLogResult.data!.logId,
        });

        broadcastEvent("OPERATION_LOG_CREATED", {
          operationId: operation.operationId,
          log: recommendationsLogResult.data,
          userIdRaw,
        });
      }

      // Update the existing operation with recommendations and completed status
      await OperationModel.update(operation.operationId, {
        status: "RECOMMENDATION_FINISHED",
        recommendedPools: JSON.stringify(recommendations),
        profit: 0, // Initialize profit to 0, will be updated by future LLM recommendations
      });

      broadcastEvent("LOG_MESSAGE", {
        message: "Pool recommendations completed successfully",
        operationId: operation.operationId,
      });

      return NextResponse.json({
        success: true,
        data: {
          operationId: operation.operationId,
          recommendations,
          message: "Pool recommendations completed successfully",
        },
      });
    } catch (recommendationError) {
      logger.error(
        "Error generating pool recommendations:",
        recommendationError
      );

      // Log the error
      const errorLogResult = await OperationLogModel.create({
        operationId: operation.operationId,
        description: `Error generating pool recommendations: ${recommendationError instanceof Error ? recommendationError.message : "Unknown error"}`,
        stepNumber: 2,
      });

      if (errorLogResult.success) {
        await OperationModel.update(operation.operationId, {
          logId: errorLogResult.data!.logId,
        });

        broadcastEvent("OPERATION_LOG_CREATED", {
          operationId: operation.operationId,
          log: errorLogResult.data,
          userIdRaw,
        });
      }

      // Update the existing operation status to failed
      await OperationModel.update(operation.operationId, {
        status: "RECOMMENDATION_FAILED",
      });

      broadcastEvent("LOG_MESSAGE", {
        message: "Pool recommendations failed",
        operationId: operation.operationId,
      });

      return NextResponse.json({
        success: false,
        error: "Failed to generate pool recommendations",
        data: {
          operation,
        },
      });
    }
  } catch (error) {
    logger.error("Error in poolsRecommendationsHandler:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
