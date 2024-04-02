import { UUID } from "crypto";

export type UserID = UUID;

export type User = {
  id: UserID;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};
