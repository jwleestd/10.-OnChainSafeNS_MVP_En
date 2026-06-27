import type { Flow } from "../types";

export const flows: Flow[] = [
  {
    id: "auth-gated-feature-entry",
    title: "Auth-Gated Feature Entry",
    summary: "Users discover the product publicly, then verify email before feature execution.",
    screens: ["public-user/landing", "public-user/auth-verify", "public-user/fraud-lookup", "public-user/safe-name-wizard"],
  },
  {
    id: "fraud-lookup-to-report",
    title: "Fraud Lookup to Report",
    summary: "A lookup result becomes the starting point for a prefilled fraud report.",
    screens: ["public-user/fraud-lookup", "system-state/api-contract", "system-state/email-policy"],
  },
  {
    id: "safe-name-demo-transfer",
    title: "Safe-Name Demo Transfer",
    summary: "The Safe-Name wizard carries data from registration through resolve and transfer simulation.",
    screens: ["public-user/safe-name-wizard", "system-state/api-contract", "system-state/email-policy"],
  },
  {
    id: "operator-report-approval",
    title: "Operator Report Approval",
    summary: "Operators authenticate, review report quality context, and approve or reject reports.",
    screens: ["operator/admin-login", "operator/approval-dashboard", "system-state/email-policy"],
  },
  {
    id: "phase0-verification-gate",
    title: "Phase-0 Verification Gate",
    summary: "Seed scale, API contracts, and E2E automation combine into the Phase-0 exit gate.",
    screens: ["system-state/seed-scale", "system-state/api-contract", "system-state/phase0-e2e-gate"],
  },
];

