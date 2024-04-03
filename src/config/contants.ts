const host = process.env["APP_HOST"] ?? "0.0.0.0";
const port = process.env["APP_PORT"] ?? "3001";

export type AppConfig = {
  host: string;
  port: string;
};

export const AppConfig = { host, port: Number(port) };
