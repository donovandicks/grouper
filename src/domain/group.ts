import type { GroupEvent } from "./events";
import type { UserID } from "./user";
import type { UUID } from "crypto";

export type GroupID = UUID;

export type Group = {
  id: GroupID;
  name: string; // Display Name
  handle: string; // Computer Name
  type?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Event = {
  groupID: GroupID;
  timestamp: Date;
};

type GroupMemberAddEvent = Event & {
  event: GroupEvent.AddMember;
  data: { userId: UserID; startDate: Date };
};

type GroupMemberRemoveEvent = Event & {
  event: GroupEvent.RemoveMember;
  data: { userId: UserID; startDate: Date; endDate: Date };
};

type GroupCreateEvent = Event & {
  event: GroupEvent.Create;
  data: Group;
};

export type GroupHistoryEvent = GroupCreateEvent | GroupMemberAddEvent | GroupMemberRemoveEvent;
