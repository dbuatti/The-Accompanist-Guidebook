import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = "user-a";
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
  });

  it("blocks once the limit is reached", () => {
    const key = "user-b";
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const result = checkRateLimit(key, 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("treats different keys independently", () => {
    expect(checkRateLimit("a", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("b", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("a", 1, 60_000).allowed).toBe(false);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = "user-c";
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);

    vi.setSystemTime(61_000);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
  });
});
