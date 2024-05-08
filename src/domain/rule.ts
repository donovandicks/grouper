import type { Condition, ConditionMap } from "./condition";
import type { UUID } from "crypto";

const brand = Symbol("brand");
export type RuleID = UUID & { [brand]: "RuleID" };
export type Rule = {
  id: RuleID;
  name: string;
  description: string;
  condition: Condition | ConditionMap;
  createdAt: Date;
  updatedAt: Date;
};
