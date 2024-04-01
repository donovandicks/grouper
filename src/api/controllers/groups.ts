import { GroupID, UserID } from "../../domain";
import { GroupService } from "../../services/group/group-service";
import { logger } from "../../utils/telemtery";
import { ErrorNotFound } from "../errors";
import { CreateGroupDTO, GroupDTO } from "../models";
import { Express, Request, Response } from "express";

export class GroupsController {
  gs: GroupService;

  constructor(gs: GroupService) {
    this.gs = gs;
  }

  registerRoutes(app: Express) {
    app.post("/groups", this.createGroup.bind(this));
    app.get("/groups", this.listGroups.bind(this));
    app.get("/groups/:id", this.getGroup.bind(this));
    app.get("/groups/:id/members", this.getGroupMembers.bind(this));
    app.post("/groups/:id/members", this.addGroupMember.bind(this));
    app.delete("/groups/:groupId/members/:memberId", this.removeGroupMember.bind(this));
  }

  async createGroup(req: Request<CreateGroupDTO>, res: Response<GroupDTO>) {
    try {
      const group = await this.gs.createGroup(req.body);
      logger.info({ id: group.id }, "successfully created group");
      res.json(group).status(201);
    } catch (err) {
      console.error("failed to handle create request:", err);
      res.sendStatus(500);
    }
  }

  async listGroups(_req: Request, res: Response<GroupDTO[]>) {
    try {
      const groups = await this.gs.listGroups();
      res.json(groups).status(200);
    } catch (err) {
      console.error("failed to handle list request:", err);
      res.sendStatus(500);
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      const group = await this.gs.getGroup(req.params?.id as GroupID);

      if (!group) {
        throw new ErrorNotFound();
      }

      res.json(group);
    } catch (err) {
      if (err instanceof ErrorNotFound) {
        res
          .json({ message: `Group ${req.params?.id} does not exist`, statusCode: 404 })
          .status(404);
        return;
      }

      console.error("failed to find group:", err);
      res.sendStatus(500);
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const members = this.gs.getGroupMembers(req.params?.id as GroupID);

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

      console.error(err);
      res.sendStatus(500);
    }
  }

  async addGroupMember(req: Request<{ id: GroupID }, any, { userId: UserID }>, res: Response) {
    try {
      this.gs.addMemberToGroup(req.params?.id, req.body?.userId);
      res.sendStatus(200);
    } catch (err) {
      console.error("failed to add member to group", err);
      res.sendStatus(500);
    }
  }

  async removeGroupMember(req: Request<{ groupId: GroupID; memberId: UserID }>, res: Response) {
    try {
      this.gs.removeMemberFromGroup(req.params?.groupId, req.params?.memberId);
      res.sendStatus(200);
    } catch (err) {
      console.error("failed to remove user from group", err);
      res.sendStatus(500);
    }
  }
}
