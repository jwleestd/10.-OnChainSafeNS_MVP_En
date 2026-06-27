import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScreenBoard } from "@/components/playboard/screen-board";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getBoardSummary } from "@/playboard/derive";
import { assertPlayBoardIntegrity } from "@/playboard/integrity";

export default function PlayBoardIndexPage() {
  assertPlayBoardIntegrity();
  const summary = getBoardSummary();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Layers3 className="h-4 w-4" />
            Registry-derived SoT
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">PlayBoard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Planning, implementation status, policy coverage, schedule, and flow walkthroughs are derived from the six
            PlayBoard registries. The product landing page remains at the root route.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/playboard/implement-summary">
                Implementation Matrix
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/playboard/plan">Work Plan</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Screen Status</h2>
            <div className="mt-3 space-y-2">
              {summary.screenStatusCounts.map((status) => (
                <div key={status.id} className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge status={status.id} />
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-semibold">Work Status</h2>
            <div className="mt-3 space-y-2">
              {summary.workItemStatusCounts.map((status) => (
                <div key={status.id} className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge status={status.id} />
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.controlAreaCoverage.map((area) => (
          <Link
            key={area.area}
            href={`/playboard/control-area/${area.area}`}
            className="rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-accent"
          >
            <h2 className="text-sm font-semibold">{area.title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{area.summary}</p>
            <div className="mt-3 text-xs font-medium">{area.coverageCount} related screens</div>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Current Waves</h2>
            <p className="text-sm text-muted-foreground">Pending work derived from the work-item DAG.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/playboard/schedule">Open Schedule</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summary.waves.map((wave) => (
            <div key={wave.level} className="rounded-md border bg-muted/30 p-3">
              <div className="text-sm font-semibold">{wave.label}</div>
              <div className="text-xs text-muted-foreground">{wave.startDate}</div>
              <div className="mt-3 space-y-2">
                {wave.items.map((item) => (
                  <div key={item.id} className="text-xs">
                    <span className="font-medium">{item.id}</span> {item.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.flows.map((flow) => (
          <Link key={flow.id} href={`/playboard/scenario/${flow.id}`} className="rounded-lg border p-4 hover:bg-accent">
            <h2 className="text-sm font-semibold">{flow.title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{flow.summary}</p>
          </Link>
        ))}
      </section>

      <ScreenBoard screens={summary.screens} />
    </div>
  );
}

