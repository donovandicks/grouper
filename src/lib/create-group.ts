import { GroupDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const createGroup = async (opts: { name: string }): Promise<GroupDTO> => {
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

  const group = (await res.json()) as GroupDTO;
  logger.info(group, "created group");
  return group;
};
