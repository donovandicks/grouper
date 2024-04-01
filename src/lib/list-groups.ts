import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const listGroups = async () => {
  logger.info("listing groups");
  const res: Response = await fetch(GROUPS_BASE_URL, { headers: HEADERS });
  logger.info({ groups: await res.json() }, "found groups");
};
