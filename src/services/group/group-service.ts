import type { CreateGroupDTO, GroupDTO } from "../../api/models";
import {
  EventType,
  type Event,
  type Group,
  type GroupID,
  type User,
  type UserID,
} from "../../domain";
import type { AccessController } from "../access-control";
import type { Datastore } from "../datastore";
import { GroupNotFoundError } from "./errors";

export class GroupService {
  ac: AccessController;
  db: Datastore;

  constructor(ac: AccessController, db: Datastore) {
    this.ac = ac;
    this.db = db;
  }

  async createGroup(group: CreateGroupDTO): Promise<Group> {
    return await this.db.createGroup(group);
  }

  async listGroups(): Promise<Group[]> {
    return await this.db.listGroups();
  }

  async getGroup(id: GroupID): Promise<GroupDTO> {
    const group = await this.db.getGroup(id);
    if (!group) {
      throw new GroupNotFoundError(id);
    }

    return { ...group, members: (await this.getGroupMembers(group.id)) ?? [] };
  }

  async getGroupMembers(id: GroupID): Promise<User[]> {
    const group = await this.db.getGroup(id);

    if (!group) {
      throw new GroupNotFoundError(id);
    }

    return await this.db.getGroupMembers(id);
  }

  async queryGroupMembers(
    id: GroupID,
    params: { userId?: UserID; email?: string },
  ): Promise<User[]> {
    const group = await this.db.getGroup(id);
    if (!group) {
      throw new GroupNotFoundError(id);
    }

    const members = await this.db.getGroupMembers(group.id);

    return members.filter((u) => {
      if (params.userId && u.id === params.userId) {
        return u;
      }

      if (params.email && u.email === params.email) {
        return u;
      }
    });
  }

  async getGroupHistory(id: GroupID): Promise<Event[]> {
    const group = await this.db.getGroup(id);

    if (!group) {
      throw new GroupNotFoundError(id);
    }

    const timeline = [{ type: EventType.Create, timestamp: group.createdAt, data: group } as Event];
    const memberships = await this.db.getGroupMemberHistory(id);

    for (const membership of memberships) {
      timeline.push({
        type: EventType.AddMember,
        timestamp: membership.startDate,
        data: { userId: membership.userId },
      });

      if (membership.endDate) {
        timeline.push({
          type: EventType.RemoveMember,
          timestamp: membership.endDate,
          data: { userId: membership.userId },
        });
      }
    }

    return timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async deleteGroup(id: GroupID): Promise<Group | undefined> {
    return this.db.deleteGroup(id);
  }

  async addMemberToGroup(group: GroupID, user: UserID): Promise<void> {
    if (this.ac.userExcludedFromGroup(group, user)) {
      return;
    }

    const alreadyMember = await this.queryGroupMembers(group, { userId: user });
    if (alreadyMember.length > 0) {
      return;
    }

    await this.db.addGroupMember(group, user);
  }

  async removeMemberFromGroup(group: GroupID, user: UserID): Promise<void> {
    if (this.ac.userAllowedInGroup(group, user)) {
      return;
    }

    const alreadyMember = await this.queryGroupMembers(group, { userId: user });
    if (alreadyMember.length === 0) {
      return;
    }

    await this.db.removeGroupMember(group, user);
  }
}
