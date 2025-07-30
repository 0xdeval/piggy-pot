import { NextRequest, NextResponse } from "next/server";
import { logger } from "@elizaos/core";
import { OperationModel } from "@/libs/database/models/operationModel";

export async function GET(request: NextRequest) {
  logger.info("GET /api/operations called");
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userIdRaw");

    if (!userIdRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "userIdRaw is required as a query parameter",
        },
        { status: 400 }
      );
    }

    const result = await OperationModel.findByUserIdRaw(userIdRaw);

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
    logger.error("Error in getOperations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
