import { getErrorMessage } from "@/lib/errors";

export type LogLevel = "debug" | "info" | "warn" | "error";
type LogDetails = Record<string, unknown>;

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(level: LogLevel, message: string, args: unknown[]) {
  if (level === "debug" && process.env.NODE_ENV === "production") return;

  const details = args.map(serialize);
  const entry: Record<string, unknown> = {
    level,
    message,
    time: new Date().toISOString(),
  };
  if (details.length === 1) entry.detail = details[0];
  else if (details.length > 1) entry.details = details;

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// Isomorphic structured logger. The call signature mirrors `console.*`, but it
// emits a single queryable JSON line per event — which Vercel log drains and
// other aggregators can parse — and gives us one place to plug in an error
// tracker later.
export const logger = {
  debug: (message: string, ...args: unknown[]) => emit("debug", message, args),
  info: (message: string, ...args: unknown[]) => emit("info", message, args),
  log: (message: string, ...args: unknown[]) => emit("info", message, args),
  warn: (message: string, ...args: unknown[]) => emit("warn", message, args),
  error: (message: string, ...args: unknown[]) => emit("error", message, args),
};

// Single funnel for unexpected failures. Once a tracker (Sentry, Axiom, …) is
// configured with its DSN, forward the event from here and every call site
// inherits reporting automatically.
export function captureError(error: unknown, context: LogDetails = {}) {
  emit("error", "unhandled_error", [{ message: getErrorMessage(error), ...context }]);
}
