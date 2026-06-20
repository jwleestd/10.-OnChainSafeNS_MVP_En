import { randomUUID } from 'crypto';

type User = {
  userId: string;
  email: string;
  emailVerified: boolean;
  verificationCode: string | null;
  verificationExpiresAt: Date | null;
  falseReportCount: number;
  reportRestrictionUntil: Date | null;
  createdAt: Date;
};

type SafeName = {
  nameId: string;
  humanName: string;
  chain: string;
  walletAddress: string;
  ownerId: string;
  status: string;
  registeredAt: Date;
};

type FraudAddress = {
  fraudId: string;
  chain: string;
  address: string;
  riskLevel: string;
  reportCount: number;
  sourceType: string;
  firstReportedAt: Date;
  status: string;
  createdAt: Date;
};

type FraudReport = {
  reportId: string;
  reporterId: string;
  reportedAddress: string;
  chain: string;
  description: string;
  evidenceUrl: string;
  status: string;
  reviewerNotes: string | null;
  reportedAt: Date;
  reviewedAt: Date | null;
};

type TransferDemo = {
  transferId: string;
  senderId: string;
  recipientName: string;
  resolvedAddress: string | null;
  chain: string | null;
  amount: number;
  fraudStatus: string;
  fraudDetail: string | null;
  transferStatus: string;
  notifiedAt: Date | null;
  createdAt: Date;
};

type Store = {
  users: User[];
  safeNames: SafeName[];
  fraudAddresses: FraudAddress[];
  fraudReports: FraudReport[];
  transferDemos: TransferDemo[];
};

type MemoryPrisma = Record<string, unknown> & {
  $transaction: <T>(callback: (tx: MemoryPrisma) => Promise<T>) => Promise<T>;
  $disconnect: () => Promise<void>;
};

export const E2E_TEST = {
  users: {
    verified: { id: 'phase0-user-id', email: 'phase0-user@test.local' },
    second: { id: 'phase0-second-id', email: 'phase0-second@test.local' },
    unverified: { id: 'phase0-unverified-id', email: 'phase0-unverified@test.local' },
    restricted: { id: 'phase0-restricted-id', email: 'phase0-restricted@test.local' },
    auth: { id: 'phase0-auth-id', email: 'phase0-auth@test.local' },
    sendFailure: { id: 'phase0-sendfail-id', email: 'phase0-sendfail@test.local' },
  },
  admin: {
    operatorId: 'phase0-admin-operator',
    email: 'phase0-admin@test.local',
  },
  addresses: {
    fraudCritical: '0xBAD0000000000000000000000000000000000001',
    fraudHigh: '0x00000000000000000000000000000000000000F1',
    cleanAlice: '0x0000000000000000000000000000000000001001',
    cleanKim: '0x0000000000000000000000000000000000001002',
    cleanGood: '0x0000000000000000000000000000000000001003',
    cleanExpired: '0x0000000000000000000000000000000000001004',
    reported: '0x0000000000000000000000000000000000002001',
    duplicate: '0x0000000000000000000000000000000000002002',
    approvalNew: '0x0000000000000000000000000000000000003001',
    approvalExisting: '0x0000000000000000000000000000000000003002',
    transferUnknown: '0x0000000000000000000000000000000000004001',
  },
  names: {
    alice: 'phase0-alice.safe',
    kim: 'phase0-kim.safe',
    good: 'phase0-good.safe',
    evil: 'phase0-evil.safe',
    expired: 'phase0-expired.safe',
  },
} as const;

const store: Store = {
  users: [],
  safeNames: [],
  fraudAddresses: [],
  fraudReports: [],
  transferDemos: [],
};

function now() {
  return new Date();
}

function id() {
  return randomUUID();
}

function matchValue(actual: unknown, expected: unknown): boolean {
  if (expected && typeof expected === 'object' && 'in' in (expected as Record<string, unknown>)) {
    return ((expected as { in: unknown[] }).in).includes(actual);
  }
  return actual === expected;
}

function matches<T extends Record<string, unknown>>(record: T, where?: Record<string, unknown>) {
  if (!where) return true;
  return Object.entries(where).every(([key, expected]) => matchValue(record[key], expected));
}

function applyData(record: Record<string, unknown>, data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'increment' in (value as Record<string, unknown>)) {
      record[key] = Number(record[key]) + Number((value as { increment: number }).increment);
    } else {
      record[key] = value;
    }
  }
}

function userPublic(user: User) {
  return {
    userId: user.userId,
    email: user.email,
    emailVerified: user.emailVerified,
    verificationCode: user.verificationCode,
    verificationExpiresAt: user.verificationExpiresAt,
    falseReportCount: user.falseReportCount,
    reportRestrictionUntil: user.reportRestrictionUntil,
    createdAt: user.createdAt,
  };
}

function reporterFor(report: FraudReport) {
  const user = store.users.find((item) => item.userId === report.reporterId);
  return user ? userPublic(user) : null;
}

export function resetE2eMemoryData() {
  store.users = [
    {
      userId: E2E_TEST.users.verified.id,
      email: E2E_TEST.users.verified.email,
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      falseReportCount: 0,
      reportRestrictionUntil: null,
      createdAt: now(),
    },
    {
      userId: E2E_TEST.users.second.id,
      email: E2E_TEST.users.second.email,
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      falseReportCount: 0,
      reportRestrictionUntil: null,
      createdAt: now(),
    },
    {
      userId: E2E_TEST.users.unverified.id,
      email: E2E_TEST.users.unverified.email,
      emailVerified: false,
      verificationCode: null,
      verificationExpiresAt: null,
      falseReportCount: 0,
      reportRestrictionUntil: null,
      createdAt: now(),
    },
    {
      userId: E2E_TEST.users.restricted.id,
      email: E2E_TEST.users.restricted.email,
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
      falseReportCount: 0,
      reportRestrictionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now(),
    },
    {
      userId: E2E_TEST.users.auth.id,
      email: E2E_TEST.users.auth.email,
      emailVerified: false,
      verificationCode: '123456',
      verificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      falseReportCount: 0,
      reportRestrictionUntil: null,
      createdAt: now(),
    },
  ];

  store.fraudAddresses = [
    {
      fraudId: id(),
      address: E2E_TEST.addresses.fraudCritical,
      chain: 'ethereum',
      riskLevel: 'critical',
      reportCount: 5,
      sourceType: 'seed',
      firstReportedAt: now(),
      status: 'verified',
      createdAt: now(),
    },
    {
      fraudId: id(),
      address: E2E_TEST.addresses.fraudHigh,
      chain: 'ethereum',
      riskLevel: 'high',
      reportCount: 3,
      sourceType: 'community',
      firstReportedAt: now(),
      status: 'verified',
      createdAt: now(),
    },
    {
      fraudId: id(),
      address: E2E_TEST.addresses.duplicate,
      chain: 'ethereum',
      riskLevel: 'medium',
      reportCount: 1,
      sourceType: 'community',
      firstReportedAt: now(),
      status: 'verified',
      createdAt: now(),
    },
    {
      fraudId: id(),
      address: E2E_TEST.addresses.approvalExisting,
      chain: 'ethereum',
      riskLevel: 'medium',
      reportCount: 4,
      sourceType: 'community',
      firstReportedAt: now(),
      status: 'verified',
      createdAt: now(),
    },
  ];

  store.safeNames = [
    {
      nameId: id(),
      humanName: E2E_TEST.names.alice,
      chain: 'ethereum',
      walletAddress: E2E_TEST.addresses.cleanAlice,
      ownerId: E2E_TEST.users.verified.id,
      status: 'active',
      registeredAt: now(),
    },
    {
      nameId: id(),
      humanName: E2E_TEST.names.kim,
      chain: 'ethereum',
      walletAddress: E2E_TEST.addresses.cleanKim,
      ownerId: E2E_TEST.users.second.id,
      status: 'active',
      registeredAt: now(),
    },
    {
      nameId: id(),
      humanName: E2E_TEST.names.good,
      chain: 'ethereum',
      walletAddress: E2E_TEST.addresses.cleanGood,
      ownerId: E2E_TEST.users.verified.id,
      status: 'active',
      registeredAt: now(),
    },
    {
      nameId: id(),
      humanName: E2E_TEST.names.evil,
      chain: 'ethereum',
      walletAddress: E2E_TEST.addresses.fraudCritical,
      ownerId: E2E_TEST.users.second.id,
      status: 'active',
      registeredAt: now(),
    },
    {
      nameId: id(),
      humanName: E2E_TEST.names.expired,
      chain: 'ethereum',
      walletAddress: E2E_TEST.addresses.cleanExpired,
      ownerId: E2E_TEST.users.verified.id,
      status: 'expired',
      registeredAt: now(),
    },
  ];

  store.fraudReports = [
    {
      reportId: id(),
      reporterId: E2E_TEST.users.verified.id,
      reportedAddress: E2E_TEST.addresses.approvalNew,
      chain: 'ethereum',
      description: 'Phase-0 pending approval report',
      evidenceUrl: 'https://example.com/evidence/pending',
      status: 'submitted',
      reviewerNotes: null,
      reportedAt: now(),
      reviewedAt: null,
    },
    {
      reportId: id(),
      reporterId: E2E_TEST.users.second.id,
      reportedAddress: E2E_TEST.addresses.approvalExisting,
      chain: 'ethereum',
      description: 'Phase-0 pending existing address report',
      evidenceUrl: 'https://example.com/evidence/existing',
      status: 'submitted',
      reviewerNotes: null,
      reportedAt: now(),
      reviewedAt: null,
    },
    {
      reportId: id(),
      reporterId: E2E_TEST.users.verified.id,
      reportedAddress: E2E_TEST.addresses.duplicate,
      chain: 'ethereum',
      description: 'Phase-0 duplicate report fixture',
      evidenceUrl: 'https://example.com/evidence/duplicate',
      status: 'submitted',
      reviewerNotes: null,
      reportedAt: now(),
      reviewedAt: null,
    },
  ];

  store.transferDemos = [];
}

resetE2eMemoryData();

export const e2eMemoryPrisma: MemoryPrisma = {
  user: {
    findUnique: async ({ where }: { where: Partial<User> }) =>
      store.users.find((item) => matches(item, where as Record<string, unknown>)) ?? null,
    upsert: async ({ where, update, create }: { where: Partial<User>; update: Partial<User>; create: Partial<User> }) => {
      const existing = store.users.find((item) => matches(item, where as Record<string, unknown>));
      if (existing) {
        applyData(existing as unknown as Record<string, unknown>, update as Record<string, unknown>);
        return existing;
      }
      const user: User = {
        userId: id(),
        email: create.email!,
        emailVerified: create.emailVerified ?? false,
        verificationCode: create.verificationCode ?? null,
        verificationExpiresAt: create.verificationExpiresAt ?? null,
        falseReportCount: 0,
        reportRestrictionUntil: null,
        createdAt: now(),
      };
      store.users.push(user);
      return user;
    },
    update: async ({ where, data }: { where: Partial<User>; data: Partial<User> }) => {
      const existing = store.users.find((item) => matches(item, where as Record<string, unknown>));
      if (!existing) throw new Error('User not found');
      applyData(existing as unknown as Record<string, unknown>, data as Record<string, unknown>);
      return existing;
    },
  },
  safeName: {
    findUnique: async ({ where }: { where: Partial<SafeName> }) =>
      store.safeNames.find((item) => matches(item, where as Record<string, unknown>)) ?? null,
    create: async ({ data }: { data: Partial<SafeName> }) => {
      const record: SafeName = {
        nameId: id(),
        humanName: data.humanName!,
        chain: data.chain!,
        walletAddress: data.walletAddress!,
        ownerId: data.ownerId!,
        status: data.status ?? 'active',
        registeredAt: now(),
      };
      store.safeNames.push(record);
      return record;
    },
  },
  fraudAddress: {
    findFirst: async ({ where, select }: { where?: Partial<FraudAddress>; select?: Record<string, boolean> }) => {
      const record = store.fraudAddresses.find((item) => matches(item, where as Record<string, unknown>));
      if (!record || !select) return record ?? null;
      return Object.fromEntries(
        Object.entries(select)
          .filter(([, include]) => include)
          .map(([key]) => [key, (record as unknown as Record<string, unknown>)[key]]),
      );
    },
    create: async ({ data }: { data: Partial<FraudAddress> }) => {
      const record: FraudAddress = {
        fraudId: id(),
        address: data.address!,
        chain: data.chain!,
        riskLevel: data.riskLevel!,
        reportCount: data.reportCount ?? 0,
        sourceType: data.sourceType!,
        firstReportedAt: data.firstReportedAt ?? now(),
        status: data.status ?? 'verified',
        createdAt: now(),
      };
      store.fraudAddresses.push(record);
      return record;
    },
    update: async ({ where, data }: { where: Partial<FraudAddress>; data: Partial<FraudAddress> }) => {
      const record = store.fraudAddresses.find((item) => matches(item, where as Record<string, unknown>));
      if (!record) throw new Error('FraudAddress not found');
      applyData(record as unknown as Record<string, unknown>, data as Record<string, unknown>);
      return record;
    },
  },
  fraudReport: {
    findMany: async ({ where }: { where?: Partial<FraudReport> }) =>
      store.fraudReports
        .filter((item) => matches(item, where as Record<string, unknown>))
        .sort((a, b) => a.reportedAt.getTime() - b.reportedAt.getTime())
        .map((report) => ({ ...report, reporter: reporterFor(report) })),
    findFirst: async ({ where }: { where?: Partial<FraudReport> }) =>
      store.fraudReports.find((item) => matches(item, where as Record<string, unknown>)) ?? null,
    findUnique: async ({ where, include }: { where: Partial<FraudReport>; include?: { reporter?: boolean } }) => {
      const report = store.fraudReports.find((item) => matches(item, where as Record<string, unknown>));
      if (!report) return null;
      return include?.reporter ? { ...report, reporter: reporterFor(report) } : report;
    },
    count: async ({ where }: { where?: Partial<FraudReport> }) =>
      store.fraudReports.filter((item) => matches(item, where as Record<string, unknown>)).length,
    create: async ({ data }: { data: Partial<FraudReport> }) => {
      const record: FraudReport = {
        reportId: id(),
        reporterId: data.reporterId!,
        reportedAddress: data.reportedAddress!,
        chain: data.chain!,
        description: data.description!,
        evidenceUrl: data.evidenceUrl!,
        status: data.status ?? 'submitted',
        reviewerNotes: data.reviewerNotes ?? null,
        reportedAt: now(),
        reviewedAt: null,
      };
      store.fraudReports.push(record);
      return record;
    },
    update: async ({ where, data }: { where: Partial<FraudReport>; data: Partial<FraudReport> }) => {
      const report = store.fraudReports.find((item) => matches(item, where as Record<string, unknown>));
      if (!report) throw new Error('FraudReport not found');
      applyData(report as unknown as Record<string, unknown>, data as Record<string, unknown>);
      return report;
    },
  },
  transferDemo: {
    create: async ({ data }: { data: Partial<TransferDemo> }) => {
      const record: TransferDemo = {
        transferId: id(),
        senderId: data.senderId!,
        recipientName: data.recipientName!,
        resolvedAddress: data.resolvedAddress ?? null,
        chain: data.chain ?? null,
        amount: data.amount!,
        fraudStatus: data.fraudStatus!,
        fraudDetail: data.fraudDetail ?? null,
        transferStatus: data.transferStatus!,
        notifiedAt: null,
        createdAt: now(),
      };
      store.transferDemos.push(record);
      return record;
    },
    update: async ({ where, data }: { where: Partial<TransferDemo>; data: Partial<TransferDemo> }) => {
      const record = store.transferDemos.find((item) => matches(item, where as Record<string, unknown>));
      if (!record) throw new Error('TransferDemo not found');
      applyData(record as unknown as Record<string, unknown>, data as Record<string, unknown>);
      return record;
    },
  },
  $transaction: async <T>(callback: (tx: MemoryPrisma) => Promise<T>) => callback(e2eMemoryPrisma),
  $disconnect: async () => undefined,
};
