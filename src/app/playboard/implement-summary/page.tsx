import { SortableMatrixTable } from "@/components/playboard/sortable-matrix-table";
import { getScreenCoverageMatrix } from "@/playboard/derive";
import { controlAreas } from "@/playboard/registry";

export default function PlayBoardImplementSummaryPage() {
  const rows = getScreenCoverageMatrix();
  const totalNotes = rows.reduce((sum, row) => sum + row.coveredCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Implementation Matrix</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Screen coverage is calculated only from each screen engineering control-area notes.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Screens</div>
          <div className="mt-2 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Control Areas</div>
          <div className="mt-2 text-2xl font-semibold">{controlAreas.length}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Coverage Notes</div>
          <div className="mt-2 text-2xl font-semibold">{totalNotes}</div>
        </div>
      </section>

      <SortableMatrixTable rows={rows} controlAreas={controlAreas} />
    </div>
  );
}

