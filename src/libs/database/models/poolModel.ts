import db from "@/libs/database/connection";
import { logger } from "@/utils/logger";
import {
  Pool,
  CreatePool,
  UpdatePool,
  PoolQueryResult,
  PoolsQueryResult,
} from "@/types/database/pool";

export class PoolModel {
  static async create(poolData: CreatePool): Promise<PoolQueryResult> {
    try {
      logger.info(`PoolModel.create called with poolId: ${poolData.poolId}`);

      const query = `
        INSERT INTO pools (
          pool_id, 
          pool_info, 
          token_quality, 
          impermanent_loss, 
          token_correlation, 
          tokens_volatility, 
          pool_growth_tendency, 
          apy_volatility
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        poolData.poolId,
        JSON.stringify(poolData.poolInfo),
        JSON.stringify(poolData.tokenQuality),
        JSON.stringify(poolData.impermanentLoss),
        JSON.stringify(poolData.tokenCorrelation),
        JSON.stringify(poolData.tokensVolatility),
        JSON.stringify(poolData.poolGrowthTendency),
        JSON.stringify(poolData.apyVolatility),
      ];

      logger.info(`Query values prepared for pool: ${poolData.poolId}`);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Failed to create pool" };
      }

      return { success: true, data: this.mapDbToPool(result.rows[0]) };
    } catch (error) {
      logger.error("Error creating pool:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findByPoolId(poolId: string): Promise<PoolQueryResult> {
    try {
      const query = "SELECT * FROM pools WHERE pool_id = $1";
      const result = await db.query(query, [poolId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Pool not found" };
      }

      return { success: true, data: this.mapDbToPool(result.rows[0]) };
    } catch (error) {
      logger.error("Error finding pool by poolId:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async findAll(): Promise<PoolsQueryResult> {
    try {
      const query = "SELECT * FROM pools ORDER BY updated_at DESC";
      const result = await db.query(query);

      return {
        success: true,
        data: result.rows.map((row: any) => this.mapDbToPool(row)),
      };
    } catch (error) {
      logger.error("Error finding all pools:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async update(
    poolId: string,
    updateData: UpdatePool
  ): Promise<PoolQueryResult> {
    try {
      logger.info(
        `PoolModel.update called for poolId: ${poolId} with data: ${JSON.stringify(updateData)}`
      );

      // Build dynamic query based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateData.poolInfo !== undefined) {
        updateFields.push(`pool_info = $${paramIndex}`);
        values.push(JSON.stringify(updateData.poolInfo));
        paramIndex++;
      }

      if (updateData.tokenQuality !== undefined) {
        updateFields.push(`token_quality = $${paramIndex}`);
        values.push(JSON.stringify(updateData.tokenQuality));
        paramIndex++;
      }

      if (updateData.impermanentLoss !== undefined) {
        updateFields.push(`impermanent_loss = $${paramIndex}`);
        values.push(JSON.stringify(updateData.impermanentLoss));
        paramIndex++;
      }

      if (updateData.tokenCorrelation !== undefined) {
        updateFields.push(`token_correlation = $${paramIndex}`);
        values.push(JSON.stringify(updateData.tokenCorrelation));
        paramIndex++;
      }

      if (updateData.tokensVolatility !== undefined) {
        updateFields.push(`tokens_volatility = $${paramIndex}`);
        values.push(JSON.stringify(updateData.tokensVolatility));
        paramIndex++;
      }

      if (updateData.poolGrowthTendency !== undefined) {
        updateFields.push(`pool_growth_tendency = $${paramIndex}`);
        values.push(JSON.stringify(updateData.poolGrowthTendency));
        paramIndex++;
      }

      if (updateData.apyVolatility !== undefined) {
        updateFields.push(`apy_volatility = $${paramIndex}`);
        values.push(JSON.stringify(updateData.apyVolatility));
        paramIndex++;
      }

      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);

      if (updateFields.length === 1) {
        // Only updated_at was added, no actual data to update
        return { success: false, error: "No valid fields to update" };
      }

      const query = `
        UPDATE pools 
        SET ${updateFields.join(", ")}
        WHERE pool_id = $${paramIndex}
        RETURNING *
      `;

      values.push(poolId);

      logger.info(`Update query: ${query}`);
      logger.info(`Update values: ${JSON.stringify(values)}`);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Pool not found for update" };
      }

      return { success: true, data: this.mapDbToPool(result.rows[0]) };
    } catch (error) {
      logger.error("Error updating pool:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async upsert(poolData: CreatePool): Promise<PoolQueryResult> {
    try {
      logger.info(`PoolModel.upsert called for poolId: ${poolData.poolId}`);

      const query = `
        INSERT INTO pools (
          pool_id, 
          pool_info, 
          token_quality, 
          impermanent_loss, 
          token_correlation, 
          tokens_volatility, 
          pool_growth_tendency, 
          apy_volatility
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (pool_id) 
        DO UPDATE SET
          pool_info = EXCLUDED.pool_info,
          token_quality = EXCLUDED.token_quality,
          impermanent_loss = EXCLUDED.impermanent_loss,
          token_correlation = EXCLUDED.token_correlation,
          tokens_volatility = EXCLUDED.tokens_volatility,
          pool_growth_tendency = EXCLUDED.pool_growth_tendency,
          apy_volatility = EXCLUDED.apy_volatility,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        poolData.poolId,
        JSON.stringify(poolData.poolInfo),
        JSON.stringify(poolData.tokenQuality),
        JSON.stringify(poolData.impermanentLoss),
        JSON.stringify(poolData.tokenCorrelation),
        JSON.stringify(poolData.tokensVolatility),
        JSON.stringify(poolData.poolGrowthTendency),
        JSON.stringify(poolData.apyVolatility),
      ];

      logger.info(`Upsert query prepared for pool: ${poolData.poolId}`);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return { success: false, error: "Failed to upsert pool" };
      }

      return { success: true, data: this.mapDbToPool(result.rows[0]) };
    } catch (error) {
      logger.error("Error upserting pool:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async delete(poolId: string): Promise<PoolQueryResult> {
    try {
      const query = "DELETE FROM pools WHERE pool_id = $1 RETURNING *";
      const result = await db.query(query, [poolId]);

      if (result.rows.length === 0) {
        return { success: false, error: "Pool not found for deletion" };
      }

      return { success: true, data: this.mapDbToPool(result.rows[0]) };
    } catch (error) {
      logger.error("Error deleting pool:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static mapDbToPool(dbRow: any): Pool {
    return {
      poolId: dbRow.pool_id,
      poolInfo: dbRow.pool_info,
      tokenQuality: dbRow.token_quality,
      impermanentLoss: dbRow.impermanent_loss,
      tokenCorrelation: dbRow.token_correlation,
      tokensVolatility: dbRow.tokens_volatility,
      poolGrowthTendency: dbRow.pool_growth_tendency,
      apyVolatility: dbRow.apy_volatility,
      updatedAt: new Date(dbRow.updated_at),
    };
  }
}
