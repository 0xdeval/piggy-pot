import { logger } from "@/utils/logger";

/**
 * Checks if a token is spam based on various patterns
 *
 * @param token - The token to check
 * @returns True if the token is spam, false otherwise
 */
export function isSpamTokens(token: string): boolean {
  const spamPatterns = [
    /https?:\/\//i,
    /\.com/i,
    /\.org/i,
    /\.xyz/i,
    /\.io/i,
    /airdrop/i,
    /\.live/i,
    /claim/i,
    /www\./i,
    /\$/,
  ];

  logger.debug("Checking token for spam", { token });
  const isSpam = spamPatterns.some((pattern) => pattern.test(token));
  logger.debug("Spam check result", { token, isSpam });

  return isSpam;
}
