import { AppConfig } from "../config/contants";

// TODO: Change how these are populated for the CLI since the environment is
// checked at compile time

export const BASE_URL = `http://${AppConfig.host}:${AppConfig.port}`;
export const GROUPS_BASE_URL = `${BASE_URL}/groups`;
export const USERS_BASE_URL = `${BASE_URL}/users`;
export const HEADERS = {
  "Content-Type": "application/json",
};
