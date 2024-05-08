import type { CreateRuleDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import type { Rule, RuleID } from "../../domain/rule";

export class RuleService {
  private db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async listRules(): Promise<Rule[]> {
    const rules = await this.db.listRules();

    // TODO: Support query params

    return rules;
  }

  async getRule(ruleId: RuleID): Promise<Rule | undefined> {
    return await this.db.getRule(ruleId);
  }

  async createRule(rule: CreateRuleDTO): Promise<Rule> {
    return await this.db.createRule(rule);
  }

  async deleteRule(ruleId: RuleID): Promise<Rule | undefined> {
    return await this.db.deleteRule(ruleId);
  }
}
