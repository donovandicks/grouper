import type { CreateGroupDTO, CreateUserDTO } from "../../api/models";
import type { Group, GroupEvent, GroupID, User, UserID } from "../../domain";
import type { GroupHistoryEvent } from "../../domain/group";

export type GroupHistory = {
  groupId: GroupID;
  event: GroupEvent;
  timestamp: Date;
  data: object;
};

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
  getGroupHistory(id: GroupID): Promise<GroupHistoryEvent[]>;

  // Users
  createUser(user: CreateUserDTO): Promise<User>;
  listUsers(): Promise<User[]>;
  getUser(id: UserID): Promise<User | undefined>;
  deleteUser(id: UserID): Promise<User | undefined>;
}
