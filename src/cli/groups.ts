import type { GroupID } from "../domain";
import { createGroup, getGroup, listGroups } from "../lib";
import { deleteGroup } from "../lib/delete-group";
import { getGroupHistory } from "../lib/get-group-history";
import type { Command } from "commander";

export const registerGroupCommands = (program: Command) => {
  const groupsCommand = program.command("groups").description("Manage group entities");
  // create group
  groupsCommand
    .command("create")
    .description("Create a group")
    .option("-n, --name <name>", "group name")
    .action(async (opts: { name: string }) => {
      await createGroup(opts);
    });

  // list groups
  groupsCommand
    .command("list")
    .description("List all groups")
    .action(() => listGroups());

  // get group
  groupsCommand
    .command("get")
    .description("Get a group by its ID")
    .argument("<id>")
    .action(async (id: GroupID) => {
      await getGroup(id);
    });

  // get history
  groupsCommand
    .command("history")
    .argument("<id>")
    .action(async (id: GroupID) => {
      await getGroupHistory(id);
    });

  // delete group
  groupsCommand
    .command("delete")
    .description("Delete a group by its ID")
    .argument("<id>")
    .action(async (id: GroupID) => {
      await deleteGroup(id);
    });
};
