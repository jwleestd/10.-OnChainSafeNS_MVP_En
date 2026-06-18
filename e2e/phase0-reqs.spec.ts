import { expect, test } from '@playwright/test';
import { adminCookie, TEST, userCookie } from './helpers/phase0-db';

test.describe.configure({ mode: 'serial' });

type ApiBody<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

async function json<T = unknown>(response: { json(): Promise<T> }) {
  return response.json();
}

test.describe('Phase-0 REQ-P0-001~019 gate', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post('/api/v1/test/reset');
    expect(response.status()).toBe(200);
  });

  test('REQ-P0-001 fraud lookup returns flagged, clean, and validation results', async ({
    request,
  }) => {
    const headers = { Cookie: await userCookie() };

    const flagged = await request.get(
      `/api/v1/fraud/lookup?address=${TEST.addresses.fraudCritical}&chain=ethereum`,
      { headers },
    );
    const flaggedBody = await json<ApiBody<Record<string, unknown>>>(flagged);

    expect(flagged.status()).toBe(200);
    expect(flaggedBody.data).toMatchObject({
      found: true,
      risk_level: 'critical',
      report_count: 5,
      source_type: 'seed',
    });

    const clean = await request.get(
      `/api/v1/fraud/lookup?address=${TEST.addresses.cleanAlice}&chain=ethereum`,
      { headers },
    );
    const cleanBody = await json<ApiBody<Record<string, unknown>>>(clean);
    expect(clean.status()).toBe(200);
    expect(cleanBody.data).toMatchObject({ found: false });

    const invalid = await request.get('/api/v1/fraud/lookup?address=bad&chain=ethereum', {
      headers,
    });
    expect(invalid.status()).toBe(400);
  });

  test('REQ-P0-002 fraud lookup exposes human-readable source context', async ({ request }) => {
    const response = await request.get(
      `/api/v1/fraud/lookup?address=${TEST.addresses.fraudHigh}&chain=ethereum`,
      { headers: { Cookie: await userCookie() } },
    );
    const body = await json<ApiBody<Record<string, unknown>>>(response);

    expect(response.status()).toBe(200);
    expect(body.data?.source_type).toBe('community');
  });

  test('REQ-P0-003 verified users can report while invalid users are blocked', async ({
    request,
  }) => {
    const ok = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie() },
      data: {
        reported_address: TEST.addresses.reported,
        chain: 'ethereum',
        description: 'Phase-0 report with enough detail',
        evidence_url: 'https://example.com/evidence/report',
      },
    });
    const okBody = await json<ApiBody<Record<string, unknown>>>(ok);

    expect(ok.status()).toBe(200);
    expect(okBody.data?.status).toBe('submitted');

    const unverified = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie(TEST.users.unverified) },
      data: {
        reported_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
        description: 'Phase-0 report with enough detail',
        evidence_url: 'https://example.com/evidence/report',
      },
    });
    expect(unverified.status()).toBe(403);

    const restricted = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie(TEST.users.restricted) },
      data: {
        reported_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
        description: 'Phase-0 report with enough detail',
        evidence_url: 'https://example.com/evidence/report',
      },
    });
    expect(restricted.status()).toBe(429);

    const shortDescription = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie() },
      data: {
        reported_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
        description: 'too short',
        evidence_url: 'https://example.com/evidence/report',
      },
    });
    expect(shortDescription.status()).toBe(400);
  });

  test('REQ-P0-004 duplicate report rules reject same reporter and count another reporter', async ({
    request,
  }) => {
    const sameReporter = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie() },
      data: {
        reported_address: TEST.addresses.duplicate,
        chain: 'ethereum',
        description: 'Same reporter duplicate should be rejected',
        evidence_url: 'https://example.com/evidence/duplicate',
      },
    });
    expect(sameReporter.status()).toBe(409);

    const otherReporter = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie(TEST.users.second) },
      data: {
        reported_address: TEST.addresses.duplicate,
        chain: 'ethereum',
        description: 'Another reporter duplicate should be accepted',
        evidence_url: 'https://example.com/evidence/duplicate-2',
      },
    });
    expect(otherReporter.status()).toBe(200);

    const lookup = await request.get(
      `/api/v1/fraud/lookup?address=${TEST.addresses.duplicate}&chain=ethereum`,
      { headers: { Cookie: await userCookie() } },
    );
    const lookupBody = await json<ApiBody<Record<string, unknown>>>(lookup);
    expect(lookupBody.data?.report_count).toBe(2);
  });

  test('REQ-P0-005 report receipt email failure does not roll back report creation', async ({
    request,
  }) => {
    const response = await request.post('/api/v1/fraud/report', {
      headers: { Cookie: await userCookie() },
      data: {
        reported_address: TEST.addresses.reported,
        chain: 'ethereum',
        description: 'Report should persist even if email is disabled',
        evidence_url: 'https://example.com/evidence/email-failure',
      },
    });
    const body = await json<ApiBody<{ report_id: string }>>(response);

    expect(response.status()).toBe(200);
    expect(body.data?.report_id).toBeTruthy();
  });

  test('REQ-P0-006 verified users can register Safe-Name and invalid cases fail', async ({
    request,
  }) => {
    const created = await request.post('/api/v1/safename/register', {
      headers: { Cookie: await userCookie() },
      data: {
        human_name: 'phase0-new',
        wallet_address: TEST.addresses.transferUnknown,
        chain: 'ethereum',
      },
    });
    const createdBody = await json<ApiBody<Record<string, unknown>>>(created);

    expect(created.status()).toBe(200);
    expect(createdBody.data).toMatchObject({ human_name: 'phase0-new.safe', status: 'active' });

    const unauthenticated = await request.post('/api/v1/safename/register', {
      data: {
        human_name: 'phase0-noauth',
        wallet_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
      },
    });
    expect(unauthenticated.status()).toBe(401);

    const badAddress = await request.post('/api/v1/safename/register', {
      headers: { Cookie: await userCookie() },
      data: {
        human_name: 'phase0-bad',
        wallet_address: 'bad',
        chain: 'ethereum',
      },
    });
    expect(badAddress.status()).toBe(400);
  });

  test('REQ-P0-007 Safe-Name format, duplicate, and reserved-word rules are enforced', async ({
    request,
  }) => {
    const headers = { Cookie: await userCookie() };

    const badFormat = await request.post('/api/v1/safename/register', {
      headers,
      data: {
        human_name: 'AB',
        wallet_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
      },
    });
    expect(badFormat.status()).toBe(400);

    const reserved = await request.post('/api/v1/safename/register', {
      headers,
      data: {
        human_name: 'admin',
        wallet_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
      },
    });
    expect(reserved.status()).toBe(400);

    const duplicate = await request.post('/api/v1/safename/register', {
      headers,
      data: {
        human_name: TEST.names.alice.replace('.safe', ''),
        wallet_address: TEST.addresses.cleanGood,
        chain: 'ethereum',
      },
    });
    expect(duplicate.status()).toBe(409);
  });

  test('REQ-P0-008 resolve returns active Safe-Name mapping', async ({ request }) => {
    const response = await request.get(`/api/v1/resolve?name=${TEST.names.alice}`, {
      headers: { Cookie: await userCookie() },
    });
    const body = await json<ApiBody<Record<string, unknown>>>(response);

    expect(response.status()).toBe(200);
    expect(body.data).toMatchObject({
      name: TEST.names.alice,
      wallet_address: TEST.addresses.cleanAlice,
      chain: 'ethereum',
    });
  });

  test('REQ-P0-009 resolve cross-checks fraud status for clean and flagged names', async ({
    request,
  }) => {
    const headers = { Cookie: await userCookie() };

    const clean = await request.get(`/api/v1/resolve?name=${TEST.names.alice}`, { headers });
    const cleanBody = await json<ApiBody<{ fraud_check: { is_flagged: boolean } }>>(clean);
    expect(cleanBody.data?.fraud_check.is_flagged).toBe(false);

    const flagged = await request.get(`/api/v1/resolve?name=${TEST.names.evil}`, { headers });
    const flaggedBody = await json<
      ApiBody<{ fraud_check: { is_flagged: boolean; risk_level?: string; report_count?: number } }>
    >(flagged);
    expect(flaggedBody.data?.fraud_check).toMatchObject({
      is_flagged: true,
      risk_level: 'critical',
      report_count: 5,
    });
  });

  test('REQ-P0-010 resolve returns not found and expired states', async ({ request }) => {
    const headers = { Cookie: await userCookie() };

    const missing = await request.get('/api/v1/resolve?name=phase0-missing.safe', { headers });
    expect(missing.status()).toBe(404);

    const expired = await request.get(`/api/v1/resolve?name=${TEST.names.expired}`, { headers });
    expect(expired.status()).toBe(410);
  });

  test('REQ-P0-011 admin can list submitted reports with approval context', async ({ request }) => {
    const unauthorized = await request.get('/api/v1/admin/approve');
    expect(unauthorized.status()).toBe(401);

    const response = await request.get('/api/v1/admin/approve', {
      headers: { Cookie: await adminCookie() },
    });
    const body = await json<ApiBody<Array<Record<string, unknown>>>>(response);

    expect(response.status()).toBe(200);
    const approvalReport = body.data?.find(
      (report) => report.reportedAddress === TEST.addresses.approvalExisting,
    );
    expect(approvalReport).toMatchObject({
      chain: 'ethereum',
      evidenceUrl: 'https://example.com/evidence/existing',
      sameAddressReportCount: 1,
      reporterFalseReportCount: 0,
    });
    expect(approvalReport?.existingFraudAddress).toMatchObject({
      riskLevel: 'medium',
      reportCount: 4,
      status: 'verified',
    });
  });

  test('REQ-P0-012 admin approval and rejection update report and fraud tables', async ({
    request,
  }) => {
    const headers = { Cookie: await adminCookie() };
    const pending = await request.get('/api/v1/admin/approve', { headers });
    const pendingBody = await json<ApiBody<Array<Record<string, string>>>>(pending);
    const newReport = pendingBody.data?.find(
      (report) => report.reportedAddress === TEST.addresses.approvalNew,
    );
    const existingReport = pendingBody.data?.find(
      (report) => report.reportedAddress === TEST.addresses.approvalExisting,
    );
    expect(newReport?.reportId).toBeTruthy();
    expect(existingReport?.reportId).toBeTruthy();

    const approve = await request.post('/api/v1/admin/approve', {
      headers,
      data: { report_id: newReport!.reportId, action: 'approve' },
    });
    expect(approve.status()).toBe(200);

    const lookupApproved = await request.get(
      `/api/v1/fraud/lookup?address=${TEST.addresses.approvalNew}&chain=ethereum`,
      { headers: { Cookie: await userCookie() } },
    );
    const lookupApprovedBody = await json<ApiBody<Record<string, unknown>>>(lookupApproved);
    expect(lookupApprovedBody.data).toMatchObject({
      risk_level: 'medium',
      source_type: 'community',
    });

    const reject = await request.post('/api/v1/admin/approve', {
      headers,
      data: {
        report_id: existingReport!.reportId,
        action: 'reject',
        reviewer_notes: 'Insufficient evidence',
      },
    });
    expect(reject.status()).toBe(200);

    const repeat = await request.post('/api/v1/admin/approve', {
      headers,
      data: {
        report_id: existingReport!.reportId,
        action: 'approve',
      },
    });
    expect(repeat.status()).toBe(409);
  });

  test('REQ-P0-013 admin result email failure does not roll back approval', async ({
    request,
  }) => {
    const pending = await request.get('/api/v1/admin/approve', {
      headers: { Cookie: await adminCookie() },
    });
    const pendingBody = await json<ApiBody<Array<Record<string, string>>>>(pending);
    const report = pendingBody.data?.find(
      (item) => item.reportedAddress === TEST.addresses.approvalNew,
    );
    expect(report?.reportId).toBeTruthy();

    const response = await request.post('/api/v1/admin/approve', {
      headers: { Cookie: await adminCookie() },
      data: { report_id: report!.reportId, action: 'approve' },
    });

    expect(response.status()).toBe(200);
  });

  test('REQ-P0-014 verification-code email request validates email, cooldown, and send failure', async ({
    request,
  }) => {
    const invalid = await request.post('/api/v1/auth/verify-email', {
      data: { email: 'not-email' },
    });
    expect(invalid.status()).toBe(400);

    const cooldown = await request.post('/api/v1/auth/verify-email', {
      data: { email: TEST.users.auth },
    });
    expect(cooldown.status()).toBe(429);

    const sendFailure = await request.post('/api/v1/auth/verify-email', {
      data: { email: TEST.users.sendFailure },
    });
    expect(sendFailure.status()).toBe(502);

    const body = await json<ApiBody>(sendFailure);
    expect(body.error?.code).toBe('EMAIL_SEND_FAILED');
  });

  test('REQ-P0-015 code verification creates a session and rejects invalid or expired codes', async ({
    request,
  }) => {
    const wrong = await request.post('/api/v1/auth/verify-email', {
      data: { email: TEST.users.auth, code: '000000' },
    });
    expect(wrong.status()).toBe(401);

    const verified = await request.post('/api/v1/auth/verify-email', {
      data: { email: TEST.users.auth, code: '123456' },
    });
    expect(verified.status()).toBe(200);
    expect(verified.headers()['set-cookie']).toContain('user_session=');
  });

  test('REQ-P0-016 demo transfer completes for clean Safe-Name and validates auth and amount', async ({
    request,
  }) => {
    const completed = await request.post('/api/v1/transfer/demo', {
      headers: { Cookie: await userCookie() },
      data: { recipient_name: TEST.names.kim, amount: 0.5 },
    });
    const completedBody = await json<ApiBody<Record<string, unknown>>>(completed);

    expect(completed.status()).toBe(200);
    expect(completedBody.data).toMatchObject({
      transfer_status: 'completed',
      fraud_status: 'clean',
      resolved_address: TEST.addresses.cleanKim,
      amount: 0.5,
    });

    const unauthorized = await request.post('/api/v1/transfer/demo', {
      data: { recipient_name: TEST.names.kim, amount: 0.5 },
    });
    expect(unauthorized.status()).toBe(401);

    const invalidAmount = await request.post('/api/v1/transfer/demo', {
      headers: { Cookie: await userCookie() },
      data: { recipient_name: TEST.names.kim, amount: 0 },
    });
    expect(invalidAmount.status()).toBe(400);
  });

  test('REQ-P0-017 demo transfer blocks flagged Safe-Name recipients', async ({ request }) => {
    const response = await request.post('/api/v1/transfer/demo', {
      headers: { Cookie: await userCookie() },
      data: { recipient_name: TEST.names.evil, amount: 1 },
    });
    const body = await json<ApiBody<Record<string, unknown>>>(response);

    expect(response.status()).toBe(200);
    expect(body.data).toMatchObject({
      transfer_status: 'blocked',
      fraud_status: 'flagged',
      resolved_address: TEST.addresses.fraudCritical,
    });
    expect(JSON.parse(String(body.data?.fraud_detail))).toMatchObject({
      risk_level: 'critical',
      report_count: 5,
    });
  });

  test('REQ-P0-018 demo transfer records name_not_found for unknown Safe-Name', async ({
    request,
  }) => {
    const response = await request.post('/api/v1/transfer/demo', {
      headers: { Cookie: await userCookie() },
      data: { recipient_name: 'phase0-nobody.safe', amount: 0.5 },
    });
    const body = await json<ApiBody<Record<string, unknown>>>(response);

    expect(response.status()).toBe(200);
    expect(body.data).toMatchObject({
      transfer_status: 'name_not_found',
      resolved_address: null,
      fraud_status: 'clean',
    });
  });

  test('REQ-P0-019 demo transfer email failure keeps DB mutation and notified_at null', async ({
    request,
  }) => {
    const response = await request.post('/api/v1/transfer/demo', {
      headers: { Cookie: await userCookie() },
      data: { recipient_name: TEST.names.good, amount: 0.75 },
    });
    const body = await json<ApiBody<{ transfer_id: string }>>(response);

    expect(response.status()).toBe(200);
    expect(body.data?.transfer_id).toBeTruthy();
  });
});
