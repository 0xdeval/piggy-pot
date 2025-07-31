import { z } from "zod";

export const OperationLogSchema = z.object({
  logId: z.string().uuid("logId must be a valid UUID"),
  operationId: z.string().uuid("operationId must be a valid UUID"),
  description: z.string().min(1, "description is required"),
  createDate: z.date(),
  stepNumber: z
    .number()
    .int()
    .positive("stepNumber must be a positive integer"),
  createdAt: z.date().optional(),
});

export const CreateOperationLogSchema = OperationLogSchema.omit({
  logId: true,
  createDate: true,
  createdAt: true,
});

export const UpdateOperationLogSchema = OperationLogSchema.partial().omit({
  logId: true,
  operationId: true,
  createDate: true,
  createdAt: true,
});

export type OperationLog = z.infer<typeof OperationLogSchema>;
export type CreateOperationLog = z.infer<typeof CreateOperationLogSchema>;
export type UpdateOperationLog = z.infer<typeof UpdateOperationLogSchema>;

export interface OperationLogQueryResult {
  success: boolean;
  data?: OperationLog;
  error?: string;
}

export interface OperationLogsQueryResult {
  success: boolean;
  data?: OperationLog[];
  error?: string;
}
