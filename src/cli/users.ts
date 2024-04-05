import type { Command } from "commander";
import type { UserID } from "../domain";
import { createUser } from "../lib/create-user";
import { deleteUser } from "../lib/delete-user";
import { getUser } from "../lib/get-user";
import { listUsers } from "../lib/list-users";

export const registerUserCommands = (program: Command) => {
  const usersCommand = program.command("users").description("Manage user entities");

  // create user
  usersCommand
    .command("create")
    .option("-n, --name <name>", "user name")
    .option("-e, --email <email>")
    .action((opts: { name: string; email: string }) => createUser(opts));

  // get user
  usersCommand
    .command("get")
    .argument("<user-id>")
    .action(async (userId: UserID) => {
      await getUser(userId);
    });

  // list users
  usersCommand.command("list").action(() => listUsers());

  // delete user
  usersCommand
    .command("delete")
    .argument("<user-id>")
    .action((userId: UserID) => deleteUser(userId));
};
