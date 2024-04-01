import { GroupID } from "../../domain/group";
import { UserID } from "../../domain/user";
import { AccessController } from "./access-controller";

type AccessControlList = Map<GroupID, Set<UserID>>;

export class InMemoryAc implements AccessController {
  acl: AccessControlList;
  ecl: AccessControlList;

  constructor() {
    this.acl = new Map();
    this.ecl = new Map();
  }

  allowUserInGroup(group: GroupID, user: UserID) {
    if (this.userExcludedFromGroup(group, user)) {
      // cannot allowlist someone already excluded
      return;
    }

    if (!this.acl.has(group)) {
      this.acl.set(group, new Set());
    }

    this.acl.get(group)!.add(user);
  }

  excludeUserFromGroup(group: GroupID, user: UserID) {
    if (this.userAllowedInGroup(group, user)) {
      // cannot exclude someone already allowlisted
      return;
    }

    if (!this.ecl.has(group)) {
      this.ecl.set(group, new Set());
    }

    this.ecl.get(group)!.add(user);
  }

  clearAllowlist(group: GroupID): void {
    this.acl.delete(group);
  }

  clearExcludelist(group: GroupID): void {
    this.ecl.delete(group);
  }

  removeUserFromAllowlist(group: GroupID, user: UserID): void {
    this.acl.get(group)?.delete(user);
  }

  removeUserFromExcludelist(group: GroupID, user: UserID): void {
    this.ecl.get(group)?.delete(user);
  }

  userAllowedInGroup(group: GroupID, user: UserID): boolean {
    return this.acl.get(group)?.has(user) || false;
  }

  userExcludedFromGroup(group: GroupID, user: UserID): boolean {
    return this.ecl.get(group)?.has(user) || false;
  }
}
