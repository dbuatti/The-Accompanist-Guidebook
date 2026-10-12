// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { joinWaitlist } = vi.hoisted(() => ({ joinWaitlist: vi.fn() }));
vi.mock("@/app/actions/waitlist", () => ({ joinWaitlist }));

const { toast } = vi.hoisted(() => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("sonner", () => ({ toast }));

import WaitlistForm from "./WaitlistForm";

type JoinResult = { ok: true } | { ok: false; reason: string };

beforeEach(() => {
  joinWaitlist.mockReset();
  joinWaitlist.mockResolvedValue({ ok: true });
});

describe("WaitlistForm", () => {
  it("renders the email input and submit button", () => {
    render(<WaitlistForm />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get the tips" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Join the email list" })).toBeInTheDocument();
  });

  it("submits the email and shows the success state", async () => {
    const user = userEvent.setup();
    render(<WaitlistForm source="guides" />);

    await user.type(screen.getByRole("textbox"), "Ada@Example.com");
    await user.click(screen.getByRole("button", { name: "Get the tips" }));

    expect(await screen.findByText("You're on the list. Watch your inbox.")).toBeInTheDocument();
    expect(joinWaitlist).toHaveBeenCalledWith({ email: "Ada@Example.com", source: "guides" });
    expect(toast.success).toHaveBeenCalledWith("You're on the list");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the server error reason when the signup fails", async () => {
    joinWaitlist.mockResolvedValue({ ok: false, reason: "Invalid source." });
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByRole("textbox"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Get the tips" }));

    expect(await screen.findByRole("button", { name: "Get the tips" })).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Invalid source.");
  });

  it("disables the button and shows 'Joining…' while in flight", async () => {
    let resolveJoin: (result: JoinResult) => void;
    joinWaitlist.mockImplementation(
      () => new Promise<JoinResult>((resolve) => (resolveJoin = resolve)),
    );
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByRole("textbox"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Get the tips" }));

    const pending = await screen.findByRole("button", { name: "Joining…" });
    expect(pending).toBeDisabled();

    resolveJoin!({ ok: true });
    expect(await screen.findByText("You're on the list. Watch your inbox.")).toBeInTheDocument();
  });

  it("ignores a second submit while already loading", async () => {
    let resolveJoin: (result: JoinResult) => void;
    joinWaitlist.mockImplementation(
      () => new Promise<JoinResult>((resolve) => (resolveJoin = resolve)),
    );
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByRole("textbox"), "ada@example.com");
    await user.click(screen.getByRole("button", { name: "Get the tips" }));
    await screen.findByRole("button", { name: "Joining…" });

    // Enter on the still-focused input attempts a second submit; the
    // in-flight guard must swallow it.
    await user.keyboard("{Enter}");
    expect(joinWaitlist).toHaveBeenCalledTimes(1);

    resolveJoin!({ ok: true });
    await screen.findByText("You're on the list. Watch your inbox.");
  });
});