import type { Event, Group, GroupID, UserID } from "../../domain";
import { GroupNotFoundError, GroupService } from "../../services/group";
import { logger } from "../../utils/telemtery";
import { ERR_INTERNAL_SERVER, type ErrorMessage } from "../errors";
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

  async createGroup(req: Request, res: Response<Group | ErrorMessage>) {
    try {
      const group = await this.gs.createGroup(req.body as CreateGroupDTO);
      logger.info({ id: group.id }, "successfully created group");
      res.status(201).json(group);
    } catch (err) {
      logger.error({ err }, "failed to handle create request");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async listGroups(req: Request, res: Response<Group[] | ErrorMessage>) {
    try {
      const groups = await this.gs.listGroups({
        groupId: (req.query.groupId as GroupID) ?? undefined,
        name: (req.query.name as string) ?? undefined,
        handle: (req.query.handle as string) ?? undefined,
      });
      res.json(groups);
    } catch (err) {
      logger.error({ err }, "failed to handle list request");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async getGroup(req: Request, res: Response<GroupDTO | ErrorMessage>) {
    try {
      const group = await this.gs.getGroup(req.params?.id as GroupID);
      const members = await this.gs.getGroupMembers(group.id);
      res.json({ ...group, members: members ?? [] });
    } catch (err) {
      logger.error({ err }, "failed to find group");

      if (err instanceof GroupNotFoundError) {
        res.status(404).json({ message: err.message, statusCode: 404 });
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const members = await this.gs.getGroupMembers(req.params?.id as GroupID, {
        userId: (req.query.userId as UserID) || undefined,
        name: (req.query.name as string) || undefined,
        email: (req.query.email as string) || undefined,
      });
      res.json(members);
    } catch (err) {
      logger.error({ err }, "failed to get group members");

      if (err instanceof GroupNotFoundError) {
        res.status(404).json({ message: err.message, statusCode: 404 });
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async addGroupMember(req: Request<{ id: GroupID }, Response, { userId: UserID }>, res: Response) {
    try {
      await this.gs.addMemberToGroup(req.params?.id, req.body?.userId);
      res.sendStatus(200);
    } catch (err) {
      logger.error({ err }, "failed to add member to group");

      if (err instanceof GroupNotFoundError) {
        res.status(404).json({ message: err.message, statusCode: 404 });
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async removeGroupMember(req: Request<{ groupId: GroupID; memberId: UserID }>, res: Response) {
    try {
      await this.gs.removeMemberFromGroup(req.params?.groupId, req.params?.memberId);
      res.sendStatus(200);
    } catch (err) {
      logger.error(err, "failed to remove user from group");

      if (err instanceof GroupNotFoundError) {
        res.status(404).json({ message: err.message, statusCode: 404 });
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async deleteGroup(req: Request, res: Response<Group | Record<string, never> | ErrorMessage>) {
    try {
      const group = await this.gs.deleteGroup(req.params?.id as GroupID);
      if (group) {
        res.json(group);
        return;
      }

      res.json({});
    } catch (err) {
      logger.error({ err }, "failed to delete group");
      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }

  async getGroupHistory(req: Request<{ id: GroupID }>, res: Response<Event[] | ErrorMessage>) {
    try {
      const history = await this.gs.getGroupHistory(req.params.id);
      res.json(history).status(200);
    } catch (err) {
      logger.error({ err }, "failed to get group history");

      if (err instanceof GroupNotFoundError) {
        res.json({ message: err.message, statusCode: 404 }).status(404);
        return;
      }

      res.status(500).json(ERR_INTERNAL_SERVER);
    }
  }
}
