import type { CreateRuleDTO } from "../api/models";
import type { Rule } from "../domain";
import { logger } from "../utils/telemtery";
import { RULES_BASE_URL } from "./constants";
import { postData } from "./post-data";

export const createRule = async (opts: CreateRuleDTO) => {
  logger.info(opts, "creating new rule");
  const rule = postData<CreateRuleDTO, Rule>(RULES_BASE_URL, opts);
  logger.info(rule, "created rule");
  return rule;
};
