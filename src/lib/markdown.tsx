"use client";

export function renderInlineMarkdown(text: string): React.ReactNode {
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
