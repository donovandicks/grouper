import { Transactor } from "./transactor";
import type { Pool } from "pg";

export class Repository {
  protected tx: Transactor;
  tblName: string;

  constructor(pool: Pool, tblName: string) {
    this.tblName = tblName;
    this.tx = new Transactor(pool);
  }
}
