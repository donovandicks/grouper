export class ErrorNotFound extends Error {}

export type ErrorMessage = { message: string; statusCode?: number };

export const ERR_INTERNAL_SERVER: ErrorMessage = { message: "Internal Server Error" };
