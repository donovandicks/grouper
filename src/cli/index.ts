import { initLogger } from "../utils/telemtery";
import { registerGroupMemberCommands } from "./group-members";
import { registerGroupCommands } from "./groups";
import { registerUserCommands } from "./users";
import { program } from "commander";

initLogger("local");

const base = program.name("grouper").description("Manage user groups").version("0.0.1");

registerUserCommands(base);
registerGroupCommands(base);
registerGroupMemberCommands(base);

async function main() {
  await program.parseAsync();
}

await main();
