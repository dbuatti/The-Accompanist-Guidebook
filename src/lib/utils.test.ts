import { describe, it, expect } from "vitest";
import {
  slugify,
  formatLevelTitle,
  formatModuleTitle,
  parseMarkdownToBlocks,
} from "./utils";

describe("slugify", () => {
  it("strips module-number prefixes, lowercases and hyphenates", () => {
    expect(slugify("Module 1: Choosing Your Audition Repertoire")).toBe(
      "choosing-your-audition-repertoire",
    );
  });

  it("removes accents via NFKD normalisation", () => {
    expect(slugify("Café Déjà Vu")).toBe("cafe-deja-vu");
  });

  it("collapses repeated separators and trims leading/trailing dashes", () => {
    expect(slugify("  Hello --- World!!! ")).toBe("hello-world");
  });

  it("falls back to 'untitled' when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("untitled");
    expect(slugify("")).toBe("untitled");
  });

  it("truncates to 80 characters", () => {
    expect(slugify("a".repeat(120))).toHaveLength(80);
  });
});

describe("formatLevelTitle", () => {
  it("drops the 'Level N:' prefix", () => {
    expect(formatLevelTitle("Level 1: Foundations & Mindset")).toBe(
      "Foundations & Mindset",
    );
  });

  it("supports dash separators and multi-digit levels", () => {
    expect(formatLevelTitle("Level 12 – Advanced")).toBe("Advanced");
    expect(formatLevelTitle("Level 3 - Performance")).toBe("Performance");
  });

  it("leaves titles without a prefix untouched", () => {
    expect(formatLevelTitle("Foundations")).toBe("Foundations");
  });
});

describe("formatModuleTitle", () => {
  it("re-numbers when a moduleNumber is supplied", () => {
    expect(formatModuleTitle({ title: "Module 4: Old Number", moduleNumber: 3 })).toBe(
      "Module 3: Old Number",
    );
  });

  it("strips any existing 'Module N: ' prefix when unnumbered", () => {
    expect(formatModuleTitle({ title: "Module 4: Old Number" })).toBe("Old Number");
  });
});

describe("parseMarkdownToBlocks", () => {
  it("maps headings, bullets, quotes, callouts and dividers", () => {
    const blocks = parseMarkdownToBlocks(
      ["# Title", "## Sub", "- bullet", "> quote", "> [!tip] hint", "---"].join("\n"),
    );
    expect(blocks.map((b) => b.type)).toEqual([
      "heading",
      "heading",
      "bullet_list",
      "quote",
      "callout",
      "divider",
    ]);
  });

  it("continues an auto-numbered list across blank lines without restarting at 1", () => {
    const blocks = parseMarkdownToBlocks(["1. first", "", "1. second", "2. third"].join("\n"));
    expect(blocks.map((b) => b.order)).toEqual([1, 2, 2]);
    expect(blocks[1].content).toBe("second");
  });

  it("resets numbering when a heading appears", () => {
    const blocks = parseMarkdownToBlocks(["1. a", "### New Section", "1. b"].join("\n"));
    const numbered = blocks.filter((b) => b.type === "numbered_list");
    expect(numbered.map((b) => b.order)).toEqual([1, 1]);
  });
});
