import { logger } from "../utils/telemtery";
import { Pool } from "pg";

const killSignals = ["SIGINT", "SIGTERM"];

const shutdownHandler = async (pool: Pool) => {
  await pool.end();
  process.exit(0);
};

export const registerGracefulShutdownHandlers = (pool: Pool) => {
  for (const sig of killSignals) {
    process.on(sig, () => {
      logger.info(`Received ${sig} signal. Starting graceful shutdown...`);
      shutdownHandler(pool);
    });
  }
};
