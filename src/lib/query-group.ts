import type { ErrorMessage } from "../api/errors";
import type { Group, GroupID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const queryGroups = async (params: {
  groupId?: GroupID;
  name?: string;
  handle?: string;
}): Promise<Group[] | ErrorMessage> => {
  logger.info({ params }, "querying for groups");

  const url = new URL(GROUPS_BASE_URL);
  if (params.groupId !== undefined) {
    url.searchParams.append("groupId", params.groupId);
  }

  if (params.name !== undefined) {
    url.searchParams.append("name", params.name);
  }

  if (params.handle !== undefined) {
    url.searchParams.append("handle", params.handle);
  }

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (res.status !== 200) {
    return (await res.json()) as ErrorMessage;
  }

  return (await res.json()) as Group[];
};
