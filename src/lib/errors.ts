// Shared error utilities: extract readable messages from `unknown` (the type
// TypeScript assigns to catch variables) and structure error data for logging
// without reaching into error internals via `any`.

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error === null || error === undefined) return "Unknown error";
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export interface SerializedError {
  message: string;
  stack?: string;
  detail?: string;
  code?: string;
  hint?: string;
}

function asRecord(error: unknown): Record<string, unknown> | null {
  return typeof error === "object" && error !== null
    ? (error as Record<string, unknown>)
    : null;
}

function stringField(record: Record<string, unknown> | null, key: string): string | undefined {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

// Produces a plain, serialisable object suitable for structured logging,
// mirroring the PostgreSQL error fields (detail/code/hint) that Drizzle errors
// carry.
export function serializeError(error: unknown): SerializedError {
  const record = asRecord(error);
  return {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    detail: stringField(record, "detail"),
    code: stringField(record, "code"),
    hint: stringField(record, "hint"),
  };
}

// Typed domain errors so callers can distinguish auth/authz/validation failures
// from unexpected ones instead of matching on message strings.
export class AppError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  readonly issues: unknown[];

  constructor(message: string, issues: unknown[] = []) {
    super("VALIDATION", message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}
