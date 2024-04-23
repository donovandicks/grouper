import type { GroupID } from "../../domain";

export class GroupNotFoundError extends Error {
  groupId: GroupID;

  constructor(id: GroupID) {
    super(`Group ${id} not found`);
    this.groupId = id;
  }
}
