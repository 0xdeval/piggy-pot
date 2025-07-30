import { NextRequest, NextResponse } from "next/server";
import { logger } from "@elizaos/core";
import { OperationModel } from "@/libs/database/models/operationModel";

export async function GET(request: NextRequest) {
  logger.info("GET /api/operations/last-by-status called");
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userIdRaw");
    const status = searchParams.get("status");

    if (!userIdRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "userIdRaw is required as a query parameter",
        },
        { status: 400 }
      );
    }

    const result = await OperationModel.findLastByUserIdRawAndStatus(
      userIdRaw,
      status || "RECOMMENDATION_INIT"
    );

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
      data: result.data || null,
    });
  } catch (error) {
    logger.error("Error in getLastRecommendationInit:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
