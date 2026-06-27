import type { ScreenStatus, StatusDefinition, WorkItemStatus } from "../types";

export const screenStatuses: StatusDefinition<ScreenStatus>[] = [
  {
    id: "planned",
    label: "Planned",
    description: "Contract is known, implementation has not started.",
    order: 0,
  },
  {
    id: "partial",
    label: "Partial",
    description: "Some implementation exists, but the surface is not complete.",
    order: 1,
  },
  {
    id: "implemented",
    label: "Implemented",
    description: "Implementation exists in the repository.",
    order: 2,
  },
  {
    id: "verified",
    label: "Verified",
    description: "Implementation has passed the relevant verification gate.",
    order: 3,
  },
];

export const workItemStatuses: StatusDefinition<WorkItemStatus>[] = [
  {
    id: "not_started",
    label: "Not Started",
    description: "Work has not started.",
    order: 0,
  },
  {
    id: "review_ready",
    label: "Review Ready",
    description: "Work exists and is ready for review or merge verification.",
    order: 1,
  },
  {
    id: "done",
    label: "Done",
    description: "Work is complete in the current source tree.",
    order: 2,
  },
];

