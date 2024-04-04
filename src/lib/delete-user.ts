import type { UserID } from "../domain";
import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const deleteUser = async (userId: UserID) => {
  logger.info({ userId }, "deleting user");

  const res = await fetch(`${USERS_BASE_URL}/${userId}`, {
    method: "DELETE",
    headers: HEADERS,
  });

  logger.info(await res.json(), "deleted user");
};
