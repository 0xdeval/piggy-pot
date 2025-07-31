import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { OperationLogModel } from "@/libs/database/models/operationLogModel";
import { OperationModel } from "@/libs/database/models/operationModel";
import { CreateOperationLogSchema } from "@/types/database/operationLog";
import { broadcastEvent } from "@/libs/socket/init";

export async function POST(request: NextRequest) {
  logger.info("POST /api/operations/create-log called");
  try {
    const { operationId, description } = await request.json();

    if (!operationId || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "operationId and description are required",
        },
        { status: 400 }
      );
    }

    const operationResult = await OperationModel.findByOperationId(operationId);
    if (!operationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Operation not found",
        },
        { status: 404 }
      );
    }

    const stepNumber = await OperationLogModel.getNextStepNumber(operationId);

    const logData = {
      operationId,
      description,
      stepNumber,
    };

    const validationResult = CreateOperationLogSchema.safeParse(logData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid log data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await OperationLogModel.create(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    await OperationModel.update(operationId, {
      logId: result.data!.logId,
    });

    broadcastEvent("OPERATION_LOG_CREATED", {
      operationId,
      log: result.data,
      userIdRaw: operationResult.data!.userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in createLog:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
