"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface CopyDocumentButtonProps {
  /** id of the element whose rendered text should be copied. */
  targetId: string;
  label?: string;
}

export default function CopyDocumentButton({ targetId, label = "Copy entire document" }: CopyDocumentButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const node = document.getElementById(targetId);
      if (!node) {
        showError("Document not found.");
        return;
      }
      const text = node.innerText ?? "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess("Blueprint copied to clipboard — paste it anywhere.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Failed to copy document.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}