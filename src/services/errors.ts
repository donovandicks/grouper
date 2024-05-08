import type { GroupID, RuleID, UserID } from "../domain";
import type { UUID } from "crypto";

class NotFoundError extends Error {
  id: UUID;

  constructor(id: UUID, entity: string) {
    super(`${entity} ${id} not found`);
    this.id = id;
  }
}

export class GroupNotFoundError extends NotFoundError {
  constructor(id: GroupID) {
    super(id, "Group");
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(id: UserID) {
    super(id, "User");
  }
}

export class RuleNotFoundError extends NotFoundError {
  constructor(id: RuleID) {
    super(id, "Rule");
  }
}
