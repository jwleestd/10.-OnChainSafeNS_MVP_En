import { expect, test } from "@playwright/test";

import { getIntegrityReport } from "../src/playboard/integrity";

test("PlayBoard registry integrity is green", () => {
  const report = getIntegrityReport();
  expect(report.issues, report.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n")).toEqual([]);
  expect(report.ok).toBe(true);
});

