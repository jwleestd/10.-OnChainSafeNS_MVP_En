import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getScreen } from "@/playboard/derive";

export default function PlayBoardScreenSurfacePage({ params }: { params: { plane: string; slug: string } }) {
  const screen = getScreen(params.plane, params.slug);

  if (!screen) {
    notFound();
  }

  const isLiveRoute = screen.designSpecType === "live-route" && screen.route.startsWith("/");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border bg-background p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{screen.plane}/{screen.slug}</p>
            <h1 className="mt-1 text-2xl font-semibold">{screen.title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{screen.flowNote}</p>
          </div>
          <StatusBadge status={screen.status} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">Route or source</div>
            <div className="mt-1 text-sm font-medium">{screen.route}</div>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">Implementation</div>
            <div className="mt-1 text-sm font-medium">{screen.implLocation}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/playboard/spec/${screen.plane}/${screen.slug}`}>Open Spec</Link>
          </Button>
          {isLiveRoute && (
            <Button asChild size="sm">
              <Link href={screen.route}>Open Live Route</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Screen Sample</h2>
        <div className="mt-4 rounded-lg border bg-muted/20 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(screen.engineering.controlAreaNotes).map(([area, note]) => (
              <div key={area} className="rounded-md border bg-background p-3">
                <div className="text-xs font-medium text-muted-foreground">{area}</div>
                <p className="mt-1 text-sm leading-6">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md border bg-background p-3">
            <div className="text-xs font-medium text-muted-foreground">Primary actions</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {screen.engineering.clientActions.length ? (
                screen.engineering.clientActions.map((action) => (
                  <span key={action} className="rounded-md border px-2 py-1 text-xs">
                    {action}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">System contract surface</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

