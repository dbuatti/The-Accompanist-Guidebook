"use client";

import { useState, useEffect } from "react";
import { getWelcomeContent, updateWelcomeContent } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Eye, Feather } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { MarkdownBody } from "@/components/MarkdownBody";

export default function AdminWelcomePage() {
  const { isPending: isAuthPending } = authClient.useSession();
  const [title, setTitle] = useState("A letter from Daniele");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isAuthPending) return;
    const load = async () => {
      try {
        const data = await getWelcomeContent();
        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
      } catch {
        showError("Failed to load welcome content");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isAuthPending]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showError("Both title and content are required.");
      return;
    }
    setIsSaving(true);
    try {
      await updateWelcomeContent(title.trim(), content.trim());
      showSuccess("Welcome page updated");
    } catch {
      showError("Failed to save welcome content");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 text-primary">
            <Feather className="h-3.5 w-3.5" /> Student welcome page
          </Badge>
        </div>
        <h2 className="text-xl font-serif font-semibold text-primary">Welcome Page Editor</h2>
        <p className="text-sm text-muted-foreground">
          The letter students see before their first module. Supports markdown: <code className="bg-muted px-1 rounded text-xs">### headings</code>, <code className="bg-muted px-1 rounded text-xs">- bullets</code>, <code className="bg-muted px-1 rounded text-xs">1. lists</code>, <code className="bg-muted px-1 rounded text-xs">**bold**</code>.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Page title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A letter from Daniele"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Content</label>
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "Hide preview" : "Preview"}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the welcome letter in markdown…"
                className="w-full min-h-[420px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Saving…" : "Save welcome page"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPreview && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Preview</p>
              <MarkdownBody markdown={content || "_Nothing to preview yet._"} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
