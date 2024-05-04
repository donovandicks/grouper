import type { UUID } from "crypto";

const brand = Symbol("brand");

export type UserID = UUID & { [brand]: "UserID" };
export type UserAttributes = Map<string, string | Date | boolean>;

export type User = {
  id: UserID;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  attributes: UserAttributes;
};
