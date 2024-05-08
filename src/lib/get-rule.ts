import type { Rule } from "../domain";
import { logger } from "../utils/telemtery";
import { HEADERS, RULES_BASE_URL } from "./constants";

export const getRule = async (id: string): Promise<Rule> => {
  logger.info(`looking for rule ${id}`);
  const res = await fetch(`${RULES_BASE_URL}/${id}`, { headers: HEADERS });
  const rule = (await res.json()) as Rule;
  logger.info(rule, "found rule");
  return rule;
};
