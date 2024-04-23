import type { GroupDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const createGroup = async (opts: { name: string; handle?: string }): Promise<GroupDTO> => {
  logger.info({ opts }, "creating group");

  const data = JSON.stringify(opts);

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
