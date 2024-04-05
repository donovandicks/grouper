import type { GroupID, UserID } from "../domain";
import { addGroupMember } from "../lib/add-group-member";
import { getGroupMembers } from "../lib/get-group-members";
import { removeGroupMember } from "../lib/remove-group-member";
import type { Command } from "commander";

export const registerGroupMemberCommands = (program: Command) => {
  const groupMembersCommand = program
    .command("group")
    .description("Manage a single group")
    .command("members")
    .description("Manage the members of a single group");

  groupMembersCommand
    .command("add")
    .argument("<group-id>")
    .argument("<user-id>")
    .action((groupId: GroupID, userId: UserID) => addGroupMember({ groupId, userId }));

  // list group members
  groupMembersCommand
    .command("list")
    .argument("<group-id>")
    .action((id: string) => getGroupMembers(id as GroupID));

  // remove group member
  groupMembersCommand
    .command("remove")
    .argument("<group-id>")
    .argument("<user-id>")
    .action((groupId: GroupID, userId: UserID) => removeGroupMember({ groupId, userId }));
};
