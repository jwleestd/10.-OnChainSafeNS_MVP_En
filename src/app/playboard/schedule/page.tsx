import { DiagramModal } from "@/components/playboard/diagram-modal";
import { StatusBadge } from "@/components/playboard/status-badge";
import { getWaves } from "@/playboard/derive";

function buildGanttDiagram() {
  const lines = ["gantt", "  title PlayBoard Derived Waves", "  dateFormat  YYYY-MM-DD", "  section Pending"];

  for (const wave of getWaves()) {
    for (const item of wave.items) {
      lines.push(`  ${item.id}: ${item.id.replace(/-/g, "_")}, ${wave.startDate}, 1d`);
    }
  }

  return lines.join("\n");
}

export default function PlayBoardSchedulePage() {
  const waves = getWaves();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="mt-2 text-sm text-muted-foreground">Parallelizable waves are derived from unfinished work-item dependencies.</p>
        </div>
        <DiagramModal title="Wave Gantt" description="Mermaid source for the current wave schedule." diagram={buildGanttDiagram()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {waves.map((wave) => (
          <section key={wave.level} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{wave.label}</h2>
                <p className="text-sm text-muted-foreground">Start: {wave.startDate}</p>
              </div>
              <div className="text-sm font-medium">{wave.items.length} items</div>
            </div>
            <div className="mt-4 space-y-3">
              {wave.items.map((item) => (
                <article key={item.id} className="rounded-md border bg-muted/20 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{item.id}</div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Blocked by: {item.dependsOn.length ? item.dependsOn.join(", ") : "none"}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

