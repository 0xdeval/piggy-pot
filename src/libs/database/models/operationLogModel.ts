import { v4 as uuidv4 } from "uuid";
import db from "../connection";
import {
  OperationLog,
  CreateOperationLog,
  UpdateOperationLog,
  OperationLogQueryResult,
  OperationLogsQueryResult,
} from "../../../types/operationLog";
import { logger } from "@elizaos/core";

export class OperationLogModel {
  static async create(
    logData: CreateOperationLog
  ): Promise<OperationLogQueryResult> {
    try {
      const query = `
        INSERT INTO operations_logs (log_id, operation_id, description, step_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const logId = uuidv4();
      const values = [
        logId,
        logData.operationId,
        logData.description,
        logData.stepNumber,
      ];

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Failed to create operation log" };
      }

      return { success: true, data: this.mapDbToOperationLog(result.rows[0]) };
    } catch (error) {
      logger.error("Error creating operation log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByLogId(logId: string): Promise<OperationLogQueryResult> {
    try {
      const query = "SELECT * FROM operations_logs WHERE log_id = $1";
      const result = await db.query(query, [logId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation log not found" };
      }

      return { success: true, data: this.mapDbToOperationLog(result.rows[0]) };
    } catch (error) {
      logger.error("Error finding operation log by logId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByOperationId(
    operationId: string
  ): Promise<OperationLogsQueryResult> {
    try {
      const query =
        "SELECT * FROM operations_logs WHERE operation_id = $1 ORDER BY step_number ASC";
      const result = await db.query(query, [operationId]);

      return {
        success: true,
        data: result.rows.map((row) => this.mapDbToOperationLog(row)),
      };
    } catch (error) {
      logger.error("Error finding operation logs by operationId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByUserIdRaw(
    userIdRaw: string
  ): Promise<OperationLogsQueryResult> {
    try {
      const query = `
        SELECT ol.* FROM operations_logs ol
        JOIN operations o ON ol.operation_id = o.operation_id
        JOIN users u ON o.user_id = u.user_id
        WHERE u.user_id_raw = $1
        ORDER BY ol.create_date DESC
      `;
      const result = await db.query(query, [userIdRaw]);

      return {
        success: true,
        data: result.rows.map((row) => this.mapDbToOperationLog(row)),
      };
    } catch (error) {
      logger.error("Error finding operation logs by userIdRaw:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getNextStepNumber(operationId: string): Promise<number> {
    try {
      const query = `
        SELECT COALESCE(MAX(step_number), 0) + 1 as next_step
        FROM operations_logs 
        WHERE operation_id = $1
      `;
      const result = await db.query(query, [operationId]);
      return result.rows[0]?.next_step || 1;
    } catch (error) {
      logger.error("Error getting next step number:", error);
      return 1;
    }
  }

  static async findAll(): Promise<OperationLogsQueryResult> {
    try {
      const query = "SELECT * FROM operations_logs ORDER BY create_date DESC";
      const result = await db.query(query);

      return {
        success: true,
        data: result.rows.map((row) => this.mapDbToOperationLog(row)),
      };
    } catch (error) {
      logger.error("Error finding all operation logs:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async update(
    logId: string,
    updateData: UpdateOperationLog
  ): Promise<OperationLogQueryResult> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updateData.description);
      }
      if (updateData.stepNumber !== undefined) {
        fields.push(`step_number = $${paramCount++}`);
        values.push(updateData.stepNumber);
      }

      if (fields.length === 0) {
        return { success: false, error: "No fields to update" };
      }

      values.push(logId);

      const query = `
        UPDATE operations_logs 
        SET ${fields.join(", ")}
        WHERE log_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation log not found" };
      }

      return { success: true, data: this.mapDbToOperationLog(result.rows[0]) };
    } catch (error) {
      logger.error("Error updating operation log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async delete(logId: string): Promise<OperationLogQueryResult> {
    try {
      const query = "DELETE FROM operations_logs WHERE log_id = $1 RETURNING *";
      const result = await db.query(query, [logId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation log not found" };
      }

      return { success: true, data: this.mapDbToOperationLog(result.rows[0]) };
    } catch (error) {
      logger.error("Error deleting operation log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static mapDbToOperationLog(dbRow: any): OperationLog {
    return {
      logId: dbRow.log_id,
      operationId: dbRow.operation_id,
      description: dbRow.description,
      createDate: new Date(dbRow.create_date),
      stepNumber: dbRow.step_number,
      createdAt: dbRow.created_at ? new Date(dbRow.created_at) : undefined,
    };
  }

  static generateLogId(): string {
    return uuidv4();
  }
}
