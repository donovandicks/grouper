import type { CreateUserDTO, UserDTO } from "../api/models";
import { logger } from "../utils/telemtery";
import { USERS_BASE_URL } from "./constants";
import { postData } from "./post-data";

export const createUser = async (opts: CreateUserDTO): Promise<UserDTO> => {
  logger.info(`Creating user ${opts.name}`);
  const user = postData<CreateUserDTO, UserDTO>(USERS_BASE_URL, opts);
  logger.info(user, "created user");
  return user;
};
