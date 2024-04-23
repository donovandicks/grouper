import type { ErrorMessage } from "../api/errors";
import type { UserDTO } from "../api/models";
import type { UserID } from "../domain";
import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const queryUser = async (params: {
  userId?: UserID;
  name?: string;
  email?: string;
}): Promise<UserDTO[] | ErrorMessage> => {
  logger.info({ params }, "querying for users");
  const url = new URL(USERS_BASE_URL);
  if (params.userId !== undefined) {
    url.searchParams.append("userId", params.userId);
  }

  if (params.email !== undefined) {
    url.searchParams.append("email", params.email);
  }

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (res.status !== 200) {
    return (await res.json()) as ErrorMessage;
  }

  return (await res.json()) as UserDTO[];
};
