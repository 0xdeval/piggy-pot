import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { UserModel } from "@/libs/database/models/userModel";

export async function GET(request: NextRequest) {
  logger.info("GET /api/users/get called");
  try {
    const { searchParams } = new URL(request.url);
    const userIdRaw = searchParams.get("userIdRaw");

    if (!userIdRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "userIdRaw is required as query parameter",
        },
        { status: 400 }
      );
    }

    const result = await UserModel.findByUserIdRaw(userIdRaw);

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
    logger.error("Error in getUserByUserId:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
