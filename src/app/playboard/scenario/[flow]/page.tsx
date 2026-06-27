import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/playboard/status-badge";
import { getFlow, getRelatedScreens } from "@/playboard/derive";

export default function PlayBoardScenarioPage({ params }: { params: { flow: string } }) {
  const flow = getFlow(params.flow);

  if (!flow) {
    notFound();
  }

  const screens = getRelatedScreens(flow.screens);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Scenario</p>
        <h1 className="mt-1 text-2xl font-semibold">{flow.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{flow.summary}</p>
      </div>

      <div className="space-y-4">
        {screens.map((screen, index) => (
          <section key={`${screen.plane}/${screen.slug}`} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Step {index + 1}</div>
                <h2 className="mt-1 text-lg font-semibold">{screen.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{screen.flowNote}</p>
              </div>
              <StatusBadge status={screen.status} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Client actions</div>
                <div className="mt-1 text-sm font-medium">{screen.engineering.clientActions.length}</div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Server actions</div>
                <div className="mt-1 text-sm font-medium">{screen.engineering.serverActions.length}</div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground">Data writes</div>
                <div className="mt-1 text-sm font-medium">{screen.engineering.dataWrites.length}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/playboard/spec/${screen.plane}/${screen.slug}`} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
                Spec
              </Link>
              <Link href={`/playboard/screens/${screen.plane}/${screen.slug}`} className="rounded-md border px-3 py-2 text-sm hover:bg-accent">
                Screen
              </Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

