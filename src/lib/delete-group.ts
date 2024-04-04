import type { GroupDTO } from "../api/models";
import type { GroupID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const deleteGroup = async (groupId: GroupID): Promise<GroupDTO> => {
  logger.info({ groupId }, "deleting group");

  const res = await fetch(`${GROUPS_BASE_URL}/${groupId}`, {
    method: "DELETE",
    headers: HEADERS,
  });

  const deleted = (await res.json()) as GroupDTO;
  logger.info(deleted, "deleted group");
  return deleted;
};
