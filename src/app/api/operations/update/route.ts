import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { OperationModel } from "@/libs/database/models/operationModel";
import { UpdateOperationSchema } from "@/types/operation";

export async function PUT(request: NextRequest) {
  logger.info("PUT /api/operations/update called");
  try {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get("operationId");
    const updateData = await request.json();

    if (!operationId) {
      return NextResponse.json(
        {
          success: false,
          error: "operationId is required as a query parameter",
        },
        { status: 400 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Update data is required",
        },
        { status: 400 }
      );
    }

    const validationResult = UpdateOperationSchema.safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid update data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await OperationModel.update(
      operationId,
      validationResult.data
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in updateOperation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
