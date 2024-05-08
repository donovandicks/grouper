import type { Operation } from "./operation";
import type { UserAttributeTypes } from "./user";

export type Condition = {
  attribute: string;
  operation: Operation;
  value?: UserAttributeTypes;
};

// [T, ...T[]] enforces at least one element in the array
export type ConditionList = [Condition, ...Condition[]];
export type ConditionMapList = [ConditionMap, ...ConditionMap[]];

// Hacky "one or the other but not both" implementation
export type ConditionMap =
  | { and: ConditionList | ConditionMapList; or?: never }
  | { or: ConditionList | ConditionMapList; and?: never };

export const conditionIsSimple = (cond: Condition | ConditionMap): cond is Condition => {
  return "attribute" in cond && "operation" in cond;
};

export const conditionIsComplex = (cond: Condition | ConditionMap): cond is ConditionMap => {
  return "and" in cond || "or" in cond;
};
