import type { CreateUserDTO } from "../../api/models";
import type { User, UserID } from "../../domain";
import type { Datastore } from "../datastore";

export class UserService {
  db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    return this.db.createUser(user);
  }

  async listUsers(): Promise<User[]> {
    return this.db.listUsers();
  }

  async getUser(id: UserID): Promise<User | undefined> {
    return this.db.getUser(id);
  }

  async deleteUser(id: UserID): Promise<User | undefined> {
    return this.db.deleteUser(id);
  }
}
