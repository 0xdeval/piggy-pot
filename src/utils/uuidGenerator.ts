import { v5 as uuidv5 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const NAMESPACE = process.env.UUID_NAMESPACE || "";

/**
 * Generates a UUID based on the input string
 *
 * @param input - The input string
 * @returns The generated UUID
 */
export const generateUuid = (input: string) => {
  return uuidv5(input, NAMESPACE);
};
