import Link from "next/link";

import { DiagramModal } from "@/components/playboard/diagram-modal";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getRelatedScreens, getWorkItemGraph } from "@/playboard/derive";
import { workItems } from "@/playboard/registry";

function buildGraphDiagram() {
  const graph = getWorkItemGraph();
  const lines = ["flowchart LR"];

  for (const node of graph.nodes) {
    lines.push(`  ${node.id.replace(/-/g, "_")}["${node.id}: ${node.title.replace(/"/g, "'")}"]`);
  }

  for (const edge of graph.edges) {
    lines.push(`  ${edge.from.replace(/-/g, "_")} --> ${edge.to.replace(/-/g, "_")}`);
  }

  return lines.join("\n");
}

export default function PlayBoardPlanPage() {
  const phases = Array.from(new Set(workItems.map((item) => item.phase)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Work Plan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Work items and dependencies are derived from the registry.</p>
        </div>
        <DiagramModal title="Work Item DAG" description="Mermaid source for the registry-derived dependency graph." diagram={buildGraphDiagram()} />
      </div>

      <div className="space-y-5">
        {phases.map((phase) => (
          <section key={phase} className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{phase}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {workItems
                .filter((item) => item.phase === phase)
                .map((item) => {
                  const screens = getRelatedScreens(item.screens);
                  return (
                    <article key={item.id} className="rounded-md border bg-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">{item.id}</div>
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Depends on: {item.dependsOn.length ? item.dependsOn.join(", ") : "none"}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {screens.map((screen) => (
                          <Link
                            key={`${screen.plane}/${screen.slug}`}
                            href={`/playboard/spec/${screen.plane}/${screen.slug}`}
                            className="rounded-md border px-2 py-1 text-xs hover:bg-accent"
                          >
                            {screen.title}
                          </Link>
                        ))}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

