// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminNav, { adminNavItems } from "./AdminNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a"> & { href: unknown }) => (
    <a href={typeof href === "string" ? href : "/"} {...props}>
      {children}
    </a>
  ),
}));

describe("AdminNav", () => {
  it("shows the dashboard heading and the back-to-courses button", () => {
    render(<AdminNav />);

    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
    const back = screen.getByRole("link", { name: "Back to all modules" });
    expect(back).toHaveAttribute("href", "/modules");
  });

  it("renders a link for every admin section", () => {
    render(<AdminNav />);

    for (const item of adminNavItems) {
      const link = screen.getByRole("link", { name: item.title });
      expect(link).toHaveAttribute("href", item.href);
    }
  });

  it("marks the section matching the current pathname as active", () => {
    render(<AdminNav />);

    const active = screen.getByRole("link", { name: "Users" });
    expect(active.className).toContain("border-b-2");
    const inactive = screen.getByRole("link", { name: "Curriculum" });
    expect(inactive.className).not.toContain("border-b-2");
  });
});