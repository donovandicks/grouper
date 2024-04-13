import type { CreateGroupDTO, CreateUserDTO } from "../../../api/models";
import type { GroupHistoryEvent } from "../../../domain/group";
import type { Group, GroupID, User, UserID } from "../../../domain/index";
import type { Datastore } from "../index";
import { GroupMemberRepository, GroupRepository, UserRepository } from "./repository";
import { Pool } from "pg";

export class PostgresDatastore implements Datastore {
  private groupMembers: GroupMemberRepository;
  private users: UserRepository;
  private groups: GroupRepository;

  constructor(pool: Pool) {
    this.groupMembers = new GroupMemberRepository(pool);
    this.users = new UserRepository(pool);
    this.groups = new GroupRepository(pool);
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

  async getGroupHistory(id: GroupID): Promise<GroupHistoryEvent[]> {
    return this.groups.getHistory(id);
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
}
