import type { Group, User } from "../domain";
import type { GroupHistoryEvent } from "../domain/group";

export type UserDTO = User;
export type CreateUserDTO = Pick<UserDTO, "name" | "email">;

export type GroupDTO = Group & { members: UserDTO[] };
export type CreateGroupDTO = {
  name: string;
  handle?: string;
  type?: string;
};

export type GroupHistoryDTO = {
  timeline: GroupHistoryEvent[];
};
