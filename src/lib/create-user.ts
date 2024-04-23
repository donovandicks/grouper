import type { UserDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { HEADERS, USERS_BASE_URL } from "./constants";

export const createUser = async (opts: { name: string; email: string }): Promise<UserDTO> => {
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

  const user = (await res.json()) as UserDTO;
  logger.info(user, "created user");
  return user;
};
