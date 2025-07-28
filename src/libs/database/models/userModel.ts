import { v4 as uuidv4 } from "uuid";
import db from "../connection";
import {
  User,
  CreateUser,
  UpdateUser,
  UserQueryResult,
  UsersQueryResult,
} from "../../../types/user";
import { logger } from "@elizaos/core";

export class UserModel {
  static async create(userData: CreateUser): Promise<UserQueryResult> {
    try {
      const query = `
        INSERT INTO users (user_id_raw, user_id, channel_id, room_id, agent_id, delegated_wallet_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        userData.userIdRaw,
        userData.userId,
        userData.channelId,
        userData.roomId,
        userData.agentId,
        userData.delegatedWalletHash,
      ];

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Failed to create user" };
      }

      return { success: true, data: this.mapDbToUser(result.rows[0]) };
    } catch (error) {
      logger.error("Error creating user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByUserIdRaw(userIdRaw: string): Promise<UserQueryResult> {
    try {
      const query = "SELECT * FROM users WHERE user_id_raw = $1";
      const result = await db.query(query, [userIdRaw]);

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: this.mapDbToUser(result.rows[0]) };
    } catch (error) {
      logger.error("Error finding user by userIdRaw:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByUserId(userId: string): Promise<UserQueryResult> {
    try {
      const query = "SELECT * FROM users WHERE user_id = $1";
      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: this.mapDbToUser(result.rows[0]) };
    } catch (error) {
      logger.error("Error finding user by userId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findAll(): Promise<UsersQueryResult> {
    try {
      const query = "SELECT * FROM users ORDER BY created_at DESC";
      const result = await db.query(query);

      return {
        success: true,
        data: result.rows.map((row) => this.mapDbToUser(row)),
      };
    } catch (error) {
      logger.error("Error finding all users:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async update(
    userId: string,
    updateData: UpdateUser
  ): Promise<UserQueryResult> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.channelId !== undefined) {
        fields.push(`channel_id = $${paramCount++}`);
        values.push(updateData.channelId);
      }
      if (updateData.roomId !== undefined) {
        fields.push(`room_id = $${paramCount++}`);
        values.push(updateData.roomId);
      }
      if (updateData.agentId !== undefined) {
        fields.push(`agent_id = $${paramCount++}`);
        values.push(updateData.agentId);
      }

      if (fields.length === 0) {
        return { success: false, error: "No fields to update" };
      }

      fields.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${fields.join(", ")}
        WHERE user_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: this.mapDbToUser(result.rows[0]) };
    } catch (error) {
      logger.error("Error updating user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async delete(userId: string): Promise<UserQueryResult> {
    try {
      const query = "DELETE FROM users WHERE user_id = $1 RETURNING *";
      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: this.mapDbToUser(result.rows[0]) };
    } catch (error) {
      logger.error("Error deleting user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static generateUserId(): string {
    return uuidv4();
  }

  private static mapDbToUser(dbRow: any): User {
    return {
      userIdRaw: dbRow.user_id_raw,
      userId: dbRow.user_id,
      channelId: dbRow.channel_id,
      roomId: dbRow.room_id,
      agentId: dbRow.agent_id,
      delegatedWalletHash: dbRow.delegated_wallet_hash,
      createdAt: dbRow.created_at ? new Date(dbRow.created_at) : undefined,
      updatedAt: dbRow.updated_at ? new Date(dbRow.updated_at) : undefined,
    };
  }
}
