import { readFileSync } from "fs";
import type { MigrationBuilder } from "node-pg-migrate";
import { basename, extname, join, resolve } from "path";

const basePath = join(join(resolve(__dirname), "sql"), basename(__filename, extname(__filename)));

const upPath = `${basePath}.up.sql`;
const downPath = `${basePath}.down.sql`;

export const up = (pgm: MigrationBuilder) => {
  const sql = readFileSync(upPath, "utf-8");
  pgm.sql(sql);
};

export const down = (pgm: MigrationBuilder) => {
  const sql = readFileSync(downPath, "utf-8");
  pgm.sql(sql);
};
