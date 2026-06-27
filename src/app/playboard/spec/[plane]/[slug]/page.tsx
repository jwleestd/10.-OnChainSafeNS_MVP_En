import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getRelatedWorkItems, getScreen } from "@/playboard/derive";

function FieldList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {values.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">None recorded.</p>
      )}
    </div>
  );
}

export default function PlayBoardSpecPage({ params }: { params: { plane: string; slug: string } }) {
  const screen = getScreen(params.plane, params.slug);

  if (!screen) {
    notFound();
  }

  const relatedWorkItems = getRelatedWorkItems(screen.workItems);
  const controlNotes = Object.entries(screen.engineering.controlAreaNotes);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{screen.plane}/{screen.slug}</p>
          <h1 className="mt-1 text-2xl font-semibold">{screen.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{screen.flowNote}</p>
        </div>
        <StatusBadge status={screen.status} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Route</div>
          <div className="mt-2 text-sm font-medium">{screen.route}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Implementation</div>
          <div className="mt-2 text-sm font-medium">{screen.implLocation}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Auth Gate</div>
          <div className="mt-2 text-sm font-medium">{screen.engineering.authGate}</div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Screen Contract</h2>
            <p className="mt-1 text-sm text-muted-foreground">{screen.statusNote}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/playboard/screens/${screen.plane}/${screen.slug}`}>Open Screen Surface</Link>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {screen.requirementRefs.map((ref) => (
            <span key={ref} className="rounded-md border bg-muted/20 px-2 py-1 text-xs">
              {ref}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FieldList title="Client Actions" values={screen.engineering.clientActions} />
        <FieldList title="Server Actions" values={screen.engineering.serverActions} />
        <FieldList title="Data Reads" values={screen.engineering.dataReads} />
        <FieldList title="Data Writes" values={screen.engineering.dataWrites} />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Control Area Notes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {controlNotes.map(([area, note]) => (
            <Link key={area} href={`/playboard/control-area/${area}`} className="rounded-md border bg-muted/20 p-3 hover:bg-accent">
              <div className="text-sm font-semibold">{area}</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Linked Work Items</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {relatedWorkItems.map((item) => (
            <article key={item.id} className="rounded-md border bg-muted/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{item.id}</div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

