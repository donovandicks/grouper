import type { GroupDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const createGroup = async ({
  name,
  handle,
  userManaged = true,
}: {
  name: string;
  handle?: string;
  userManaged?: boolean;
}): Promise<GroupDTO> => {
  logger.info({ name, handle, userManaged }, "creating group");

  const data = JSON.stringify({ name, handle, userManaged });

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
