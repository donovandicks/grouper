import type { Group, User } from "../domain";
import type { Rule } from "../domain/rule";
import type { UserAttributes } from "../domain/user";

export type UserDTO = User;
export type CreateUserDTO = Pick<UserDTO, "name" | "email"> & { attributes?: UserAttributes };

export type GroupDTO = Group & { members: UserDTO[] };
export type CreateGroupDTO = {
  name: string;
  handle?: string;
  userManaged: boolean;
};

export type CreateRuleDTO = Pick<Rule, "name" | "description" | "condition">;
