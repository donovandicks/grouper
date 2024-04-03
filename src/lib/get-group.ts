import { GroupDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroup = async (id: string): Promise<GroupDTO> => {
  logger.info(`looking for group ${id}`);
  const res = await fetch(`${GROUPS_BASE_URL}/${id}`, { headers: HEADERS });
  const group = (await res.json()) as GroupDTO;
  logger.info(group, "found group");
  return group;
};
