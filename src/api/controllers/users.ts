import type { UserID } from "../../domain";
import { UserService } from "../../services/user/user-service";
import { logger } from "../../utils/telemtery";
import { ERR_INTERNAL_SERVER, ErrorNotFound, type ErrorMessage } from "../errors";
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
      res.json(deleted).status(200);
    } catch (err) {
      console.error("failed to delete user", err);
      res.json(ERR_INTERNAL_SERVER).status(500);
    }
  }

  async getUser(req: Request<{ id: UserID }>, res: Response<UserDTO | ErrorMessage>) {
    try {
      const user = await this.us.getUser(req.params.id);
      if (!user) {
        throw new ErrorNotFound();
      }
      res.json(user).status(200);
    } catch (err) {
      if (err instanceof ErrorNotFound) {
        logger.error(`could not find user ${req.params.id}`);
        res.sendStatus(404);
        return;
      }

      res.json(ERR_INTERNAL_SERVER).status(500);
    }
  }

  async listUsers(_req: Request, res: Response<UserDTO[] | ErrorMessage>) {
    try {
      const users = await this.us.listUsers();
      res.json(users).status(200);
    } catch (err) {
      logger.error({ err }, "failed to list users");
      res.json(ERR_INTERNAL_SERVER).status(500);
    }
  }

  async createUser(req: Request, res: Response<UserDTO | ErrorMessage>) {
    try {
      const user = await this.us.createUser(req.body as CreateUserDTO);
      res.json(user).status(201);
    } catch (err) {
      logger.error({ err }, "failed to create new user");
      res.json(ERR_INTERNAL_SERVER).status(500);
    }
  }
}
