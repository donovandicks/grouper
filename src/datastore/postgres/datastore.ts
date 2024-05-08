import type { CreateGroupDTO, CreateRuleDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupID, Membership, User, UserID } from "../../domain";
import type { Rule, RuleID } from "../../domain/rule";
import type { Datastore } from "../index";
import { GroupMemberRepository } from "./group-member-repository";
import { GroupRepository } from "./group-repository";
import { RuleAttachmentRepository } from "./rule-attachment-repository";
import { RuleRepository } from "./rule-repository";
import { UserRepository } from "./user-repository";
import { Pool } from "pg";

export class PostgresDatastore implements Datastore {
  private groupMembers: GroupMemberRepository;
  private users: UserRepository;
  private groups: GroupRepository;
  private rules: RuleRepository;
  private ruleAttachments: RuleAttachmentRepository;

  constructor(pool: Pool) {
    this.groupMembers = new GroupMemberRepository(pool);
    this.users = new UserRepository(pool);
    this.groups = new GroupRepository(pool);
    this.rules = new RuleRepository(pool);
    this.ruleAttachments = new RuleAttachmentRepository(pool);
  }

  // Members //
  async getGroupMembers(group: GroupID): Promise<User[]> {
    const userIds = await this.groupMembers.getGroupMembers(group);
    return await this.users.list((u) => userIds.includes(u.id));
  }

  async addGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.addGroupMember(group, user);
  }

  async removeGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.removeGroupMember(group, user);
  }

  async getGroupMemberHistory(group: GroupID): Promise<Membership[]> {
    return await this.groupMembers.getGroupMemberHistory(group);
  }

  // Groups //
  async createGroup(group: CreateGroupDTO): Promise<Group> {
    return this.groups.create(group);
  }

  async listGroups(): Promise<Group[]> {
    return this.groups.list();
  }

  async getGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async deleteGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.delete(id);
  }

  // Users //
  async createUser(user: CreateUserDTO): Promise<User> {
    return this.users.create(user);
  }

  async listUsers(): Promise<User[]> {
    return this.users.list();
  }

  async getUser(id: UserID): Promise<User | undefined> {
    return this.users.get(id);
  }

  async deleteUser(id: UserID): Promise<User | undefined> {
    return this.users.delete(id);
  }

  // Rules //
  async listRules(): Promise<Rule[]> {
    return this.rules.list();
  }

  async createRule(rule: CreateRuleDTO): Promise<Rule> {
    return this.rules.create(rule);
  }

  // Rule Attachments //
  async attachRule(groupId: GroupID, ruleId: RuleID): Promise<void> {
    return this.ruleAttachments.attachRule(groupId, ruleId);
  }

  async detachRule(groupId: GroupID): Promise<void> {
    return this.ruleAttachments.detachRule(groupId);
  }
}
