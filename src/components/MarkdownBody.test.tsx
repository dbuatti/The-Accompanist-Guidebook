// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownBody } from "./MarkdownBody";

describe("MarkdownBody", () => {
  it("shows a placeholder for empty content", () => {
    render(<MarkdownBody markdown="" />);
    expect(screen.getByText("Content coming soon.")).toBeInTheDocument();
  });

  it("shows a placeholder for whitespace-only content", () => {
    render(<MarkdownBody markdown={"   \n  "} />);
    expect(screen.getByText("Content coming soon.")).toBeInTheDocument();
  });

  it("renders headings, paragraphs, lists, callouts and quotes", () => {
    const markdown = [
      "# Aim",
      "Body paragraph with some words.",
      "- a bullet point",
      "1. first step",
      "> [!tip] Pro tip",
      "> A quoted line",
    ].join("\n");

    render(<MarkdownBody markdown={markdown} />);

    expect(screen.getByRole("heading", { name: "Aim" })).toBeInTheDocument();
    expect(screen.getByText("Body paragraph with some words.")).toBeInTheDocument();
    expect(screen.getByText("a bullet point")).toBeInTheDocument();
    expect(screen.getByText("Pro tip")).toBeInTheDocument();
    expect(screen.getByText("A quoted line")).toBeInTheDocument();
  });

  it("re-numbers repeated '1.' markers so auto-numbered lists continue", () => {
    const markdown = ["1. first", "1. second", "1. third"].join("\n");
    render(<MarkdownBody markdown={markdown} />);

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });
});