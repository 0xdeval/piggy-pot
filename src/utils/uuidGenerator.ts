import { v5 as uuidv5 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const NAMESPACE = process.env.UUID_NAMESPACE || "";

export const generateUuid = (input: string) => {
  return uuidv5(input, NAMESPACE);
};

export const generateRoomId = (input: string) => {
  return uuidv5(`room-${input}`, NAMESPACE);
};
