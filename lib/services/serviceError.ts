/**
 * Error with an HTTP status, thrown by services when a database write fails
 * so API routes can return a real error instead of a fake success.
 */
export class ServiceError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
    this.code = code;
  }
}

export interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string;
}

/**
 * Translate a Supabase/PostgREST error into a ServiceError with a clear,
 * admin-friendly message. `fkMessage` is used for foreign-key violations
 * (Postgres 23503), e.g. deleting a product that appears in orders.
 */
export function toServiceError(
  error: PostgrestLikeError,
  context: string,
  fkMessage?: string
): ServiceError {
  console.error(`[db] ${context} failed:`, error.code, error.message);
  if (error.code === '23503') {
    return new ServiceError(fkMessage || `${context} failed: it is still referenced by other records.`, 409, error.code);
  }
  if (error.code === '23505') {
    return new ServiceError(`${context} failed: a record with the same unique value already exists.`, 409, error.code);
  }
  return new ServiceError(`${context} failed. Please try again.`, 500, error.code);
}

export function errorStatus(err: unknown, fallback = 500): number {
  return err instanceof ServiceError ? err.status : fallback;
}
