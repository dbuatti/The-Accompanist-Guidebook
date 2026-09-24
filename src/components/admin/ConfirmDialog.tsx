"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  /** When true, renders a text input and passes its value to onConfirm. */
  withInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  isPending?: boolean;
  onConfirm: (value?: string) => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  withInput = false,
  inputLabel = "Name",
  inputPlaceholder,
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {withInput && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{inputLabel}</label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) onConfirm(value.trim());
              }}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => onConfirm(withInput ? value.trim() : undefined)}
            disabled={isPending || (withInput && !value.trim())}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}