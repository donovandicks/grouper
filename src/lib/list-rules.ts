import type { Rule } from "../domain";
import { logger } from "../utils/telemtery";
import { HEADERS, RULES_BASE_URL } from "./constants";

export const listRules = async (): Promise<Rule[]> => {
  logger.info("listing rules");
  const res = await fetch(`${RULES_BASE_URL}/`, { headers: HEADERS });
  const rules = (await res.json()) as Rule[];
  logger.info({ rules }, "found rules");
  return rules;
};
