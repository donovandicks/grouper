import type { GroupID } from "./group";
import type { UserID } from "./user";

export type Membership = {
  groupId: GroupID;
  userId: UserID;
  startDate: Date;
  endDate: Date | null;
};
