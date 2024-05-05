import type { UserAttributeTypes } from "./user";
import type { UUID } from "crypto";

export type Operation = "equals" | "not equals" | "contains" | "does not contain";

export type OpFunc = (actual: UserAttributeTypes, expected?: UserAttributeTypes) => boolean;

export type OpFuncMap = Record<Operation, OpFunc>;

export const Operators: OpFuncMap = {
  equals: (actual: UserAttributeTypes, expected?: UserAttributeTypes) => actual === expected,
  "not equals": (actual: UserAttributeTypes, expected?: UserAttributeTypes) =>
    !Operators.equals(actual, expected),
  contains: (actual: UserAttributeTypes, expected?: UserAttributeTypes) => {
    if (typeof actual !== "string" || typeof expected !== "string") {
      return false;
    }
    return actual.includes(expected);
  },
  "does not contain": (actual: UserAttributeTypes, expected?: UserAttributeTypes) =>
    !Operators.contains(actual, expected),
};

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

export type Rule = {
  id: UUID;
  name: string;
  description: string;
  userManaged: boolean;
  condition: Condition | ConditionMap;
  createdAt: Date;
  updatedAt: Date;
};

export const conditionIsSimple = (cond: Condition | ConditionMap): cond is Condition => {
  return "attribute" in cond && "operation" in cond;
};

export const conditionIsComplex = (cond: Condition | ConditionMap): cond is ConditionMap => {
  return "and" in cond || "or" in cond;
};
