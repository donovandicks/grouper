import { GroupID, UserID } from "../domain/index";
import { addGroupMember } from "../lib/add-group-member";
import { createUser } from "../lib/create-user";
import { deleteUser } from "../lib/delete-user";
import { getGroupMembers } from "../lib/get-group-members";
import { createGroup, getGroup, listGroups } from "../lib/index";
import { listUsers } from "../lib/list-users";
import { removeGroupMember } from "../lib/remove-group-member";
import { initLogger, logger } from "../utils/telemtery";
import { program } from "commander";

initLogger("local");

program.name("grouper").description("Manage user groups").version("0.0.1");

const usersCommand = program.command("users").description("Manage user entities");

usersCommand
  .command("create")
  .option("-n, --name <name>", "user name")
  .option("-e, --email <email>")
  .action((opts: { name: string; email: string }) => createUser(opts));

usersCommand.command("list").action(() => listUsers());

usersCommand
  .command("delete")
  .argument("<user-id>")
  .action((userId: UserID) => deleteUser(userId));

const groupsCommand = program.command("groups").description("Manage group entities");

groupsCommand
  .command("create")
  .description("Create a group")
  .option("-n, --name <name>", "group name")
  .action((opts: { name: string }) => createGroup(opts));

groupsCommand
  .command("list")
  .description("List all groups")
  .action(() => listGroups());

groupsCommand
  .command("get")
  .description("Get a group by its ID")
  .argument("<id>")
  .action((id: string) => getGroup(id));

const groupCommand = program.command("group").description("Manage a single group");

const groupMembersCommand = groupCommand
  .command("members")
  .description("Manage the members of a single group");

groupMembersCommand
  .command("add")
  .argument("<group-id>")
  .argument("<user-id>")
  .action((groupId: GroupID, userId: UserID) => addGroupMember({ groupId, userId }));

groupMembersCommand
  .command("list")
  .argument("<group-id>")
  .action((id: string) => getGroupMembers(id as GroupID));

groupMembersCommand
  .command("remove")
  .argument("<group-id>")
  .argument("<user-id>")
  .action((groupId: GroupID, userId: UserID) => removeGroupMember({ groupId, userId }));

async function main() {
  await program.parseAsync();
}

main().catch((err: Error) => logger.fatal({ err }, "failed to execute command"));
