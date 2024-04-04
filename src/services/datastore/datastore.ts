import type { CreateGroupDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupID, User, UserID } from "../../domain/index";

export interface Datastore {
  // Members
  getGroupMembers(group: GroupID): Promise<User[]>;
  addGroupMember(group: GroupID, user: UserID): Promise<void>;
  removeGroupMember(group: GroupID, user: UserID): Promise<void>;

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
}
