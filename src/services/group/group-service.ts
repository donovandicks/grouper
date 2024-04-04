import type { CreateGroupDTO, GroupDTO } from "../../api/models";
import type { Group, GroupID, User, UserID } from "../../domain/index";
import type { AccessController } from "../access-control/index";
import type { Datastore } from "../datastore/index";

export class GroupService {
  ac: AccessController;
  db: Datastore;

  constructor(ac: AccessController, db: Datastore) {
    this.ac = ac;
    this.db = db;
  }

  async createGroup(group: CreateGroupDTO): Promise<GroupDTO> {
    const g = await this.db.createGroup(group);
    return { ...g, members: [] };
  }

  async listGroups(): Promise<GroupDTO[]> {
    const groups = await this.db.listGroups();
    return await Promise.all(
      groups.map(async (g) => {
        return {
          ...g,
          members: await this.db.getGroupMembers(g.id),
        };
      }),
    );
  }

  async getGroup(id: GroupID): Promise<Group | undefined> {
    return this.db.getGroup(id);
  }

  async getGroupMembers(id: GroupID): Promise<User[] | undefined> {
    const group = await this.db.getGroup(id);

    if (!group) {
      return undefined;
    }

    return await this.db.getGroupMembers(id);
  }

  async deleteGroup(id: GroupID): Promise<Group | undefined> {
    return this.db.deleteGroup(id);
  }

  async addMemberToGroup(group: GroupID, user: UserID): Promise<void> {
    if (this.ac.userExcludedFromGroup(group, user)) {
      return;
    }

    await this.db.addGroupMember(group, user);
  }

  async removeMemberFromGroup(group: GroupID, user: UserID): Promise<void> {
    if (this.ac.userAllowedInGroup(group, user)) {
      return;
    }

    await this.db.removeGroupMember(group, user);
  }
}
