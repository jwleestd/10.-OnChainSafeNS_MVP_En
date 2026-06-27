import {
  controlAreas,
  flows,
  planes,
  screens,
  screenStatuses,
  workItems,
  workItemStatuses,
} from "./registry";
import type {
  ControlAreaId,
  CoverageMatrixRow,
  PlaneId,
  Screen,
  ScreenKey,
  ScreenStatus,
  Wave,
  WorkItem,
  WorkItemStatus,
} from "./types";

export function getScreenKey(screen: Pick<Screen, "plane" | "slug">): ScreenKey {
  return `${screen.plane}/${screen.slug}`;
}

export function getScreensByStatus(): Record<ScreenStatus, Screen[]> {
  return screenStatuses.reduce(
    (groups, status) => ({
      ...groups,
      [status.id]: screens.filter((screen) => screen.status === status.id),
    }),
    {} as Record<ScreenStatus, Screen[]>,
  );
}

export function getWorkItemsByStatus(): Record<WorkItemStatus, WorkItem[]> {
  return workItemStatuses.reduce(
    (groups, status) => ({
      ...groups,
      [status.id]: workItems.filter((item) => item.status === status.id),
    }),
    {} as Record<WorkItemStatus, WorkItem[]>,
  );
}

export function getScreensByPlane(): Record<PlaneId, Screen[]> {
  return planes.reduce(
    (groups, plane) => ({
      ...groups,
      [plane.id]: screens.filter((screen) => screen.plane === plane.id),
    }),
    {} as Record<PlaneId, Screen[]>,
  );
}

export function getScreen(plane: string, slug: string): Screen | undefined {
  return screens.find((screen) => screen.plane === plane && screen.slug === slug);
}

export function getControlArea(area: string) {
  return controlAreas.find((controlArea) => controlArea.area === area);
}

export function getFlow(flow: string) {
  return flows.find((item) => item.id === flow);
}

export function getControlAreaCoverage() {
  return controlAreas.map((area) => {
    const relatedScreens = screens.filter((screen) => Boolean(screen.engineering.controlAreaNotes[area.area]));
    const relatedWorkItems = workItems.filter((item) => area.workItems.includes(item.id));

    return {
      ...area,
      screens: relatedScreens,
      workItems: relatedWorkItems,
      coverageCount: relatedScreens.length,
    };
  });
}

export function getScreenCoverageMatrix(): CoverageMatrixRow[] {
  return screens
    .map((screen) => {
      const notes = screen.engineering.controlAreaNotes;
      return {
        screen,
        notes,
        coveredCount: controlAreas.filter((area) => Boolean(notes[area.area])).length,
      };
    })
    .sort((a, b) => a.screen.title.localeCompare(b.screen.title));
}

export function getWorkItemGraph() {
  const nodes = workItems.map((item) => ({
    id: item.id,
    title: item.title,
    phase: item.phase,
    status: item.status,
  }));

  const edges = workItems.flatMap((item) =>
    item.dependsOn.map((dependency) => ({
      from: dependency,
      to: item.id,
    })),
  );

  return { nodes, edges };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getWaves(day1Anchor = "2026-06-27"): Wave[] {
  const itemMap = new Map(workItems.map((item) => [item.id, item]));
  const levelMemo = new Map<string, number>();

  function getLevel(item: WorkItem): number {
    const cached = levelMemo.get(item.id);
    if (cached !== undefined) {
      return cached;
    }

    const incompleteDependencies = item.dependsOn
      .map((dependency) => itemMap.get(dependency))
      .filter((dependency): dependency is WorkItem => Boolean(dependency))
      .filter((dependency) => dependency.status !== "done");

    const level =
      incompleteDependencies.length === 0
        ? 0
        : Math.max(...incompleteDependencies.map((dependency) => getLevel(dependency))) + 1;

    levelMemo.set(item.id, level);
    return level;
  }

  const pendingItems = workItems.filter((item) => item.status !== "done");
  const anchor = new Date(`${day1Anchor}T00:00:00.000Z`);
  const grouped = new Map<number, WorkItem[]>();

  for (const item of pendingItems) {
    const level = getLevel(item);
    grouped.set(level, [...(grouped.get(level) ?? []), item]);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([level, items]) => ({
      level,
      label: `Wave ${level + 1}`,
      startDate: addDays(anchor, level).toISOString().slice(0, 10),
      items: items.sort((a, b) => a.id.localeCompare(b.id)),
    }));
}

export function getRelatedScreens(keys: ScreenKey[]) {
  return keys
    .map((key) => {
      const [plane, slug] = key.split("/");
      return getScreen(plane, slug);
    })
    .filter((screen): screen is Screen => Boolean(screen));
}

export function getRelatedWorkItems(ids: string[]) {
  const idSet = new Set(ids);
  return workItems.filter((item) => idSet.has(item.id));
}

export function getBoardSummary() {
  const screenStatusCounts = screenStatuses.map((status) => ({
    ...status,
    count: screens.filter((screen) => screen.status === status.id).length,
  }));

  const workItemStatusCounts = workItemStatuses.map((status) => ({
    ...status,
    count: workItems.filter((item) => item.status === status.id).length,
  }));

  return {
    planes,
    screens,
    screenStatusCounts,
    workItemStatusCounts,
    controlAreaCoverage: getControlAreaCoverage(),
    flows,
    waves: getWaves(),
  };
}

export function getControlAreaIds(): ControlAreaId[] {
  return controlAreas.map((area) => area.area);
}

