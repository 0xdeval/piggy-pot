import { z } from "zod";

export const OperationSchema = z.object({
  operationId: z.string().uuid("operationId must be a valid UUID"),
  userId: z.string().uuid("userId must be a valid UUID"),
  operationDate: z.date(),
  investedAmount: z.number().positive("investedAmount must be positive"),
  riskyInvestment: z.number().min(0, "riskyInvestment must be non-negative"),
  nonRiskyInvestment: z
    .number()
    .min(0, "nonRiskyInvestment must be non-negative"),
  logId: z.string().uuid("logId must be a valid UUID").optional(),
  status: z.enum(
    [
      "RECOMMENDATION_INIT",
      "RECOMMENDATION_FINISHED",
      "RECOMMENDATION_FAILED",
      "DEPOSIT_INIT",
      "DEPOSIT_FAILED",
      "ACTIVE_INVESTMENT",
      "CLOSED_INVESTMENT",
    ],
    {
      errorMap: () => ({
        message:
          "status must be one of: RECOMMENDATION_INIT, RECOMMENDATION_FINISHED, RECOMMENDATION_FAILED, DEPOSIT_INIT, DEPOSIT_FAILED, ACTIVE_INVESTMENT, CLOSED_INVESTMENT",
      }),
    }
  ),
  recommendedPools: z.any().optional(),
  profit: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateOperationSchema = OperationSchema.omit({
  operationId: true,
  operationDate: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateOperationSchema = OperationSchema.partial().omit({
  operationId: true,
  userId: true,
  operationDate: true,
  createdAt: true,
  updatedAt: true,
});

export type Operation = z.infer<typeof OperationSchema>;
export type CreateOperation = z.infer<typeof CreateOperationSchema>;
export type UpdateOperation = z.infer<typeof UpdateOperationSchema>;

export interface OperationQueryResult {
  success: boolean;
  data?: Operation;
  error?: string;
}

export interface OperationsQueryResult {
  success: boolean;
  data?: Operation[];
  error?: string;
}
