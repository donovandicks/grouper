import type { Event, GroupID, UserID } from "../../domain";
import { GroupService } from "../../services/group/group-service";
import { logger } from "../../utils/telemtery";
import { ErrorNotFound, type ErrorMessage } from "../errors";
import type { CreateGroupDTO, GroupDTO } from "../models";
import type { Express, Request, Response } from "express";

export class GroupsController {
  gs: GroupService;

  constructor(gs: GroupService) {
    this.gs = gs;
  }

  registerRoutes(app: Express) {
    /* eslint-disable @typescript-eslint/no-misused-promises */
    app.post("/groups", this.createGroup.bind(this));
    app.get("/groups", this.listGroups.bind(this));
    app.get("/groups/:id", this.getGroup.bind(this));
    app.delete("/groups/:id", this.deleteGroup.bind(this));
    app.get("/groups/:id/members", this.getGroupMembers.bind(this));
    app.post("/groups/:id/members", this.addGroupMember.bind(this));
    app.delete("/groups/:groupId/members/:memberId", this.removeGroupMember.bind(this));
    app.get("/groups/:id/history", this.getGroupHistory.bind(this));
    /* eslint-enable @typescript-eslint/no-misused-promises */
  }

  async createGroup(req: Request, res: Response<GroupDTO>) {
    try {
      const group = await this.gs.createGroup(req.body as CreateGroupDTO);
      logger.info({ id: group.id }, "successfully created group");
      res.json(group).status(201);
    } catch (err) {
      logger.error({ err }, "failed to handle create request");
      res.sendStatus(500);
    }
  }

  async listGroups(_req: Request, res: Response<GroupDTO[]>) {
    try {
      const groups = await this.gs.listGroups();
      res.json(groups).status(200);
    } catch (err) {
      logger.error({ err }, "failed to handle list request");
      res.sendStatus(500);
    }
  }

  async getGroup(req: Request, res: Response<GroupDTO | ErrorMessage>) {
    try {
      const group = await this.gs.getGroup(req.params?.id as GroupID);

      if (!group) {
        throw new ErrorNotFound();
      }

      const members = await this.gs.getGroupMembers(group.id);

      res.json({ ...group, members: members ?? [] }).status(200);
    } catch (err) {
      if (err instanceof ErrorNotFound) {
        res
          .json({ message: `Group ${req.params?.id} does not exist`, statusCode: 404 })
          .status(404);
        return;
      }

      logger.error({ err }, "failed to find group");
      res.sendStatus(500);
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const members = await this.gs.getGroupMembers(req.params?.id as GroupID);

      if (members === undefined) {
        throw new ErrorNotFound();
      }

      res.json(members).status(200);
    } catch (err) {
      if (err instanceof ErrorNotFound) {
        res
          .json({ message: `Group ${req.params?.id} does not exist`, statusCode: 404 })
          .status(404);
        return;
      }

      logger.error({ err }, "failed to get group members");
      res.sendStatus(500);
    }
  }

  async addGroupMember(req: Request<{ id: GroupID }, Response, { userId: UserID }>, res: Response) {
    try {
      await this.gs.addMemberToGroup(req.params?.id, req.body?.userId);
      res.sendStatus(200);
    } catch (err) {
      logger.error({ err }, "failed to add member to group");
      res.sendStatus(500);
    }
  }

  async removeGroupMember(req: Request<{ groupId: GroupID; memberId: UserID }>, res: Response) {
    try {
      await this.gs.removeMemberFromGroup(req.params?.groupId, req.params?.memberId);
      res.sendStatus(200);
    } catch (err) {
      logger.error(err, "failed to remove user from group");
      res.sendStatus(500);
    }
  }

  async deleteGroup(req: Request, res: Response<GroupDTO | Record<string, never> | ErrorMessage>) {
    try {
      const group = await this.gs.deleteGroup(req.params?.id as GroupID);

      if (group) {
        res.json({ ...group, members: [] }).status(200);
        return;
      }

      res.json({}).status(200);
    } catch (err) {
      logger.error({ err }, "failed to delete group");
      res.sendStatus(500);
    }
  }

  async getGroupHistory(req: Request<{ id: GroupID }>, res: Response<Event[] | ErrorMessage>) {
    try {
      const history = await this.gs.getGroupHistory(req.params.id);
      if (!history) {
        throw new ErrorNotFound();
      }

      res.json(history).status(200);
    } catch (err) {
      if (err instanceof ErrorNotFound) {
        res.json({ message: `Group ${req.params.id} does not exist`, statusCode: 404 }).status(404);
        return;
      }

      logger.error({ err }, "failed to get group history");
      res.sendStatus(500);
    }
  }
}
