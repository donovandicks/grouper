import { Operators, conditionIsComplex, type Condition, type ConditionMap } from "../domain/rule";
import type { UserAttributes } from "../domain/user";

const processSimpleCondition = (cond: Condition, attributes: UserAttributes): boolean => {
  const actual = attributes[cond.attribute];

  if (actual === undefined) {
    return false;
  }

  return Operators[cond.operation](actual, cond.value);
};

const processComplexCondition = (cond: ConditionMap, attributes: UserAttributes): boolean => {
  const combinator = "and" in cond ? "and" : "or";
  const children = cond.and ?? cond.or;

  const results = children.map((cond) => processCondition(cond, attributes));

  return combinator === "and" ? results.every((v) => v) : results.some((v) => v);
};

export const processCondition = (
  condition: Condition | ConditionMap,
  attributes: UserAttributes,
): boolean => {
  if (conditionIsComplex(condition)) {
    return processComplexCondition(condition, attributes); // TODO:
  }

  return processSimpleCondition(condition, attributes);
};
