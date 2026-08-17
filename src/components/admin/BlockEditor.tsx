"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  ChevronRight,
  GripVertical,
  MoreHorizontal,
  Type,
  FileText,
  List,
  ListOrdered,
  Lightbulb,
  Quote,
  Minus,
  X,
} from "lucide-react";
import { parseMarkdownToBlocks } from "@/lib/utils";
import { renderInlineMarkdown } from "@/lib/markdown";

export type BlockType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "numbered_list"
  | "callout"
  | "quote"
  | "divider";

export interface DocBlock {
  id: string;
  type: BlockType;
  content: string;
  order?: number;
}

export function parseNotesToBlocks(notes: string): DocBlock[] {
  if (!notes.trim()) {
    return [
      { id: "block-init-heading", type: "heading", content: "Lesson Overview" },
      { id: "block-init-p1", type: "paragraph", content: "" },
    ];
  }
  const baseBlocks = parseMarkdownToBlocks(notes);
  return baseBlocks.map((block, i) => ({
    id: `block-parsed-${i}`,
    ...block,
  }));
}

export function blocksToNotes(blocks: DocBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading": return `### ${block.content}`;
      case "bullet_list": return `- ${block.content}`;
      case "numbered_list": return `${block.order ?? 1}. ${block.content}`;
      case "quote": return `> ${block.content}`;
      case "callout": return `> [!tip] ${block.content}`;
      case "divider": return "---";
      default: return block.content;
    }
  }).join("\n");
}

interface BlockEditorProps {
  blocks: DocBlock[];
  onChange: (blocks: DocBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType, afterId?: string) => {
    const newBlock: DocBlock = { id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, content: "" };
    const next = [...blocks];
    if (!afterId) {
      next.push(newBlock);
    } else {
      const idx = next.findIndex((b) => b.id === afterId);
      next.splice(idx + 1, 0, newBlock);
    }
    onChange(next);
    setEditingBlockId(newBlock.id);
  };

  const updateBlockContent = (blockId: string, content: string) => {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, content } : b)));
  };

  const updateBlockType = (blockId: string, type: BlockType) => {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, type } : b)));
  };

  const deleteBlock = (blockId: string) => {
    onChange(blocks.filter((b) => b.id !== blockId));
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const next = [...blocks];
    const idx = next.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === next.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-1">
      {blocks.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <p className="text-muted-foreground text-sm">No content blocks yet.</p>
          <button
            onClick={() => addBlock("paragraph")}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add first block
          </button>
        </div>
      ) : (
        blocks.map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            isEditing={editingBlockId === block.id}
            isHovered={hoveredBlockId === block.id}
            onEdit={() => setEditingBlockId(block.id)}
            onBlur={() => setEditingBlockId(null)}
            onHover={(v) => setHoveredBlockId(v ? block.id : null)}
            onChange={(c) => updateBlockContent(block.id, c)}
            onChangeType={(t) => updateBlockType(block.id, t)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, "up")}
            onMoveDown={() => moveBlock(block.id, "down")}
            onAddAfter={(t) => addBlock(t, block.id)}
          />
        ))
      )}
      <div className="mt-4">
        <AddBlockMenu onSelect={(t) => addBlock(t)} />
      </div>
    </div>
  );
}

function BlockRow({ block, isEditing, isHovered, onEdit, onBlur, onHover, onChange, onChangeType, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
  block: DocBlock; isEditing: boolean; isHovered: boolean; onEdit: () => void; onBlur: () => void; onHover: (v: boolean) => void;
  onChange: (content: string) => void; onChangeType: (type: BlockType) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onAddAfter: (type: BlockType) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  if (block.type === "divider") {
    return (
      <div className="group relative py-2 flex items-center justify-center" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
        {isHovered && <div className="absolute right-0 -top-2 z-10"><BlockActions onChangeType={onChangeType} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onAddAfter={onAddAfter} /></div>}
        <div className="w-full border-t-2 border-border/80" />
      </div>
    );
  }

  return (
    <div className="group relative" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      {isHovered && (
        <div className="absolute -left-8 top-1 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={onMoveUp} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" aria-label="Move block up"><ChevronRight className="w-3 h-3 -rotate-90" /></button>
          <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
          <button onClick={onMoveDown} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" aria-label="Move block down"><ChevronRight className="w-3 h-3 rotate-90" /></button>
        </div>
      )}
      {isHovered && <div className="absolute right-0 top-0 z-10"><BlockActions onChangeType={onChangeType} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onAddAfter={onAddAfter} /></div>}
      <div onClick={onEdit} className="cursor-text">
        {isEditing ? (
          <Textarea ref={textareaRef} value={block.content} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && block.type !== "paragraph") { e.preventDefault(); onBlur(); onAddAfter("paragraph"); } }}
            className={`${getBlockClassName(block.type, true)} min-h-[40px] resize-none border-transparent focus:border-primary/30 focus:bg-accent/20 bg-transparent shadow-none hover:bg-accent/10 transition-colors`}
            rows={block.type === "paragraph" || block.type === "quote" || block.type === "callout" ? 3 : 1}
          />
        ) : (
          <BlockRender block={block} />
        )}
      </div>
    </div>
  );
}

function BlockRender({ block }: { block: DocBlock }) {
  const cn = getBlockClassName(block.type, false);
  const empty = <span className="text-muted-foreground/40 italic">Click to edit...</span>;
  switch (block.type) {
    case "heading": return <h2 className={cn}>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Heading</span>}</h2>;
    case "paragraph": return <p className={cn}>{block.content ? renderInlineMarkdown(block.content) : empty}</p>;
    case "bullet_list": return <ul className={cn}><li>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Bullet point</span>}</li></ul>;
    case "numbered_list": return <div className={`${cn} flex items-start gap-2`}><span className="text-xs font-bold text-primary/40 mt-[3px] shrink-0 tabular-nums">{block.order ?? 1}.</span><span>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Numbered item</span>}</span></div>;
    case "callout": return <div className={`${cn} bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 rounded-r-lg`}><div className="flex items-start gap-3"><Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><span>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Pro tip...</span>}</span></div></div>;
    case "quote": return <blockquote className={cn}>{block.content ? renderInlineMarkdown(block.content) : <span className="text-muted-foreground/40 italic">Quote...</span>}</blockquote>;
    default: return <p className={cn}>{block.content ? renderInlineMarkdown(block.content) : empty}</p>;
  }
}

function getBlockClassName(type: BlockType, isEditing: boolean): string {
  const base = isEditing ? "px-3 py-2 rounded-lg w-full" : "px-3 py-1.5 rounded-lg w-full";
  switch (type) {
    case "heading": return `${base} text-xl font-serif font-bold text-primary leading-tight`;
    case "paragraph": return `${base} text-sm text-foreground/90 leading-relaxed`;
    case "bullet_list": return `${base} text-sm text-foreground/90 list-disc list-inside leading-relaxed`;
    case "numbered_list": return `${base} text-sm text-foreground/90 list-decimal list-inside leading-relaxed`;
    case "callout": return `${base} text-sm text-foreground/90 leading-relaxed p-4`;
    case "quote": return `${base} text-sm text-foreground/80 italic border-l-4 border-primary/30 pl-4 py-2 leading-relaxed`;
    default: return base;
  }
}

function BlockActions({ onChangeType, onDelete, onMoveUp, onMoveDown, onAddAfter }: {
  onChangeType: (type: BlockType) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onAddAfter: (type: BlockType) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-card border border-border/60 rounded-md shadow-sm p-0.5">
      <button onClick={onMoveUp} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Move up" aria-label="Move block up"><ChevronRight className="w-3 h-3 -rotate-90" /></button>
      <button onClick={onMoveDown} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" title="Move down" aria-label="Move block down"><ChevronRight className="w-3 h-3 rotate-90" /></button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none" aria-label="Block actions"><MoreHorizontal className="w-3 h-3" /></button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onChangeType("heading")}><Type className="w-3.5 h-3.5 mr-2" /> Heading</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("paragraph")}><FileText className="w-3.5 h-3.5 mr-2" /> Paragraph</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("bullet_list")}><List className="w-3.5 h-3.5 mr-2" /> Bullet List</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("numbered_list")}><ListOrdered className="w-3.5 h-3.5 mr-2" /> Numbered List</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("callout")}><Lightbulb className="w-3.5 h-3.5 mr-2" /> Callout</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("quote")}><Quote className="w-3.5 h-3.5 mr-2" /> Quote</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeType("divider")}><Minus className="w-3.5 h-3.5 mr-2" /> Divider</DropdownMenuItem>
          <Separator className="my-1" />
          <DropdownMenuItem onClick={() => onAddAfter("paragraph")}><Plus className="w-3.5 h-3.5 mr-2" /> Add below</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AddBlockMenu({ onSelect }: { onSelect: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const items = [
    { type: "heading" as BlockType, label: "Heading", icon: <Type className="w-4 h-4" /> },
    { type: "paragraph" as BlockType, label: "Paragraph", icon: <FileText className="w-4 h-4" /> },
    { type: "bullet_list" as BlockType, label: "Bullet List", icon: <List className="w-4 h-4" /> },
    { type: "numbered_list" as BlockType, label: "Numbered List", icon: <ListOrdered className="w-4 h-4" /> },
    { type: "callout" as BlockType, label: "Callout", icon: <Lightbulb className="w-4 h-4" /> },
    { type: "quote" as BlockType, label: "Quote", icon: <Quote className="w-4 h-4" /> },
    { type: "divider" as BlockType, label: "Divider", icon: <Minus className="w-4 h-4" /> },
  ];
  return (
    <div className="relative">
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm py-2 px-3 rounded-lg hover:bg-accent/30 w-full">
          <Plus className="w-4 h-4" /> Add a block
        </button>
      ) : (
        <div className="bg-card border border-border/60 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1">
          {items.map((item) => (
            <button key={item.type} onClick={() => { onSelect(item.type); setOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 text-sm text-foreground/80 transition-colors text-left">
              {item.icon} {item.label}
            </button>
          ))}
          <button onClick={() => setOpen(false)} className="col-span-2 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent/30 text-xs text-muted-foreground transition-colors">
            <X className="w-3 h-3" /> Close
          </button>
        </div>
      )}
    </div>
  );
}
