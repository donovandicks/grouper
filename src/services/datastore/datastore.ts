import type { CreateGroupDTO, CreateRuleDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupID, Membership, User, UserID } from "../../domain";
import type { Rule } from "../../domain/rule";

export interface Datastore {
  // Members
  getGroupMembers(group: GroupID): Promise<User[]>;
  addGroupMember(group: GroupID, user: UserID): Promise<void>;
  removeGroupMember(group: GroupID, user: UserID): Promise<void>;
  getGroupMemberHistory(group: GroupID): Promise<Membership[]>;

  // Groups
  createGroup(group: CreateGroupDTO): Promise<Group>;
  listGroups(): Promise<Group[]>;
  getGroup(id: GroupID): Promise<Group | undefined>;
  deleteGroup(id: GroupID): Promise<Group | undefined>;

  // Users
  createUser(user: CreateUserDTO): Promise<User>;
  listUsers(): Promise<User[]>;
  getUser(id: UserID): Promise<User | undefined>;
  deleteUser(id: UserID): Promise<User | undefined>;

  // Rules
  createRule(rule: CreateRuleDTO): Promise<Rule>;
  listRules(): Promise<Rule[]>;
}
