import type { GroupID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroupMembers = async (id: GroupID) => {
  logger.info("getting group members");
  const res = await fetch(`${GROUPS_BASE_URL}/${id}/members`, { headers: HEADERS });
  logger.info(await res.json(), "get group members");
};
