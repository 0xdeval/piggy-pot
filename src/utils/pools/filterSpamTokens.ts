import { logger } from "@/utils/logger";

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
