import { NextRequest, NextResponse } from "next/server";
import { logger } from "@elizaos/core";
import { broadcastEvent } from "@/libs/socket/init";
import { OperationModel } from "@/libs/database/models/operationModel";
import { OperationLogModel } from "@/libs/database/models/operationLogModel";
import { UserModel } from "@/libs/database/models/userModel";

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

    return NextResponse.json({
      success: true,
      data: {
        operation,
        message: "Pool recommendation operation created successfully",
      },
    });
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
