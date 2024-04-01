import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const getGroup = async (id: string) => {
  logger.info(`looking for group ${id}`);
  const res = await fetch(`${GROUPS_BASE_URL}/${id}`, { headers: HEADERS });
  logger.info(await res.json(), "found group");
};
