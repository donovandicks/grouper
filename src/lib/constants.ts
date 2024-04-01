export const BASE_URL = "http://0.0.0.0:3001";
export const GROUPS_BASE_URL = new URL(`${BASE_URL}/groups`);
export const USERS_BASE_URL = new URL(`${BASE_URL}/users`);
export const HEADERS = {
  "Content-Type": "application/json",
};
