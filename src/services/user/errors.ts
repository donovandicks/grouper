import type { UserID } from "../../domain";

export class UserNotFoundError extends Error {
  userId: UserID;

  constructor(id: UserID) {
    super(`User ${id} not found`);
    this.userId = id;
  }
}
