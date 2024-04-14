export enum EventType {
  Create = "GROUP_CREATE",
  Update = "GROUP_UPDATE",
  Delete = "GROUP_DELETE",
  AddMember = "GROUP_MEMBER_ADD",
  RemoveMember = "GROUP_MEMBER_REMOVE",
}

export type Event = {
  type: EventType;
  timestamp: Date;
  data: object;
};
