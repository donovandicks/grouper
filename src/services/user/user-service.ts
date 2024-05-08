import type { CreateUserDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import type { User, UserID } from "../../domain";
import { UserNotFoundError } from "./errors";

export class UserService {
  db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    return this.db.createUser(user);
  }

  async listUsers(params: { userId?: UserID; name?: string; email?: string }): Promise<User[]> {
    const users = await this.db.listUsers();
    if (Object.values(params).every((p) => p === undefined)) {
      return users;
    }

    return users.filter((u) => {
      if (params.userId && u.id === params.userId) {
        return u;
      }

      if (params.email && u.email === params.email) {
        return u;
      }

      if (params.name && u.name.includes(params.name)) {
        return u;
      }
    });
  }

  async getUser(id: UserID): Promise<User> {
    const user = await this.db.getUser(id);
    if (user === undefined) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  async deleteUser(id: UserID): Promise<User | undefined> {
    return this.db.deleteUser(id);
  }
}
