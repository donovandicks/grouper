import { AppConfig } from "../config/contants";
import { getConfig, runMigrations } from "../config/database";
import { PostgresDatastore, type Datastore } from "../services/datastore";
import { GroupGenerationService } from "../services/group-generation";
import { GroupMemberService } from "../services/group-member";
import { GroupService } from "../services/group/service";
import { UserService } from "../services/user/user-service";
import { currentEnv } from "../utils/env";
import { initLogger, logger } from "../utils/telemtery";
import { GroupsController, UsersController } from "./controllers";
import { HealthController } from "./controllers/health";
import { registerGracefulShutdownHandlers } from "./shutdown";
import express from "express";
import http from "http";
import { Pool } from "pg";
import httpLogger from "pino-http";

initLogger(currentEnv());

const pool = new Pool(getConfig());
const db: Datastore = new PostgresDatastore(pool);
// const ac = new InMemoryAc();

const gs = new GroupService(db);
const gms = new GroupMemberService(db);
const ggs = new GroupGenerationService(db);
const gc = new GroupsController(gs, gms, ggs);

const us = new UserService(db);
const uc = new UsersController(us);

const hc = new HealthController();

const app = express();
app.use(express.json(), httpLogger({ logger }));

export async function main() {
  logger.info({ config: AppConfig }, "starting application");

  registerGracefulShutdownHandlers(pool);

  if (!(await runMigrations(pool))) {
    await pool.end();
    return;
  }

  logger.info("registering routes");
  hc.registerRoute(app);
  uc.registerRoutes(app);
  gc.registerRoutes(app);

  logger.info("starting http server");
  http
    .createServer(app)
    .listen(AppConfig.port, AppConfig.host, () =>
      logger.info(`listening on ${AppConfig.host}:${AppConfig.port}`),
    )
    .on("error", (err: Error) => logger.fatal({ err }, "failed to start http server"));
}
