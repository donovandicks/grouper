import type { CreateRuleDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import type { Rule } from "../../domain/rule";

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

  async createRule(rule: CreateRuleDTO): Promise<Rule> {
    return await this.db.createRule(rule);
  }
}
