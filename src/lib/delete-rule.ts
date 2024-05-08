import type { Rule, RuleID } from "../domain";
import { logger } from "../utils/telemtery";
import { HEADERS, RULES_BASE_URL } from "./constants";
import { listRules } from "./list-rules";

export const deleteRule = async (id: RuleID): Promise<Rule> => {
  logger.info({ id }, "deleting rule");

  const res = await fetch(`${RULES_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: HEADERS,
  });

  const deleted = (await res.json()) as Rule;
  logger.info(deleted, "deleted rule");
  return deleted;
};

export const deleteAllRules = async (): Promise<void> => {
  logger.info("deleting all rules");

  const existing = await listRules();

  logger.info({ numRules: existing.length }, "deleting rules");

  for (const rule of existing) {
    await deleteRule(rule.id);
  }

  logger.info("deleted all rules");
};
