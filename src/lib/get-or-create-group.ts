import type { Group, GroupID } from "../domain";
import { createGroup } from "./create-group";
import { queryGroups } from "./query-group";

export const getOrCreateGroup = async (params: {
  groupId?: GroupID;
  name: string;
  handle?: string;
}): Promise<Group | undefined> => {
  const groups = await queryGroups(params);

  if (groups instanceof Array && groups.length > 0) {
    return groups[0];
  }

  return await createGroup({ name: params.name });
};
