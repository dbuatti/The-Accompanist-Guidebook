"use client";

import { Lightbulb } from "lucide-react";
import { parseMarkdownToBlocks } from "@/lib/utils";
import { renderInlineMarkdown } from "@/lib/markdown";

export function MarkdownBody({ markdown }: { markdown: string }) {
  if (!markdown || !markdown.trim()) {
    return <p className="text-sm text-muted-foreground/50 italic">Content coming soon.</p>;
  }
  const blocks = parseMarkdownToBlocks(markdown);
  return <div className="space-y-4">{blocks.map((block, i) => <BlockDisplay key={i} block={block} />)}</div>;
}

function BlockDisplay({ block }: { block: { type: string; content: string; order?: number } }) {
  switch (block.type) {
    case "heading":
      return <h3 className="text-xl font-serif font-semibold text-primary/90 mt-10 mb-4 first:mt-0 leading-snug">{renderInlineMarkdown(block.content)}</h3>;
    case "bullet_list":
      return <div className="flex items-start gap-3 pl-1"><span className="w-1 h-1 rounded-full bg-primary/30 mt-[9px] shrink-0" /><p className="text-base text-foreground/80 leading-relaxed">{renderInlineMarkdown(block.content)}</p></div>;
    case "numbered_list":
      return <div className="flex items-start gap-3 pl-1"><span className="text-sm font-bold text-primary/50 mt-0.5 shrink-0 tabular-nums">{block.order}.</span><p className="text-base text-foreground/80 leading-relaxed">{renderInlineMarkdown(block.content)}</p></div>;
    case "callout":
      return (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5 my-8">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-base text-foreground/80 leading-relaxed">{renderInlineMarkdown(block.content)}</p>
          </div>
        </div>
      );
    case "quote":
      return <blockquote className="border-l-[3px] border-primary/25 pl-6 py-2 my-8 text-base text-foreground/60 italic leading-relaxed">{renderInlineMarkdown(block.content)}</blockquote>;
    case "divider":
      return <div className="my-8 flex items-center gap-4"><div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" /></div>;
    default:
      return <p className="text-base text-foreground/80 leading-relaxed">{renderInlineMarkdown(block.content)}</p>;
  }
}
