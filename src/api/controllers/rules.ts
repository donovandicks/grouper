import type { Rule } from "../../domain/rule";
import type { RuleService } from "../../services/rule/service";
import { logger } from "../../utils/telemtery";
import { ERR_INTERNAL_SERVER, type ErrorMessage } from "../errors";
import type { CreateRuleDTO } from "../models";
import type { Express, Request, Response } from "express";

export class RulesController {
  rs: RuleService;

  constructor(rules: RuleService) {
    this.rs = rules;
  }

  registerRoutes(app: Express) {
    /* eslint-disable @typescript-eslint/no-misused-promises */
    app.get("/rules", this.listRules.bind(this));
    app.post("/rules", this.createRule.bind(this));
    /* eslint-enable @typescript-eslint/no-misused-promises */
  }

  async listRules(_: Request, res: Response<Rule[] | ErrorMessage>) {
    try {
      logger.info("received rule list request");
      const rules = await this.rs.listRules();
      res.json(rules);
    } catch (err) {
      logger.error({ err }, "failed to list rules");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async createRule(req: Request, res: Response<Rule | ErrorMessage>) {
    try {
      logger.info({ body: req.body as object }, "received rule create request");
      const rule = await this.rs.createRule(req.body as CreateRuleDTO);
      res.status(201).json(rule);
    } catch (err) {
      logger.error({ err, body: req.body as object }, "failed to create rule");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }
}
