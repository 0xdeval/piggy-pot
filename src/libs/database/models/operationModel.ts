import { v4 as uuidv4 } from "uuid";
import db from "@/libs/database/connection";
import { logger } from "@/utils/logger";
import {
  Operation,
  CreateOperation,
  UpdateOperation,
  OperationQueryResult,
  OperationsQueryResult,
} from "@/types/database/operation";

export class OperationModel {
  static async create(
    operationData: CreateOperation
  ): Promise<OperationQueryResult> {
    try {
      logger.info(
        `OperationModel.create called with: ${JSON.stringify(operationData)}`
      );
      logger.info(
        `userId value: ${operationData.userId}, type: ${typeof operationData.userId}`
      );

      const query = `
        INSERT INTO operations (operation_id, user_id, invested_amount, risky_investment, non_risky_investment, status, recommended_pools, profit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const operationId = uuidv4();
      const values = [
        operationId,
        operationData.userId,
        operationData.investedAmount,
        operationData.riskyInvestment,
        operationData.nonRiskyInvestment,
        operationData.status || null,
        operationData.recommendedPools
          ? JSON.stringify(operationData.recommendedPools)
          : null,
        operationData.profit || null,
      ];

      logger.info(`Query values: ${JSON.stringify(values)}`);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Failed to create operation" };
      }

      return { success: true, data: this.mapDbToOperation(result.rows[0]) };
    } catch (error) {
      logger.error("Error creating operation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByOperationId(
    operationId: string
  ): Promise<OperationQueryResult> {
    try {
      const query = "SELECT * FROM operations WHERE operation_id = $1";
      const result = await db.query(query, [operationId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation not found" };
      }

      return { success: true, data: this.mapDbToOperation(result.rows[0]) };
    } catch (error) {
      logger.error("Error finding operation by operationId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByUserId(userId: string): Promise<OperationsQueryResult> {
    try {
      const query =
        "SELECT * FROM operations WHERE user_id = $1 ORDER BY operation_date DESC";
      const result = await db.query(query, [userId]);

      return {
        success: true,
        data: result.rows.map((row: any) => this.mapDbToOperation(row)),
      };
    } catch (error) {
      logger.error("Error finding operations by userId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByUserIdRaw(
    userIdRaw: string
  ): Promise<OperationsQueryResult> {
    try {
      const query = `
        SELECT o.* FROM operations o
        JOIN users u ON o.user_id = u.user_id
        WHERE u.user_id_raw = $1
        ORDER BY o.operation_date DESC
      `;
      const result = await db.query(query, [userIdRaw]);

      return {
        success: true,
        data: result.rows.map((row: any) => this.mapDbToOperation(row)),
      };
    } catch (error) {
      logger.error("Error finding operations by userIdRaw:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findLastByUserIdRawAndStatus(
    userIdRaw: string,
    status: string
  ): Promise<OperationQueryResult> {
    try {
      const query = `
        SELECT o.* FROM operations o
        JOIN users u ON o.user_id = u.user_id
        WHERE u.user_id_raw = $1 AND o.status = $2
        ORDER BY o.operation_date DESC
        LIMIT 1
      `;
      const result = await db.query(query, [userIdRaw, status]);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation not found" };
      }

      return { success: true, data: this.mapDbToOperation(result.rows[0]) };
    } catch (error) {
      logger.error(
        "Error finding last operation by userIdRaw and status:",
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findAll(): Promise<OperationsQueryResult> {
    try {
      const query = "SELECT * FROM operations ORDER BY operation_date DESC";
      const result = await db.query(query);

      return {
        success: true,
        data: result.rows.map((row: any) => this.mapDbToOperation(row)),
      };
    } catch (error) {
      logger.error("Error finding all operations:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async update(
    operationId: string,
    updateData: UpdateOperation
  ): Promise<OperationQueryResult> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.investedAmount !== undefined) {
        fields.push(`invested_amount = $${paramCount++}`);
        values.push(updateData.investedAmount);
      }
      if (updateData.riskyInvestment !== undefined) {
        fields.push(`risky_investment = $${paramCount++}`);
        values.push(updateData.riskyInvestment);
      }
      if (updateData.nonRiskyInvestment !== undefined) {
        fields.push(`non_risky_investment = $${paramCount++}`);
        values.push(updateData.nonRiskyInvestment);
      }
      if (updateData.logId !== undefined) {
        fields.push(`log_id = $${paramCount++}`);
        values.push(updateData.logId);
      }
      if (updateData.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(updateData.status);
      }
      if (updateData.recommendedPools !== undefined) {
        fields.push(`recommended_pools = $${paramCount++}`);
        values.push(updateData.recommendedPools);
      }
      if (updateData.profit !== undefined) {
        fields.push(`profit = $${paramCount++}`);
        values.push(updateData.profit);
      }

      if (fields.length === 0) {
        return { success: false, error: "No fields to update" };
      }

      values.push(operationId);

      const query = `
        UPDATE operations 
        SET ${fields.join(", ")}
        WHERE operation_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation not found" };
      }

      return { success: true, data: this.mapDbToOperation(result.rows[0]) };
    } catch (error) {
      logger.error("Error updating operation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async delete(operationId: string): Promise<OperationQueryResult> {
    try {
      const query =
        "DELETE FROM operations WHERE operation_id = $1 RETURNING *";
      const result = await db.query(query, [operationId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Operation not found" };
      }

      return { success: true, data: this.mapDbToOperation(result.rows[0]) };
    } catch (error) {
      logger.error("Error deleting operation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static mapDbToOperation(dbRow: any): Operation {
    return {
      operationId: dbRow.operation_id,
      userId: dbRow.user_id,
      operationDate: new Date(dbRow.operation_date),
      investedAmount: parseFloat(dbRow.invested_amount),
      riskyInvestment: parseFloat(dbRow.risky_investment),
      nonRiskyInvestment: parseFloat(dbRow.non_risky_investment),
      logId: dbRow.log_id,
      status: dbRow.status,
      recommendedPools: dbRow.recommended_pools
        ? (() => {
            logger.debug(
              "dbRaw from Operation model:",
              dbRow.recommended_pools
            );
            // If it's already an object (PostgreSQL JSONB parsed it), return it directly
            if (
              typeof dbRow.recommended_pools === "object" &&
              dbRow.recommended_pools !== null
            ) {
              return dbRow.recommended_pools;
            }

            // If it's a string, try to parse it
            if (typeof dbRow.recommended_pools === "string") {
              try {
                // Check if it's already a malformed string like "[object Obj"
                if (dbRow.recommended_pools.startsWith("[object ")) {
                  logger.warn(
                    "Found malformed recommendedPools data, returning null",
                    {
                      value: dbRow.recommended_pools.substring(0, 50),
                    }
                  );
                  return null;
                }
                return JSON.parse(dbRow.recommended_pools);
              } catch (error) {
                logger.error("Error parsing recommendedPools JSON:", error, {
                  value: dbRow.recommended_pools.substring(0, 50),
                });
                return null;
              }
            }

            // If it's neither object nor string, log and return null
            logger.warn("Unexpected recommendedPools data type", {
              type: typeof dbRow.recommended_pools,
              value: String(dbRow.recommended_pools).substring(0, 50),
            });
            return null;
          })()
        : null,
      profit: dbRow.profit ? parseFloat(dbRow.profit) : 0,
      createdAt: dbRow.created_at ? new Date(dbRow.created_at) : undefined,
      updatedAt: dbRow.updated_at ? new Date(dbRow.updated_at) : undefined,
    };
  }

  static generateOperationId(): string {
    return uuidv4();
  }
}
