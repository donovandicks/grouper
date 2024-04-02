import { GroupID, UserID } from "../domain";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL, HEADERS } from "./constants";

export const removeGroupMember = async ({
  groupId,
  userId,
}: {
  groupId: GroupID;
  userId: UserID;
}) => {
  logger.info(`removing user ${userId} from group ${groupId}`);

  const endpoint = `${GROUPS_BASE_URL}/${groupId}/members/${userId}`;
  await fetch(endpoint, {
    method: "DELETE",
    headers: HEADERS,
  });

  logger.info("removed user from group");
};
