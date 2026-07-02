import { Badge } from "@/components/ui/badge";

export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="default"
      className={`bg-emerald-500 text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0 leading-4 ${className || ""}`}
    >
      New
    </Badge>
  );
}
