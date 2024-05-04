import { EventChannels, type Cache } from "../../cache";
import type { Rule } from "../../domain/rule";
import { logger } from "../../utils/telemtery";

export class RuleProcessorService {
  private cache: Cache;

  constructor(cache: Cache) {
    this.cache = cache;
  }

  async subscribeToChannels(): Promise<void> {
    logger.info(
      { channels: [EventChannels.RuleCreated] },
      "subscribing rule processor to channel(s)",
    );
    await this.cache.subscribe(EventChannels.RuleCreated, this.processRuleCreation.bind(this));
  }

  processRuleCreation(message: string, channel: string): void {
    const msg = JSON.parse(message) as Rule;
    logger.info({ message: msg, channel }, "rule creation triggered");
  }
}
