export type Combinator = "and" | "or";

export type Condition = {
  attribute: string;
  operation: string;
  value?: string;
};

// [T, ...T[]] enforces at least one element in the array
export type ConditionList = [Condition, ...Condition[]];
export type ConditionMapList = [ConditionMap, ...ConditionMap[]];

// Hacky "one or the other but not both" implementation
export type ConditionMap =
  | { and: ConditionList | ConditionMapList; or?: never }
  | { or: ConditionList | ConditionMapList; and?: never };

export type Rule = {
  id?: number;
  name: string;
  description: string;
  userManaged: boolean;
  condition: Condition | ConditionMap;
};
