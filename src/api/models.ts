import type { Group, User } from "../domain";

export type UserDTO = User;
export type CreateUserDTO = Pick<UserDTO, "name" | "email">;

export type GroupDTO = Group & { members: UserDTO[] };
export type CreateGroupDTO = {
  name: string;
  handle?: string;
};
