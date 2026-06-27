export type ScreenStatus = "planned" | "partial" | "implemented" | "verified";

export type WorkItemStatus = "not_started" | "review_ready" | "done";

export type PlaneId = "public-user" | "operator" | "system-state";

export type ControlAreaId =
  | "auth-and-access"
  | "fraud-lookup-reporting"
  | "safe-name-transfer"
  | "admin-approval-quality"
  | "email-failure-policy"
  | "api-response-contract"
  | "e2e-phase-gate"
  | "seed-scale-cost";

export type ScreenKey = `${PlaneId}/${string}`;

export interface StatusDefinition<T extends string> {
  id: T;
  label: string;
  description: string;
  order: number;
}

export interface Plane {
  id: PlaneId;
  title: string;
  summary: string;
}

export interface EngineeringSpec {
  authGate: string;
  clientActions: string[];
  serverActions: string[];
  dataReads: string[];
  dataWrites: string[];
  telemetryEvents: string[];
  exceptionStates: string[];
  controlAreaNotes: Partial<Record<ControlAreaId, string>>;
}

export interface Screen {
  plane: PlaneId;
  slug: string;
  title: string;
  route: string;
  designSpecType: "live-route" | "system-contract" | "test-gate";
  flowNote: string;
  status: ScreenStatus;
  statusNote: string;
  workItems: string[];
  requirementRefs: string[];
  implLocation: string;
  engineering: EngineeringSpec;
}

export interface WorkItem {
  id: string;
  title: string;
  phase: string;
  status: WorkItemStatus;
  externalRefs: string[];
  dependsOn: string[];
  screens: ScreenKey[];
  doc: string;
}

export interface ControlArea {
  area: ControlAreaId;
  title: string;
  goal: string;
  summary: string;
  policies: Array<{ statement: string; detail: string }>;
  decisions: Array<{ name: string; value: string }>;
  standards: Array<{ title: string; path: string }>;
  workItems: string[];
  gaps: string[];
}

export interface Flow {
  id: string;
  title: string;
  summary: string;
  screens: ScreenKey[];
}

export interface CoverageMatrixRow {
  screen: Screen;
  notes: Partial<Record<ControlAreaId, string>>;
  coveredCount: number;
}

export interface Wave {
  level: number;
  label: string;
  startDate: string;
  items: WorkItem[];
}

