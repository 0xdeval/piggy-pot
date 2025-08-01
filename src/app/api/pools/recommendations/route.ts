import { NextRequest, NextResponse } from "next/server";
import { OperationModel } from "@/libs/database/models/operationModel";
import { UserModel } from "@/libs/database/models/userModel";
import { recommendLiquidityPools } from "@/processors/liquidityManagement/recommendLiquidityPools";
import { logger } from "@/utils/logger";
import { createOperation, createOperationLog } from "@/libs/database/utils";
import { CreateOperationLog } from "@/types/database/operationLog";
import { Operation } from "@/types/database/operation";

export async function POST(request: NextRequest) {
  logger.info("POST /api/pools/recommendations called");
  try {
    const { userIdRaw, investedAmount, riskyInvestment, nonRiskyInvestment } =
      await request.json();

    // Determine if user wants volatile pools based on investment preferences
    const isLookingForVolatilePool = riskyInvestment > 0;

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
    } as Operation;

    logger.info(
      `Creating operation with data: ${JSON.stringify(operationData)}`
    );
    logger.info(`Operation userId: ${operationData.userId}`);
    logger.info(`Operation userId type: ${typeof operationData.userId}`);

    const {
      isCreated: isOperationCreated,
      data: operation,
      error: operationError,
    } = await createOperation(operationData);

    if (!isOperationCreated) {
      logger.error(`Failed to create operation`);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create operation: ${operationError}`,
        },
        { status: 500 }
      );
    }

    const logRecord = {
      description: "Pool recommendation request initiated",
      stepNumber: 1,
    } as CreateOperationLog;
    await createOperationLog(operation!.operationId, logRecord);

    logger.info(
      `Starting pool recommendations for user ${userResult.data!.userId}, volatile: ${isLookingForVolatilePool}`
    );

    try {
      const recommendations = await recommendLiquidityPools({
        userId: userResult.data!.userId,
        isLookingForVolatilePool,
      });

      if (recommendations.length === 0) {
        logger.error(
          "No pool recommendations generated - no data available in database"
        );

        await createOperationLog(operation!.operationId, {
          operationId: operation!.operationId,
          description:
            "No pool recommendations generated - no data available in database",
          stepNumber: 2,
        } as CreateOperationLog);

        // Update the existing operation status to failed
        await OperationModel.update(operation!.operationId, {
          status: "RECOMMENDATION_FAILED",
        });

        return NextResponse.json(
          {
            success: false,
            error:
              "No pool data available in database. Please try again later or contact support.",
            data: {
              operation,
            },
          },
          { status: 503 }
        );
      }

      logger.info(
        `Pool recommendations generated: ${JSON.stringify(recommendations)}`
      );

      await createOperationLog(operation!.operationId, {
        operationId: operation!.operationId,
        description: `Pool recommendations generated: ${JSON.stringify(recommendations)}`,
        stepNumber: 2,
      } as CreateOperationLog);

      await OperationModel.update(operation!.operationId, {
        status: "RECOMMENDATION_FINISHED",
        recommendedPools: JSON.stringify(recommendations),
        profit: 0,
      });

      return NextResponse.json({
        success: true,
        data: {
          operationId: operation!.operationId,
          recommendations,
          message: "Pool recommendations completed successfully",
        },
      });
    } catch (recommendationError) {
      logger.error(
        "Error generating pool recommendations:",
        recommendationError
      );

      await createOperationLog(operation!.operationId, {
        operationId: operation!.operationId,
        description: `Error generating pool recommendations: ${recommendationError instanceof Error ? recommendationError.message : "Unknown error"}`,
        stepNumber: 2,
      } as CreateOperationLog);

      await OperationModel.update(operation!.operationId, {
        status: "RECOMMENDATION_FAILED",
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
