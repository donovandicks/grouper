import type { CreateGroupDTO, GroupDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import { EventType, type Event, type Group, type GroupID } from "../../domain";
import { GroupNotFoundError } from "../errors";

export class GroupService {
  db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async createGroup(group: CreateGroupDTO): Promise<Group> {
    return await this.db.createGroup(group);
  }

  async listGroups(params: {
    groupId?: GroupID;
    name?: string;
    handle?: string;
  }): Promise<Group[]> {
    const groups = await this.db.listGroups();

    if (Object.values(params).every((p) => p === undefined)) {
      return groups;
    }

    return groups.filter((g) => {
      if (params.groupId && g.id === params.groupId) {
        return g;
      }

      if (params.name && g.name.includes(params.name)) {
        return g;
      }

      if (params.handle && g.handle.includes(params.handle)) {
        return g;
      }
    });
  }

  async getGroup(id: GroupID): Promise<GroupDTO> {
    const group = await this.db.getGroup(id);
    if (!group) {
      throw new GroupNotFoundError(id);
    }

    return { ...group, members: (await this.db.getGroupMembers(group.id)) ?? [] };
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
}
