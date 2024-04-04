import type { CreateGroupDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupID, User, UserID } from "../../domain/index";
import type { Datastore } from "./datastore";
import type { UUID } from "crypto";
import { randomUUID } from "crypto";

const toKebab = (raw: string): string => {
  return raw.toLocaleLowerCase().replaceAll(" ", "-");
};

class GroupRepository {
  groups: Map<GroupID, Group>;

  constructor() {
    this.groups = new Map();
  }

  async create(group: CreateGroupDTO): Promise<Group> {
    const id = randomUUID();
    const g: Group = {
      id,
      name: group.name,
      handle: group.handle ?? toKebab(group.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.groups.set(id, g);
    return Promise.resolve(g);
  }

  async get(id: GroupID): Promise<Group | undefined> {
    return Promise.resolve(this.groups.get(id));
  }

  async list(): Promise<Group[]> {
    return Promise.resolve([...this.groups.values()]);
  }

  async delete(id: GroupID): Promise<Group | undefined> {
    const existing = this.groups.get(id);
    this.groups.delete(id);
    return Promise.resolve(existing);
  }
}

class UserRepository {
  users: Map<UserID, User>;

  constructor() {
    this.users = new Map();
  }

  create(user: CreateUserDTO): Promise<User> {
    const u = {
      ...user,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(u.id, u);
    return Promise.resolve(u);
  }

  async get(id: UserID): Promise<User | undefined> {
    return Promise.resolve(this.users.get(id));
  }

  async list(filter?: (user: User) => boolean): Promise<User[]> {
    return Promise.resolve([...this.users.values()].filter(filter ?? (() => true)));
  }

  async delete(id: UserID): Promise<User | undefined> {
    const existing = this.users.get(id);
    this.users.delete(id);
    return Promise.resolve(existing);
  }
}

class GroupMemberRepository {
  members: Map<UUID, { groupId: GroupID; userId: UserID }>;

  constructor() {
    this.members = new Map();
  }

  async addGroupMember(groupId: GroupID, userId: UserID) {
    this.members.set(randomUUID(), { groupId, userId });
    return Promise.resolve();
  }

  async removeGroupMember(groupId: GroupID, userId: UserID) {
    const entryId = [...this.members.entries()].filter(
      (e) => e[1].groupId === groupId && e[1].userId === userId,
    )[0];
    if (entryId) {
      this.members.delete(entryId[0]);
    }
    return Promise.resolve();
  }

  async getGroupMembers(groupId: GroupID): Promise<UserID[]> {
    return Promise.resolve(
      [...this.members.values()].filter((o) => o.groupId === groupId).map((o) => o.userId),
    );
  }
}

export class InMemoryDatastore implements Datastore {
  groups: GroupRepository;
  users: UserRepository;
  groupMembers: GroupMemberRepository;

  constructor() {
    this.groups = new GroupRepository();
    this.users = new UserRepository();
    this.groupMembers = new GroupMemberRepository();
  }

  async removeGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.removeGroupMember(group, user);
  }

  async addGroupMember(group: GroupID, user: UserID): Promise<void> {
    await this.groupMembers.addGroupMember(group, user);
  }

  async getGroupMembers(group: GroupID): Promise<User[]> {
    const userIds = await this.groupMembers.getGroupMembers(group);
    return this.users.list((user) => userIds.includes(user.id));
  }

  async createGroup(group: CreateGroupDTO): Promise<Group> {
    return this.groups.create(group);
  }

  async getGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async listGroups(): Promise<Group[]> {
    return this.groups.list();
  }

  async deleteGroup(id: GroupID): Promise<Group | undefined> {
    return this.groups.delete(id);
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    return this.users.create(user);
  }

  async getUser(id: UserID): Promise<User | undefined> {
    return this.users.get(id);
  }

  async listUsers(): Promise<User[]> {
    return this.users.list();
  }

  async deleteUser(id: UserID): Promise<User | undefined> {
    return this.users.delete(id);
  }
}
