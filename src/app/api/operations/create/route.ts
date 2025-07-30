import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";
import { OperationModel } from "@/libs/database/models/operationModel";
import { UserModel } from "@/libs/database/models/userModel";
import { CreateOperationSchema } from "@/types/operation";

export async function POST(request: NextRequest) {
  logger.info("POST /api/operations/create called");
  try {
    const body = await request.json();
    const {
      userIdRaw,
      investedAmount,
      riskyInvestment,
      nonRiskyInvestment,
      status,
    } = body;

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

    const userResult = await UserModel.findByUserIdRaw(userIdRaw);
    if (!userResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const operationData = {
      userId: userResult.data!.userId,
      investedAmount: parseFloat(investedAmount),
      riskyInvestment: parseFloat(riskyInvestment),
      nonRiskyInvestment: parseFloat(nonRiskyInvestment),
      status: status || "Active",
    };

    const validationResult = CreateOperationSchema.safeParse(operationData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid operation data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const result = await OperationModel.create(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in createOperation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
