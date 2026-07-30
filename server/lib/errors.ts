/**
 * T040: typed wrapper around http-errors, replacing the `createError(404)` pattern used
 * throughout today's routes/*.js.
 */
import createHttpError from 'http-errors';

export function notFound(message?: string) {
  return message ? createHttpError(404, message) : createHttpError(404);
}

export function badRequest(message?: string) {
  return message ? createHttpError(400, message) : createHttpError(400);
}
