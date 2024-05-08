import { AppConfig } from "../config/contants";
import { getConfig, runMigrations } from "../config/database";
import { PostgresDatastore, type Datastore } from "../datastore";
import {
  GroupGenerationService,
  GroupMemberService,
  GroupService,
  RuleAttachmentService,
  RuleService,
  UserService,
} from "../services";
import { currentEnv } from "../utils/env";
import { initLogger, logger } from "../utils/telemtery";
import {
  GroupsController,
  HealthController,
  RulesController,
  UsersController,
} from "./controllers";
import { registerGracefulShutdownHandlers } from "./shutdown";
import express from "express";
import http from "http";
import { Pool } from "pg";
import httpLogger from "pino-http";

initLogger(currentEnv());

logger.info("connecting to database");
const pool = new Pool(getConfig());
const db: Datastore = new PostgresDatastore(pool);

logger.info("connecting to cache");
// const cache: Cache = new Cache(getCacheConfig());

// const ac = new InMemoryAc();

const gs = new GroupService(db);
const gms = new GroupMemberService(db);
const ggs = new GroupGenerationService(db);
const ras = new RuleAttachmentService(db /* cache.clone() */);
const gc = new GroupsController(gs, gms, ggs, ras);

const us = new UserService(db);
const uc = new UsersController(us);

const rs = new RuleService(db /* cache */);
const rc = new RulesController(rs);

// await rps.subscribeToChannels();

const hc = new HealthController();

const app = express();
app.disable("x-powered-by");
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
  rc.registerRoutes(app);

  logger.info("starting http server");
  http
    .createServer(app)
    .listen(AppConfig.port, AppConfig.host, () =>
      logger.info(`listening on ${AppConfig.host}:${AppConfig.port}`),
    )
    .on("error", (err: Error) => logger.fatal({ err }, "failed to start http server"));
}
