"use client";

import { useState } from "react";
import { updateModule, updateModuleWrapUpVideo, toggleModuleVisibility } from "@/app/actions";
import { formatModuleTitle } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Video, Save, Loader2, Plus } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface ModulePanelProps {
  module: any;
  onRefetch: () => void | Promise<void>;
  onAddLesson: () => void;
}

export default function ModulePanel({ module, onRefetch, onAddLesson }: ModulePanelProps) {
  const [title, setTitle] = useState(module.title);
  const [wrapUpVideoUrl, setWrapUpVideoUrl] = useState(module.wrapUpVideoUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        title !== module.title ? updateModule(module.id, title) : Promise.resolve(),
        wrapUpVideoUrl !== (module.wrapUpVideoUrl || "") ? updateModuleWrapUpVideo(module.id, wrapUpVideoUrl) : Promise.resolve(),
      ]);
      showSuccess("Module saved");
      await onRefetch();
    } catch {
      showError("Failed to save module");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      const result = await toggleModuleVisibility(module.id);
      showSuccess(result.isPublished ? "Module published" : "Module hidden");
      await onRefetch();
    } catch {
      showError("Failed to toggle module visibility");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FolderOpen className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Module &middot; {formatModuleTitle(module)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch id="module-publish" checked={module.isPublished} onCheckedChange={handleTogglePublish} disabled={isTogglingPublish} />
            <Label htmlFor="module-publish" className="text-xs font-medium cursor-pointer">
              {module.isPublished ? "Published" : "Hidden"}
            </Label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Module Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 text-sm" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> Wrap-Up Video URL
          </label>
          <p className="text-[11px] text-muted-foreground">Optional video shown at the end of this module for logged-out viewers.</p>
          <Input
            value={wrapUpVideoUrl}
            onChange={(e) => setWrapUpVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or Vimeo URL"
            className="h-9 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"} in this module</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onAddLesson} className="h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-xs">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
