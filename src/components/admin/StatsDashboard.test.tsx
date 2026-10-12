// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsDashboard from "./StatsDashboard";

const props = {
  courseProgress: 42,
  videoProgress: 38,
  draftLessons: 12,
  publishedLessons: 8,
  totalLessons: 20,
};

describe("StatsDashboard", () => {
  it("shows lesson publication stats and percentages", () => {
    render(<StatsDashboard {...props} />);

    expect(screen.getByText("Lessons Live")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("8 of 20 lessons published")).toBeInTheDocument();
    expect(screen.getByText("38%")).toBeInTheDocument();
    expect(screen.getByText("Of lessons that require video")).toBeInTheDocument();
  });

  it("shows the drafts vs live breakdown", () => {
    render(<StatsDashboard {...props} />);

    expect(screen.getByText("Drafts vs Published")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "12 drafts / 8 live" })).toBeInTheDocument();
    expect(screen.getByText("Total of 20 lessons")).toBeInTheDocument();
  });

  it("renders a progress bar for each metric", () => {
    render(<StatsDashboard {...props} />);

    expect(screen.getAllByRole("progressbar")).toHaveLength(3);
  });
});