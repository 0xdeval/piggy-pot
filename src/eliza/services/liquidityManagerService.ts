import { Service, IAgentRuntime } from "@elizaos/core";
import { logger } from "@elizaos/core";

export class LiquidityManagerService extends Service {
  static serviceType = "liquidity-manager";
  capabilityDescription =
    "This is a liquidity manager service which is attached to the agent through the liquidity manager plugin.";

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info("*** Starting starter service ***");
    const service = new LiquidityManagerService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info("*** Stopping starter service ***");
    // get the service from the runtime
    const service = runtime.getService(LiquidityManagerService.serviceType);
    if (!service) {
      throw new Error("Liquidity manager service not found");
    }
    service.stop();
  }

  async stop() {
    logger.info("*** Stopping starter service instance ***");
  }
}
