import { NextRequest, NextResponse } from "next/server";
import { logger } from "@elizaos/core";
import { OperationLogModel } from "@/libs/database/models/operationLogModel";

export async function GET(request: NextRequest) {
  logger.info("GET /api/operations/logs called");
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userIdRaw");
    const operationId = searchParams.get("operationId");

    if (!userIdRaw && !operationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Either userIdRaw or operationId is required as a query parameter",
        },
        { status: 400 }
      );
    }

    let result;

    if (operationId) {
      result = await OperationLogModel.findByOperationId(operationId);
    } else {
      result = await OperationLogModel.findByUserIdRaw(userIdRaw!);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    logger.error("Error in getLogs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
