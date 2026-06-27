import { existsSync } from "fs";
import path from "path";

import { controlAreas, flows, planes, screens, screenStatuses, workItems, workItemStatuses } from "./registry";
import { getControlArea, getFlow, getScreen, getScreenKey } from "./derive";
import type { ScreenKey, WorkItem } from "./types";

export interface IntegrityIssue {
  code: string;
  message: string;
}

export interface IntegrityReport {
  ok: boolean;
  issues: IntegrityIssue[];
}

function addIssue(issues: IntegrityIssue[], code: string, message: string) {
  issues.push({ code, message });
}

function fileExists(projectPath: string) {
  return existsSync(path.resolve(process.cwd(), projectPath));
}

function routeFileExists(route: string) {
  if (!route.startsWith("/") || route.includes("*")) {
    return true;
  }

  if (route === "/") {
    return fileExists("src/app/page.tsx");
  }

  const routePath = route.replace(/^\//, "").replace(/\//g, path.sep);
  return fileExists(path.join("src", "app", routePath, "page.tsx"));
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return Array.from(duplicates);
}

function hasCycle(items: WorkItem[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): boolean {
    if (visiting.has(id)) {
      return true;
    }

    if (visited.has(id)) {
      return false;
    }

    visiting.add(id);

    for (const dependency of map.get(id)?.dependsOn ?? []) {
      if (map.has(dependency) && visit(dependency)) {
        return true;
      }
    }

    visiting.delete(id);
    visited.add(id);
    return false;
  }

  return items.some((item) => visit(item.id));
}

export function getIntegrityReport(): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const workItemIds = new Set(workItems.map((item) => item.id));
  const screenKeys = new Set(screens.map(getScreenKey));
  const systemStateSlugs = new Set(screens.filter((screen) => screen.plane === "system-state").map((screen) => screen.slug));
  const controlAreaIds = new Set<string>(controlAreas.map((area) => area.area));
  const planeIds = new Set<string>(planes.map((plane) => plane.id));
  const screenStatusIds = new Set<string>(screenStatuses.map((status) => status.id));
  const workItemStatusIds = new Set<string>(workItemStatuses.map((status) => status.id));

  for (const duplicate of findDuplicates(Array.from(screenKeys))) {
    addIssue(issues, "SCREEN_KEY_DUPLICATE", `Screen key ${duplicate} is declared more than once.`);
  }

  for (const duplicate of findDuplicates(workItems.map((item) => item.id))) {
    addIssue(issues, "WORKITEM_ID_DUPLICATE", `Work item ${duplicate} is declared more than once.`);
  }

  for (const duplicate of findDuplicates(controlAreas.map((area) => area.area))) {
    addIssue(issues, "CONTROL_AREA_DUPLICATE", `Control area ${duplicate} is declared more than once.`);
  }

  for (const duplicate of findDuplicates(flows.map((flow) => flow.id))) {
    addIssue(issues, "FLOW_ID_DUPLICATE", `Flow ${duplicate} is declared more than once.`);
  }

  for (const screen of screens) {
    if (!planeIds.has(screen.plane)) {
      addIssue(issues, "SCREEN_PLANE_MISSING", `${getScreenKey(screen)} uses missing plane ${screen.plane}.`);
    }

    if (!screenStatusIds.has(screen.status)) {
      addIssue(issues, "SCREEN_STATUS_MISSING", `${getScreenKey(screen)} uses missing status ${screen.status}.`);
    }

    for (const workItem of screen.workItems) {
      if (!workItemIds.has(workItem)) {
        addIssue(issues, "SCREEN_WORKITEM_MISSING", `${getScreenKey(screen)} references missing work item ${workItem}.`);
      } else {
        const item = workItems.find((candidate) => candidate.id === workItem);
        if (item && !item.screens.includes(getScreenKey(screen))) {
          addIssue(issues, "SCREEN_WORKITEM_NOT_BIDIRECTIONAL", `${getScreenKey(screen)} references ${workItem}, but ${workItem}.screens does not reference the screen.`);
        }
      }
    }

    for (const exceptionState of screen.engineering.exceptionStates) {
      if (!systemStateSlugs.has(exceptionState)) {
        addIssue(issues, "EXCEPTION_STATE_MISSING", `${getScreenKey(screen)} references missing system-state screen ${exceptionState}.`);
      }
    }

    if ((screen.status === "implemented" || screen.status === "verified") && !screen.implLocation) {
      addIssue(issues, "IMPLEMENTED_SCREEN_WITHOUT_IMPL", `${getScreenKey(screen)} is ${screen.status} without implLocation.`);
    }

    for (const area of Object.keys(screen.engineering.controlAreaNotes)) {
      if (!controlAreaIds.has(area)) {
        addIssue(issues, "CONTROL_AREA_NOTE_MISSING", `${getScreenKey(screen)} references missing control area ${area}.`);
      }
    }

    if ((screen.status === "implemented" || screen.status === "verified") && !fileExists(screen.implLocation)) {
      addIssue(issues, "SCREEN_IMPL_PATH_MISSING", `${getScreenKey(screen)} implLocation does not exist: ${screen.implLocation}.`);
    }

    if (screen.designSpecType === "live-route" && !routeFileExists(screen.route)) {
      addIssue(issues, "LIVE_ROUTE_PATH_MISSING", `${getScreenKey(screen)} live route has no app page file for ${screen.route}.`);
    }
  }

  for (const item of workItems) {
    if (!workItemStatusIds.has(item.status)) {
      addIssue(issues, "WORKITEM_STATUS_MISSING", `${item.id} uses missing status ${item.status}.`);
    }

    for (const screen of item.screens) {
      if (!screenKeys.has(screen)) {
        addIssue(issues, "WORKITEM_SCREEN_MISSING", `${item.id} references missing screen ${screen}.`);
      } else {
        const [plane, slug] = screen.split("/");
        const targetScreen = getScreen(plane, slug);
        if (targetScreen && !targetScreen.workItems.includes(item.id)) {
          addIssue(issues, "WORKITEM_SCREEN_NOT_BIDIRECTIONAL", `${item.id} references ${screen}, but ${screen}.workItems does not reference the work item.`);
        }
      }
    }

    for (const dependency of item.dependsOn) {
      if (!workItemIds.has(dependency)) {
        addIssue(issues, "WORKITEM_DEPENDENCY_MISSING", `${item.id} references missing dependency ${dependency}.`);
      }
    }

    if (!fileExists(item.doc)) {
      addIssue(issues, "WORKITEM_DOC_MISSING", `${item.id} doc path does not exist: ${item.doc}.`);
    }
  }

  if (hasCycle(workItems)) {
    addIssue(issues, "WORKITEM_DAG_CYCLE", "Work-item dependency graph contains a cycle.");
  }

  for (const flow of flows) {
    for (const screen of flow.screens) {
      if (!screenKeys.has(screen)) {
        addIssue(issues, "FLOW_SCREEN_MISSING", `${flow.id} references missing screen ${screen}.`);
      }
    }

    if (flow.screens.length === 0) {
      addIssue(issues, "FLOW_WITHOUT_SCREENS", `${flow.id} does not contain any screens.`);
    }
  }

  for (const area of controlAreas) {
    for (const workItem of area.workItems) {
      if (!workItemIds.has(workItem)) {
        addIssue(issues, "CONTROL_AREA_WORKITEM_MISSING", `${area.area} references missing work item ${workItem}.`);
      }
    }

    for (const standard of area.standards) {
      if (!fileExists(standard.path)) {
        addIssue(issues, "STANDARD_PATH_MISSING", `${area.area} references missing standard path ${standard.path}.`);
      }
    }
  }

  const routeParamChecks: Array<[string, boolean]> = [
    ["known screen", Boolean(getScreen("public-user", "fraud-lookup"))],
    ["unknown screen", !getScreen("public-user", "missing")],
    ["known control area", Boolean(getControlArea("api-response-contract"))],
    ["unknown control area", !getControlArea("missing")],
    ["known flow", Boolean(getFlow("safe-name-demo-transfer"))],
    ["unknown flow", !getFlow("missing")],
  ];

  for (const [label, passes] of routeParamChecks) {
    if (!passes) {
      addIssue(issues, "ROUTE_PARAM_LOOKUP", `Route parameter lookup check failed for ${label}.`);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function assertPlayBoardIntegrity() {
  const report = getIntegrityReport();

  if (!report.ok) {
    throw new Error(report.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
  }

  return report;
}

export function parseScreenKey(key: ScreenKey) {
  const [plane, slug] = key.split("/");
  return { plane, slug };
}
