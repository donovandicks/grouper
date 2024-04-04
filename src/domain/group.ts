import type { UUID } from "crypto";

export type GroupID = UUID;

export type Group = {
  id: GroupID;
  name: string; // Display Name
  handle: string; // Computer Name
  createdAt: Date;
  updatedAt: Date;
};
