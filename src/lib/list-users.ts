import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const listUsers = async () => {
  logger.info("lising users");
  const res: Response = await fetch(USERS_BASE_URL, { headers: HEADERS });
  logger.info({ users: await res.json() }, "found users");
};
