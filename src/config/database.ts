import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_CONNECTION_URL) {
  throw new Error("DATABASE_CONNECTION_URL is not set");
}

const databaseUrl = process.env.DATABASE_CONNECTION_URL;

const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().default(databaseUrl),
});

export const databaseConfig = databaseConfigSchema.parse(process.env);

export const getDatabaseUrl = (): string => {
  return databaseConfig.DATABASE_URL;
};
