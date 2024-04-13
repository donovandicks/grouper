import type { GroupHistoryDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroupHistory = async (id: string): Promise<GroupHistoryDTO> => {
  logger.info(`pulling history for group ${id}`);
  const res = await fetch(`${GROUPS_BASE_URL}/${id}/history`, { headers: HEADERS });
  const history = (await res.json()) as GroupHistoryDTO;
  logger.info({ history }, "found history for group");
  return history;
};
