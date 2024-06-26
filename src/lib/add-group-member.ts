import type { GroupID, UserID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const addGroupMember = async ({ groupId, userId }: { groupId: GroupID; userId: UserID }) => {
  logger.info(`adding user ${userId} to group ${groupId}`);

  const data = JSON.stringify({ userId });

  const endpoint = `${GROUPS_BASE_URL}/${groupId}/members`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...HEADERS,
      "Content-Length": `${Buffer.byteLength(data)}`,
    },
    body: data,
  });

  if (res.status !== 200) {
    logger.error("failed to add user to group");
  } else {
    logger.info("added user to group");
  }
};
