import type { GroupID, User, UserID } from "../../domain";
import type { Datastore } from "../datastore";
import { GroupNotFoundError } from "../errors";

export class GroupMemberService {
  private db: Datastore;

  constructor(
    // ac: AccessController,
    db: Datastore,
  ) {
    this.db = db;
  }

  async getGroupMembers(
    id: GroupID,
    params?: { userId?: UserID; name?: string; email?: string },
  ): Promise<User[]> {
    const group = await this.db.getGroup(id);

    if (group === undefined) {
      throw new GroupNotFoundError(id);
    }

    const members = await this.db.getGroupMembers(id);

    if (params === undefined || Object.values(params).every((p) => p === undefined)) {
      return members;
    }

    return members.filter((u) => {
      if (params.userId && u.id === params.userId) {
        return u;
      }

      if (params.email && u.email === params.email) {
        return u;
      }

      if (params.name && u.name.includes(params.name)) {
        return u;
      }
    });
  }

  async addMemberToGroup(group: GroupID, user: UserID): Promise<void> {
    // if (this.ac.userExcludedFromGroup(group, user)) {
    //   return;
    // }

    const alreadyMember = await this.getGroupMembers(group, { userId: user });
    if (alreadyMember.length > 0) {
      return;
    }

    await this.db.addGroupMember(group, user);
  }

  async removeMemberFromGroup(group: GroupID, user: UserID): Promise<void> {
    // if (this.ac.userAllowedInGroup(group, user)) {
    //   return;
    // }

    const alreadyMember = await this.getGroupMembers(group, { userId: user });
    if (alreadyMember.length === 0) {
      return;
    }

    await this.db.removeGroupMember(group, user);
  }
}
