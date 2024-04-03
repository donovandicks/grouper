import { Config, runMigrations } from "../config/database";
import { InMemoryAc } from "../services/access-control";
import { Datastore, PostgresDatastore } from "../services/datastore";
import { GroupService } from "../services/group/group-service";
import { UserService } from "../services/user/user-service";
import { initLogger, logger } from "../utils/telemtery";
import { GroupsController, UsersController } from "./controllers";
import { registerGracefulShutdownHandlers } from "./shutdown";
import express from "express";
import http from "http";
import { Pool } from "pg";
import httpLogger from "pino-http";

initLogger("local");

const pool = new Pool(Config);
const db: Datastore = new PostgresDatastore(pool);
const ac = new InMemoryAc();

const gs = new GroupService(ac, db);
const gc = new GroupsController(gs);

const us = new UserService(db);
const uc = new UsersController(us);

const app = express();
app.use(express.json(), httpLogger({ logger }));

export async function main() {
  registerGracefulShutdownHandlers(pool);

  if (!(await runMigrations())) {
    pool.end();
    return;
  }

  uc.registerRoutes(app);
  gc.registerRoutes(app);

  http.createServer(app).listen(3000, "0.0.0.0", () => logger.info("listening on :3000"));
}
