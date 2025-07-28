import { logger } from "@elizaos/core";
import { UserModel } from "src/libs/database/models/userModel";
import { generateUuid } from "src/utils/uuidGenerator";
import { generateRoomId } from "src/utils/uuidGenerator";
import { getAgentId } from "src/utils/getAgent";
import { createCentralChannel } from "src/utils/createChannel";

export const createUserHandler = async (req: any, res: any) => {
  logger.info("POST /api/users/create called");
  try {
    const userIdRaw = req.query?.userIdRaw || req.body?.userIdRaw;
    const delegatedWalletHash =
      req.query?.delegatedWalletHash || req.body?.delegatedWalletHash;

    if (!userIdRaw) {
      return res.status(400).json({
        success: false,
        error:
          "userIdRaw is required (can be in query parameter or request body)",
      });
    }

    const existingUser = await UserModel.findByUserIdRaw(userIdRaw);
    if (existingUser.success) {
      return res.status(409).json({
        success: false,
        error: "User already exists",
        data: existingUser.data,
      });
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
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in createUser:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
