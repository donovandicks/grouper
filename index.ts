import { main } from "./src/api/api";

main().catch((err: Error) => console.error("program crashed", err));
