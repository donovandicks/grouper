import type { UserDTO } from "../api/models";
import type { GroupID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroupMembers = async (id: GroupID): Promise<UserDTO[]> => {
  logger.info("getting group members");
  const res = await fetch(`${GROUPS_BASE_URL}/${id}/members`, { headers: HEADERS });

  const members = (await res.json()) as UserDTO[];
  logger.info(members, "get group members");
  return members;
};
