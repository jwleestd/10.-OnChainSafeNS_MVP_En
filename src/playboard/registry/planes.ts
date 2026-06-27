import type { Plane } from "../types";

export const planes: Plane[] = [
  {
    id: "public-user",
    title: "Public User",
    summary: "Public landing, email verification, fraud lookup, Safe-Name, and demo transfer surfaces.",
  },
  {
    id: "operator",
    title: "Operator",
    summary: "Admin login and approval review surfaces for Phase-0 fraud-report handling.",
  },
  {
    id: "system-state",
    title: "System State",
    summary: "API contracts, policy surfaces, seed scale, cost gates, and E2E verification gates.",
  },
];

