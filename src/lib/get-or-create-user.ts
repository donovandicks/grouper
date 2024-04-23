import type { UserDTO } from "../api/models";
import { createUser } from "./create-user";
import { queryUser } from "./query-user";

export const getOrCreateUser = async (params: {
  name: string;
  email: string;
}): Promise<UserDTO> => {
  const users = await queryUser({ email: params.email });

  if (users instanceof Array && users.length > 0) {
    return users[0];
  }

  return await createUser(params);
};
