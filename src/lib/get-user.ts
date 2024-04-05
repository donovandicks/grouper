import type { UserDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const getUser = async (id: string): Promise<UserDTO> => {
  logger.info(`looking for user ${id}`);
  const res = await fetch(`${USERS_BASE_URL}/${id}`, { headers: HEADERS });
  const user = (await res.json()) as UserDTO;
  logger.info(user, "found user");
  return user;
};
