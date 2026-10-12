// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchFilterBar from "./SearchFilterBar";

const baseProps = {
  searchQuery: "",
  onSearchQueryChange: vi.fn(),
  statusFilter: "all" as const,
  onStatusFilterChange: vi.fn(),
  videoFilter: "all" as const,
  onVideoFilterChange: vi.fn(),
};

function StatefulSearchFilterBar() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SearchFilterBar
      searchQuery={searchQuery}
      onSearchQueryChange={(val) => setSearchQuery(val)}
      statusFilter="all"
      onStatusFilterChange={baseProps.onStatusFilterChange}
      videoFilter="all"
      onVideoFilterChange={baseProps.onVideoFilterChange}
    />
  );
}

describe("SearchFilterBar", () => {
  it("reflects typed search queries", async () => {
    const user = userEvent.setup();
    render(<StatefulSearchFilterBar />);

    const input = screen.getByPlaceholderText("Find a lesson...");
    await user.type(input, "cadence");
    expect(input).toHaveValue("cadence");
  });

  it("renders searchable triggers for both filters", () => {
    render(<SearchFilterBar {...baseProps} />);

    expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by video requirement")).toBeInTheDocument();
  });
});