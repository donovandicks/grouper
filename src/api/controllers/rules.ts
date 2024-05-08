import type { Rule, RuleID } from "../../domain/rule";
import { RuleNotFoundError } from "../../services/errors";
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
    app.get("/rules/:ruleId", this.getRule.bind(this));
    app.post("/rules", this.createRule.bind(this));
    app.delete("/rules/:ruleId", this.deleteRule.bind(this));
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

  async getRule(req: Request<{ ruleId: RuleID }>, res: Response<Rule | ErrorMessage>) {
    try {
      logger.info({ ruleId: req.params.ruleId }, "received rule get request");
      const rule = await this.rs.getRule(req.params.ruleId);
      if (rule === undefined) {
        throw new RuleNotFoundError(req.params.ruleId);
      }
      res.json(rule);
    } catch (err) {
      logger.error({ err }, "failed to find rule");
      if (err instanceof RuleNotFoundError) {
        res.status(404).json(err);
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async createRule(
    req: Request<object, object, CreateRuleDTO>,
    res: Response<Rule | ErrorMessage>,
  ) {
    try {
      logger.info({ body: req.body }, "received rule create request");
      const rule = await this.rs.createRule(req.body);
      res.status(201).json(rule);
    } catch (err) {
      logger.error({ err, body: req.body as object }, "failed to create rule");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async deleteRule(req: Request<{ ruleId: RuleID }>, res: Response<Rule | null | ErrorMessage>) {
    try {
      logger.info({ ruleId: req.params.ruleId }, "received request to delete rule");
      const deleted = await this.rs.deleteRule(req.params.ruleId);
      if (deleted) {
        res.status(200).json(deleted);
        return;
      }
      res.status(204);
    } catch (err) {
      logger.error({ err }, "failed to delete rule");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }
}
