// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PaywallGate from "./PaywallGate";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a"> & { href: unknown }) => (
    <a href={typeof href === "string" ? href : "/"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: { user: null } }),
  },
}));

vi.mock("@/hooks/use-pricing", () => ({
  usePricing: () => ({ display: "$99 USD" }),
}));

vi.mock("@/components/PromoCountdown", () => ({
  default: () => null,
}));

describe("PaywallGate", () => {
  it("renders the members area headline and included benefits", () => {
    render(<PaywallGate hasSession={false} />);

    expect(screen.getByText("Members area")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Full course access" })).toBeInTheDocument();
    expect(screen.getByText("Three levels of training")).toBeInTheDocument();
    expect(screen.getByText("Self-paced video lessons")).toBeInTheDocument();
    expect(screen.getByText("Lifetime access")).toBeInTheDocument();
  });

  it("shows the live price from usePricing", () => {
    render(<PaywallGate hasSession={false} />);

    expect(screen.getByText("$99 USD")).toBeInTheDocument();
    expect(screen.getByText("Launch offer")).toBeInTheDocument();
    expect(screen.getByText("One-time payment")).toBeInTheDocument();
  });

  it("points the primary CTA at sign-in when no payment link is configured", () => {
    render(<PaywallGate hasSession={false} />);

    const cta = screen.getByRole("link", { name: /sign in to view your course/i });
    expect(cta).toHaveAttribute("href", "/auth/sign-in");
  });

  it("lists the guarantee and the free preview link", () => {
    render(<PaywallGate hasSession={false} />);

    expect(screen.getByText("14-day money-back guarantee")).toBeInTheDocument();
    const preview = screen.getByRole("link", { name: "Watch a free lesson first" });
    expect(preview).toHaveAttribute(
      "href",
      "/preview/how-to-cut-your-music/the-correct-bracket-notation"
    );
  });

  it("mentions a session refresh hint when the user has just purchased", () => {
    render(<PaywallGate hasSession={true} />);

    expect(screen.getByText(/or try refreshing if you just purchased/i)).toBeInTheDocument();
  });

  it("links the support email for purchase issues", () => {
    render(<PaywallGate hasSession={false} />);

    expect(screen.getByRole("link", { name: "info@danielebuatti.com" })).toHaveAttribute(
      "href",
      "mailto:info@danielebuatti.com"
    );
  });
});