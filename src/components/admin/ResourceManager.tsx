"use client";

import { useState } from "react";
import { addResource, deleteResource } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Plus, Trash2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface Resource {
  id: string;
  title: string;
  url: string;
  description?: string | null;
}

interface ResourceManagerProps {
  lessonId: string;
  resources: Resource[];
  onAdd: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

export default function ResourceManager({ lessonId, resources, onAdd, onDelete }: ResourceManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", url: "", description: "" });

  const handleAdd = async () => {
    if (!draft.title.trim() || !draft.url.trim()) return;
    try {
      const result = await addResource(lessonId, draft.title, draft.url, draft.description);
      onAdd(result);
      setDraft({ title: "", url: "", description: "" });
      setIsAdding(false);
      showSuccess("Resource added!");
    } catch {
      showError("Failed to add resource");
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      await deleteResource(resourceId);
      onDelete(resourceId);
      showSuccess("Resource removed");
    } catch {
      showError("Failed to remove resource");
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-primary" /> Resources
      </h3>
      {resources.length > 0 && (
        <div className="space-y-2 mb-3">
          {resources.map((res) => (
            <div key={res.id} className="flex items-center gap-3 p-3 bg-card/50 border border-border/40 rounded-lg group">
              <ExternalLink className="w-4 h-4 text-primary shrink-0" />
              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate">
                {res.title}
              </a>
              {res.description && <span className="text-xs text-muted-foreground truncate">- {res.description}</span>}
              <button onClick={() => handleDelete(res.id)} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {isAdding ? (
        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
          <Input placeholder="Resource title (e.g. Musicnotes)" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="h-8 text-sm" />
          <Input placeholder="URL (https://...)" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} className="h-8 text-sm" />
          <Input placeholder="Description (optional)" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="h-8 text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add resource
        </button>
      )}
    </div>
  );
}
