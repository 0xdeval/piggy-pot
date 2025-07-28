import { logger } from "@elizaos/core";
import { UserModel } from "src/libs/database/models/userModel";

export const getUserHandler = async (req: any, res: any) => {
  logger.info("GET /api/users/get called");
  try {
    const { userIdRaw } = req.query || {};

    if (!userIdRaw) {
      return res.status(400).json({
        success: false,
        error: "userIdRaw is required as query parameter",
      });
    }

    const result = await UserModel.findByUserIdRaw(userIdRaw);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error in getUserByUserId:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
