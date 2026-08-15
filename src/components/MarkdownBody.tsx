"use client";

import { Lightbulb } from "lucide-react";

export function MarkdownBody({ markdown }: { markdown: string }) {
  if (!markdown || !markdown.trim()) {
    return <p className="text-sm text-muted-foreground/50 italic">Content coming soon.</p>;
  }
  const blocks = parseNotesToBlocks(markdown);
  return <div className="space-y-4">{blocks.map((block, i) => <BlockDisplay key={i} block={block} />)}</div>;
}

function BlockDisplay({ block }: { block: { type: string; content: string; order?: number } }) {
  switch (block.type) {
    case "heading":
      return <h3 className="text-xl font-serif font-semibold text-primary/90 mt-10 mb-4 first:mt-0 leading-snug">{renderMarkdown(block.content)}</h3>;
    case "bullet_list":
      return <div className="flex items-start gap-3 pl-1"><span className="w-1 h-1 rounded-full bg-primary/30 mt-[9px] shrink-0" /><p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p></div>;
    case "numbered_list":
      return <div className="flex items-start gap-3 pl-1"><span className="text-sm font-bold text-primary/50 mt-0.5 shrink-0 tabular-nums">{block.order}.</span><p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p></div>;
    case "callout":
      return (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5 my-8">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p>
          </div>
        </div>
      );
    case "quote":
      return <blockquote className="border-l-[3px] border-primary/25 pl-6 py-2 my-8 text-base text-foreground/60 italic leading-relaxed">{renderMarkdown(block.content)}</blockquote>;
    case "divider":
      return <div className="my-8 flex items-center gap-4"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" /></div>;
    default:
      return <p className="text-base text-foreground/80 leading-relaxed">{renderMarkdown(block.content)}</p>;
  }
}

export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    if (match[2]) parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono">{match[4]}</code>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

export function parseNotesToBlocks(notes: string) {
  const lines = notes.split("\n");
  const blocks: { type: string; content: string; order?: number }[] = [];
  let listCounter = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { listCounter = 0; continue; }
    if (t.startsWith("### ")) blocks.push({ type: "heading", content: t.replace("### ", "") });
    else if (t.startsWith("## ")) blocks.push({ type: "heading", content: t.replace("## ", "") });
    else if (t.startsWith("# ")) blocks.push({ type: "heading", content: t.replace("# ", "") });
    else if (t.startsWith("- ") || t.startsWith("* ")) blocks.push({ type: "bullet_list", content: t.replace(/^[-*] /, "") });
    else if (/^\d+\.\s/.test(t)) { listCounter++; blocks.push({ type: "numbered_list", content: t.replace(/^\d+\.\s/, ""), order: listCounter }); }
    else if (t.startsWith("> [!tip] ")) blocks.push({ type: "callout", content: t.replace("> [!tip] ", "") });
    else if (t.startsWith("> ")) blocks.push({ type: "quote", content: t.replace("> ", "") });
    else if (t === "---") blocks.push({ type: "divider", content: "" });
    else { listCounter = 0; blocks.push({ type: "paragraph", content: t }); }
  }
  return blocks;
}
