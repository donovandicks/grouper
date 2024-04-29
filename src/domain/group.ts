import { type UUID } from "crypto";

const brand = Symbol("brand");

export type GroupID = UUID & { [brand]: "GroupID" };

export type Group = {
  id: GroupID;
  name: string; // Display Name
  handle: string; // Computer Name
  type?: string;
  createdAt: Date;
  updatedAt: Date;
};
