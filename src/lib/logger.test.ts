import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureError, logger } from "./logger";

describe("logger", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits a structured JSON line with level and message", () => {
    logger.info("hello", { id: 1 });
    const entry = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe("info");
    expect(entry.message).toBe("hello");
    expect(entry.detail).toEqual({ id: 1 });
    expect(typeof entry.time).toBe("string");
  });

  it("serializes Error instances into name/message/stack", () => {
    logger.error("boom", new Error("kaboom"));
    const entry = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(entry.level).toBe("error");
    expect(entry.detail).toMatchObject({ name: "Error", message: "kaboom" });
  });

  it("captureError folds the error message into a single detail object", () => {
    captureError(new Error("nope"), { scope: "webhook" });
    const entry = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(entry.message).toBe("unhandled_error");
    expect(entry.detail).toMatchObject({ message: "nope", scope: "webhook" });
  });

  it("suppresses debug logs in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    logger.debug("noisy");
    expect(logSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
