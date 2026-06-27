import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScreenStatus, WorkItemStatus } from "@/playboard/types";

const statusClasses: Record<ScreenStatus | WorkItemStatus, string> = {
  planned: "border-slate-300 bg-slate-50 text-slate-700",
  partial: "border-amber-300 bg-amber-50 text-amber-800",
  implemented: "border-emerald-300 bg-emerald-50 text-emerald-800",
  verified: "border-teal-300 bg-teal-50 text-teal-800",
  not_started: "border-slate-300 bg-slate-50 text-slate-700",
  review_ready: "border-sky-300 bg-sky-50 text-sky-800",
  done: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

const labels: Record<ScreenStatus | WorkItemStatus, string> = {
  planned: "Planned",
  partial: "Partial",
  implemented: "Implemented",
  verified: "Verified",
  not_started: "Not Started",
  review_ready: "Review Ready",
  done: "Done",
};

export function StatusBadge({ status, className }: { status: ScreenStatus | WorkItemStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0 whitespace-nowrap", statusClasses[status], className)}>
      {labels[status]}
    </Badge>
  );
}

