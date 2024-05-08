import type { UserAttributeTypes } from "./user";

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
