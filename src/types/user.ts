import { z } from "zod";

export const UserSchema = z.object({
  userIdRaw: z.string().min(1, "userIdRaw is required"),
  userId: z.string().uuid("userId must be a valid UUID"),
  channelId: z.string().uuid("channelId must be a valid UUID"),
  roomId: z.string().uuid("roomId must be a valid UUID"),
  agentId: z.string().uuid("agentId must be a valid UUID"),
  delegatedWalletHash: z.string().min(1, "delegatedWalletHash is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for creating a user - requires all fields
export const CreateUserSchema = UserSchema.omit({
  createdAt: true,
  updatedAt: true,
});

// Schema for the complete user data after generation
export const GeneratedUserSchema = UserSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = UserSchema.partial().omit({
  userIdRaw: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type GeneratedUser = z.infer<typeof GeneratedUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export interface UserQueryResult {
  success: boolean;
  data?: User;
  error?: string;
}

export interface UsersQueryResult {
  success: boolean;
  data?: User[];
  error?: string;
}
