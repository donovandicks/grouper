import type { ErrorMessage } from "../api/errors";
import type { UserDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const getUser = async (id: string): Promise<UserDTO | ErrorMessage> => {
  logger.info(`looking for user ${id}`);
  const res = await fetch(`${USERS_BASE_URL}/${id}`, { headers: HEADERS });

  if (res.status !== 200) {
    const msg = (await res.json()) as ErrorMessage;
    logger.error(msg, "failed to find user");
    return msg;
  }

  const user = (await res.json()) as UserDTO;
  logger.info(user, "found user");
  return user;
};
