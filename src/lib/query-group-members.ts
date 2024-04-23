import type { ErrorMessage } from "../api/errors";
import type { UserDTO } from "../api/models";
import type { GroupID, UserID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const queryGroupMembers = async (
  groupId: GroupID,
  params: {
    userId?: UserID;
    name?: string;
    email?: string;
  },
): Promise<UserDTO[] | ErrorMessage> => {
  logger.info({ groupId, params }, "querying group members");
  const url = new URL(`${GROUPS_BASE_URL}/${groupId}/members`);
  if (params.userId !== undefined) {
    url.searchParams.append("userId", params.userId);
  }

  if (params.name !== undefined) {
    url.searchParams.append("name", params.name);
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
