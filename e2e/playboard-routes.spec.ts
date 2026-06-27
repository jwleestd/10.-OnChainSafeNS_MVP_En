import { expect, test } from "@playwright/test";

test("PlayBoard index renders registry-derived summaries", async ({ request }) => {
  const response = await request.get("/playboard");
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).toContain("PlayBoard");
  expect(body).toContain("Registry-derived SoT");
  expect(body).toContain("Implementation Matrix");
});

test("PlayBoard dynamic routes render known registry entries", async ({ request }) => {
  const specResponse = await request.get("/playboard/spec/public-user/fraud-lookup");
  expect(specResponse.status()).toBe(200);
  expect(await specResponse.text()).toContain("Fraud Lookup");

  const areaResponse = await request.get("/playboard/control-area/api-response-contract");
  expect(areaResponse.status()).toBe(200);
  expect(await areaResponse.text()).toContain("API Response Contract");

  const scenarioResponse = await request.get("/playboard/scenario/safe-name-demo-transfer");
  expect(scenarioResponse.status()).toBe(200);
  expect(await scenarioResponse.text()).toContain("Safe-Name Demo Transfer");
});

test("PlayBoard unknown route params return 404", async ({ request }) => {
  await expect((await request.get("/playboard/spec/public-user/missing")).status()).toBe(404);
  await expect((await request.get("/playboard/control-area/missing")).status()).toBe(404);
  await expect((await request.get("/playboard/scenario/missing")).status()).toBe(404);
});
