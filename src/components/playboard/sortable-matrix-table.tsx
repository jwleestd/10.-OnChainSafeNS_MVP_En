"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/playboard/status-badge";
import type { ControlArea, CoverageMatrixRow } from "@/playboard/types";

type SortKey = "screen" | "status" | "coverage";

export function SortableMatrixTable({ rows, controlAreas }: { rows: CoverageMatrixRow[]; controlAreas: ControlArea[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("screen");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    const next = [...rows].sort((a, b) => {
      if (sortKey === "status") {
        return a.screen.status.localeCompare(b.screen.status);
      }

      if (sortKey === "coverage") {
        return a.coveredCount - b.coveredCount;
      }

      return a.screen.title.localeCompare(b.screen.title);
    });

    return direction === "asc" ? next : next.reverse();
  }, [direction, rows, sortKey]);

  function updateSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setDirection("asc");
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th className="w-[240px] px-3 py-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => updateSort("screen")}>
                Screen
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </th>
            <th className="w-[140px] px-3 py-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => updateSort("status")}>
                Status
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </th>
            <th className="w-[120px] px-3 py-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => updateSort("coverage")}>
                Coverage
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </th>
            {controlAreas.map((area) => (
              <th key={area.area} className="w-[150px] px-3 py-3">
                <Link href={`/playboard/control-area/${area.area}`} className="font-medium hover:underline">
                  {area.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={`${row.screen.plane}/${row.screen.slug}`} className="border-t">
              <td className="px-3 py-3 align-top">
                <Link href={`/playboard/spec/${row.screen.plane}/${row.screen.slug}`} className="font-medium hover:underline">
                  {row.screen.title}
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">{row.screen.plane}/{row.screen.slug}</div>
              </td>
              <td className="px-3 py-3 align-top">
                <StatusBadge status={row.screen.status} />
              </td>
              <td className="px-3 py-3 align-top">
                {row.coveredCount}/{controlAreas.length}
              </td>
              {controlAreas.map((area) => {
                const note = row.notes[area.area];
                return (
                  <td key={area.area} className="px-3 py-3 align-top">
                    {note ? (
                      <span className="inline-flex items-start gap-2 text-xs leading-5 text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {note}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Circle className="h-4 w-4" />
                        No note
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

