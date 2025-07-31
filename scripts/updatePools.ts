import { logger } from "@/utils/logger";
import { runPoolUpdateWithRetry } from "@/cron/fetchAndUpdatePools";

export const main = async () => {
  logger.info("Starting pool fetch and update cron job...");

  const result = await runPoolUpdateWithRetry();

  if (result.success) {
    logger.info(
      `Cron job completed successfully. Updated ${result.updatedCount} pools.`
    );
  } else {
    logger.error(`Cron job failed: ${result.error}`);
  }

  return result;
};

main();
