import { GroupID } from "../../domain/group";
import { UserID } from "../../domain/user";

export interface AccessController {
  allowUserInGroup(group: GroupID, user: UserID): void;
  excludeUserFromGroup(group: GroupID, user: UserID): void;

  userAllowedInGroup(group: GroupID, user: UserID): boolean;
  userExcludedFromGroup(group: GroupID, user: UserID): boolean;

  removeUserFromAllowlist(group: GroupID, user: UserID): void;
  removeUserFromExcludelist(group: GroupID, user: UserID): void;

  clearAllowlist(group: GroupID): void;
  clearExcludelist(group: GroupID): void;
}
