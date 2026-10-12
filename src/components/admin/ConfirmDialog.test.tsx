// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Delete lesson",
  onConfirm: vi.fn(),
};

describe("ConfirmDialog", () => {
  it("shows its title, description and buttons when open", () => {
    render(
      <ConfirmDialog {...baseProps} description="This cannot be undone." confirmLabel="Delete" />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete lesson")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("confirms without a value by default", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(baseProps.onConfirm).toHaveBeenCalledWith(undefined);
    expect(baseProps.onOpenChange).not.toHaveBeenCalled();
  });

  it("closes via the Cancel button", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(baseProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(baseProps.onConfirm).not.toHaveBeenCalled();
  });

  it("keeps Confirm disabled until a non-blank value is typed, then submits the trimmed value", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        withInput
        inputLabel="Type the title"
        inputPlaceholder="Lesson title"
        onConfirm={onConfirm}
      />
    );

    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeDisabled();

    const input = screen.getByPlaceholderText("Lesson title");
    await user.type(input, "  Final draft  ");
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith("Final draft");
  });

  it("submits on Enter from the input", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        withInput
        inputLabel="Type the title"
        inputPlaceholder="Lesson title"
        onConfirm={onConfirm}
      />
    );

    await user.type(screen.getByPlaceholderText("Lesson title"), "Ready{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("Ready");
  });

  it("disables both buttons while pending", () => {
    render(<ConfirmDialog {...baseProps} isPending />);

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});