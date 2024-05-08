import type { UUID } from "crypto";

const brand = Symbol("brand");

export type UserID = UUID & { [brand]: "UserID" };
export type UserAttributeTypes = string | Date | number | boolean;
export type UserAttributes = { [key: string]: UserAttributeTypes };

export type User = {
  id: UserID;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  attributes: UserAttributes;
};
