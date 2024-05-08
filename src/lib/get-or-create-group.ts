import type { CreateGroupDTO } from "../api/models";
import type { Group, GroupID } from "../domain";
import { createGroup } from "./create-group";
import { queryGroups } from "./query-group";

export const getOrCreateGroup = async ({
  groupId,
  name,
  handle,
  userManaged,
}: { groupId?: GroupID } & CreateGroupDTO): Promise<Group | undefined> => {
  const groups = await queryGroups({ groupId, name, handle });
  if (groups instanceof Array && groups.length > 0) {
    return groups[0];
  }

  return await createGroup({ name, handle, userManaged });
};
