import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const createUser = async (opts: { name: string; email: string }) => {
  logger.info(`Creating user ${opts.name}`);

  const data = JSON.stringify(opts);

  const res = await fetch(USERS_BASE_URL, {
    method: "POST",
    headers: {
      ...HEADERS,
      "Content-Length": `${Buffer.byteLength(data)}`,
    },
    body: data,
  });

  logger.info(await res.json(), "created user");
};
