import type { Express, Request, Response } from "express";

export class HealthController {
  constructor() {}

  registerRoute(app: Express) {
    /* eslint-disable @typescript-eslint/no-misused-promises */
    app.get("/health", this.healthCheck.bind(this));
    /* eslint-enable @typescript-eslint/no-misused-promises */
  }

  healthCheck(_req: Request, res: Response<{ message: "Ok" }>) {
    res.json({ message: "Ok" });
  }
}
