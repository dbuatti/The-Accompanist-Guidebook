import { describe, it, expect } from "vitest";
import {
  parseUuid,
  parseText,
  urlSchema,
  stripeSessionIdSchema,
  nonNegativeInt,
  parse,
  text,
} from "./validation";
import { ValidationError } from "./errors";

describe("parseUuid", () => {
  it("accepts valid UUIDs", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(parseUuid(id)).toBe(id);
  });

  it("rejects non-UUID input", () => {
    expect(() => parseUuid("not-a-uuid")).toThrow(ValidationError);
    expect(() => parseUuid(42)).toThrow(ValidationError);
  });
});

describe("parseText", () => {
  it("trims surrounding whitespace", () => {
    expect(parseText("  Hello  ", 100)).toBe("Hello");
  });

  it("enforces the max length", () => {
    expect(() => parseText("a".repeat(11), 10)).toThrow(ValidationError);
  });

  it("rejects empty strings", () => {
    expect(() => parseText("   ", 100)).toThrow(ValidationError);
  });
});

describe("urlSchema", () => {
  it("accepts http(s) URLs and empty strings", () => {
    expect(parse(urlSchema, "https://example.com/a?b=c")).toBe("https://example.com/a?b=c");
    expect(parse(urlSchema, "")).toBe("");
  });

  it("rejects non-URL and disallowed schemes", () => {
    expect(() => parse(urlSchema, "not a url")).toThrow(ValidationError);
    expect(() => parse(urlSchema, "javascript:alert(1)")).toThrow(ValidationError);
  });
});

describe("stripeSessionIdSchema", () => {
  it("accepts Stripe checkout session ids", () => {
    expect(parse(stripeSessionIdSchema, "cs_test_abc123")).toBe("cs_test_abc123");
  });

  it("rejects arbitrary strings", () => {
    expect(() => parse(stripeSessionIdSchema, "random")).toThrow(ValidationError);
  });
});

describe("nonNegativeInt", () => {
  it("accepts non-negative integers", () => {
    expect(parse(nonNegativeInt, 0)).toBe(0);
    expect(parse(nonNegativeInt, 42)).toBe(42);
  });

  it("rejects negatives, floats and non-numbers", () => {
    expect(() => parse(nonNegativeInt, -1)).toThrow(ValidationError);
    expect(() => parse(nonNegativeInt, 1.5)).toThrow(ValidationError);
    expect(() => parse(nonNegativeInt, "10")).toThrow(ValidationError);
  });
});

describe("text", () => {
  it("returns the trimmed value", () => {
    expect(parse(text(50), "  hi  ")).toBe("hi");
  });
});
