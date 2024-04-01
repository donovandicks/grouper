import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const createGroup = async (opts: { name: string }) => {
  logger.info(`Creating group ${opts.name}`);

  const data = JSON.stringify({ name: opts.name });

  const res = await fetch(GROUPS_BASE_URL, {
    method: "POST",
    headers: {
      ...HEADERS,
      "Content-Length": `${Buffer.byteLength(data)}`,
    },
    body: data,
  });

  logger.info(await res.json(), "created group");
};
