import dotenv from "dotenv";

dotenv.config();

if (!process.env.ONE_INCH_API_KEY) {
  throw new Error(
    "ONE_INCH_API_KEY is not set. This is necessary to fetch data from the 1inch API"
  );
}

export const ONE_INCH_API_KEY = process.env.ONE_INCH_API_KEY;
