"use client";

import { useState } from "react";
import { Columns3, Grid2X2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScreenCard } from "@/components/playboard/screen-card";
import { StatusBadge } from "@/components/playboard/status-badge";
import { screenStatuses } from "@/playboard/registry";
import type { Screen } from "@/playboard/types";

export function ScreenBoard({ screens }: { screens: Screen[] }) {
  const [mode, setMode] = useState<"tiles" | "kanban">("tiles");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Screen Board</h2>
          <p className="text-sm text-muted-foreground">Registry-derived surfaces grouped by implementation state.</p>
        </div>
        <div className="flex rounded-md border p-1">
          <Button
            type="button"
            variant={mode === "tiles" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMode("tiles")}
            aria-pressed={mode === "tiles"}
          >
            <Grid2X2 className="h-4 w-4" />
            Tiles
          </Button>
          <Button
            type="button"
            variant={mode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMode("kanban")}
            aria-pressed={mode === "kanban"}
          >
            <Columns3 className="h-4 w-4" />
            Kanban
          </Button>
        </div>
      </div>

      {mode === "tiles" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {screens.map((screen) => (
            <ScreenCard key={`${screen.plane}/${screen.slug}`} screen={screen} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {screenStatuses.map((status) => (
            <div key={status.id} className="min-h-[260px] rounded-lg border bg-muted/20 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <StatusBadge status={status.id} />
                <span className="text-xs text-muted-foreground">{screens.filter((screen) => screen.status === status.id).length}</span>
              </div>
              <div className="space-y-3">
                {screens
                  .filter((screen) => screen.status === status.id)
                  .map((screen) => (
                    <ScreenCard key={`${screen.plane}/${screen.slug}`} screen={screen} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

