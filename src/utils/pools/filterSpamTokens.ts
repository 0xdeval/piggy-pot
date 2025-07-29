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

  console.log("token", token);
  const isSpam = spamPatterns.some((pattern) => pattern.test(token));
  console.log("isSpam", isSpam);

  return isSpam;
}
