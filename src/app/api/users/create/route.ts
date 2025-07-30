import { NextRequest, NextResponse } from "next/server";
import { logger } from "@elizaos/core";
import { UserModel } from "@/libs/database/models/userModel";
import { generateUuid } from "@/utils/uuidGenerator";
import { generateRoomId } from "@/utils/uuidGenerator";
import { getAgentId } from "@/utils/getAgent";
import { createCentralChannel } from "@/utils/createChannel";

export async function POST(request: NextRequest) {
  logger.info("POST /api/users/create called");
  try {
    const body = await request.json();
    const userIdRaw = body?.userIdRaw;
    const delegatedWalletHash = body?.delegatedWalletHash;

    if (!userIdRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "userIdRaw is required in request body",
        },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findByUserIdRaw(userIdRaw);
    if (existingUser.success) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
          data: existingUser.data,
        },
        { status: 409 }
      );
    }

    const generatedUserId = generateUuid(userIdRaw);
    const generatedRoomId = generateRoomId(userIdRaw);

    const agentId = await getAgentId();

    const channelId = await createCentralChannel(generatedUserId, agentId);

    const userData = {
      userIdRaw,
      userId: generatedUserId,
      channelId,
      roomId: generatedRoomId,
      agentId,
      delegatedWalletHash,
    };

    const result = await UserModel.create(userData);

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
    logger.error("Error in createUser:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
