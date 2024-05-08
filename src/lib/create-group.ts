import type { CreateGroupDTO, GroupDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { GROUPS_BASE_URL } from "./constants";
import { postData } from "./post-data";

export const createGroup = async (opts: CreateGroupDTO): Promise<GroupDTO> => {
  logger.info(opts, "creating group");
  const group = postData<CreateGroupDTO, GroupDTO>(GROUPS_BASE_URL, opts);
  logger.info(group, "created group");
  return group;
};
