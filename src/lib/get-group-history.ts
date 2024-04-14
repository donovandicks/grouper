import type { Event } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroupHistory = async (id: string): Promise<Event[]> => {
  logger.info(`pulling history for group ${id}`);
  const res = await fetch(`${GROUPS_BASE_URL}/${id}/history`, { headers: HEADERS });
  const history = (await res.json()) as Event[];
  logger.info({ history }, "found history for group");
  return history;
};
