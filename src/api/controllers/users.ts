import type { UserID } from "../../domain";
import { UserNotFoundError, UserService } from "../../services/user";
import { logger } from "../../utils/telemtery";
import { ERR_INTERNAL_SERVER, type ErrorMessage } from "../errors";
import type { CreateUserDTO, UserDTO } from "../models";
import type { Express, Request, Response } from "express";

export class UsersController {
  us: UserService;

  constructor(users: UserService) {
    this.us = users;
  }

  registerRoutes(app: Express) {
    /* eslint-disable @typescript-eslint/no-misused-promises */
    app.delete("/users/:id", this.deleteUser.bind(this));
    app.get("/users/:id", this.getUser.bind(this));
    app.get("/users", this.listUsers.bind(this));
    app.post("/users", this.createUser.bind(this));
    /* eslint-enable @typescript-eslint/no-misused-promises */
  }

  async deleteUser(
    req: Request<{ id: UserID }>,
    res: Response<UserDTO | ErrorMessage | Record<string, never>>,
  ) {
    try {
      logger.info({ id: req.params.id }, "received user delete request");
      const deleted = (await this.us.deleteUser(req.params.id)) ?? {};
      res.json(deleted);
    } catch (err) {
      console.error("failed to delete user", err);
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async getUser(req: Request<{ id: UserID }>, res: Response<UserDTO | ErrorMessage>) {
    try {
      const user = await this.us.getUser(req.params.id);
      res.json(user);
    } catch (err) {
      logger.error({ err }, "failed to get user");

      if (err instanceof UserNotFoundError) {
        res.status(404).json({ message: err.message, statusCode: 404 });
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async listUsers(_req: Request, res: Response<UserDTO[] | ErrorMessage>) {
    try {
      const users = await this.us.listUsers();
      res.json(users);
    } catch (err) {
      logger.error({ err }, "failed to list users");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async createUser(req: Request, res: Response<UserDTO | ErrorMessage>) {
    try {
      const user = await this.us.createUser(req.body as CreateUserDTO);
      res.status(201).json(user);
    } catch (err) {
      logger.error({ err }, "failed to create new user");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }
}
