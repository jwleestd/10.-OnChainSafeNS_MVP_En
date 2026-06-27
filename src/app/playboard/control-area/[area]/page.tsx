import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/playboard/status-badge";
import { getControlArea, getRelatedWorkItems } from "@/playboard/derive";
import { screens } from "@/playboard/registry";

export default function PlayBoardControlAreaPage({ params }: { params: { area: string } }) {
  const area = getControlArea(params.area);

  if (!area) {
    notFound();
  }

  const relatedScreens = screens.filter((screen) => Boolean(screen.engineering.controlAreaNotes[area.area]));
  const relatedWorkItems = getRelatedWorkItems(area.workItems);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Control Area</p>
        <h1 className="mt-1 text-2xl font-semibold">{area.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{area.summary}</p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Goal</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.goal}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Policies</h2>
          <div className="mt-4 space-y-3">
            {area.policies.map((policy) => (
              <article key={policy.statement} className="rounded-md border bg-muted/20 p-3">
                <h3 className="text-sm font-semibold">{policy.statement}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{policy.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Decisions</h2>
          <div className="mt-4 space-y-3">
            {area.decisions.map((decision) => (
              <div key={decision.name} className="rounded-md border bg-muted/20 p-3 text-sm">
                <span className="font-semibold">{decision.name}</span>: {decision.value}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Standards</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {area.standards.map((standard) => (
            <div key={standard.path} className="rounded-md border bg-muted/20 p-3 text-sm">
              <div className="font-medium">{standard.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{standard.path}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Related Screens</h2>
          <div className="mt-3 space-y-2">
            {relatedScreens.map((screen) => (
              <Link
                key={`${screen.plane}/${screen.slug}`}
                href={`/playboard/spec/${screen.plane}/${screen.slug}`}
                className="block rounded-md border p-3 text-sm hover:bg-accent"
              >
                <span className="font-medium">{screen.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">{screen.plane}/{screen.slug}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Related Work Items</h2>
          <div className="mt-3 space-y-2">
            {relatedWorkItems.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{item.id}</div>
                    <div className="text-sm font-medium">{item.title}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Gaps</h2>
        {area.gaps.length ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {area.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No open gaps recorded for this control area.</p>
        )}
      </section>
    </div>
  );
}

