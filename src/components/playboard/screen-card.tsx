import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getScreenKey } from "@/playboard/derive";
import type { Screen } from "@/playboard/types";

export function ScreenCard({ screen }: { screen: Screen }) {
  return (
    <article className="flex h-full min-h-[220px] flex-col justify-between rounded-lg border bg-background p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{getScreenKey(screen)}</p>
            <h3 className="mt-1 text-base font-semibold leading-tight">{screen.title}</h3>
          </div>
          <StatusBadge status={screen.status} />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{screen.flowNote}</p>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Route:</span> {screen.route}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/playboard/spec/${screen.plane}/${screen.slug}`}>
            Spec
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/playboard/screens/${screen.plane}/${screen.slug}`}>
            Screen
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

